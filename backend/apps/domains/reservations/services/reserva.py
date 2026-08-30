from django.db import transaction
from django.utils import timezone

from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Reserva, ReservaSeat, Seat


class ReservaService(BaseService):

    def create_reserva(self, user, funcion, seats) -> ServiceResult:
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
