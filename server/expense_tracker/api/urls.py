from django.urls import path
from .views.authentication import RegisterUserView, LoginUserView, LogoutUserView, UserDetailView, CustomTokenRefreshView
from .views.transaction import TransactionListAPIView, TransactionCreateAPIView, TransactionRetrieveUpdateDestroyAPIView
from .views.account import AccountListAPIView, AccountCreateAPIView, AccountRetrieveDestroyAPIView
from .views.category import CategoryListCreateAPIView, CategoryRetrieveUpdateDestroyAPIView
from .views.default_category import DefaultCategoryListView

urlpatterns = [
    # --- Authentication & User Management URLs ---
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', LoginUserView.as_view(), name='login'),
    path('auth/logout/', LogoutUserView.as_view(), name='logout'),
    path('auth/me/', UserDetailView.as_view(), name='user_detail'), # Endpoint for current authenticated user
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'), # For refreshing JWT tokens

    # --- Transaction URLs ---
    path('transactions/', TransactionListAPIView.as_view(), name='transaction-list'),
    path('transactions/create/', TransactionCreateAPIView.as_view(), name='transaction-create'),
    path('transactions/<int:pk>/', TransactionRetrieveUpdateDestroyAPIView.as_view(), name='transaction-detail'),

    # --- Account URLs ---
    path('accounts/', AccountListAPIView.as_view(), name='account-list'),
    path('accounts/create/', AccountCreateAPIView.as_view(), name='account-create'),
    path('accounts/<int:pk>/', AccountRetrieveDestroyAPIView.as_view(), name='account-detail'),

    # --- Category URLs ---
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),

    # --- Default Categories URL
    path('categories/default/', DefaultCategoryListView.as_view(), name='category-default-list'),
]
