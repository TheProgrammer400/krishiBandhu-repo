from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

def landing(request):
    return render(request, "landing.html")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", landing, name="landing"),
    path('api/farmers/', include('farmers.urls')),  # now dashboard URL will be here
    path('farmers/', include('farmers.urls'))
]
