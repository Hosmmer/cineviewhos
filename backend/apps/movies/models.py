from django.db import models

from apps.utils.models import TimeStampedMixin


class Genre(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Movie(TimeStampedMixin):
    title = models.CharField(max_length=255)
    description = models.TextField()
    director = models.CharField(max_length=255)
    actors = models.TextField()
    duration_minutes = models.PositiveIntegerField()
    release_year = models.IntegerField()
    poster = models.ImageField(upload_to="posters/")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    genre = models.ForeignKey(Genre, on_delete=models.PROTECT, related_name="movies")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
