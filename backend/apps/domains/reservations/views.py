from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminUser

from .models import Funcion, Reserva, Sala
from .serializers import (
    AdminFuncionSerializer,
    ReservaListSerializer,
    ReservaSerializer,
    SalaDetailSerializer,
    SalaSerializer,
)
from .services import FuncionService, ReservaService, SalaService


class SalaAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Sala.objects.prefetch_related("seats", "funciones").all()

    def get_serializer_class(self):
        if self.action == "list":
            return SalaDetailSerializer
        return SalaSerializer

    def create(self, request, *args, **kwargs):
        serializer = SalaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = SalaService()
        result = service.create_sala(
            name=serializer.validated_data["name"],
            rows=serializer.validated_data["rows"],
            cols=serializer.validated_data["cols"],
        )
        if result.success:
            return Response(result.data, status=result.status_code)
        return Response({"detail": result.error}, status=result.status_code)

    def update(self, request, *args, **kwargs):
        sala = self.get_object()
        serializer = SalaSerializer(sala, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service = SalaService()
        result = service.update_sala(sala, name=serializer.validated_data["name"])
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)

    def destroy(self, request, *args, **kwargs):
        sala = self.get_object()
        service = SalaService()
        result = service.delete_sala(sala)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class FuncionAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Funcion.objects.select_related("movie", "sala").all()

    def get_serializer_class(self):
        if self.action == "list":
            return AdminFuncionSerializer
        return AdminFuncionSerializer

    def create(self, request, *args, **kwargs):
        serializer = AdminFuncionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = FuncionService()
        result = service.create_funcion(
            movie=serializer.validated_data["movie"],
            sala=serializer.validated_data["sala"],
            start_time=serializer.validated_data["start_time"],
        )
        if result.success:
            return Response(result.data, status=result.status_code)
        return Response({"detail": result.error}, status=result.status_code)

    def update(self, request, *args, **kwargs):
        funcion = self.get_object()
        serializer = AdminFuncionSerializer(funcion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service = FuncionService()
        result = service.update_funcion(
            funcion,
            movie=serializer.validated_data["movie"],
            sala=serializer.validated_data["sala"],
            start_time=serializer.validated_data["start_time"],
        )
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)

    def destroy(self, request, *args, **kwargs):
        funcion = self.get_object()
        service = FuncionService()
        result = service.soft_delete(funcion)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class ReservaAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return (
            Reserva.objects
            .select_related("user", "funcion__movie", "funcion__sala")
            .prefetch_related("reserva_seats__seat")
            .all()
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ReservaListSerializer
        return ReservaSerializer

    @action(detail=True, methods=["post"])
    def anular(self, request, pk=None):
        reserva = self.get_object()
        service = ReservaService()
        result = service.anular_reserva(reserva, user=request.user)
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)
