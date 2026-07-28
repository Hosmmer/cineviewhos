from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.common.views import UserAdminViewSet


def health(request):
    return JsonResponse({"status": "ok"})


router = DefaultRouter()
router.register(r"users", UserAdminViewSet, basename="admin-users")

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path("admin/", include("apps.domains.movies.urls")),
    path("admin/", include("apps.modules.urls")),
    path("admin/", include("apps.domains.reservations.urls")),
    path("admin/", include(router.urls)),
    path("", include("apps.domains.movies.urls_public")),
    path("", include("apps.domains.reservations.urls_public")),
]
