from rest_framework.routers import DefaultRouter

from .views import FuncionAdminViewSet, ReservaAdminViewSet, SalaAdminViewSet

router = DefaultRouter()
router.register(r"salas", SalaAdminViewSet, basename="admin-sala")
router.register(r"funciones", FuncionAdminViewSet, basename="admin-funcion")
router.register(r"reservas", ReservaAdminViewSet, basename="admin-reserva")

urlpatterns = router.urls
