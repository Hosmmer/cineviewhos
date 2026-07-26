from rest_framework.routers import DefaultRouter

from .views import (
    ActorAdminViewSet,
    AuthorAdminViewSet,
    DirectorAdminViewSet,
    GenreAdminViewSet,
    MovieAdminViewSet,
)

router = DefaultRouter()
router.register(r"genres", GenreAdminViewSet, basename="admin-genre")
router.register(r"movies", MovieAdminViewSet, basename="admin-movie")
router.register(r"directors", DirectorAdminViewSet, basename="admin-director")
router.register(r"authors", AuthorAdminViewSet, basename="admin-author")
router.register(r"actors", ActorAdminViewSet, basename="admin-actor")

urlpatterns = router.urls
