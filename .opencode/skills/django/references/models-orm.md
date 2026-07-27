# Models & ORM — CineViewHos

## Base Class

Every model inherits from `TimeStampedMixin` (`apps.utils.models`):

```python
from apps.utils.models import TimeStampedMixin

class MyModel(TimeStampedMixin):
    # created_at, updated_at provided automatically
    ...
```

## Field Conventions

| Pattern | Example |
|---------|---------|
| `CharField(max_length=...)` | `name = models.CharField(max_length=100, unique=True)` |
| `SlugField` | `slug = models.SlugField(max_length=100, unique=True)` |
| `TextField(blank=True)` | `description = models.TextField(blank=True)` |
| `PositiveIntegerField()` | `duration_minutes = models.PositiveIntegerField()` |
| `DecimalField(max_digits=10, decimal_places=2)` | `price = models.DecimalField(...)` |
| `ImageField(upload_to="...")` | `poster = models.ImageField(upload_to="posters/")` |
| `BooleanField(default=True)` | `is_active = models.BooleanField(default=True)` |
| `ForeignKey("self", ...)` | Self-referential (e.g., `Module.parent`) |
| `ManyToManyField(blank=True)` | `roles = models.ManyToManyField(Role, blank=True, related_name="...")` |
| `models.TextChoices` | `class Status(models.TextChoices): CONFIRMED = "confirmed", "Confirmed"` |
| `settings.AUTH_USER_MODEL` | For user FK: `user = models.ForeignKey(settings.AUTH_USER_MODEL, ...)` |

## ForeignKey Conventions

- **PROTECT** for referenced entities that should not be deleted if referenced:
  ```python
  genre = models.ForeignKey(Genre, on_delete=models.PROTECT, related_name="movies")
  ```
- **CASCADE** for owned children (e.g., seats belonging to a sala):
  ```python
  sala = models.ForeignKey(Sala, on_delete=models.CASCADE, related_name="seats")
  ```
- FK field names: use the model name directly (`genre`, `sala`), or `{entity}_fk` when ambiguous (`director_fk`)

## Meta Conventions

```python
class Meta:
    ordering = ["name"]           # Alphabetical for lookup models
    ordering = ["-created_at"]    # Reverse chronological for transactional models
    ordering = ["order", "name"]  # Custom ordering field + name
    unique_together = ["field_a", "field_b"]  # Composite uniqueness
    abstract = True               # For mixins only
```

## `__str__` Convention

Always implemented:
```python
def __str__(self):
    return self.name                           # Simple models
    return f"{self.movie.title} - {self.sala.name} - {self.start_time}"  # Composite
```

## Soft Delete Pattern

Every deletable entity uses `is_active = BooleanField(default=True)`. Never hard-delete entities with relationships. Delete is done via service methods called `soft_delete()` that set `is_active = False`.

## Signals

Used sparingly with `@receiver(post_save, ...)`. Only for automatic record generation (e.g., creating seats when a Sala is created). Use `bulk_create` for mass inserts.

```python
@receiver(post_save, sender=Sala)
def create_seats_for_sala(sender, instance, created, **kwargs):
    if created:
        seats = [Seat(sala=instance, row=r, col=c) for r in range(rows) for c in range(cols)]
        Seat.objects.bulk_create(seats)
```

## Custom User Model

`User` extends `AbstractUser` in `apps/common/models.py`. Reference via `settings.AUTH_USER_MODEL` and import at runtime via `get_user_model()`.

```python
from django.contrib.auth import get_user_model
User = get_user_model()
```

## Imports

```python
from django.db import models, transaction
from django.db.models import Q, F, Count, Sum
from apps.utils.models import TimeStampedMixin
```
