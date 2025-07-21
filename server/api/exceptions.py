"""
Custom exception handlers for the API.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST framework that formats errors into a standard structure.
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize the error response format
        custom_response_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': 'An error occurred.',
                'details': response.data
            }
        }
        
        # Customize the message for known exception types
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_response_data['error']['message'] = "Validation error. Please check your inputs."
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            custom_response_data['error']['message'] = "Authentication credentials were not provided or are invalid."
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            custom_response_data['error']['message'] = "You do not have permission to perform this action."
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            custom_response_data['error']['message'] = "The requested resource was not found."
        elif response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED:
             custom_response_data['error']['message'] = "This method is not allowed for the requested resource."
        elif status.is_server_error(response.status_code):
            # For 5xx errors, we might want to hide detailed errors in production
            custom_response_data['error']['message'] = "A server error occurred. Please try again later."
            # In a real production environment, you would log the full exception here
            # and not expose internal details to the client.
            del custom_response_data['error']['details']


        response.data = custom_response_data

    return response

class ServiceValidationError(Exception):
    """Custom exception for service layer validation errors."""
    def __init__(self, message, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

    def as_response(self):
        """Return a DRF Response object for this exception."""
        return Response(
            {
                'success': False,
                'error': {
                    'code': self.status_code,
                    'message': "A business logic error occurred.",
                    'details': self.message
                }
            },
            status=self.status_code
        )