from rest_framework.routers import DefaultRouter

from .views.admin import (
    CineAdminViewSet,
    FormatAdminViewSet,
    FranjaAdminViewSet,
    FuncionAdminViewSet,
    ReservaAdminViewSet,
    SalaAdminViewSet,
)

router = DefaultRouter()
router.register(r"cines", CineAdminViewSet, basename="admin-cine")
router.register(r"formats", FormatAdminViewSet, basename="admin-format")
router.register(r"franjas", FranjaAdminViewSet, basename="admin-franja")
router.register(r"salas", SalaAdminViewSet, basename="admin-sala")
router.register(r"funciones", FuncionAdminViewSet, basename="admin-funcion")
router.register(r"reservas", ReservaAdminViewSet, basename="admin-reserva")

urlpatterns = router.urls
