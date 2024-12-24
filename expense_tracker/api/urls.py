from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ExpenseListView, ExpenseCreateView,
     ExpenseDetailView, UserDetailView, RegisterUserView,
     LoginUserView, LogoutUserView
    )

urlpatterns = [
    path('expenses/', ExpenseListView.as_view(), name='expenses'),
    path('expenses/create/', ExpenseCreateView.as_view(), name='create_expense'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
]