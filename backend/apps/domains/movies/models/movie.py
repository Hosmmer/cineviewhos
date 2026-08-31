from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import TimeStampedMixin

from .actor import Actor
from .author import Author
from .director import Director
from .genre import Genre


class Movie(TimeStampedMixin):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration_minutes = models.PositiveIntegerField()
    release_year = models.IntegerField()
    poster = models.ImageField(upload_to="posters/")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    genre = models.ForeignKey(Genre, on_delete=models.PROTECT, related_name="movies")
    director_fk = models.ForeignKey(
        Director, on_delete=models.PROTECT, null=True, blank=True, related_name="movies"
    )
    author_fk = models.ForeignKey(
        Author, on_delete=models.PROTECT, null=True, blank=True, related_name="movies"
    )
    actor_fk = models.ForeignKey(
        Actor, on_delete=models.PROTECT, null=True, blank=True, related_name="movies"
    )
    franjas = models.ManyToManyField(
        "reservations.Franja", blank=True, related_name="movies"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class MovieDisplayConfig(models.Model):
    movie = models.OneToOneField(
        Movie, on_delete=models.CASCADE, related_name="display_config"
    )
    show_director = models.BooleanField(default=True)
    show_author = models.BooleanField(default=True)
    show_actor = models.BooleanField(default=True)
    show_description = models.BooleanField(default=True)
    show_duration = models.BooleanField(default=True)
    show_release_year = models.BooleanField(default=True)
    show_price = models.BooleanField(default=True)
    show_genre = models.BooleanField(default=True)

    def __str__(self):
        return f"Display config for {self.movie.title}"


@receiver(post_save, sender=Movie)
def create_movie_display_config(sender, instance, created, **kwargs):
    if created:
        MovieDisplayConfig.objects.create(movie=instance)
