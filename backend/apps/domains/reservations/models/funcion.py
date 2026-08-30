from django.db import models

from apps.core.models import TimeStampedMixin

from .format import Format
from .sala import Sala


class Funcion(TimeStampedMixin):
    movie = models.ForeignKey(
        "movies.Movie", on_delete=models.PROTECT, related_name="funciones"
    )
    sala = models.ForeignKey(
        Sala, on_delete=models.PROTECT, related_name="funciones"
    )
    start_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    formats = models.ManyToManyField(Format, blank=True, related_name="funciones")

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.movie.title} - {self.sala.display_name} - {self.start_time}"
