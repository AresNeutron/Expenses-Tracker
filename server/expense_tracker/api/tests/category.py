from django.urls import reverse
from rest_framework import status
from .base import BaseAPITestCase 
from api.models import Category, User, Transaction
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal

class CategoryAPITestCase(BaseAPITestCase):
    """
    Tests for the Category API endpoints.
    """

    def setUp(self):
        super().setUp()
        # Create a base category for the test user for retrieval/update/delete tests
        self.category1 = Category.objects.create(
            user=self.user,
            name="Food",
            color="#FF0000",
            is_expense=True
        )
        self.category2 = Category.objects.create(
            user=self.user,
            name="Salary",
            color="#00FF00",
            is_expense=False
        )
        # Create a category for another user (should not be accessible)
        self.other_user = User.objects.create_user(username='otheruser', password='password')
        self.other_category = Category.objects.create(
            user=self.other_user,
            name="Other User's Category",
            color="#0000FF",
            is_expense=True
        )

    def test_list_categories(self):
        """
        Ensure we can list categories for the authenticated user only.
        """
        url = reverse('category-list-create') # Assuming 'category-list-create' for ListCreateAPIView
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should only see self.category1 and self.category2
        category_names = [c['name'] for c in response.data]
        self.assertIn('Food', category_names)
        self.assertIn('Salary', category_names)
        self.assertNotIn("Other User's Category", category_names)

    def test_create_category(self):
        """
        Ensure we can create a new category.
        """
        url = reverse('category-list-create')
        data = {
            'name': 'Utilities',
            'color': '#FFFF00',
            'is_expense': True
            # 'user' is automatically set by perform_create
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.filter(user=self.user).count(), 3) # Existing 2 + new 1
        new_category = Category.objects.get(name='Utilities', user=self.user)
        self.assertEqual(new_category.user, self.user)
        self.assertEqual(new_category.color, '#FFFF00')

    def test_create_category_duplicate_name(self):
        """
        Ensure we cannot create a category with a duplicate name for the same user.
        """
        url = reverse('category-list-create')
        data = {
            'name': 'Food', # Duplicate name
            'color': '#FF0000',
            'is_expense': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify the custom error format
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn('non_field_errors', response.data['error']['details']) # UniqueTogetherValidator puts error here
        self.assertIn("You already have a category with this name.", response.data['error']['details']['non_field_errors'][0])


    def test_create_category_invalid_color(self):
        """
        Ensure category creation fails with an invalid hex color.
        """
        url = reverse('category-list-create')
        data = {
            'name': 'Invalid Color Cat',
            'color': 'INVALID', # Invalid hex color
            'is_expense': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn('color', response.data['error']['details'])
        self.assertIn('Color must be a valid 6-digit hex code starting with #.', response.data['error']['details']['color'][0])


    def test_retrieve_category(self):
        """
        Ensure we can retrieve a single category.
        """
        url = reverse('category-detail', kwargs={'pk': self.category1.pk}) # Assuming 'category-detail' for RetrieveUpdateDestroyAPIView
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Food')
        self.assertEqual(response.data['color'], '#FF0000')


    def test_retrieve_category_not_owned(self):
        """
        Ensure user cannot retrieve a category they don't own.
        """
        url = reverse('category-detail', kwargs={'pk': self.other_category.pk})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # Verify the custom error format for PermissionDenied
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn("You do not have permission to perform this action.", response.data['error']['message']) # From custom_exception_handler
        # Also check the specific message from the viewset that ends up in 'details'
        self.assertIn("You do not have permission to perform this action on this category.", response.data['error']['details']['detail'])


    def test_update_category(self):
        """
        Ensure we can update an existing category.
        """
        url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        update_data = {
            'name': 'Groceries',
            'color': '#AA00FF',
            'is_expense': False # Change type
        }
        response = self.client.put(url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category1.refresh_from_db()
        self.assertEqual(self.category1.name, 'Groceries')
        self.assertEqual(self.category1.color, '#AA00FF')
        self.assertFalse(self.category1.is_expense)

    def test_update_category_not_owned(self):
        """
        Ensure user cannot update a category they don't own.
        """
        url = reverse('category-detail', kwargs={'pk': self.other_category.pk})
        update_data = {'name': 'Attempted Update'}
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn("You do not have permission to perform this action.", response.data['error']['message'])
        self.assertIn("You do not have permission to perform this action on this category.", response.data['error']['details']['detail'])


    def test_soft_delete_category(self):
        """
        Ensure category can be deleted if no transactions are linked.
        """
        # Create a category specifically for deletion that has no linked transactions
        category_to_delete = Category.objects.create(
            user=self.user,
            name="Temporary Category",
            color="#CCCCCC",
            is_expense=True
        )
        url = reverse('category-detail', kwargs={'pk': category_to_delete.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Ensure it's actually deleted from the DB
        self.assertFalse(Category.objects.filter(pk=category_to_delete.pk).exists())
        # Ensure it's not listed anymore
        list_url = reverse('category-list-create')
        list_response = self.client.get(list_url, format='json')
        self.assertEqual(len(list_response.data), 2) # Still self.category1 and self.category2

    def test_delete_category_with_transactions(self):
        """
        Ensure category cannot be deleted if it has associated transactions (ProtectedError).
        """
        # Create a transaction linked to category1 (Food)
        Transaction.objects.create(
            user=self.user,
            category_type_model=ContentType.objects.get_for_model(Category),
            category_id=self.category1.id,
            amount=Decimal('10.00'),
            is_expense=True
        )

        url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) # Should be Bad Request due to custom handling
        # Verify the custom error format and the specific message for ProtectedError
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        # The 'details' for a ValidationError from perform_destroy is a dict, so check for 'detail' key
        self.assertIn('detail', response.data['error']['details'])
        self.assertIn(f"Cannot delete category '{self.category1.name}' because it has associated transactions. Please reassign transactions first.", response.data['error']['details']['detail'])

        # Ensure the category was NOT deleted
        self.assertTrue(Category.objects.filter(pk=self.category1.pk).exists())

    def test_delete_category_not_owned(self):
        """
        Ensure user cannot delete a category they don't own.
        """
        url = reverse('category-detail', kwargs={'pk': self.other_category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
        self.assertIn('details', response.data['error'])
        self.assertIn("You do not have permission to perform this action.", response.data['error']['message'])
        self.assertIn("You do not have permission to perform this action on this category.", response.data['error']['details']['detail'])