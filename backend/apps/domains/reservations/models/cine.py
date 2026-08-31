from django.db import models

from apps.core.models import TimeStampedMixin


class Cine(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
