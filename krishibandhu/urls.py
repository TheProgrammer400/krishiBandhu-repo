from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/farmers/', include('farmers.urls')),  # now dashboard URL will be here
    path('farmers/', include('farmers.urls'))
]
