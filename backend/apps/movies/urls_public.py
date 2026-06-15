from rest_framework.routers import DefaultRouter

from .views_public import GenrePublicViewSet, MoviePublicViewSet

router = DefaultRouter()
router.register(r"movies", MoviePublicViewSet, basename="movie")
router.register(r"genres", GenrePublicViewSet, basename="genre")

urlpatterns = router.urls
