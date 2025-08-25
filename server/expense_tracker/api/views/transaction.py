from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from ..models import Transaction
from ..serializers import TransactionSerializer
from django.contrib.contenttypes.models import ContentType
from ..renderer import CustomResponseRenderer


class TransactionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [CustomResponseRenderer]
    
    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user, deleted_at__isnull=True)

        is_expense = self.request.query_params.get('is_expense')
        if is_expense is not None:
            queryset = queryset.filter(is_expense=(is_expense.lower() == 'true'))

        category_id = self.request.query_params.get('category_id')
        category_type = self.request.query_params.get('category_type_model') 
        if category_id and category_type:
            try:
                content_type_obj = ContentType.objects.get(app_label='api', model=category_type.lower()) 
                queryset = queryset.filter(category_type_model=content_type_obj, category_id=category_id)
            except ContentType.DoesNotExist:
                print("Something wrong in Transaction List by categories")
                pass

        return queryset.order_by('-id')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to perform this action on this transaction.")
        return obj

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.soft_delete()