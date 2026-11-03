from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password']

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def validate(self, attrs):

        # Check whether both passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        # Check Django password rules
        try:
            validate_password(attrs['password'])
        except ValidationError as error:
            raise serializers.ValidationError({
                'password': error.messages
            })

        return attrs

    def create(self, validated_data):

        # Remove confirm_password before saving
        validated_data.pop('confirm_password')

        # Create user with securely hashed password
        user = User.objects.create_user(**validated_data)

        return user

from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction

        fields = [
            'id',
            'title',
            'amount',
            'transaction_type',
            'category',
            'date',
            'created_at'
        ]

        read_only_fields = ['id', 'created_at']