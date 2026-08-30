from django.db import models

from apps.core.models import TimeStampedMixin

from .sala import Sala


class Seat(TimeStampedMixin):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE, related_name="seats")
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()

    class Meta:
        ordering = ["row", "col"]
        unique_together = ["sala", "row", "col"]

    def __str__(self):
        return f"{self.sala.display_name} - F{self.row}C{self.col}"
