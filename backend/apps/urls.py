from django.urls import path, include
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
]
