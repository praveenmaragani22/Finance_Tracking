from decimal import Decimal
import calendar
from datetime import date
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Sum

from .models import User, Transaction, Budget, SavingsGoal


# User Registration Serializer
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


# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


# Change Password Serializer
class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'New password and confirm password do not match.'
            })

        try:
            validate_password(attrs['new_password'])
        except ValidationError as error:
            raise serializers.ValidationError({
                'new_password': error.messages
            })

        return attrs


# Transaction Serializer
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


# Budget Serializer
class BudgetSerializer(serializers.ModelSerializer):

    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    is_exceeded = serializers.SerializerMethodField()
    month = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'name',
            'category',
            'amount',
            'start_date',
            'end_date',
            'spent',
            'remaining',
            'percentage',
            'is_exceeded',
            'month',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'spent',
            'remaining',
            'percentage',
            'is_exceeded',
            'month'
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Support 'month' input ('YYYY-MM') if start_date/end_date not explicitly given
        if 'month' in data and data['month']:
            try:
                parts = str(data['month']).split('-')
                year = int(parts[0])
                month = int(parts[1])
                _, last_day = calendar.monthrange(year, month)
                if not data.get('start_date'):
                    data['start_date'] = date(year, month, 1)
                if not data.get('end_date'):
                    data['end_date'] = date(year, month, last_day)
            except Exception:
                pass

        # If name is omitted, default to category name
        if not data.get('name') and data.get('category'):
            data['name'] = f"{data.get('category')} Budget"

        return super().to_internal_value(data)

    def validate(self, attrs):
        amount = attrs.get('amount')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if amount is not None and amount <= Decimal('0.00'):
            raise serializers.ValidationError({
                'amount': 'Budget amount must be greater than zero.'
            })

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date.'
            })

        return attrs

    def get_spent(self, obj):
        qs = Transaction.objects.filter(
            user=obj.user,
            transaction_type='Expense',
            category__iexact=obj.category
        )
        if obj.start_date:
            qs = qs.filter(date__gte=obj.start_date)
        if obj.end_date:
            qs = qs.filter(date__lte=obj.end_date)

        total = qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        return float(total)

    def get_remaining(self, obj):
        spent = Decimal(str(self.get_spent(obj)))
        remaining = obj.amount - spent
        return float(remaining)

    def get_percentage(self, obj):
        if not obj.amount or obj.amount <= Decimal('0.00'):
            return 0.0

        spent = Decimal(str(self.get_spent(obj)))
        pct = (spent / obj.amount) * Decimal('100.0')
        return float(round(pct, 2))

    def get_is_exceeded(self, obj):
        spent = Decimal(str(self.get_spent(obj)))
        return spent > obj.amount

    def get_month(self, obj):
        if obj.start_date:
            return obj.start_date.strftime('%Y-%m')
        return ''


# Savings Goal Serializer
class SavingsGoalSerializer(serializers.ModelSerializer):

    progress_percentage = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'title',
            'target_amount',
            'current_amount',
            'target_date',
            'progress_percentage',
            'remaining_amount',
            'is_completed',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'progress_percentage',
            'remaining_amount',
            'is_completed'
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Support camelCase names sent from React components
        if 'goalName' in data and not data.get('title'):
            data['title'] = data['goalName']
        if 'targetAmount' in data and not data.get('target_amount'):
            data['target_amount'] = data['targetAmount']
        if 'savedAmount' in data and 'current_amount' not in data:
            data['current_amount'] = data['savedAmount']
        if 'targetDate' in data and not data.get('target_date'):
            data['target_date'] = data['targetDate']

        return super().to_internal_value(data)

    def validate(self, attrs):
        target = attrs.get('target_amount')
        current = attrs.get('current_amount', Decimal('0.00'))

        if target is not None and target <= Decimal('0.00'):
            raise serializers.ValidationError({
                'target_amount': 'Target amount must be greater than zero.'
            })

        if current is not None and current < Decimal('0.00'):
            raise serializers.ValidationError({
                'current_amount': 'Saved amount cannot be negative.'
            })

        return attrs

    def get_progress_percentage(self, obj):
        if not obj.target_amount or obj.target_amount <= Decimal('0.00'):
            return 0.0

        pct = (obj.current_amount / obj.target_amount) * Decimal('100.0')
        return float(round(min(pct, Decimal('100.0')), 2))

    def get_remaining_amount(self, obj):
        rem = max(Decimal('0.00'), obj.target_amount - obj.current_amount)
        return float(rem)

    def get_is_completed(self, obj):
        return obj.current_amount >= obj.target_amount
