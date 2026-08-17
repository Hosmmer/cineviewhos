from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.utils.models import TimeStampedMixin


class Format(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Franja(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return self.name


class Cine(TimeStampedMixin):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


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
        seats = [
            Seat(sala=instance, row=r, col=c)
            for r in range(1, instance.rows + 1)
            for c in range(1, instance.cols + 1)
        ]
        Seat.objects.bulk_create(seats)


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


class Seat(TimeStampedMixin):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE, related_name="seats")
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()

    class Meta:
        ordering = ["row", "col"]
        unique_together = ["sala", "row", "col"]

    def __str__(self):
        return f"{self.sala.display_name} - F{self.row}C{self.col}"


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
