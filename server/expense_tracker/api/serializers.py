from rest_framework import serializers
from .default_categories import DefaultCategory
from django.core.validators import RegexValidator
from .models import Category, Transaction
from decimal import Decimal
from django.contrib.contenttypes.models import ContentType
    

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
    category_id = serializers.IntegerField(
        error_messages={
            'invalid': "Category ID must be an integer.",
            'required': "Category ID is required."
        }
    )
    category_type_model = serializers.CharField(required=True)

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
        fields = ['id', 'user', 'is_expense', 'category_type_model', 'category_id', 'amount', 'notes', 'created_at']
        read_only_fields = ['user', 'created_at', 'deleted_at'] 

    def validate(self, data):
        category_id = data.get('category_id') 
        category_type_model = data.pop('category_type_model', None)

        if not category_type_model:
            raise serializers.ValidationError({"category_type_model": "Category type (e.g., 'Category' or 'DefaultCategory') is required."})

        model_name = category_type_model.capitalize()

        category_instance = None
        if model_name == 'Category':
            try:
                category_instance = Category.objects.get(id=category_id, user=self.context['request'].user)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category": "User category not found or does not belong to you."})
        elif model_name == 'Defaultcategory':
             try:
                category_instance = DefaultCategory.objects.get(id=category_id)
             except DefaultCategory.DoesNotExist:
                raise serializers.ValidationError({"category": "Default category not found."})
        else:
            raise serializers.ValidationError({"category_type_model": "Invalid category type specified. Must be 'Category' or 'DefaultCategory'."})

        data['category_type_model'] = ContentType.objects.get_for_model(category_instance)
        data['category_id'] = category_instance.id

        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

class DefaultCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultCategory
        fields = '__all__'
        