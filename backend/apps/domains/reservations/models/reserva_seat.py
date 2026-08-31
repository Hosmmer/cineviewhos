from django.db import models

from apps.core.models import TimeStampedMixin

from .reserva import Reserva
from .seat import Seat


class ReservaSeat(TimeStampedMixin):
    reserva = models.ForeignKey(
        Reserva, on_delete=models.CASCADE, related_name="reserva_seats"
    )
    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name="reserva_seats")
    person_name = models.CharField(max_length=150, blank=False, default="")

    class Meta:
        unique_together = ["reserva", "seat"]

    def __str__(self):
        return f"Reserva {self.reserva_id} - Seat {self.seat_id}"
