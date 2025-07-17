from django.db import models
from django.contrib.auth.models import User

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
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accounts")
    # Name of the account (e.g., "Checking Account", "Savings", "Cash")
    name            = models.CharField(max_length=100)
    # Type of account using predefined choices
    acc_type        = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default=BANK)
    # Currency of the account (e.g., "USD", "EUR")
    currency        = models.CharField(max_length=3, default="USD")
    # Current balance of the account
    balance         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Initial balance when the account is created, useful for auditing
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0) 
    # Flag to indicate if the account is active or inactive (not deleted)
    is_active       = models.BooleanField(default=True) 

    def __str__(self):
        # Returns a human-readable representation of the account
        return f"{self.name} ({self.get_acc_type_display()})"

# --- Category Model ---
class Category(models.Model):
    # Foreign Key to User model, CASCADE deletes categories if user is deleted
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    # Name of the category (e.g., "Groceries", "Salary", "Utilities")
    name            = models.CharField(max_length=100)
    parent_category = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    is_expense = models.BooleanField(default=True)

    class Meta: 
        # Ensures that a user cannot have two categories with the exact same name
        unique_together = ("user", "name")

    def __str__(self):
        # Returns a human-readable representation of the category
        return f"{self.name} ({'Expense' if self.is_expense else 'Income'})"

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
    user               = models.ForeignKey(User, on_delete=models.PROTECT, related_name="transactions")
    # Foreign Key to Account, PROTECT prevents account deletion if transactions exist
    account            = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="transactions")
    # Type of transaction (expense, income, transfer, adjustment)
    transaction_type   = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default=EXPENSE)
    # Link to another transaction (e.g., for transfers where one outgoing links to one incoming)
    # null=True and blank=True allow a transaction to not be linked.
    linked_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    # Status of the transaction (pending, cleared, reconciled, void)
    status             = models.CharField(max_length=10, choices=TRANSACTION_STATUSES, default=CLEARED)
    # Foreign Key to Category, PROTECT prevents category deletion if transactions exist
    category           = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="transactions")
    # Amount of the transaction
    amount             = models.DecimalField(max_digits=10, decimal_places=2)
    # Detailed notes for the transaction, optional
    notes              = models.TextField(blank=True)
    # Date and time of the transaction
    date               = models.DateTimeField()

    def save(self, *args, **kwargs):
        # Store the original transaction before saving, if it exists (for updates)
        # This is crucial to correctly reverse previous balance adjustments during updates.
        old_transaction = None
        if self.pk: # self.pk exists if the object is already in the database
            try:
                old_transaction = Transaction.objects.get(pk=self.pk)
            except Transaction.DoesNotExist:
                pass # Object is new, or was just created in a race condition

        # 1. Save the transaction to the database
        super().save(*args, **kwargs)

        # 2. Adjust the associated account's balance
        # Only adjust balance for 'cleared' or 'reconciled' transactions
        if self.status in [self.CLEARED, self.RECONCILED]:
            # Calculate the impact factor based on transaction type
            if self.transaction_type == self.EXPENSE:
                factor = -1
            elif self.transaction_type == self.INCOME:
                factor = 1
            elif self.transaction_type == self.TRANSFER:
                # Transfers require special handling. Assuming this transaction is the 'out' part,
                # or that transfers are handled by two separate transactions linked by linked_transaction.
                # For a simple 'save' method, we'll assume this is an 'expense' from current account.
                factor = -1
            elif self.transaction_type == self.ADJUSTMENT:
                 # Adjustments might increase or decrease, depending on how they are defined.
                 # For simplicity, let's assume positive adjustments increase, negative decrease.
                 # User would input a positive amount for an increase, negative for a decrease.
                 factor = 1 # The amount itself will determine the sign
            else:
                factor = 0 # Should not happen with choices, but as a fallback

            # Calculate the new balance change
            balance_change = factor * self.amount

            # If this is an update to an existing transaction, we need to reverse the old impact
            # and then apply the new impact to avoid double counting or incorrect adjustments.
            if old_transaction and old_transaction.status in [old_transaction.CLEARED, old_transaction.RECONCILED]:
                old_factor = -1 if old_transaction.transaction_type == self.EXPENSE else \
                             (1 if old_transaction.transaction_type == self.INCOME else \
                              (-1 if old_transaction.transaction_type == self.TRANSFER else \
                                (1 if old_transaction.transaction_type == self.ADJUSTMENT else 0)))
                
                # If account changed or status changed from cleared/reconciled, reverse old transaction from its original account
                if old_transaction.account != self.account or old_transaction.status != self.status:
                     old_transaction.account.balance -= (old_factor * old_transaction.amount)
                     old_transaction.account.save(update_fields=["balance"])
                else: # Same account, simply revert the old impact and apply the new
                    self.account.balance -= (old_factor * old_transaction.amount)
            
            # Apply the new balance change to the current account
            self.account.balance += balance_change
            self.account.save(update_fields=["balance"])
        elif old_transaction and old_transaction.status in [old_transaction.CLEARED, old_transaction.RECONCILED] and self.status not in [self.CLEARED, self.RECONCILED]:
            # If the status changes from cleared/reconciled to something else (e.g., pending, void),
            # we need to reverse the previous impact on the balance.
            old_factor = -1 if old_transaction.transaction_type == self.EXPENSE else \
                         (1 if old_transaction.transaction_type == self.INCOME else \
                          (-1 if old_transaction.transaction_type == self.TRANSFER else \
                           (1 if old_transaction.transaction_type == self.ADJUSTMENT else 0)))
            
            self.account.balance -= (old_factor * old_transaction.amount)
            self.account.save(update_fields=["balance"])

    def __str__(self):
        # Returns a human-readable representation of the transaction
        return f"{self.transaction_type.capitalize()} of {self.amount} on {self.date} for {self.category.name} in {self.account.name}"