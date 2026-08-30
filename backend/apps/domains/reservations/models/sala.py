from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import TimeStampedMixin

from .cine import Cine


class Sala(TimeStampedMixin):
    cine = models.ForeignKey(Cine, on_delete=models.PROTECT, related_name="salas")
    number = models.PositiveIntegerField()
    rows = models.PositiveIntegerField()
    cols = models.PositiveIntegerField()

    class Meta:
        ordering = ["cine", "number"]
        unique_together = ["cine", "number"]

    def __str__(self):
        return self.display_name

    @property
    def display_name(self):
        return f"{self.cine.name} - Sala {self.number}"


@receiver(post_save, sender=Sala)
def create_seats_for_sala(sender, instance, created, **kwargs):
    if created:
        from .seat import Seat

        seats = [
            Seat(sala=instance, row=r, col=c)
            for r in range(1, instance.rows + 1)
            for c in range(1, instance.cols + 1)
        ]
        Seat.objects.bulk_create(seats)
