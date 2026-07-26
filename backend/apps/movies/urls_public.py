from rest_framework.routers import DefaultRouter

from .views_public import (
    ActorPublicViewSet,
    AuthorPublicViewSet,
    DirectorPublicViewSet,
    GenrePublicViewSet,
    MoviePublicViewSet,
)

router = DefaultRouter()
router.register(r"movies", MoviePublicViewSet, basename="movie")
router.register(r"genres", GenrePublicViewSet, basename="genre")
router.register(r"directors", DirectorPublicViewSet, basename="director")
router.register(r"authors", AuthorPublicViewSet, basename="author")
router.register(r"actors", ActorPublicViewSet, basename="actor")

urlpatterns = router.urls
