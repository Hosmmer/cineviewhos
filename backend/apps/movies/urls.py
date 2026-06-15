from rest_framework.routers import DefaultRouter

from .views import GenreAdminViewSet, MovieAdminViewSet

router = DefaultRouter()
router.register(r"genres", GenreAdminViewSet, basename="admin-genre")
router.register(r"movies", MovieAdminViewSet, basename="admin-movie")

urlpatterns = router.urls
