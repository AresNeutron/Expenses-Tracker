from django.db import models
# from django.db.models import Q

# --- DefaultCategory Model for System Categories ---
class DefaultCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_expense = models.BooleanField(default=True)
    icon = models.CharField(max_length=50, blank=True, default='')
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Optional parent for hierarchical default categories (if needed, otherwise remove)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True,
                              related_name='children')
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name} ({'Expense' if self.is_expense else 'Income'})"
    
    @classmethod
    def populate_defaults(cls):
        """Populate the database with common default categories"""
        expense_categories = [
            ('Food & Dining', '🍽️', '#FF6B6B', 1),
            ('Transportation', '🚗', '#4ECDC4', 2),
            ('Shopping', '🛍️', '#45B7D1', 3),
            ('Entertainment', '🎬', '#96CEB4', 4),
            ('Bills & Utilities', '💡', '#FFEAA7', 5),
            ('Healthcare', '🏥', '#DDA0DD', 6),
            ('Education', '📚', '#98D8C8', 7),
            ('Travel', '✈️', '#F7DC6F', 8),
            ('Personal Care', '💄', '#BB8FCE', 9),
            ('Other Expenses', '📦', '#85C1E9', 10),
        ]
        
        income_categories = [
            ('Salary', '💰', '#2ECC71', 1),
            ('Freelance', '💻', '#3498DB', 2),
            ('Investment', '📈', '#9B59B6', 3),
            ('Gift', '🎁', '#E74C3C', 4),
            ('Other Income', '💵', '#F39C12', 5),
        ]
        
        # Create expense categories
        for name, icon, color, order in expense_categories:
            cls.objects.get_or_create(
                name=name,
                defaults={
                    'is_expense': True,
                    'icon': icon,
                    'color': color,
                    'order': order,
                    'is_active': True
                }
            )
        
        # Create income categories
        for name, icon, color, order in income_categories:
            cls.objects.get_or_create(
                name=name,
                defaults={
                    'is_expense': False,
                    'icon': icon,
                    'color': color,
                    'order': order + 100,  # Offset to separate from expenses
                    'is_active': True
                }
            )