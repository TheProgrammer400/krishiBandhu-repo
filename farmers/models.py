from django.contrib.auth.models import AbstractUser
from django.db import models

class FarmerUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    primary_crop = models.CharField(max_length=100)
    primary_language = models.CharField(max_length=50)
    secondary_language = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField()
