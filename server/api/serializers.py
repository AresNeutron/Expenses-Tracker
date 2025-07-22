from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Account, Category, Transaction

class AccountSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    # 'name' validation handled by min_length directly in CharField
    name = serializers.CharField(max_length=100, min_length=1, error_messages={
        'min_length': 'Account name cannot be empty.'
    })

    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ['balance', 'created_at', 'updated_at', 'deleted_at', 'last_transaction_date']

    def validate_initial_balance(self, value):
        # Retrieve acc_type from initial_data (for creation) or self.instance (for update)
        # For updates, acc_type might not be sent, so use the existing instance's acc_type
        acc_type = self.initial_data.get('acc_type')
        if not acc_type and self.instance:
            acc_type = self.instance.acc_type

        if acc_type == Account.CARD and value > 0:
            raise serializers.ValidationError('Credit card accounts should not have positive initial balances.')
        
        if acc_type != Account.CARD and value < 0:
            raise serializers.ValidationError('Initial balance cannot be negative for this account type.')
            
        return value

    def validate(self, data):
        # No additional cross-field validations needed here if covered by other validators or model's clean()
        return data


hex_color_validator = RegexValidator(
    regex=r'^#[0-9A-Fa-f]{6}$',
    message='Color must be a valid 6-digit hex code starting with #.'
)

class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100, min_length=1, error_messages={
        'min_length': 'Category name cannot be empty.'
    })
    color = serializers.CharField(max_length=7, default='#6B7280', validators=[hex_color_validator])

    class Meta:
        model = Category
        fields = '__all__'

        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Category.objects.all(),
                fields=['user', 'name'],
                message="You already have a category with this name."
            )
        ]

class CategoryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_expense']
        read_only_fields = ['id', 'name', 'is_expense']


class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    destination_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), 
        write_only=True, 
        required=False, 
        allow_null=True 
    )

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0.01,
        error_messages={
            'min_value': 'Transaction amount must be greater than zero.'
        }
    )
    
    class Meta:
        model = Transaction
        fields = "__all__" + ('destination_account_id')
        read_only_fields = ['user', 'created_at', 'updated_at', 'deleted_at'] 

    def validate(self, data):
        transaction_type = data.get('transaction_type')
        linked_transaction = data.get('linked_transaction')
        account = data.get('account') # Esta es la cuenta de origen

        # Validar que destination_account_id exista y no sea la misma cuenta de origen si es una transferencia
        if transaction_type == Transaction.TRANSFER:
            destination_account = data.get('destination_account_id') # Ahora lo obtenemos de validated_data
            if not destination_account: # Si el campo no fue provisto
                raise serializers.ValidationError({"destination_account_id": "Destination account is required for transfer transactions."})
            
            if account and destination_account == account: # Compara objetos Account
                raise serializers.ValidationError({"account": "Source and destination accounts cannot be the same for a transfer."})

        current_id = self.instance.id if self.instance else None
        linked_id = linked_transaction.id if linked_transaction else None
        
        if linked_id and current_id == linked_id:
            raise serializers.ValidationError({'linked_transaction': 'A transaction cannot be linked to itself.'})

        return data