from django.urls import reverse
from rest_framework import status
from .base import BaseAPITestCase # Asegúrate de que esta importación es correcta
from api.models import Account # Asegúrate de que esta importación es correcta
from django.contrib.auth.models import User # Importar User para crear otro usuario si es necesario
from django.utils import timezone

class AccountAPITestCase(BaseAPITestCase):
    """
    Tests for the Account API endpoints.
    """

    def setUp(self):
        super().setUp()
        pass

    def test_list_accounts(self):
        """
        Ensure we can list accounts for the authenticated user and only active ones by default.
        """
        Account.objects.create(
            user=self.user,
            name="Test Checking",
            balance=1000.00,
            initial_balance=1000.00, # Added initial_balance
            currency="USD",
            acc_type="bank"
        )
        Account.objects.create(
            user=User.objects.create_user(username='otheruser', password='password', email="otheruseremail"),
            name="Other User's Account",
            balance=500.00,
            initial_balance=500.00,
            currency="EUR",
            acc_type="cash"
        )
        # Create an inactive account for the test user
        Account.objects.create(
            user=self.user,
            name="Inactive Savings",
            balance=200.00,
            initial_balance=200.00,
            currency="USD",
            acc_type="bank",
            is_active=False
        )


        url = reverse('account-list-create')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Only one active account for 'testuser'
        self.assertEqual(response.data[0]['name'], 'Test Checking')
        self.assertEqual(float(response.data[0]['balance']), 1000.00)
        self.assertTrue(response.data[0]['is_active'])

        # Test listing inactive accounts
        response_inactive = self.client.get(url + '?is_active=false', format='json')
        self.assertEqual(response_inactive.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_inactive.data), 1)
        self.assertEqual(response_inactive.data[0]['name'], 'Inactive Savings')
        self.assertFalse(response_inactive.data[0]['is_active'])


    def test_create_account(self):
        """
        Ensure we can create a new account with correct initial balance.
        """
        url = reverse('account-list-create')
        data = {
            'name': 'New Savings',
            'acc_type': 'bank',
            'currency': 'EUR',
            'initial_balance': 500.00, # Only send initial_balance
            'is_active': True
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check if 1 account was created (the one in this test)
        self.assertEqual(Account.objects.filter(user=self.user).count(), 1)
        new_account = Account.objects.get(name='New Savings', user=self.user)
        self.assertEqual(new_account.user, self.user)
        self.assertEqual(float(new_account.initial_balance), 500.00)
        self.assertEqual(float(new_account.balance), 500.00) # Balance should be set to initial_balance

    def test_create_account_empty_name(self):
        """
        Ensure account creation fails with an empty name (including whitespace).
        """
        url = reverse('account-list-create')
        data = {
            'name': ' ', # O ''
            'acc_type': 'bank',
            'currency': 'USD',
            'initial_balance': 0,
            'is_active': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data['error']['details'])
        # CAMBIO: Espera el mensaje predeterminado de DRF para campos en blanco
        self.assertEqual(response.data['error']['details']['name'][0], 'This field may not be blank.')

    def test_create_account_credit_card_positive_initial_balance(self):
        """
        Ensure account creation fails for credit card with positive initial balance.
        """
        url = reverse('account-list-create')
        data = {
            'name': 'My Credit Card',
            'acc_type': 'card',
            'currency': 'USD',
            'initial_balance': 100.00, # Positive initial_balance (should fail)
            'is_active': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # CAMBIO: Acceder al error en el formato personalizado
        self.assertIn('initial_balance', response.data['error']['details'])
        self.assertIn('Credit card accounts should not have positive initial balances.', response.data['error']['details']['initial_balance'][0])

    def test_create_account_non_card_negative_initial_balance(self):
        """
        Ensure account creation fails for non-credit card with negative initial balance.
        """
        url = reverse('account-list-create')
        data = {
            'name': 'My Bank Account',
            'acc_type': 'bank',
            'currency': 'USD',
            'initial_balance': -50.00, # Negative initial_balance (should fail)
            'is_active': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # CAMBIO: Acceder al error en el formato personalizado
        self.assertIn('initial_balance', response.data['error']['details'])
        self.assertIn('Initial balance cannot be negative for this account type.', response.data['error']['details']['initial_balance'][0])


    def test_retrieve_account(self):
        """
        Ensure we can retrieve a single account.
        """
        account = Account.objects.create(
            user=self.user,
            name="Retrieve Me",
            balance=200.00,
            initial_balance=200.00,
            currency="GBP",
            acc_type="other"
        )
        url = reverse('account-detail', kwargs={'pk': account.pk})
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Retrieve Me')
        self.assertEqual(float(response.data['balance']), 200.00)
        self.assertEqual(response.data['acc_type'], 'other')
        self.assertEqual(response.data['user'], self.user.username)


    def test_retrieve_account_not_owned(self):
        """
        Ensure user cannot retrieve an account they don't own.
        """
        other_user = User.objects.create_user(username='otheruser', password='password')
        account = Account.objects.create(
            user=other_user,
            name="Not My Account",
            balance=100.00,
            initial_balance=100.00,
            currency="USD",
            acc_type="bank"
        )
        url = reverse('account-detail', kwargs={'pk': account.pk})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # CAMBIO: Acceder al error en el formato personalizado
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn("You do not have permission", response.data['error']['details']['detail'])


    def test_update_account_not_allowed(self):
        """
        Ensure direct update of account is explicitly NOT allowed.
        """
        account = Account.objects.create(
            user=self.user,
            name="Account To Not Update",
            balance=300.00,
            initial_balance=300.00,
            currency="USD",
            acc_type="bank"
        )
        url = reverse('account-detail', kwargs={'pk': account.pk})
        update_data = {
            'name': 'Attempted Update Name',
            'balance': 350.00,
            'initial_balance': 350.00,
            'acc_type': 'cash'
        }

        # Test PUT (full update)
        response_put = self.client.put(url, update_data, format='json')
        self.assertEqual(response_put.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        # CAMBIO: Acceder al error en el formato personalizado
        self.assertIn('error', response_put.data)
        self.assertIn('details', response_put.data['error'])
        self.assertIn('Method "PUT" not allowed.', response_put.data['error']['details']['detail'])


        # Test PATCH (partial update)
        response_patch = self.client.patch(url, {'name': 'Partial Update Attempt'}, format='json')
        self.assertEqual(response_patch.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        # CAMBIO: Acceder al error en el formato personalizado
        self.assertIn('error', response_patch.data)
        self.assertIn('details', response_patch.data['error'])
        self.assertIn('Method "PATCH" not allowed.', response_patch.data['error']['details']['detail'])

        # Verify account state remains unchanged
        account.refresh_from_db()
        self.assertEqual(account.name, "Account To Not Update")
        self.assertEqual(float(account.balance), 300.00)
        self.assertEqual(float(account.initial_balance), 300.00)
        self.assertEqual(account.acc_type, 'bank')


    def test_soft_delete_account(self):
        """
        Ensure soft delete works correctly and account is marked inactive.
        """
        account = Account.objects.create(
            user=self.user,
            name="Account To Soft Delete",
            balance=100.00,
            initial_balance=100.00,
            currency="USD",
            acc_type="cash"
        )
        url = reverse('account-detail', kwargs={'pk': account.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        account.refresh_from_db()
        self.assertFalse(account.is_active)
        self.assertIsNotNone(account.deleted_at)
        self.assertLessEqual(account.deleted_at, timezone.now()) # Check deleted_at is set to a recent time

        # Ensure soft-deleted account is NOT listed in active accounts by default
        list_url = reverse('account-list-create')
        list_response = self.client.get(list_url, format='json')
        self.assertEqual(len(list_response.data), 0) # Assumes this is the only active account for user

        # Ensure soft-deleted account IS listed if explicitly requested by is_active=false
        list_inactive_url = reverse('account-list-create') + '?is_active=false'
        list_inactive_response = self.client.get(list_inactive_url, format='json')
        self.assertEqual(list_inactive_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_inactive_response.data), 1)
        self.assertEqual(list_inactive_response.data[0]['name'], 'Account To Soft Delete')
        self.assertFalse(list_inactive_response.data[0]['is_active'])

