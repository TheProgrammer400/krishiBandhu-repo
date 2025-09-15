from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import FarmerUser

class FarmerUserAdmin(UserAdmin):
    # show these in the list view
    list_display = ("username", "email", "phone_number", "is_staff", "is_active")

    # add phone_number into the fieldsets (used when editing user in admin)
    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("phone_number",)}),
    )

    # also add phone_number into add_fieldsets (used when creating user in admin)
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {"fields": ("phone_number",)}),
    )

# Register with your custom admin
admin.site.register(FarmerUser, FarmerUserAdmin)
