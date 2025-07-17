# your_app_name/account_views.py
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Account
from ..serializers import AccountSerializer

# --- Account CRUD Views ---

class AccountListCreateAPIView(generics.ListCreateAPIView):
    """
    Handles listing all accounts for the authenticated user and creating new accounts.
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users only see their own active accounts by default, or all if specified.
        """
        # Filter accounts to only show the current user's accounts
        queryset = Account.objects.filter(user=self.request.user)
        # Optional: Allow filtering by active status via query parameter
        is_active_param = self.request.query_params.get('is_active', None)
        if is_active_param is not None:
            queryset = queryset.filter(is_active=(is_active_param.lower() == 'true'))
        return queryset.order_by('name') # Order accounts by name

    def perform_create(self, serializer):
        """
        Automatically associates the new account with the logged-in user.
        Sets initial_balance as the starting point for 'balance' upon creation.
        """
        # When a new account is created, its 'balance' should start with 'initial_balance'
        # If 'balance' is not provided, it defaults to initial_balance.
        # If 'initial_balance' is not provided, it defaults to 0.
        # Ensure that the initial balance is set correctly.
        initial_balance = serializer.validated_data.get('initial_balance', 0)
        # If balance isn't explicitly sent by client, use initial_balance as starting point.
        # Otherwise, the client's provided balance will be used.
        if 'balance' not in serializer.validated_data:
             serializer.validated_data['balance'] = initial_balance
        
        serializer.save(user=self.request.user)

class AccountRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles retrieving, updating, and deleting a specific account by ID.
    Ensures users can only interact with their own accounts.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        """
        Ensures a user can only retrieve, update, or delete their own accounts.
        """
        obj = super().get_object()
        if obj.user != self.request.user:
            raise generics.exceptions.PermissionDenied("You do not have permission to perform this action on this account.")
        return obj

    def perform_destroy(self, instance):
        """
        Performs the delete operation for an account.
        Due to `on_delete=models.PROTECT` on Transaction, deleting an account with
        associated transactions will raise a ProtectedError. This is desired.
        """
        # If you want to "soft delete" (set is_active=False) instead of actual delete,
        # you would update the instance here:
        # instance.is_active = False
        # instance.save(update_fields=['is_active'])
        # return Response(status=status.HTTP_200_OK, data={'message': 'Account deactivated'})
        
        # Current behavior: hard delete. Will raise ProtectedError if transactions exist.
        instance.delete()