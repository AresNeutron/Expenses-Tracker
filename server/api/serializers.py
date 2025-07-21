from rest_framework import serializers
from .models import Account, Category, Transaction, User

class AccountSerializer(serializers.ModelSerializer):
    # Optional: Display the user's username instead of just their ID
    # user = serializers.ReadOnlyField(source='user.username') # Or use a Nested Serializer if more user info is needed

    class Meta:
        model = Account
        fields = '__all__'
        # Read-only fields are included in serialization but ignored during deserialization (updates/creates)
        read_only_fields = ['balance'] # Balance is calculated, not directly set by API client


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializes Category model instances.
    Handles subcategory relationships.
    """
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
        # We only want to show the name and if it's an expense when nested in a transaction
        fields = ['id', 'name', 'is_expense']
        read_only_fields = ['id', 'name', 'is_expense']


class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = "__all__"
        # 'user' is often read-only as it's set by the API on creation/update, not by the client.
        read_only_fields = ['user'] 

    # Custom validation example (optional, but good practice for specific rules)
    def validate(self, data):
        """
        Check that transfer transactions have a linked_transaction.
        (This is a simplified example, real transfer logic is more complex and would involve
        creating two transactions from one API call, or validating both sides).
        """
        # tenemos que completar esto después.
        if data.get('transaction_type') == Transaction.TRANSFER and not data.get('linked_transaction'):
            raise serializers.ValidationError("Transfer transactions must have a linked transaction.")

        return data
