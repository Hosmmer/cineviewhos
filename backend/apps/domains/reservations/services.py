from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from .models import Format, Funcion, Reserva, ReservaSeat, Sala, Seat


class SalaService(BaseService):

    def create_sala(self, name: str, rows: int, cols: int) -> ServiceResult:
        name = name.strip()
        if Sala.objects.filter(name=name).exists():
            return self.error("A sala with this name already exists.", 400)
        if rows < 1 or cols < 1:
            return self.error("Rows and cols must be at least 1.", 400)

        sala = Sala.objects.create(name=name, rows=rows, cols=cols)

        return self.success(
            data={"id": sala.id, "name": sala.name, "rows": rows, "cols": cols},
            status_code=201,
        )

    def update_sala(self, sala: Sala, name: str) -> ServiceResult:
        name = name.strip()
        existing = Sala.objects.filter(name=name).exclude(id=sala.id).first()
        if existing:
            return self.error("A sala with this name already exists.", 400)
        sala.name = name
        sala.save()
        return self.success(data={"id": sala.id, "name": sala.name})

    def delete_sala(self, sala: Sala) -> ServiceResult:
        if sala.funciones.filter(is_active=True).exists():
            return self.error(
                "Cannot delete sala because it has active funciones.", 400
            )
        sala.delete()
        return self.success(status_code=204)


class FuncionService(BaseService):

    def _get_funcion_end(self, funcion):
        return funcion.start_time + timedelta(minutes=funcion.movie.duration_minutes)

    def _check_overlap(self, sala, start_time, end_time, exclude_id=None):
        if not timezone.is_aware(start_time):
            start_time = timezone.make_aware(start_time, timezone.utc)
            end_time = timezone.make_aware(end_time, timezone.utc)

        queryset = Funcion.objects.filter(
            sala=sala,
            is_active=True,
        )
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)

        for f in queryset:
            f_start = f.start_time
            if not timezone.is_aware(f_start):
                f_start = timezone.make_aware(f_start, timezone.utc)
            f_end = f.start_time + timedelta(minutes=f.movie.duration_minutes)
            if not timezone.is_aware(f_end):
                f_end = timezone.make_aware(f_end, timezone.utc)
            if f_start < end_time and f_end > start_time:
                return f
        return None

    def create_funcion(
        self, movie, sala: Sala, start_time, format_ids=None
    ) -> ServiceResult:
        end_time = start_time + timedelta(minutes=movie.duration_minutes)

        if self._check_overlap(sala, start_time, end_time):
            return self.error(
                "This sala already has a funcion scheduled during this time.", 400
            )

        funcion = Funcion.objects.create(
            movie=movie, sala=sala, start_time=start_time
        )
        if format_ids is not None:
            valid_ids = set(
                Format.objects.filter(id__in=format_ids).values_list("id", flat=True)
            )
            if len(valid_ids) != len(format_ids):
                return self.error("One or more format IDs are invalid.", 400)
            funcion.formats.set(format_ids)

        return self.success(
            data={
                "id": funcion.id,
                "start_time": str(funcion.start_time),
                "format_ids": list(funcion.formats.values_list("id", flat=True)),
            },
            status_code=201,
        )

    def update_funcion(
        self, funcion: Funcion, movie, sala: Sala, start_time, format_ids=None
    ) -> ServiceResult:
        end_time = start_time + timedelta(minutes=movie.duration_minutes)

        if self._check_overlap(sala, start_time, end_time, exclude_id=funcion.id):
            return self.error(
                "This sala already has a funcion scheduled during this time.", 400
            )

        funcion.movie = movie
        funcion.sala = sala
        funcion.start_time = start_time
        funcion.save()
        if format_ids is not None:
            valid_ids = set(
                Format.objects.filter(id__in=format_ids).values_list("id", flat=True)
            )
            if len(valid_ids) != len(format_ids):
                return self.error("One or more format IDs are invalid.", 400)
            funcion.formats.set(format_ids)

        return self.success(
            data={
                "id": funcion.id,
                "start_time": str(funcion.start_time),
                "format_ids": list(funcion.formats.values_list("id", flat=True)),
            }
        )

    def soft_delete(self, funcion: Funcion) -> ServiceResult:
        funcion.is_active = False
        funcion.save()
        return self.success(status_code=204)


class ReservaService(BaseService):

    def create_reserva(self, user, funcion: Funcion, seat_ids: list[int]) -> ServiceResult:
        if not seat_ids:
            return self.error("At least one seat must be selected.", 400)

        with transaction.atomic():
            seats = list(
                Seat.objects.filter(
                    id__in=seat_ids,
                    sala=funcion.sala,
                ).select_for_update()
            )

            if len(seats) != len(seat_ids):
                return self.error("One or more seats do not belong to this sala.", 400)

            occupied = Seat.objects.filter(
                id__in=seat_ids,
                reserva_seats__reserva__funcion=funcion,
                reserva_seats__reserva__status=Reserva.Status.CONFIRMED,
            ).values_list("id", flat=True)

            occupied_set = set(occupied)
            unavailable = [sid for sid in seat_ids if sid in occupied_set]

            if unavailable:
                return self.error(
                    f"Seats {unavailable} are no longer available.", 409
                )

            reserva = Reserva.objects.create(
                user=user,
                funcion=funcion,
                status=Reserva.Status.CONFIRMED,
                confirmed_at=timezone.now(),
            )

            reserva_seats = [
                ReservaSeat(reserva=reserva, seat=seat) for seat in seats
            ]
            ReservaSeat.objects.bulk_create(reserva_seats)

            return self.success(
                data={
                    "id": reserva.id,
                    "status": reserva.status,
                    "seat_ids": seat_ids,
                },
                status_code=201,
            )

    def anular_reserva(self, reserva: Reserva, user) -> ServiceResult:
        if not user.is_staff and reserva.user != user:
            return self.error(
                "You do not have permission to anular this reserva.", 403
            )

        if reserva.status == Reserva.Status.ANULADA:
            return self.error("This reserva is already anulada.", 400)

        reserva.status = Reserva.Status.ANULADA
        reserva.save()
        return self.success(
            data={"id": reserva.id, "status": reserva.status}
        )
