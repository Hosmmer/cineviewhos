from django.db import models

from apps.core.models import TimeStampedMixin


class Genre(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
