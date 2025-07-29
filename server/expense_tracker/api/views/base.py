"""
Base views for the API.
"""

from rest_framework.views import APIView
from ..exceptions import custom_exception_handler

class BaseAPIView(APIView):
    """
    A base view for all API views that ensures all exceptions are handled
    and formatted consistently using the custom_exception_handler.
    """
    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        except Exception as exc:
            context = self.get_exception_handler_context()
            response = custom_exception_handler(exc, context)

            if response is not None:
                return response
            
            raise
    
    def get_exception_handler_context(self):
        return {
            'view': self,
            'request': self.request,
            'args': self.args,
            'kwargs': self.kwargs
        }