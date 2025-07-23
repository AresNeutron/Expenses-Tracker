from django.urls import reverse
from rest_framework import status
from .base import BaseAPITestCase
from api.models import Account, Category, Transaction, User
from django.utils import timezone
from decimal import Decimal

class TransactionAPITestCase(BaseAPITestCase):
    """
    Tests for the Transaction API endpoints.
    """

    def setUp(self):
        super().setUp() # This sets up self.user and self.client
        self.today = timezone.localdate() # Using localdate for date comparisons

        # Create necessary Accounts for the test user
        self.bank_account = Account.objects.create(
            user=self.user,
            name="Checking Account",
            balance=Decimal('1000.00'),
            initial_balance=Decimal('1000.00'),
            currency="USD",
            acc_type="bank"
        )
        self.cash_account = Account.objects.create(
            user=self.user,
            name="Cash Wallet",
            balance=Decimal('200.00'),
            initial_balance=Decimal('200.00'),
            currency="USD",
            acc_type="cash"
        )
        self.credit_card = Account.objects.create(
            user=self.user,
            name="Credit Card",
            balance=Decimal('-500.00'), # Negative balance for credit card
            initial_balance=Decimal('0.00'),
            currency="USD",
            acc_type="card"
        )

        # Create necessary Categories for the test user
        self.expense_category = Category.objects.create(
            user=self.user,
            name="Groceries",
            color="#FF0000",
            is_expense=True
        )
        self.income_category = Category.objects.create(
            user=self.user,
            name="Salary",
            color="#00FF00",
            is_expense=False
        )

        # Create some initial transactions for listing/retrieval
        self.transaction1 = Transaction.objects.create(
            user=self.user,
            account=self.bank_account,
            category=self.expense_category,
            amount=Decimal('50.00'),
            transaction_type='expense',
            notes="Weekly groceries",
            date=self.today
        )
        self.transaction2 = Transaction.objects.create(
            user=self.user,
            account=self.cash_account,
            category=self.income_category,
            amount=Decimal('500.00'),
            transaction_type='income',
            notes="Freelance work",
            date=self.today
        )

        # Other user's setup
        self.other_user = User.objects.create_user(username='otheruser', password='password')
        self.other_account = Account.objects.create(
            user=self.other_user,
            name="Other User Bank",
            balance=Decimal('100.00'),
            initial_balance=Decimal('100.00'),
            currency="USD",
            acc_type="bank"
        )
        self.other_category = Category.objects.create(
            user=self.other_user,
            name="Other User Category",
            color="#123456",
            is_expense=True
        )
        self.other_transaction = Transaction.objects.create(
            user=self.other_user,
            account=self.other_account,
            category=self.other_category,
            amount=Decimal('20.00'),
            transaction_type='expense',
            notes="Other's expense",
            date=self.today
        )

    # --- Test Listing Transactions ---
    def test_list_transactions(self):
        """
        Ensure we can list transactions for the authenticated user only.
        """
        url = reverse('transaction-list-create')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should only see transaction1 and transaction2
        transaction_descriptions = [t['notes'] for t in response.data]
        self.assertIn('Weekly groceries', transaction_descriptions)
        self.assertIn('Freelance work', transaction_descriptions)
        self.assertNotIn("Other's expense", transaction_descriptions)
        self.assertEqual(float(response.data[1]['amount']), 50.00) # Check decimal conversion

    def test_list_transactions_with_filters(self):
        """
        Ensure we can list transactions with filters (e.g., transaction_type).
        """
        # Create an income transaction
        Transaction.objects.create(
            user=self.user,
            account=self.bank_account,
            category=self.income_category,
            amount=Decimal('100.00'),
            transaction_type='income',
            notes="Bonus",
            date=self.today
        )

        url = reverse('transaction-list-create')
        # Filter by expense
        response_expense = self.client.get(url + '?transaction_type=expense', format='json')
        self.assertEqual(response_expense.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_expense.data), 1)
        self.assertEqual(response_expense.data[0]['notes'], 'Weekly groceries')

        # Filter by income
        response_income = self.client.get(url + '?transaction_type=income', format='json')
        self.assertEqual(response_income.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_income.data), 2) # "Freelance work" and "Bonus"

        # Filter by account (using account ID)
        response_bank_account = self.client.get(url + f'?account={self.bank_account.pk}', format='json')
        self.assertEqual(response_bank_account.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_bank_account.data), 2) # "Weekly groceries" and "Bonus"

        # Filter by category
        response_groceries = self.client.get(url + f'?category={self.expense_category.pk}', format='json')
        self.assertEqual(response_groceries.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_groceries.data), 1)
        self.assertEqual(response_groceries.data[0]['notes'], 'Weekly groceries')


    # --- Test Create Transactions ---
    def test_create_expense_transaction(self):
        """
        Ensure we can create an expense transaction and account balance is updated.
        """
        url = reverse('transaction-list-create')
        data = {
            'account': self.bank_account.pk,
            'category': self.expense_category.pk,
            'amount': '25.00', # Sent as string, serializer should handle
            'transaction_type': 'expense',
            'notes': 'Coffee',
        }
        initial_balance = self.bank_account.balance
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.bank_account.refresh_from_db()
        self.assertEqual(self.bank_account.balance, initial_balance - Decimal('25.00'))
        self.assertEqual(Transaction.objects.filter(user=self.user).count(), 3) # Existing 2 + new 1


    # def test_create_income_transaction(self):
    #     """
    #     Ensure we can create an income transaction and account balance is updated.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.cash_account.pk,
    #         'category': self.income_category.pk,
    #         'amount': '150.00',
    #         'transaction_type': 'income',
    #         'notes': 'Gift',
    #         'date': self.today.isoformat()
    #     }
    #     initial_balance = self.cash_account.balance
    #     response = self.client.post(url, data, format='json')

    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.cash_account.refresh_from_db()
    #     self.assertEqual(self.cash_account.balance, initial_balance + Decimal('150.00'))

    # def test_create_transfer_transaction(self):
    #     """
    #     Ensure we can create a transfer transaction and both account balances are updated.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'target_account': self.cash_account.pk,
    #         'amount': '100.00',
    #         'transaction_type': 'transfer',
    #         'notes': 'Transfer to cash',
    #         'date': self.today.isoformat()
    #         # Category is not required for transfers
    #     }
    #     initial_bank_balance = self.bank_account.balance
    #     initial_cash_balance = self.cash_account.balance
    #     response = self.client.post(url, data, format='json')

    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.bank_account.refresh_from_db()
    #     self.cash_account.refresh_from_db()

    #     self.assertEqual(self.bank_account.balance, initial_bank_balance - Decimal('100.00'))
    #     self.assertEqual(self.cash_account.balance, initial_cash_balance + Decimal('100.00'))
    #     # Transfers create 2 transactions: one expense-like, one income-like
    #     self.assertEqual(Transaction.objects.filter(user=self.user, transaction_type='transfer').count(), 2)

    # # --- Test Create Transaction Validations ---
    # def test_create_expense_insufficient_balance(self):
    #     """
    #     Ensure expense transaction fails if account has insufficient balance (for non-credit cards).
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'category': self.expense_category.pk,
    #         'amount': '2000.00', # More than current balance
    #         'transaction_type': 'expense',
    #         'notes': 'Too much coffee',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     # The error message comes from custom validation, usually in non_field_errors or a specific field
    #     # For simplicity, we check if the message is in the general details or specific fields
    #     self.assertIn('Insufficient balance.', response.data['error']['details'].get('amount', [None])[0] or response.data['error']['details'].get('non_field_errors', [None])[0])
    #     # Restore account balance for other tests if it was consumed.
    #     self.bank_account.refresh_from_db()
    #     self.assertEqual(self.bank_account.balance, Decimal('1000.00')) # Balance should not have changed


    # def test_create_transfer_insufficient_balance(self):
    #     """
    #     Ensure transfer transaction fails if source account has insufficient balance.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'target_account': self.cash_account.pk,
    #         'amount': '2000.00', # More than current balance
    #         'transaction_type': 'transfer',
    #         'notes': 'Too much transfer',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('Insufficient balance in source account.', response.data['error']['details'].get('amount', [None])[0] or response.data['error']['details'].get('non_field_errors', [None])[0])
    #     self.bank_account.refresh_from_db()
    #     self.cash_account.refresh_from_db()
    #     self.assertEqual(self.bank_account.balance, Decimal('1000.00'))
    #     self.assertEqual(self.cash_account.balance, Decimal('200.00'))


    # def test_create_transaction_credit_card_expense(self):
    #     """
    #     Ensure expense transaction works with a credit card (balance becomes more negative).
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.credit_card.pk,
    #         'category': self.expense_category.pk,
    #         'amount': '100.00',
    #         'transaction_type': 'expense',
    #         'notes': 'Online purchase',
    #         'date': self.today.isoformat()
    #     }
    #     initial_balance = self.credit_card.balance # -500.00
    #     response = self.client.post(url, data, format='json')

    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.credit_card.refresh_from_db()
    #     self.assertEqual(self.credit_card.balance, initial_balance - Decimal('100.00')) # -500 - 100 = -600


    # def test_create_transaction_credit_card_income(self):
    #     """
    #     Ensure income transaction on credit card reduces negative balance.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.credit_card.pk,
    #         'category': self.income_category.pk,
    #         'amount': '200.00',
    #         'transaction_type': 'income',
    #         'notes': 'Payment to credit card',
    #         'date': self.today.isoformat()
    #     }
    #     initial_balance = self.credit_card.balance # -500.00
    #     response = self.client.post(url, data, format='json')

    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.credit_card.refresh_from_db()
    #     self.assertEqual(self.credit_card.balance, initial_balance + Decimal('200.00')) # -500 + 200 = -300


    # def test_create_transaction_invalid_account(self):
    #     """
    #     Ensure transaction creation fails if account does not belong to user.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.other_account.pk, # Account of another user
    #         'category': self.expense_category.pk,
    #         'amount': '10.00',
    #         'transaction_type': 'expense',
    #         'notes': 'Foreign account',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('account', response.data['error']['details'])
    #     self.assertIn('Invalid pk value - object does not exist.', response.data['error']['details']['account'][0])


    # def test_create_transaction_invalid_category(self):
    #     """
    #     Ensure transaction creation fails if category does not belong to user.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'category': self.other_category.pk, # Category of another user
    #         'amount': '10.00',
    #         'transaction_type': 'expense',
    #         'notes': 'Foreign category',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('category', response.data['error']['details'])
    #     self.assertIn('Invalid pk value - object does not exist.', response.data['error']['details']['category'][0])


    # def test_create_transfer_same_account(self):
    #     """
    #     Ensure transfer transaction fails if source and target accounts are the same.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'target_account': self.bank_account.pk, # Same account
    #         'amount': '10.00',
    #         'transaction_type': 'transfer',
    #         'notes': 'Self transfer',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('non_field_errors', response.data['error']['details'])
    #     self.assertIn('Source and target accounts cannot be the same for a transfer.', response.data['error']['details']['non_field_errors'][0])


    # def test_create_expense_with_income_category_mismatch(self):
    #     """
    #     Ensure expense transaction fails if linked to an income category that is_expense=False.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'category': self.income_category.pk, # is_expense=False
    #         'amount': '10.00',
    #         'transaction_type': 'expense',
    #         'notes': 'Mismatched category',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('category', response.data['error']['details']) # Error should be on category field
    #     self.assertIn("Expense transactions must be linked to an expense category.", response.data['error']['details']['category'][0])


    # def test_create_income_with_expense_category_mismatch(self):
    #     """
    #     Ensure income transaction fails if linked to an expense category that is_expense=True.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'category': self.expense_category.pk, # is_expense=True
    #         'amount': '10.00',
    #         'transaction_type': 'income',
    #         'notes': 'Mismatched category',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('category', response.data['error']['details'])
    #     self.assertIn("Income transactions must be linked to an income category.", response.data['error']['details']['category'][0])


    # def test_create_transfer_with_category_provided(self):
    #     """
    #     Ensure transfer transaction fails if a category is provided.
    #     """
    #     url = reverse('transaction-list-create')
    #     data = {
    #         'account': self.bank_account.pk,
    #         'target_account': self.cash_account.pk,
    #         'category': self.expense_category.pk, # Category provided for transfer
    #         'amount': '10.00',
    #         'transaction_type': 'transfer',
    #         'notes': 'Transfer with category',
    #         'date': self.today.isoformat()
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn('category', response.data['error']['details'])
    #     self.assertIn('Category should not be provided for transfer transactions.', response.data['error']['details']['category'][0])


    # # --- Test Retrieve Transaction ---
    # def test_retrieve_transaction(self):
    #     """
    #     Ensure we can retrieve a single transaction.
    #     """
    #     url = reverse('transaction-detail', kwargs={'pk': self.transaction1.pk})
    #     response = self.client.get(url, format='json')

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data['notes'], 'Weekly groceries')
    #     self.assertEqual(float(response.data['amount']), 50.00) # Ensure decimal converted back

    # def test_retrieve_transaction_not_owned(self):
    #     """
    #     Ensure user cannot retrieve a transaction they don't own.
    #     """
    #     url = reverse('transaction-detail', kwargs={'pk': self.other_transaction.pk})
    #     response = self.client.get(url, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn("You do not have permission to perform this action.", response.data['error']['message'])
    #     self.assertIn("You do not have permission to perform this action on this transaction.", response.data['error']['details']['detail'])


    # # --- Test Update Transaction (Not Allowed) ---
    # def test_update_transaction_not_allowed(self):
    #     """
    #     Ensure direct update of transaction is explicitly NOT allowed.
    #     """
    #     url = reverse('transaction-detail', kwargs={'pk': self.transaction1.pk})
    #     update_data = {
    #         'notes': 'Updated notes',
    #         'amount': '100.00'
    #     }
    #     response_put = self.client.put(url, update_data, format='json')
    #     self.assertEqual(response_put.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
    #     self.assertIn('error', response_put.data)
    #     self.assertIn('details', response_put.data['error'])
    #     self.assertIn('Method "PUT" not allowed.', response_put.data['error']['details']['detail'])

    #     response_patch = self.client.patch(url, {'notes': 'Partial Update'}, format='json')
    #     self.assertEqual(response_patch.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
    #     self.assertIn('error', response_patch.data)
    #     self.assertIn('details', response_patch.data['error'])
    #     self.assertIn('Method "PATCH" not allowed.', response_patch.data['error']['details']['detail'])

    #     # Verify transaction state remains unchanged
    #     self.transaction1.refresh_from_db()
    #     self.assertEqual(self.transaction1.notes, 'Weekly groceries')
    #     self.assertEqual(self.transaction1.amount, Decimal('50.00'))


    # # --- Test Soft Delete Transaction ---
    # def test_soft_delete_transaction(self):
    #     """
    #     Ensure soft delete works correctly and account balance is reversed.
    #     """
    #     initial_balance = self.bank_account.balance # Current balance after transaction1 (1000 - 50 = 950)
    #     url = reverse('transaction-detail', kwargs={'pk': self.transaction1.pk})
    #     response = self.client.delete(url)

    #     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    #     self.transaction1.refresh_from_db()
    #     self.bank_account.refresh_from_db() # Refresh account balance

    #     self.assertFalse(self.transaction1.is_active)
    #     self.assertIsNotNone(self.transaction1.deleted_at)
    #     self.assertEqual(self.bank_account.balance, initial_balance + self.transaction1.amount) # Balance reversed (950 + 50 = 1000)

    #     # Ensure it's not listed in active transactions anymore
    #     list_url = reverse('transaction-list-create')
    #     list_response = self.client.get(list_url, format='json')
    #     self.assertEqual(len(list_response.data), 1) # Only transaction2 should remain active

    # def test_soft_delete_income_transaction(self):
    #     """
    #     Ensure soft delete for income transaction correctly reverses balance.
    #     """
    #     initial_balance = self.cash_account.balance # Current balance after transaction2 (200 + 500 = 700)
    #     url = reverse('transaction-detail', kwargs={'pk': self.transaction2.pk})
    #     response = self.client.delete(url)

    #     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    #     self.transaction2.refresh_from_db()
    #     self.cash_account.refresh_from_db()

    #     self.assertFalse(self.transaction2.is_active)
    #     self.assertIsNotNone(self.transaction2.deleted_at)
    #     self.assertEqual(self.cash_account.balance, initial_balance - self.transaction2.amount) # Balance reversed (700 - 500 = 200)

    # def test_soft_delete_transfer_transaction(self):
    #     """
    #     Ensure soft delete for transfer transaction correctly reverses both account balances.
    #     """
    #     # Create a new transfer for this test to avoid interfering with others
    #     transfer_from_bank = self.bank_account.balance
    #     transfer_to_cash = self.cash_account.balance
    #     transfer_amount = Decimal('50.00')

    #     transfer_trx_out = Transaction.objects.create(
    #         user=self.user,
    #         account=self.bank_account,
    #         amount=transfer_amount,
    #         transaction_type='transfer',
    #         notes='Test Transfer Out',
    #         date=self.today,
    #         is_active=True,
    #         target_account=self.cash_account
    #     )
    #     transfer_trx_in = Transaction.objects.create(
    #         user=self.user,
    #         account=self.cash_account,
    #         amount=transfer_amount,
    #         transaction_type='transfer',
    #         notes='Test Transfer In',
    #         date=self.today,
    #         is_active=True,
    #         target_account=self.bank_account # The other end of the transfer
    #     )
    #     # Link them for proper reversal logic
    #     transfer_trx_out.related_transaction = transfer_trx_in
    #     transfer_trx_out.save()
    #     transfer_trx_in.related_transaction = transfer_trx_out
    #     transfer_trx_in.save()

    #     # Update balances as if transfer just happened
    #     self.bank_account.balance -= transfer_amount
    #     self.bank_account.save()
    #     self.cash_account.balance += transfer_amount
    #     self.cash_account.save()

    #     # Store initial balances *after* the transfer for reversal check
    #     initial_bank_balance_after_transfer = self.bank_account.balance
    #     initial_cash_balance_after_transfer = self.cash_account.balance

    #     # Now, delete one side of the transfer (e.g., the 'out' side)
    #     url = reverse('transaction-detail', kwargs={'pk': transfer_trx_out.pk})
    #     response = self.client.delete(url)

    #     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    #     transfer_trx_out.refresh_from_db()
    #     transfer_trx_in.refresh_from_db() # Refresh both linked transactions
    #     self.bank_account.refresh_from_db()
    #     self.cash_account.refresh_from_db()

    #     # Both linked transactions should be inactive
    #     self.assertFalse(transfer_trx_out.is_active)
    #     self.assertFalse(transfer_trx_in.is_active)
    #     self.assertIsNotNone(transfer_trx_out.deleted_at)
    #     self.assertIsNotNone(transfer_trx_in.deleted_at)

    #     # Balances should revert to before the transfer
    #     self.assertEqual(self.bank_account.balance, initial_bank_balance_after_transfer + transfer_amount)
    #     self.assertEqual(self.cash_account.balance, initial_cash_balance_after_transfer - transfer_amount)


    # def test_soft_delete_transaction_not_owned(self):
    #     """
    #     Ensure user cannot soft delete a transaction they don't own.
    #     """
    #     url = reverse('transaction-detail', kwargs={'pk': self.other_transaction.pk})
    #     response = self.client.delete(url)
    #     self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    #     self.other_transaction.refresh_from_db()
    #     self.assertTrue(self.other_transaction.is_active) # Should not be deleted
    #     self.assertIn('error', response.data)
    #     self.assertIn('details', response.data['error'])
    #     self.assertIn("You do not have permission to perform this action.", response.data['error']['message'])
    #     self.assertIn("You do not have permission to perform this action on this transaction.", response.data['error']['details']['detail'])