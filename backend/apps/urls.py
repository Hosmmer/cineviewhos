from django.http import JsonResponse
from django.urls import include, path


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health, name="health"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path("admin/", include("apps.accounts.urls")),
    path("admin/", include("apps.domains.movies.urls")),
    path("admin/", include("apps.domains.modules.urls")),
    path("admin/", include("apps.domains.reservations.urls")),
    path("", include("apps.domains.movies.urls_public")),
    path("", include("apps.domains.reservations.urls_public")),
]
