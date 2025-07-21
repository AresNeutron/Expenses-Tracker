"""
Base views for the API.
"""

from rest_framework.views import APIView
from ..exceptions import ServiceValidationError

class BaseAPIView(APIView):
    """
    A base view for all API views that handles service layer exceptions.
    """
    def dispatch(self, request, *args, **kwargs):
        """
        Catches ServiceValidationError and returns a formatted response.
        """
        try:
            return super().dispatch(request, *args, **kwargs)
        except ServiceValidationError as e:
            return e.as_response()