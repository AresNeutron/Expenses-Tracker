"""
Base test case for API tests.
"""

from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class BaseAPITestCase(APITestCase):
    """
    Base class for API test cases with user authentication helpers.
    """

    def setUp(self):
        """
        Set up a test user and authenticate.
        """
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='testuser@example.com'
        )
        self.client.force_authenticate(user=self.user)

    def get_auth_headers(self):
        """
        Returns authorization headers for the test user.
        """
        refresh = RefreshToken.for_user(self.user)
        return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}