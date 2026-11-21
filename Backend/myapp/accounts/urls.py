from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from . import views

# Create API router
router = DefaultRouter()

# Register ViewSets
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'budgets', views.BudgetViewSet, basename='budget')
router.register(r'goals', views.SavingsGoalViewSet, basename='goal')

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile & Security endpoints
    path('profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),

    # Analytics, Reporting & Alert endpoints
    path('dashboard/', views.dashboard_summary, name='dashboard'),
    path('reports/', views.reports_summary, name='reports'),
    path('alerts/', views.alerts_summary, name='alerts'),

    # Router endpoints (transactions, budgets, goals)
    path('', include(router.urls)),
]
