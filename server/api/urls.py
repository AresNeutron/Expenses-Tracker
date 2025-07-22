from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views.authentication import RegisterUserView, LoginUserView, LogoutUserView, UserDetailView
from .views.transaction import TransactionListCreateAPIView, TransactionRetrieveUpdateDestroyAPIView
from .views.account import AccountListCreateAPIView, AccountRetrieveDestroyAPIView
from .views.category import CategoryListCreateAPIView, CategoryRetrieveUpdateDestroyAPIView

urlpatterns = [
    # --- Authentication & User Management URLs ---
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', LoginUserView.as_view(), name='login'),
    path('auth/logout/', LogoutUserView.as_view(), name='logout'),
    path('auth/me/', UserDetailView.as_view(), name='user_detail'), # Endpoint for current authenticated user
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # For refreshing JWT tokens

    # --- Transaction URLs ---
    path('transactions/', TransactionListCreateAPIView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionRetrieveUpdateDestroyAPIView.as_view(), name='transaction-detail'),

    # --- Account URLs ---
    path('accounts/', AccountListCreateAPIView.as_view(), name='account-list-create'),
    path('accounts/<int:pk>/', AccountRetrieveDestroyAPIView.as_view(), name='account-detail'),

    # --- Category URLs ---
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),
]
