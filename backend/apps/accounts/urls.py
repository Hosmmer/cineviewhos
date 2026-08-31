from rest_framework.routers import DefaultRouter

from .views import RoleViewSet, UserAdminViewSet

router = DefaultRouter()
router.register(r"users", UserAdminViewSet, basename="admin-users")
router.register(r"roles", RoleViewSet, basename="admin-roles")

urlpatterns = router.urls
