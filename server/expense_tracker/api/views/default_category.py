from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..default_categories import DefaultCategory
from ..serializers import DefaultCategorySerializer
from .base import BaseAPIView # Si quieres usar tu BaseAPIView para el manejo de errores

class DefaultCategoryListView(BaseAPIView, generics.ListAPIView):
    queryset = DefaultCategory.objects.filter(is_active=True)
    serializer_class = DefaultCategorySerializer
    permission_classes = [IsAuthenticated] # O IsAuthenticated si es necesario
    pagination_class = None # Las categorías por defecto suelen ser una lista pequeña, no paginada