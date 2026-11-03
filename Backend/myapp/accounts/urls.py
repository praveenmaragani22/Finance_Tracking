from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from .views import TransactionViewSet


# Create API router
router = DefaultRouter()

# Register Transactions API
router.register(
    r'transactions',
    TransactionViewSet,
    basename='transaction'
)


urlpatterns = [
    path('register/', views.register_user, name='register'),

    path('login/', TokenObtainPairView.as_view(), name='login'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Transaction API endpoints
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_summary, name='dashboard'),
]