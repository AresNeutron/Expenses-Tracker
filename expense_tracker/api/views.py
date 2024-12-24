from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ExpenseSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Authentication
class RegisterUserView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    
class LoginUserView(APIView):
    def post(self, request):
        print("Request data:", request.data)
        identifier = request.data.get('identifier')  # Can be username or email
        password = request.data.get('password')

        # Check if identifier is an email or username
        user = (
            User.objects.filter(email=identifier).first()  # Check email
            or User.objects.filter(username=identifier).first()  # Check username
        )

        if not user:
            return Response(
                {'error': 'User with this username/email does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(username=user.username, password=password)
        if not user:
            return Response(
                {'error': 'Invalid username/email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)

class LogoutUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        user = request.user  # Get the current logged-in user
        user_data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
        }
        return Response(user_data)

class ExpenseCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        print(request.headers)
        data = request.data
        # Automatically associate the expense with the logged-in user
        data['user'] = request.user.id  # Assign the user to the expense data internally

        serializer = ExpenseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()  # Save the data, including the user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseListView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        try:
            print(request.headers)
            # Only fetch expenses associated with the logged-in user
            expenses = Expense.objects.filter(user=request.user)
            serializer = ExpenseSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

        if not expense.user or expense.user != request.user:
            return Response({'error': 'You do not have permission to edit this expense'}, 
                            status=status.HTTP_403_FORBIDDEN)

        serializer = ExpenseSerializer(expense, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Expense Updated", "data": serializer.data},
                             status=status.HTTP_200_OK)

        print("Serializer errors:", serializer.errors)  # Debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def delete(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk)
        except Expense.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not expense.user or expense.user != request.user:
            return Response({'error': 'You do not have permission to edit this expense'}, 
                            status=status.HTTP_403_FORBIDDEN)

        expense.delete()
        return Response({"message": "Expense Deleted"}, status=status.HTTP_204_NO_CONTENT)
