from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..default_categories import DefaultCategory
from ..serializers import DefaultCategorySerializer
from .base import BaseAPIView

class DefaultCategoryListView(BaseAPIView, generics.ListAPIView):
    queryset = DefaultCategory.objects.filter(is_active=True)
    serializer_class = DefaultCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None