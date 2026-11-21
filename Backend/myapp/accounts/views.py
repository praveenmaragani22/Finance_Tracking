from decimal import Decimal
import datetime
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User, Transaction, Budget, SavingsGoal
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    TransactionSerializer,
    BudgetSerializer,
    SavingsGoalSerializer
)


# User Registration
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                'message': 'Registration successful!',
                'user': {
                    'full_name': serializer.data['full_name'],
                    'email': serializer.data['email']
                }
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# User Profile (Get & Update)
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        full_name = request.data.get('full_name') or request.data.get('fullName')
        if not full_name or not str(full_name).strip():
            return Response(
                {'detail': 'Full name cannot be empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.full_name = str(full_name).strip()
        user.save()

        serializer = UserProfileSerializer(user)
        return Response({
            'message': 'Profile updated successfully!',
            'user': serializer.data
        })


# Secure Password Change
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    current_password = serializer.validated_data['current_password']
    new_password = serializer.validated_data['new_password']

    if not user.check_password(current_password):
        return Response(
            {'current_password': ['Current password is incorrect.']},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()

    return Response({
        'message': 'Password changed successfully! Please log in again if required.'
    })


# Transaction ViewSet
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Budget ViewSet
class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Savings Goal ViewSet
class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_savings(self, request, pk=None):
        goal = self.get_object()

        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except Exception:
            return Response(
                {'detail': 'Please provide a valid numeric amount.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount <= Decimal('0.00'):
            return Response(
                {'detail': 'Amount to add must be greater than zero.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_total = goal.current_amount + amount
        if new_total > goal.target_amount:
            goal.current_amount = goal.target_amount
        else:
            goal.current_amount = new_total

        goal.save()
        serializer = self.get_serializer(goal)
        return Response({
            'message': f"Added ₹{amount} to {goal.title} successfully!",
            'goal': serializer.data
        })


# Dashboard Summary API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    transactions = Transaction.objects.filter(user=request.user)

    # Calculate total income
    total_income = transactions.filter(
        transaction_type='Income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    # Calculate total expenses
    total_expenses = transactions.filter(
        transaction_type='Expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    # Calculate balance and savings
    total_balance = total_income - total_expenses
    savings = total_balance

    # Recent transactions (latest 5)
    recent_transactions = transactions.order_by('-date', '-created_at')[:5]
    recent_data = TransactionSerializer(recent_transactions, many=True).data

    # Budgets overview
    user_budgets = Budget.objects.filter(user=request.user)[:4]
    budgets_data = BudgetSerializer(user_budgets, many=True).data

    # Expenses by category
    category_data = transactions.filter(
        transaction_type='Expense'
    ).values('category').annotate(
        total=Sum('amount')
    ).order_by('-total')

    # Monthly income
    monthly_income = transactions.filter(
        transaction_type='Income'
    ).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        total=Sum('amount')
    ).order_by('month')

    # Monthly expenses
    monthly_expenses = transactions.filter(
        transaction_type='Expense'
    ).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        total=Sum('amount')
    ).order_by('month')

    return Response({
        'total_income': float(total_income),
        'total_expenses': float(total_expenses),
        'total_balance': float(total_balance),
        'savings': float(savings),
        'recent_transactions': recent_data,
        'budgets': budgets_data,
        'expenses_by_category': [
            {'category': item['category'], 'total': float(item['total'])}
            for item in category_data
        ],
        'monthly_income': [
            {
                'month': item['month'].strftime('%Y-%m-%d') if hasattr(item['month'], 'strftime') else str(item['month']),
                'total': float(item['total'])
            }
            for item in monthly_income
        ],
        'monthly_expenses': [
            {
                'month': item['month'].strftime('%Y-%m-%d') if hasattr(item['month'], 'strftime') else str(item['month']),
                'total': float(item['total'])
            }
            for item in monthly_expenses
        ]
    })


# Reports API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_summary(request):
    transactions = Transaction.objects.filter(user=request.user)

    # Optional month filter: 'YYYY-MM'
    selected_month = request.query_params.get('month')
    if selected_month:
        try:
            year, month = map(int, selected_month.split('-'))
            transactions = transactions.filter(
                date__year=year,
                date__month=month
            )
        except Exception:
            pass

    # Optional date range filter
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date:
        transactions = transactions.filter(date__gte=start_date)
    if end_date:
        transactions = transactions.filter(date__lte=end_date)

    total_income = transactions.filter(
        transaction_type='Income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    total_expenses = transactions.filter(
        transaction_type='Expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    savings = total_income - total_expenses

    category_expenses = transactions.filter(
        transaction_type='Expense'
    ).values('category').annotate(
        total=Sum('amount')
    ).order_by('-total')

    category_income = transactions.filter(
        transaction_type='Income'
    ).values('category').annotate(
        total=Sum('amount')
    ).order_by('-total')

    # All-time monthly trends for user transactions
    all_user_tx = Transaction.objects.filter(user=request.user)
    monthly_inc = all_user_tx.filter(
        transaction_type='Income'
    ).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        total=Sum('amount')
    ).order_by('month')

    monthly_exp = all_user_tx.filter(
        transaction_type='Expense'
    ).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        total=Sum('amount')
    ).order_by('month')

    # Combine into unified monthly trends map
    monthly_map = {}
    for item in monthly_inc:
        m_str = item['month'].strftime('%Y-%m') if hasattr(item['month'], 'strftime') else str(item['month'])[:7]
        monthly_map[m_str] = {
            'month': m_str,
            'income': float(item['total']),
            'expenses': 0.0
        }

    for item in monthly_exp:
        m_str = item['month'].strftime('%Y-%m') if hasattr(item['month'], 'strftime') else str(item['month'])[:7]
        if m_str not in monthly_map:
            monthly_map[m_str] = {
                'month': m_str,
                'income': 0.0,
                'expenses': float(item['total'])
            }
        else:
            monthly_map[m_str]['expenses'] = float(item['total'])

    monthly_trends = sorted(monthly_map.values(), key=lambda x: x['month'])

    return Response({
        'total_income': float(total_income),
        'total_expenses': float(total_expenses),
        'net_savings': float(savings),
        'transactions_count': transactions.count(),
        'category_data': [
            {'name': item['category'], 'value': float(item['total'])}
            for item in category_expenses
        ],
        'income_category_data': [
            {'name': item['category'], 'value': float(item['total'])}
            for item in category_income
        ],
        'monthly_trends': monthly_trends
    })


# Dynamic Alerts API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alerts_summary(request):
    user = request.user
    today = timezone.localdate() if hasattr(timezone, 'localdate') else datetime.date.today()
    today_str = today.strftime('%d %b %Y')

    alerts = []
    alert_id = 1

    # 1. Budget Alerts
    budgets = Budget.objects.filter(user=user)
    for b in budgets:
        b_qs = Transaction.objects.filter(
            user=user,
            transaction_type='Expense',
            category__iexact=b.category
        )
        if b.start_date:
            b_qs = b_qs.filter(date__gte=b.start_date)
        if b.end_date:
            b_qs = b_qs.filter(date__lte=b.end_date)
        spent = b_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        if b.amount > Decimal('0.00'):
            percentage = round(float((spent / b.amount) * Decimal('100.0')), 1)
        else:
            percentage = 0.0

        if spent > b.amount:
            over = float(spent - b.amount)
            alerts.append({
                'id': alert_id,
                'type': 'budget',
                'severity': 'danger',
                'title': f"Budget Exceeded: {b.category}",
                'message': f"You have exceeded your {b.category} budget of ₹{float(b.amount):,.2f} by ₹{over:,.2f} (Total spent: ₹{float(spent):,.2f}).",
                'date': today_str,
                'read': False
            })
            alert_id += 1
        elif percentage >= 80.0:
            alerts.append({
                'id': alert_id,
                'type': 'budget',
                'severity': 'warning',
                'title': f"Budget Alert: {b.category} ({percentage}%)",
                'message': f"You have used {percentage}% of your {b.category} budget (₹{float(spent):,.2f} of ₹{float(b.amount):,.2f}).",
                'date': today_str,
                'read': False
            })
            alert_id += 1

    # 2. Savings Goal Alerts
    goals = SavingsGoal.objects.filter(user=user)
    for g in goals:
        if g.current_amount >= g.target_amount:
            alerts.append({
                'id': alert_id,
                'type': 'goal',
                'severity': 'success',
                'title': f"Goal Achieved: {g.title}!",
                'message': f"Congratulations! You reached your savings target of ₹{float(g.target_amount):,.2f} for '{g.title}'.",
                'date': today_str,
                'read': False
            })
            alert_id += 1
        elif g.target_date:
            days_left = (g.target_date - today).days
            if 0 <= days_left <= 10:
                rem = float(g.target_amount - g.current_amount)
                alerts.append({
                    'id': alert_id,
                    'type': 'goal',
                    'severity': 'warning',
                    'title': f"Goal Deadline Approaching: {g.title}",
                    'message': f"Only {days_left} day(s) left until target date ({g.target_date}). You still need ₹{rem:,.2f} to reach your goal.",
                    'date': today_str,
                    'read': False
                })
                alert_id += 1
            elif days_left < 0 and g.current_amount < g.target_amount:
                rem = float(g.target_amount - g.current_amount)
                alerts.append({
                    'id': alert_id,
                    'type': 'goal',
                    'severity': 'danger',
                    'title': f"Goal Overdue: {g.title}",
                    'message': f"Target date was {g.target_date}. ₹{rem:,.2f} remaining to reach the target.",
                    'date': today_str,
                    'read': False
                })
                alert_id += 1

    # 3. Overall Financial Health Alerts
    transactions = Transaction.objects.filter(user=user)
    income = transactions.filter(transaction_type='Income').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    expenses = transactions.filter(transaction_type='Expense').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    balance = income - expenses

    if balance < Decimal('0.00'):
        alerts.append({
            'id': alert_id,
            'type': 'transaction',
            'severity': 'danger',
            'title': 'Negative Cash Balance Warning',
            'message': f"Your total expenses (₹{float(expenses):,.2f}) currently exceed your total income (₹{float(income):,.2f}). Current deficit is ₹{abs(float(balance)):,.2f}.",
            'date': today_str,
            'read': False
        })
        alert_id += 1

    # If no alerts generated at all, show helpful informative welcome alert
    if not alerts:
        alerts.append({
            'id': alert_id,
            'type': 'general',
            'severity': 'info',
            'title': 'Financial System Status: Healthy',
            'message': 'All budgets and savings goals are on track. No critical alerts found.',
            'date': today_str,
            'read': False
        })

    return Response(alerts)
