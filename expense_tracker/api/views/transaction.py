# your_app_name/transaction_views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Transaction
from ..serializers import TransactionSerializer

# --- Transaction CRUD Views ---

class TransactionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users only see their own transactions.
        """
        # Filter transactions to only show the current user's transactions
        return Transaction.objects.filter(user=self.request.user).order_by('-date', '-id') # Order by date descending

    def perform_create(self, serializer):
        serializer.save(user=self.request.user) # Assign the user to the transaction

class TransactionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles retrieving, updating, and deleting a specific transaction by ID.
    Ensures users can only interact with their own transactions.
    """
    queryset = Transaction.objects.all() # All transactions are loaded first, then filtered by get_object
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk' # The URL keyword argument for lookup (e.g., /transactions/123/)

    def get_object(self):
        """
        Ensures a user can only retrieve, update, or delete their own transactions.
        """
        # Get the transaction based on the lookup field (pk)
        obj = super().get_object()
        # Check if the retrieved object belongs to the current user
        if obj.user != self.request.user:
            raise generics.exceptions.PermissionDenied("You do not have permission to perform this action on this transaction.")
        return obj

    def perform_update(self, serializer):
        """
        Performs the update operation.
        The model's save method will handle balance adjustments.
        """
        serializer.save(user=self.request.user) # Ensure user is not changed accidentally
        
    def perform_destroy(self, instance):
        if instance.status in [Transaction.CLEARED, Transaction.RECONCILED]:
            # Determine the factor for reversal
            factor = 0
            if instance.transaction_type == Transaction.EXPENSE:
                factor = 1 # Adding back for an expense
            elif instance.transaction_type == Transaction.INCOME:
                factor = -1 # Subtracting for an income
            elif instance.transaction_type == Transaction.TRANSFER:
                factor = 1 # Adding back for an outgoing transfer
            elif instance.transaction_type == Transaction.ADJUSTMENT:
                factor = -1 # Subtracting if amount was positive, adding if negative

            instance.account.balance += (factor * instance.amount)
            instance.account.save(update_fields=["balance"])
        
        instance.delete()