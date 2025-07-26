from rest_framework import serializers
from .default_categories import DefaultCategory
from django.core.validators import RegexValidator
from .models import Account, Category, Transaction
from decimal import Decimal
from django.contrib.contenttypes.models import ContentType 

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
        fields = ['id', 'user', 'name', 'parent_category', 'color', 'is_expense', 'icon']
        read_only_fields = ['user']

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
    account = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        error_messages={'does_not_exist': "Account not found or does not belong to you."}
    )
    
    category_id = serializers.IntegerField(
        error_messages={
            'invalid': "Category ID must be an integer.",
            'required': "Category ID is required."
        }
    )
    category_type_model = serializers.CharField(write_only=True, required=True)
    
    destination_account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), 
        write_only=True, 
        required=False, 
        allow_null=True 
    )

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
        error_messages={
            'min_value': 'Transaction amount must be greater than zero.'
        }
    )
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'account', 'transaction_type', 'linked_transaction', 'status', 
                  'category_type_model', 'category_id', 'amount', 'notes', 'destination_account_id']
        read_only_fields = ['user', 'created_at', 'updated_at', 'deleted_at'] 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'request' in self.context:
            user = self.context['request'].user
            self.fields['account'].queryset = Account.objects.filter(user=user)
            self.fields['destination_account_id'].queryset = Account.objects.filter(user=user)

    def validate(self, data):
        transaction_type = data.get('transaction_type')
        linked_transaction = data.get('linked_transaction')
        account = data.get('account') # Esta es la cuenta de origen

        category_id = data.get('category_id') 
        category_type_model = data.pop('category_type_model', None)

        if not category_type_model:
            raise serializers.ValidationError({"category_type_model": "Category type (e.g., 'Category' or 'DefaultCategory') is required."})

        model_name = category_type_model.capitalize() # "category" -> "Category", "defaultcategory" -> "DefaultCategory"

        category_instance = None
        if model_name == 'Category':
            try:
                # Filtra por usuario para Category normal
                category_instance = Category.objects.get(id=category_id, user=self.context['request'].user)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category": "User category not found or does not belong to you."})
        elif model_name == 'Defaultcategory': # Django models name is lowercase by default
             try:
                category_instance = DefaultCategory.objects.get(id=category_id)
             except DefaultCategory.DoesNotExist:
                raise serializers.ValidationError({"category": "Default category not found."})
        else:
            raise serializers.ValidationError({"category_type_model": "Invalid category type specified. Must be 'Category' or 'DefaultCategory'."})

        data['category_type_model'] = ContentType.objects.get_for_model(category_instance)
        data['category_id'] = category_instance.id

        # Validar que destination_account_id exista y no sea la misma cuenta de origen si es una transferencia
        if transaction_type == Transaction.TRANSFER:
            destination_account = data.get('destination_account_id') # Ahora lo obtenemos de validated_data
            if not destination_account: # Si el campo no fue provisto
                raise serializers.ValidationError({"destination_account_id": "Destination account is required for transfer transactions."})
            
            if account and destination_account == account: # Compara objetos Account
                raise serializers.ValidationError({"account": "Source and destination accounts cannot be the same for a transfer."})

        current_id = self.instance.id if self.instance else None
        linked_id = linked_transaction.id if linked_transaction else None
        
        if linked_id and current_id  == linked_id:
            raise serializers.ValidationError({'linked_transaction': 'A transaction cannot be linked to itself.'})

        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

class DefaultCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultCategory
        fields = '__all__'
        