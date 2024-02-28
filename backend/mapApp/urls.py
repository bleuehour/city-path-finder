from django.urls import path
from .views import getpath

urlpatterns = [
    path('get-location-data/', getpath, name='get-location-data'),
]