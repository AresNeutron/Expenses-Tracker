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

        # Filter by expense type
        is_expense = self.request.query_params.get('is_expense')
        if is_expense is not None:
            queryset = queryset.filter(is_expense=(is_expense.lower() == 'true'))

        # Filter by category
        category_id = self.request.query_params.get('category_id')
        category_type = self.request.query_params.get('category_type_model') 
        if category_id and category_type:
            try:
                content_type_obj = ContentType.objects.get(app_label='api', model=category_type.lower()) 
                queryset = queryset.filter(category_type_model=content_type_obj, category_id=category_id)
            except ContentType.DoesNotExist:
                print("Something wrong in Transaction List by categories")
                pass

        # Filter by date
        date_param = self.request.query_params.get('date')
        if date_param:
            try:
                # Parse different date formats
                if len(date_param) == 4:  # Year only (e.g., "2025")
                    year = int(date_param)
                    queryset = queryset.filter(created_at__year=year)
                elif len(date_param) == 7 and '-' in date_param:  # Month-Year (e.g., "08-2025")
                    month, year = date_param.split('-')
                    queryset = queryset.filter(created_at__month=int(month), created_at__year=int(year))
                elif len(date_param) == 10 and date_param.count('-') == 2:  # Full date (e.g., "15-08-2025" or "2025-08-15")
                    # Handle both DD-MM-YYYY and YYYY-MM-DD formats
                    parts = date_param.split('-')
                    if len(parts[0]) == 4:  # YYYY-MM-DD format
                        year, month, day = parts
                    else:  # DD-MM-YYYY format
                        day, month, year = parts
                    queryset = queryset.filter(
                        created_at__year=int(year),
                        created_at__month=int(month), 
                        created_at__day=int(day)
                    )
            except (ValueError, IndexError):
                # Invalid date format, ignore filter
                pass

        # Filter by keywords in notes
        search = self.request.query_params.get('search')
        if search:
            # Split search terms and filter by each word in notes
            search_terms = search.strip().split()
            for term in search_terms:
                queryset = queryset.filter(notes__icontains=term)

        return queryset.order_by('-id')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    renderer_classes = [CustomResponseRenderer]
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