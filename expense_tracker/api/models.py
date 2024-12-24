from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expenses", null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(max_length=255)
    date = models.DateField(blank=True, null=True)
    is_expense = models.BooleanField(default=True)
    category = models.CharField(max_length=255)

    def __str__(self):
        return self.description