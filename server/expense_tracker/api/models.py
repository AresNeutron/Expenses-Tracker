from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


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
    user               = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions", db_index=True)
    is_expense         = models.BooleanField(db_index=True)

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
            models.Index(fields=['user', 'is_expense']),
            models.Index(fields=['user', '-created_at']),
        ]
        
        ordering = ['-id']

    def clean(self):
        if self.amount <= 0:
            raise ValidationError({'amount': 'Transaction amount must be positive.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    @property
    def is_active(self):
        return self.deleted_at is None