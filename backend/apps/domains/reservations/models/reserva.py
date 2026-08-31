from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedMixin

from .funcion import Funcion


class Reserva(TimeStampedMixin):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        ANULADA = "anulada", "Anulada"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservas",
    )
    funcion = models.ForeignKey(
        Funcion, on_delete=models.PROTECT, related_name="reservas"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CONFIRMED
    )
    confirmed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-confirmed_at"]

    def __str__(self):
        return f"{self.user.username} - {self.funcion} - {self.status}"
