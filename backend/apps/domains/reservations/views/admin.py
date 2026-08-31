from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminUser

from ..models import Cine, Format, Franja, Funcion, Reserva, Sala
from ..serializers import (
    AdminFuncionSerializer,
    AdminReservaListSerializer,
    AdminReservaSerializer,
    CineScheduleSerializer,
    CineSerializer,
    CreateReservaSerializer,
    FormatSerializer,
    FranjaSerializer,
    SalaDetailSerializer,
    SalaSerializer,
)
from ..services import CineService, FranjaService, FuncionService, ReservaService, SalaService


class CineAdminViewSet(viewsets.ModelViewSet):
    queryset = Cine.objects.all()
    serializer_class = CineSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = CineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = CineService()
        result = service.create_cine(name=serializer.validated_data["name"])
        if result.success:
            return Response(result.data, status=result.status_code)
        return Response({"detail": result.error}, status=result.status_code)

    def update(self, request, *args, **kwargs):
        cine = self.get_object()
        serializer = CineSerializer(cine, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service = CineService()
        result = service.update_cine(
            cine, name=serializer.validated_data.get("name", cine.name)
        )
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)

    def destroy(self, request, *args, **kwargs):
        cine = self.get_object()
        service = CineService()
        result = service.soft_delete(cine)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)

    @action(detail=True, methods=["get"], url_path="schedule")
    def schedule(self, request, pk=None):
        cine = self.get_object()
        serializer = CineScheduleSerializer(cine)
        return Response(serializer.data)


class FranjaAdminViewSet(viewsets.ModelViewSet):
    queryset = Franja.objects.all()
    serializer_class = FranjaSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = FranjaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = FranjaService()
        result = service.create_franja(
            name=serializer.validated_data["name"],
            start_time=serializer.validated_data["start_time"],
            end_time=serializer.validated_data["end_time"],
        )
        if result.success:
            return Response(result.data, status=result.status_code)
        return Response({"detail": result.error}, status=result.status_code)

    def update(self, request, *args, **kwargs):
        franja = self.get_object()
        serializer = FranjaSerializer(franja, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service = FranjaService()
        result = service.update_franja(
            franja,
            name=serializer.validated_data.get("name", franja.name),
            start_time=serializer.validated_data.get("start_time", franja.start_time),
            end_time=serializer.validated_data.get("end_time", franja.end_time),
        )
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)

    def destroy(self, request, *args, **kwargs):
        franja = self.get_object()
        service = FranjaService()
        result = service.soft_delete(franja)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class FormatAdminViewSet(viewsets.ModelViewSet):
    queryset = Format.objects.all()
    serializer_class = FormatSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        fmt = self.get_object()
        fmt.is_active = False
        fmt.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
            cine_id=serializer.validated_data["cine"].id,
            number=serializer.validated_data["number"],
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
        cine = serializer.validated_data.get("cine", sala.cine)
        number = serializer.validated_data.get("number", sala.number)
        result = service.update_sala(sala, cine_id=cine.id, number=number)
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
        return Funcion.objects.select_related("movie", "sala").prefetch_related("formats").all()

    def get_serializer_class(self):
        return AdminFuncionSerializer

    def create(self, request, *args, **kwargs):
        serializer = AdminFuncionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = FuncionService()
        result = service.create_funcion(
            movie=serializer.validated_data["movie"],
            sala=serializer.validated_data["sala"],
            start_time=serializer.validated_data["start_time"],
            format_ids=serializer.validated_data.get("format_ids"),
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
            format_ids=serializer.validated_data.get("format_ids"),
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


class ReservaAdminViewSet(viewsets.ModelViewSet):
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
            return AdminReservaListSerializer
        return AdminReservaSerializer

    def create(self, request, *args, **kwargs):
        serializer = CreateReservaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            funcion = Funcion.objects.get(
                id=serializer.validated_data["funcion_id"],
                is_active=True,
            )
        except Funcion.DoesNotExist:
            return Response(
                {"detail": "Funcion not found or is not active."},
                status=status.HTTP_404_NOT_FOUND,
            )

        service = ReservaService()
        result = service.create_reserva(
            user=request.user,
            funcion=funcion,
            seats=serializer.validated_data["seats"],
        )
        if result.success:
            return Response(result.data, status=result.status_code)
        return Response({"detail": result.error}, status=result.status_code)

    @action(detail=True, methods=["post"])
    def anular(self, request, pk=None):
        reserva = self.get_object()
        service = ReservaService()
        result = service.anular_reserva(reserva, user=request.user)
        if result.success:
            return Response(result.data)
        return Response({"detail": result.error}, status=result.status_code)
