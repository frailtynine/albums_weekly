from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

from .api import api


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
    path('', include('front.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
