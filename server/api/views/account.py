from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Account
from ..serializers import AccountSerializer
from .base import BaseAPIView

class AccountListCreateAPIView(BaseAPIView, generics.ListCreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Account.objects.filter(user=self.request.user, is_active=True)
        is_active_param = self.request.query_params.get('is_active', None)

        if is_active_param is not None:
            queryset = Account.objects.filter(user=self.request.user, is_active=(is_active_param.lower() == 'true'))
        return queryset.order_by('name')

    def perform_create(self, serializer):
        initial_balance_value = serializer.validated_data.get('initial_balance', 0)
        serializer.validated_data['balance'] = initial_balance_value

        serializer.save(user=self.request.user)


class AccountRetrieveDestroyAPIView(BaseAPIView, generics.RetrieveAPIView, generics.DestroyAPIView):
    # Heredamos de RetrieveAPIView para GET (lectura) y DestroyAPIView para DELETE (destrucción)
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise generics.exceptions.PermissionDenied("You do not have permission to perform this action on this account.")
        return obj

    # Deshabilitar explícitamente la actualización (PUT y PATCH)
    def update(self, request, *args, **kwargs):
        return Response({'detail': 'Account cannot be updated directly. Use transactions to modify balance.'},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({'detail': 'Account cannot be updated directly. Use transactions to modify balance.'},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def perform_destroy(self, instance: Account):
        # Utiliza la función soft_delete del modelo
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT) # 204 No Content es estándar para DELETE exitoso