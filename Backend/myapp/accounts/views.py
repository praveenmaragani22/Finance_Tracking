from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer
from .serializers import RegisterSerializer
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

class TransactionViewSet(viewsets.ModelViewSet):

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):

    transactions = Transaction.objects.filter(user=request.user)

    # Calculate total income
    total_income = transactions.filter(
        transaction_type='Income'
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Calculate total expenses
    total_expenses = transactions.filter(
        transaction_type='Expense'
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Calculate balance and savings
    total_balance = total_income - total_expenses
    savings = total_balance

    # Recent transactions
    recent_transactions = transactions.order_by(
        '-date', '-created_at'
    )[:5]

    recent_data = TransactionSerializer(
        recent_transactions, many=True
    ).data

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
        'total_income': total_income,
        'total_expenses': total_expenses,
        'total_balance': total_balance,
        'savings': savings,
        'recent_transactions': recent_data,
        'expenses_by_category': list(category_data),
        'monthly_income': list(monthly_income),
        'monthly_expenses': list(monthly_expenses)
    })