from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError, PermissionDenied
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from ..models import Transaction, Account
from ..serializers import TransactionSerializer
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

class TransactionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user, deleted_at__isnull=True)

        # --- Lógica de filtrado manual (si no usas DjangoFilterBackend) ---
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        account = self.request.query_params.get('account')
        if account:
            queryset = queryset.filter(account=account)

        category_id = self.request.query_params.get('category_id')
        category_type = self.request.query_params.get('category_type_model') 
        if category_id and category_type:
            try:
                # Obtén el ContentType para el modelo especificado
                content_type_obj = ContentType.objects.get(app_label='api', model=category_type.lower()) 
                queryset = queryset.filter(category_type_model=content_type_obj, category_id=category_id)
            except ContentType.DoesNotExist:
                print("Something wrong in Transaction List by categories")
                pass

        return queryset.order_by('-id')
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class for filtering related fields.
        """
        return {'request': self.request}
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Serializer validation failed. Errors: {serializer.errors}")
            print(f"Data received: {request.data}")
            print(f"DEBUG_PRINT: Serializer validation failed. Errors: {serializer.errors}")
            print(f"DEBUG_PRINT: Data received: {request.data}")
        
        serializer.is_valid(raise_exception=True) # Esto lanza el 400 con los errores del serializer
        
        # perform_create recibirá validated_data con category_type_model y category_id listos
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        transaction_type = serializer.validated_data.get('transaction_type')
        amount = serializer.validated_data.get('amount')
        source_account = serializer.validated_data.get('account')
        category_content_type: ContentType = serializer.validated_data.get('category_type_model')
        category_id = serializer.validated_data.get('category_id')
        notes = serializer.validated_data.get('notes')
        status_val = serializer.validated_data.get('status', Transaction.CLEARED)

        with db_transaction.atomic():
            if transaction_type == Transaction.TRANSFER:
                # this field doesn't exists in the model
                destination_account_id = serializer.validated_data.get('destination_account_id')
                
                if not destination_account_id:
                    raise DRFValidationError({"destination_account_id": "Destination account is required for transfer transactions."})
                
                destination_account = get_object_or_404(Account.objects.filter(user=self.request.user), id=destination_account_id.id) 

                if source_account == destination_account:
                    raise DRFValidationError({"account": "Source and destination accounts cannot be the same for a transfer."})

                # Validar balance de la cuenta de origen (saldrá dinero)
                source_new_balance = source_account.balance - amount
                if source_account.acc_type != Account.CARD and source_new_balance < 0:
                    raise DRFValidationError({"amount": f"Insufficient funds in source account '{source_account.name}'."})
                if source_account.acc_type == Account.CARD and source_new_balance > 0:
                    raise DRFValidationError({"amount": f"Credit card account '{source_account.name}' cannot have a positive balance after this transfer."})

                # Validar balance de la cuenta de destino (entrará dinero)
                dest_new_balance = destination_account.balance + amount
                if destination_account.acc_type == Account.CARD and dest_new_balance > 0:
                    raise DRFValidationError({"destination_account_id": f"Credit card account '{destination_account.name}' cannot have a positive balance after receiving this transfer."})
                if destination_account.acc_type != Account.CARD and dest_new_balance < 0:
                     # Esto es más un caso de borde, si la cuenta de destino es normal y el monto la hace negativa (por un ajuste, por ejemplo)
                     # Aunque en una transferencia normal, el monto siempre es positivo para la cuenta de destino.
                     raise DRFValidationError({"destination_account_id": f"Account '{destination_account.name}' cannot have a negative balance after receiving this transfer."})

                outgoing_transaction = serializer.save(
                    user=self.request.user,
                    amount=-amount, # El monto negativo para la salida
                    transaction_type=Transaction.EXPENSE, # La salida es un gasto desde la perspectiva de la cuenta de origen
                    linked_transaction=None # Temporalmente nulo, se llenará después
                )

                incoming_transaction = Transaction.objects.create(
                    user=self.request.user,
                    account=destination_account,
                    transaction_type=Transaction.INCOME,
                    amount=amount, # El monto positivo para la entrada
                    category_type_model=category_content_type,
                    category_id=category_id,
                    notes=notes,
                    status=status_val,
                    linked_transaction=outgoing_transaction # Enlazar la entrada con la salida
                )
                
                outgoing_transaction.linked_transaction = incoming_transaction
                outgoing_transaction.save(update_fields=['linked_transaction'])

                source_account.balance = source_new_balance
                destination_account.balance = dest_new_balance

                source_account.save(update_fields=['balance', 'last_transaction_date'])
                destination_account.save(update_fields=['balance', 'last_transaction_date'])

            else:
                # Transacción normal (Expense, Income, Adjustment)
                current_account = source_account
                calculated_balance = current_account.balance

                if transaction_type == Transaction.EXPENSE:
                    calculated_balance -= amount
                elif transaction_type == Transaction.INCOME:
                    calculated_balance += amount
                elif transaction_type == Transaction.ADJUSTMENT:
                    # Para ajustes, el monto puede ser positivo o negativo, se suma directamente.
                    calculated_balance += amount
                
                # Validar el balance después de la transacción
                if current_account.acc_type != Account.CARD and calculated_balance < 0:
                    raise DRFValidationError({"amount": f"Transaction would result in a negative balance for account '{current_account.name}'."})
                if current_account.acc_type == Account.CARD and calculated_balance > 0:
                    raise DRFValidationError({"amount": f"Credit card account '{current_account.name}' cannot have a positive balance after this transaction."})

                instance = serializer.save(user=self.request.user)
                
                current_account.balance = calculated_balance
                current_account.save(update_fields=['balance', 'last_transaction_date'])


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
        old_instance = self.get_object()
        old_amount = old_instance.amount
        old_type = old_instance.transaction_type
        old_account = old_instance.account

        # Deshabilitar actualización de transferencias que afecten balances directamente
        if old_type == Transaction.TRANSFER or serializer.validated_data.get('transaction_type') == Transaction.TRANSFER:
            # Puedes permitir actualizar solo 'notes', 'category', '', 'status'
            # Si se intenta cambiar monto, tipo o cuentas, se podría levantar un error
            if serializer.validated_data.get('amount') != old_amount or \
               serializer.validated_data.get('account') != old_account or \
               serializer.validated_data.get('transaction_type') != old_type:
                raise DRFValidationError("Direct modification of amount, account, or type for transfer transactions is not allowed. Please delete and recreate.")
            # Si solo se modifican campos que no afectan el balance (e.g., notes, category, , status)
            instance = serializer.save(user=self.request.user)
            # No se actualiza el balance de la cuenta, se asume que solo son metadatos.
            return

        with db_transaction.atomic():
            # Revertir el impacto de la transacción antigua
            current_old_balance = old_account.balance
            if old_type == Transaction.EXPENSE:
                current_old_balance += old_amount
            elif old_type == Transaction.INCOME:
                current_old_balance -= old_amount
            elif old_type == Transaction.ADJUSTMENT:
                current_old_balance -= old_amount
            old_account.balance = current_old_balance
            old_account.save(update_fields=['balance'])

            # Guardar la instancia actualizada
            instance = serializer.save(user=self.request.user)

            # Aplicar el impacto de la nueva transacción
            new_amount = instance.amount
            new_type = instance.transaction_type
            new_account = instance.account
            calculated_balance = new_account.balance

            if new_type == Transaction.EXPENSE:
                calculated_balance -= new_amount
            elif new_type == Transaction.INCOME:
                calculated_balance += new_amount
            elif new_type == Transaction.ADJUSTMENT:
                calculated_balance += new_amount
            
            # Validar el balance resultante
            if new_account.acc_type != Account.CARD and calculated_balance < 0:
                # Revertir y levantar error si la validación falla
                old_account.balance -= old_amount if old_type == Transaction.EXPENSE else -old_amount if old_type == Transaction.INCOME else -old_amount # Revertir el rollback previo
                old_account.save(update_fields=['balance'])
                raise DRFValidationError({"amount": f"Update would result in a negative balance for account '{new_account.name}'."})
            if new_account.acc_type == Account.CARD and calculated_balance > 0:
                old_account.balance -= old_amount if old_type == Transaction.EXPENSE else -old_amount if old_type == Transaction.INCOME else -old_amount
                old_account.save(update_fields=['balance'])
                raise DRFValidationError({"amount": f"Credit card account '{new_account.name}' cannot have a positive balance after this update."})

            new_account.balance = calculated_balance
            new_account.save(update_fields=['balance', 'last_transaction_date'])

    def perform_destroy(self, instance):
        with db_transaction.atomic():
            if instance.transaction_type == Transaction.TRANSFER:
                linked_tx = instance.linked_transaction
                if linked_tx:
                    # Revertir el balance de la cuenta de la transacción original (la que se está eliminando)
                    source_account_tx = instance.account
                    if instance.amount < 0: # Si es la transacción de salida original
                        source_account_tx.balance += abs(instance.amount) # Sumar el monto de vuelta
                    else: # Si es la transacción de entrada original
                        source_account_tx.balance -= instance.amount # Restar el monto
                    source_account_tx.save(update_fields=['balance'])

                    # Revertir el balance de la cuenta de la transacción vinculada
                    dest_account_tx = linked_tx.account
                    if linked_tx.amount < 0: # Si la vinculada es de salida
                        dest_account_tx.balance += abs(linked_tx.amount)
                    else: # Si la vinculada es de entrada
                        dest_account_tx.balance -= linked_tx.amount
                    dest_account_tx.save(update_fields=['balance'])

                    # Marcar ambas como eliminadas/void
                    instance.deleted_at = timezone.now()
                    instance.status = Transaction.VOID
                    instance.save(update_fields=['deleted_at', 'status'])

                    linked_tx.deleted_at = timezone.now()
                    linked_tx.status = Transaction.VOID
                    linked_tx.save(update_fields=['deleted_at', 'status'])
                else:
                    # Esto no debería ocurrir si las transferencias se crean en pares
                    raise DRFValidationError("Linked transaction not found for transfer. Manual correction may be needed.")

            else:
                # Transacción normal (Expense, Income, Adjustment)
                account = instance.account
                # Revertir el impacto en el balance
                if instance.transaction_type == Transaction.EXPENSE:
                    account.balance += instance.amount
                elif instance.transaction_type == Transaction.INCOME:
                    account.balance -= instance.amount
                elif instance.transaction_type == Transaction.ADJUSTMENT:
                    account.balance -= instance.amount
                
                account.save(update_fields=['balance'])

                # Realizar la eliminación suave de la transacción actual
                instance.deleted_at = timezone.now()
                instance.status = Transaction.VOID
                instance.save(update_fields=['deleted_at', 'status'])