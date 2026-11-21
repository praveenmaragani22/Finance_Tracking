from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Transaction, Budget, SavingsGoal

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'is_staff', 'is_active')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password'),
        }),
    )

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'transaction_type', 'category', 'date', 'created_at')
    list_filter = ('transaction_type', 'category', 'date')
    search_fields = ('title', 'category', 'user__email')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'amount', 'start_date', 'end_date', 'created_at')
    list_filter = ('category', 'start_date', 'end_date')
    search_fields = ('name', 'category', 'user__email')

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'target_amount', 'current_amount', 'target_date', 'created_at')
    list_filter = ('target_date',)
    search_fields = ('title', 'user__email')
