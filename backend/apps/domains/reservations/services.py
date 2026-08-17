from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from .models import Cine, Format, Franja, Funcion, Reserva, ReservaSeat, Sala, Seat


def get_active_franjas() -> list[Franja]:
    return list(Franja.objects.filter(is_active=True).order_by("start_time"))


def classify_franja(start_time, franjas=None) -> Franja | None:
    """Return the active Franja whose [start_time, end_time) contains start_time's
    time-of-day, or None if no band matches (rendered as "Sin franja")."""
    if start_time is None:
        return None
    t = start_time.time() if hasattr(start_time, "time") else start_time
    franjas = franjas if franjas is not None else get_active_franjas()
    for franja in franjas:
        if franja.start_time <= t < franja.end_time:
            return franja
    return None


class FranjaService(BaseService):

    def create_franja(self, name: str, start_time, end_time) -> ServiceResult:
        name = name.strip()
        if Franja.objects.filter(name=name).exists():
            return self.error("A franja with this name already exists.", 400)
        if start_time >= end_time:
            return self.error("start_time must be before end_time.", 400)

        franja = Franja.objects.create(
            name=name, start_time=start_time, end_time=end_time
        )
        return self.success(
            data={"id": franja.id, "name": franja.name},
            status_code=201,
        )

    def update_franja(self, franja: Franja, name: str, start_time, end_time) -> ServiceResult:
        name = name.strip()
        existing = Franja.objects.filter(name=name).exclude(id=franja.id).first()
        if existing:
            return self.error("A franja with this name already exists.", 400)
        if start_time >= end_time:
            return self.error("start_time must be before end_time.", 400)

        franja.name = name
        franja.start_time = start_time
        franja.end_time = end_time
        franja.save()
        return self.success(data={"id": franja.id, "name": franja.name})

    def soft_delete(self, franja: Franja) -> ServiceResult:
        franja.is_active = False
        franja.save()
        return self.success(status_code=204)


class CineService(BaseService):

    def create_cine(self, name: str) -> ServiceResult:
        name = name.strip()
        if Cine.objects.filter(name=name).exists():
            return self.error("A cine with this name already exists.", 400)

        cine = Cine.objects.create(name=name)
        return self.success(data={"id": cine.id, "name": cine.name}, status_code=201)

    def update_cine(self, cine: Cine, name: str) -> ServiceResult:
        name = name.strip()
        existing = Cine.objects.filter(name=name).exclude(id=cine.id).first()
        if existing:
            return self.error("A cine with this name already exists.", 400)
        cine.name = name
        cine.save()
        return self.success(data={"id": cine.id, "name": cine.name})

    def soft_delete(self, cine: Cine) -> ServiceResult:
        if cine.salas.filter(funciones__is_active=True).exists():
            return self.error("Cannot delete cine because it has active funciones.", 400)
        cine.is_active = False
        cine.save()
        return self.success(status_code=204)


class SalaService(BaseService):

    def create_sala(self, cine_id: int, number: int, rows: int, cols: int) -> ServiceResult:
        if rows < 1 or cols < 1:
            return self.error("Rows and cols must be at least 1.", 400)
        if number < 1:
            return self.error("Number must be at least 1.", 400)

        try:
            cine = Cine.objects.get(id=cine_id, is_active=True)
        except Cine.DoesNotExist:
            return self.error("Cine not found.", 400)

        if Sala.objects.filter(cine=cine, number=number).exists():
            return self.error("This cine already has a sala with this number.", 400)

        sala = Sala.objects.create(cine=cine, number=number, rows=rows, cols=cols)

        return self.success(
            data={
                "id": sala.id,
                "cine": cine.id,
                "number": number,
                "rows": rows,
                "cols": cols,
            },
            status_code=201,
        )

    def update_sala(self, sala: Sala, cine_id: int, number: int) -> ServiceResult:
        if number < 1:
            return self.error("Number must be at least 1.", 400)

        try:
            cine = Cine.objects.get(id=cine_id, is_active=True)
        except Cine.DoesNotExist:
            return self.error("Cine not found.", 400)

        existing = Sala.objects.filter(cine=cine, number=number).exclude(id=sala.id).first()
        if existing:
            return self.error("This cine already has a sala with this number.", 400)

        sala.cine = cine
        sala.number = number
        sala.save()
        return self.success(data={"id": sala.id, "cine": cine.id, "number": number})

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

    def create_reserva(self, user, funcion: Funcion, seats) -> ServiceResult:
        if not seats:
            return self.error("At least one seat must be selected.", 400)

        seat_ids: list[int] = []
        person_names: dict[int, str] = {}
        for item in seats:
            seat_id = item.get("seat_id")
            person_name = (item.get("person_name") or "").strip()
            if not seat_id:
                return self.error("Each seat must have a seat_id.", 400)
            if not person_name:
                return self.error("Each seat must have a person_name.", 400)
            seat_ids.append(seat_id)
            person_names[seat_id] = person_name

        with transaction.atomic():
            seat_objs = list(
                Seat.objects.filter(
                    id__in=seat_ids,
                    sala=funcion.sala,
                ).select_for_update()
            )

            if len(seat_objs) != len(set(seat_ids)):
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
                ReservaSeat(
                    reserva=reserva,
                    seat=seat,
                    person_name=person_names[seat.id],
                )
                for seat in seat_objs
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
