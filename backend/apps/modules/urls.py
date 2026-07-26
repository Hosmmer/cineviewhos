from rest_framework.routers import DefaultRouter

from .views import ModuleViewSet, RoleViewSet

router = DefaultRouter()
router.register(r"roles", RoleViewSet)
router.register(r"modules", ModuleViewSet)

urlpatterns = router.urls
