from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# --- User Authentication & Management Views ---

class RegisterUserView(APIView):
    """
    Handles user registration. Creates a new User instance and returns JWT tokens.
    """
    permission_classes = [AllowAny] # Allow anyone to register

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        # Basic validation for required fields
        if not username or not password or not email:
            return Response({'error': 'Username, password, and email are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to register user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginUserView(APIView):
    """
    Handles user login. Authenticates user by username/email and password,
    then returns JWT access and refresh tokens.
    """
    permission_classes = [AllowAny] # Allow unauthenticated users to log in

    def post(self, request):
        identifier = request.data.get('identifier')  # Can be username or email
        password = request.data.get('password')

        if not identifier or not password:
            return Response({'error': 'Identifier (username/email) and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find user by email or username
        user = (
            User.objects.filter(email__iexact=identifier).first() # Case-insensitive email check
            or User.objects.filter(username__iexact=identifier).first() # Case-insensitive username check
        )

        if not user:
            return Response(
                {'error': 'User with this username/email does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user using the found username (authenticate expects username)
        authenticated_user = authenticate(request, username=user.username, password=password)
        
        if not authenticated_user:
            return Response(
                {'error': 'Invalid username/email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(authenticated_user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)

class LogoutUserView(APIView):
    """
    Blacklists the provided refresh token, effectively logging out the user.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist() # Blacklist the refresh token
            return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            # Handle cases where refresh token is missing or invalid
            return Response({"error": "Invalid token or token not provided."}, status=status.HTTP_400_BAD_REQUEST)

    
class UserDetailView(APIView):
    """
    Retrieves details of the currently authenticated user.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user 
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(), # Format datetime for consistency
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }
        return Response(user_data)
    

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except TokenError as e:
            print(f"TokenError: {e.detail}")
            return Response(
                {"detail": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            print("User associated with refresh token does not exist.")
            return Response(
                {"detail": "User associated with refresh token does not exist. Please log in again."},
                status=status.HTTP_404_NOT_FOUND # O status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Unexpected error during token refresh: {e}")
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )