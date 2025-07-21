from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone

# --- Account Model ---
class Account(models.Model):
    # Constants for account types
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

    # Foreign Key to User model, CASCADE deletes accounts if user is deleted
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accounts", db_index=True)
    # Name of the account (e.g., "Checking Account", "Savings", "Cash")
    name            = models.CharField(max_length=100, db_index=True)
    # Type of account using predefined choices
    acc_type        = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default=BANK, db_index=True)
    # Currency of the account (e.g., "USD", "EUR")
    currency        = models.CharField(max_length=3, default="USD", db_index=True)
    # Current balance of the account
    balance         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Initial balance when the account is created, useful for auditing
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Flag to indicate if the account is active or inactive (not deleted)
    is_active       = models.BooleanField(default=True, db_index=True)
    
    # Audit fields for tracking
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
        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0) | models.Q(acc_type='card'),
                name='non_negative_balance_except_cards'
            ),
            models.CheckConstraint(
                check=models.Q(name__length__gt=0),
                name='account_name_not_empty'
            ),
        ]

    def clean(self):
        """Custom validation for the Account model"""
        if self.name and len(self.name.strip()) == 0:
            raise ValidationError({'name': 'Account name cannot be empty or just whitespace.'})
        
        if self.acc_type == self.CARD and self.balance > 0:
            raise ValidationError({'balance': 'Credit card accounts should not have positive balances.'})

    def save(self, *args, **kwargs):
        self.full_clean()  # Always run full validation before saving
        super().save(*args, **kwargs)

    def __str__(self):
        # Returns a human-readable representation of the account
        return f"{self.name} ({self.get_acc_type_display()})"
    
    @property
    def available_balance(self):
        """Calculate available balance considering account type"""
        if self.acc_type == self.CARD:
            # For credit cards, available balance is credit limit minus current balance
            # Assuming balance is negative for credit cards (debt)
            return abs(self.balance)
        return self.balance
    
    def soft_delete(self):
        """Soft delete the account"""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=['deleted_at', 'is_active'])


# --- Category Model ---
class Category(models.Model):
    # Foreign Key to User model, CASCADE deletes categories if user is deleted
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories", db_index=True)
    # Name of the category (e.g., "Groceries", "Salary", "Utilities")
    name            = models.CharField(max_length=100, db_index=True)
    parent_category = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='subcategories', db_index=True)
    is_expense      = models.BooleanField(default=True, db_index=True)
    
    # Additional fields for better UX
    icon            = models.CharField(max_length=50, blank=True, default='')
    color           = models.CharField(max_length=7, default='#6B7280')  # Hex color
    order           = models.PositiveIntegerField(default=0)
    is_active       = models.BooleanField(default=True, db_index=True)
    
    # Audit fields
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at      = models.DateTimeField(auto_now=True)
    deleted_at      = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        # Ensures that a user cannot have two categories with the exact same name
        unique_together = ("user", "name")
        indexes = [
            models.Index(fields=['user', 'is_expense', 'is_active']),
            models.Index(fields=['user', 'parent_category']),
            models.Index(fields=['user', 'order', 'name']),
            models.Index(fields=['is_expense', 'is_active']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(name__length__gt=0),
                name='category_name_not_empty'
            ),
            models.CheckConstraint(
                check=models.Q(color__regex=r'^#[0-9A-Fa-f]{6}$'),
                name='valid_hex_color'
            ),
        ]
        ordering = ['order', 'name']

    def clean(self):
        """Custom validation for the Category model"""
        if self.name and len(self.name.strip()) == 0:
            raise ValidationError({'name': 'Category name cannot be empty or just whitespace.'})
        
        # Prevent circular references in parent-child relationships
        if self.parent_category and self.parent_category == self:
            raise ValidationError({'parent_category': 'A category cannot be its own parent.'})
        
        # Check for deep nesting (prevent infinite loops) - simplified for MVP
        if self.parent_category:
            current = self.parent_category
            depth = 0
            # A simple loop for basic circular reference detection, not excessive depth
            while current and depth < 5:  # Reduced max depth for simplicity
                if current == self:
                    raise ValidationError({'parent_category': 'Circular reference detected in category hierarchy.'})
                current = current.parent_category
                depth += 1
            if depth >= 5: # If depth reaches 5, it's likely too deep for an MVP
                raise ValidationError({'parent_category': 'Category hierarchy is too deep (max 5 levels).'})

    def save(self, *args, **kwargs):
        self.full_clean()  # Always run full validation before saving
        super().save(*args, **kwargs)

    def __str__(self):
        # Returns a human-readable representation of the category
        parent_name = f" > {self.parent_category.name}" if self.parent_category else ""
        return f"{self.name}{parent_name} ({'Expense' if self.is_expense else 'Income'})"
    
    def soft_delete(self):
        """Soft delete the category (subcategories should be handled by business logic)"""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=['deleted_at', 'is_active'])


