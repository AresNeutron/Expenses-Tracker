from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from ..models import Category
from ..serializers import CategorySerializer
from django.db import models
from rest_framework import serializers

# --- Category CRUD Views ---

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    """
    Handles listing all categories for the authenticated user and creating new categories.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users only see their own categories.
        """
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        """
        Automatically associates the new category with the logged-in user.
        """
        serializer.save(user=self.request.user)


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles retrieving, updating, and deleting a specific category by ID.
    Ensures users can only interact with their own categories.
    """
    queryset = Category.objects.all() # Se filtra por get_object para seguridad
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        """
        Ensures a user can only retrieve, update, or delete their own categories.
        """
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to perform this action on this category.") # ¡Uso corregido!
        return obj

    def perform_destroy(self, instance):
        """
        Performs the delete operation for a category.
        Due to `on_delete=models.PROTECT` on Transaction, deleting a category with
        associated transactions will raise a ProtectedError. This is desired behavior.

        Consider implementing soft delete for categories if desired,
        to avoid ProtectedError directly.
        """
        try:
            instance.delete()
        except models.ProtectedError as e: # Asegúrate de importar `models` de Django
            raise serializers.ValidationError(
                {"detail": f"Cannot delete category '{instance.name}' because it has associated transactions. Please reassign transactions first."}
            ) from e