from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Account(models.Model):
    BANK     = "bank"
    CASH     = "cash"
    CARD     = "card"
    OTHER    = "other"
    ACCOUNT_TYPES = [
        (BANK, "Bank"),
        (CASH, "Cash"),
        (CARD, "Credit Card"),
        (OTHER, "Other"),
    ]

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accounts", db_index=True)
    name            = models.CharField(max_length=100, db_index=True)
    acc_type        = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default=BANK, db_index=True)
    
    balance         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active       = models.BooleanField(default=True, db_index=True)
    currency        = models.CharField(max_length=3, default="USD", db_index=True)
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at      = models.DateTimeField(auto_now=True)
    deleted_at      = models.DateTimeField(null=True, blank=True, db_index=True)
    last_transaction_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'acc_type', 'is_active']),
            models.Index(fields=['currency', 'is_active']),
            models.Index(fields=['user', '-created_at']),
        ]

    def clean(self):
        if self.name and len(self.name.strip()) == 0:
            raise ValidationError({'name': 'Account name cannot be empty or just whitespace.'})
        
        if self.acc_type == self.CARD and self.initial_balance > 0:
            raise ValidationError({'initial_balance': 'Credit card accounts should not have positive initial balances.'})
        
        if self.acc_type != self.CARD and self.initial_balance < 0:
            raise ValidationError({'initial_balance': 'Initial balance cannot be negative for this account type.'})


    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_acc_type_display()})"
    
    @property
    def available_balance(self):
        if self.acc_type == self.CARD:
            return abs(self.balance)
        return self.balance
    
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=['deleted_at', 'is_active'])


class Category(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories", db_index=True)
    name            = models.CharField(max_length=100, db_index=True)
    parent_category = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='subcategories', db_index=True)
    is_expense      = models.BooleanField(default=True, db_index=True)
    
    icon            = models.CharField(max_length=50, blank=True, default='')
    color           = models.CharField(max_length=7, default='#6B7280')
    order           = models.PositiveIntegerField(default=0)
    is_active       = models.BooleanField(default=True, db_index=True)
    
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    deleted_at      = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        unique_together = ("user", "name")
        indexes = [
            models.Index(fields=['user', 'is_expense', 'is_active']),
            models.Index(fields=['user', 'parent_category']),
            models.Index(fields=['user', 'order', 'name']),
            models.Index(fields=['is_expense', 'is_active']),
        ]
        
        ordering = ['order', 'name']

    def clean(self):
        if self.name and len(self.name.strip()) == 0:
            raise ValidationError({'name': 'Category name cannot be empty or just whitespace.'})
        
        if self.parent_category and self.parent_category == self:
            raise ValidationError({'parent_category': 'A category cannot be its own parent.'})
        
        if self.parent_category:
            current = self.parent_category
            depth = 0
            while current and depth < 5:
                if current == self:
                    raise ValidationError({'parent_category': 'Circular reference detected in category hierarchy.'})
                current = current.parent_category
                depth += 1
            if depth >= 5:
                raise ValidationError({'parent_category': 'Category hierarchy is too deep (max 5 levels).'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        parent_name = f" > {self.parent_category.name}" if self.parent_category else ""
        return f"{self.name}{parent_name} ({'Expense' if self.is_expense else 'Income'})"
    
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=['deleted_at', 'is_active'])


class Transaction(models.Model):
    EXPENSE  = "expense"
    INCOME   = "income"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjust"
    TRANSACTION_TYPES = [
        (EXPENSE, "Expense"),
        (INCOME, "Income"),
        (TRANSFER, "Transfer"),
        (ADJUSTMENT, "Adjustment"),
    ]

    PENDING    = "pending"
    CLEARED    = "cleared"
    RECONCILED = "reconciled"
    VOID       = "void"
    TRANSACTION_STATUSES = [
        (PENDING, "Pending"),
        (CLEARED, "Cleared"),
        (RECONCILED, "Reconciled"),
        (VOID, "Void"),
    ]

    user               = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions", db_index=True)
    account            = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions", db_index=True)
    transaction_type   = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default=EXPENSE, db_index=True)
    linked_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    status             = models.CharField(max_length=10, choices=TRANSACTION_STATUSES, default=CLEARED, db_index=True)

    category_type_model = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    category_id = models.PositiveIntegerField()
    category = GenericForeignKey('category_type_model', 'category_id')    

    amount             = models.DecimalField(max_digits=10, decimal_places=2)
    notes              = models.TextField(blank=True)
    
    created_at         = models.DateTimeField(auto_now_add=True, db_index=True)
    deleted_at         = models.DateTimeField(null=True, blank=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['user', 'account']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['status', 'transaction_type']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['account', 'status']),
            models.Index(fields=['user', '-created_at']),
        ]
        
        ordering = ['-id']

    def clean(self):
        if self.amount <= 0:
            raise ValidationError({'amount': 'Transaction amount must be positive.'})
        
        if self.transaction_type == self.TRANSFER and not self.linked_transaction:
            raise ValidationError({'linked_transaction': 'Transfer transactions must have a linked transaction.'})
        
        if self.linked_transaction and self.linked_transaction == self:
            raise ValidationError({'linked_transaction': 'A transaction cannot be linked to itself.'})
        
        if self.transaction_type == self.TRANSFER and self.linked_transaction:
            if self.account == self.linked_transaction.account:
                raise ValidationError({'account': 'Transfer transactions must involve different accounts.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.deleted_at is None