# --- Transaction Model ---
class Transaction(models.Model):
    # Options for transaction types
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

    # Options for transaction status
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

    # Foreign Key to User, PROTECT prevents user deletion if transactions exist
    user               = models.ForeignKey(User, on_delete=models.PROTECT, related_name="transactions", db_index=True)
    # Foreign Key to Account, PROTECT prevents account deletion if transactions exist
    account            = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="transactions", db_index=True)
    # Type of transaction (expense, income, transfer, adjustment)
    transaction_type   = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default=EXPENSE, db_index=True)
    # Link to another transaction (e.g., for transfers where one outgoing links to one incoming)
    # null=True and blank=True allow a transaction to not be linked.
    linked_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    # Status of the transaction (pending, cleared, reconciled, void)
    status             = models.CharField(max_length=10, choices=TRANSACTION_STATUSES, default=CLEARED, db_index=True)
    # Foreign Key to Category, PROTECT prevents category deletion if transactions exist
    category           = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="transactions", db_index=True)
    # Amount of the transaction
    amount             = models.DecimalField(max_digits=10, decimal_places=2)
    # Detailed notes for the transaction, optional
    notes              = models.TextField(blank=True)
    # Date and time of the transaction
    date               = models.DateTimeField(db_index=True)
    
    # Audit fields for tracking
    created_at         = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at         = models.DateTimeField(auto_now=True)
    deleted_at         = models.DateTimeField(null=True, blank=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', '-date']),
            models.Index(fields=['user', 'account', '-date']),
            models.Index(fields=['user', 'category', '-date']),
            models.Index(fields=['user', 'transaction_type', '-date']),
            models.Index(fields=['status', 'transaction_type']),
            models.Index(fields=['user', 'status', '-date']),
            models.Index(fields=['account', 'status', '-date']),
            models.Index(fields=['category', '-date']),
            models.Index(fields=['user', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(amount__gt=0),
                name='positive_amount'
            ),
        ]
        ordering = ['-date', '-id']

    def clean(self):
        """Custom validation for the Transaction model"""
        if self.amount <= 0:
            raise ValidationError({'amount': 'Transaction amount must be positive.'})
        
        if self.transaction_type == self.TRANSFER and not self.linked_transaction:
            raise ValidationError({'linked_transaction': 'Transfer transactions must have a linked transaction.'})
        
        if self.linked_transaction and self.linked_transaction == self:
            raise ValidationError({'linked_transaction': 'A transaction cannot be linked to itself.'})
        
        # Validate that transfer transactions have different accounts
        if self.transaction_type == self.TRANSFER and self.linked_transaction:
            if self.account == self.linked_transaction.account:
                raise ValidationError({'account': 'Transfer transactions must involve different accounts.'})

    def save(self, *args, **kwargs):
        self.full_clean() # Ensure all validations run before saving
        super().save(*args, **kwargs)

    def __str__(self):
        # Returns a human-readable representation of the transaction
        return f"{self.transaction_type.capitalize()} of {self.amount} on {self.date.strftime('%Y-%m-%d')} for {self.category.name} in {self.account.name}"
    
    @property
    def is_active(self):
        """Check if transaction is active (not soft deleted)"""
        return self.deleted_at is None