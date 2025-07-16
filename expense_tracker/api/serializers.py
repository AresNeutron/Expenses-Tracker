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
