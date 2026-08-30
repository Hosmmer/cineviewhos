from django.db import models

from apps.core.models import TimeStampedMixin


class Author(TimeStampedMixin):
    name = models.CharField(max_length=255, unique=True)
    birth_date = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
