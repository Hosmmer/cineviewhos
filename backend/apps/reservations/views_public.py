from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Funcion, Reserva, Seat
from .serializers import (
    CreateReservaSerializer,
    FuncionDetailSerializer,
    FuncionSerializer,
    ReservaListSerializer,
    ReservaSerializer,
    SeatSerializer,
)
from .services import ReservaService


class FuncionPublicViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Funcion.objects.filter(is_active=True).select_related(
            "movie", "sala"
        )
        movie_id = self.request.query_params.get("movie")
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return FuncionSerializer
        return FuncionDetailSerializer


class FuncionSeatPublicViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SeatSerializer

    def get_queryset(self):
        funcion_id = self.request.query_params.get("funcion")
        if not funcion_id:
            return Seat.objects.none()

        try:
            funcion = Funcion.objects.get(id=funcion_id, is_active=True)
        except Funcion.DoesNotExist:
            return Seat.objects.none()

        return funcion.sala.seats.all().order_by("row", "col")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["funcion_id"] = self.request.query_params.get("funcion")
        return context


class ReservaPublicViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action in ("list", "retrieve", "anular"):
            return (
                Reserva.objects
                .filter(user=self.request.user)
                .select_related("funcion__movie", "funcion__sala")
                .prefetch_related("reserva_seats__seat")
            )
        return Reserva.objects.none()

    def get_serializer_class(self):
        if self.action == "list":
            return ReservaListSerializer
        return ReservaSerializer

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
            seat_ids=serializer.validated_data["seat_ids"],
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
