from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotAuthenticated, PermissionDenied, NotFound, MethodNotAllowed

def custom_exception_handler(exc, context):
    """
    Custom exception handler for REST framework that formats errors into a standard structure,
    providing more specific and user-friendly messages.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': 'An unexpected error occurred. Please try again later.', # Default message
                'details': None
            }
        }

        if isinstance(exc, ValidationError):
            custom_response_data['error']['message'] = "There was a problem with your input. Please check the provided data."
            if response.data:
                custom_response_data['error']['details'] = response.data

        elif isinstance(exc, NotAuthenticated):
            custom_response_data['error']['message'] = "Authentication is required to access this resource. Please log in."
        
        elif isinstance(exc, PermissionDenied):
            custom_response_data['error']['message'] = "You don't have the necessary permissions to perform this action."
        
        elif isinstance(exc, NotFound):
            custom_response_data['error']['message'] = "The requested resource could not be found."
        
        elif isinstance(exc, MethodNotAllowed):
             custom_response_data['error']['message'] = "This action is not allowed for the requested resource."
        
        elif status.is_server_error(response.status_code):
            custom_response_data['error']['message'] = "A server error occurred. We're working to fix it. Please try again later."
            custom_response_data['error']['details'] = None # Ensure no internal details are exposed
        
        else:
            if response.data and 'detail' in response.data:
                custom_response_data['error']['message'] = str(response.data['detail'])

        if custom_response_data['error']['details'] is None and response.data and not status.is_server_error(response.status_code):
            custom_response_data['error']['details'] = response.data

        response.data = custom_response_data
    return response