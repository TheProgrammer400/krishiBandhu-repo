from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/farmers/", include("farmers.urls")),  # 👈 React will call this
]
