from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Import your new, modularized views
from .views.authentication import RegisterUserView, LoginUserView, LogoutUserView, UserDetailView
from .views.transaction import TransactionListCreateAPIView, TransactionRetrieveUpdateDestroyAPIView
from .views.account import AccountListCreateAPIView, AccountRetrieveUpdateDestroyAPIView
from .views.category import CategoryListCreateAPIView, CategoryRetrieveUpdateDestroyAPIView


urlpatterns = [
    # --- Authentication & User Management URLs ---
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', LoginUserView.as_view(), name='login'),
    path('auth/logout/', LogoutUserView.as_view(), name='logout'),
    path('auth/me/', UserDetailView.as_view(), name='user_detail'), # Endpoint for current authenticated user
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # For refreshing JWT tokens

    # --- Transaction URLs ---
    # GET /api/transactions/ -> List all transactions for the user
    # POST /api/transactions/ -> Create a new transaction
    path('transactions/', TransactionListCreateAPIView.as_view(), name='transaction-list-create'),
    
    # GET /api/transactions/<id>/ -> Retrieve details of a specific transaction
    # PUT /api/transactions/<id>/ -> Update a specific transaction
    # PATCH /api/transactions/<id>/ -> Partially update a specific transaction
    # DELETE /api/transactions/<id>/ -> Delete a specific transaction
    path('transactions/<int:pk>/', TransactionRetrieveUpdateDestroyAPIView.as_view(), name='transaction-detail'),

    # --- Account URLs ---
    # GET /api/accounts/ -> List all accounts for the user
    # POST /api/accounts/ -> Create a new account
    path('accounts/', AccountListCreateAPIView.as_view(), name='account-list-create'),
    
    # GET /api/accounts/<id>/ -> Retrieve details of a specific account
    # PUT /api/accounts/<id>/ -> Update a specific account
    # PATCH /api/accounts/<id>/ -> Partially update a specific account
    # DELETE /api/accounts/<id>/ -> Delete a specific account
    path('accounts/<int:pk>/', AccountRetrieveUpdateDestroyAPIView.as_view(), name='account-detail'),

    # --- Category URLs ---
    # GET /api/categories/ -> List all categories for the user
    # POST /api/categories/ -> Create a new category
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    
    # GET /api/categories/<id>/ -> Retrieve details of a specific category
    # PUT /api/categories/<id>/ -> Update a specific category
    # PATCH /api/categories/<id>/ -> Partially update a specific category
    # DELETE /api/categories/<id>/ -> Delete a specific category
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),
]