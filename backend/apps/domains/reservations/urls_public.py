from rest_framework.routers import DefaultRouter

from .views_public import (
    FuncionPublicViewSet,
    FuncionSeatPublicViewSet,
    ReservaPublicViewSet,
)

router = DefaultRouter()
router.register(r"funciones", FuncionPublicViewSet, basename="funcion")
router.register(r"asientos", FuncionSeatPublicViewSet, basename="asiento")
router.register(r"reservas", ReservaPublicViewSet, basename="reserva")

urlpatterns = router.urls
