# Architecture & Project Structure — CineViewHos Backend

## Principles (from Django-Styleguide + HackSoft)

1. **Separation of concerns**: business logic lives in services/selectors, NOT in views/serializers
2. **Thin APIs**: views should only validate, call service, return response
3. **Data flow**: Request → Serializer → Service → Model → ServiceResult → Response
4. **Never**: business logic in `save()`, signals for domain logic, fat serializers

## Project Structure — Current & Growth

```
backend/
├── config/                  # Django settings, urls, wsgi, celery
│   ├── settings.py          # ENV-driven settings
│   ├── urls.py              # Root URL routing
│   └── celery_config.py
├── apps/                    # All application code
│   ├── core/                # Foundation layer
│   │   ├── services/
│   │   │   └── base.py      # BaseService + ServiceResult
│   │   └── data_classes.py
│   ├── common/              # Shared: User model, permissions, auth, middleware
│   │   ├── models.py        # User, Role
│   │   ├── permissions.py   # IsAdminUser, HasRole, IsOwnerOrAdmin
│   │   ├── authentication.py
│   │   ├── auth_backend.py
│   │   ├── serializers.py   # UserSerializer (Djoser override)
│   │   └── middleware.py
│   ├── utils/               # Shared utilities
│   │   ├── models.py        # TimeStampedMixin
│   │   ├── utils.py         # slugify()
│   │   ├── choices.py
│   │   ├── encryption.py
│   │   └── lucide_icons.py
│   ├── modules/             # Dynamic navigation module system
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── movies/              # Movie domain
│   │   ├── models.py        # Genre, Director, Author, Actor, Movie
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── views.py         # Admin endpoints
│   │   ├── views_public.py  # Public endpoints
│   │   ├── urls.py
│   │   ├── urls_public.py
│   │   └── admin.py
│   └── reservations/        # Reservation domain
│       ├── models.py        # Sala, Funcion, Seat, Reserva, ReservaSeat
│       ├── serializers.py
│       ├── services.py
│       ├── views.py
│       ├── views_public.py
│       ├── urls.py
│       └── urls_public.py
└── tests/                   # Pytest suite
    └── apps/
        └── {app}/           # Mirrors apps/ structure
            ├── test_services.py
            └── test_views.py
```

## When to Create a New App

Create a new `apps/{domain}/` when:

1. **New bounded context**: a set of models/serializers/services/views that form a distinct domain (e.g., `payments/`, `loyalty/`, `analytics/`)
2. **5+ models**: if a single app has more than ~5 models, consider splitting
3. **200+ line services.py**: if services.py is hard to navigate, split into module
4. **Independent feature**: the feature can be understood without reading other apps

DO NOT create a new app for:
- A single model with no unique business logic (add to existing app)
- "Helper" or "common" utilities (use `apps/utils/` or `apps/common/`)
- Django admin-only models (unless significant business logic)

## When to Split services.py → Module

```
services/
├── __init__.py        # Re-export public services
├── create.py          # All create operations
├── update.py          # All update operations
├── delete.py          # Soft-delete, anular
├── selectors.py       # All read/fetch operations (if adopting selectors)
└── validators.py      # Complex validation logic shared across services
```

Split when:
- services.py exceeds ~300 lines
- Multiple "flows" that could be grouped (e.g., `movie_create`, `movie_update`, `movie_delete`)
- Complex validation logic shared between services

## Selectors (Fetch Layer)

Django-Styleguide recommends separating reads from writes:

```python
# apps/movies/selectors.py
def movie_get_by_id(*, movie_id: int) -> Movie:
    return Movie.objects.get(id=movie_id)

def movie_list_active(*, genre_id: int = None) -> QuerySet[Movie]:
    qs = Movie.objects.filter(is_active=True).select_related("genre")
    if genre_id:
        qs = qs.filter(genre_id=genre_id)
    return qs
```

CineViewHos currently combines reads into services. Adopt selectors when:
- The same query appears in 3+ places
- A complex queryset needs to be reused across services and views
- N+1 optimization requires centralized queryset management

## Service Best Practices (Deep)

### Class-based vs Function-based

CineViewHos uses class-based services (extending `BaseService`). This is correct for:
- Grouping related operations (create, update, delete, anular)
- Reusing internal helpers within the same domain
- Dependency injection via constructor

Use function-based services when:
- The operation is a one-off with no related operations
- No shared state or helpers needed
- Example: `email_send_confirmation(*, user: User) -> None`

### Atomic Transactions

```python
from django.db import transaction

@transaction.atomic
def create_reserva(self, *, funcion: Funcion, seats: List[Seat], user: User) -> ServiceResult:
    # All or nothing — if any step fails, everything rolls back
    ...
```

Use `transaction.atomic` for:
- Multi-model creates (e.g., reserva + reserva_seats)
- Operations that must be all-or-nothing
- Balance/quantity updates (select_for_update inside atomic)

### select_for_update

```python
with transaction.atomic():
    seat = Seat.objects.select_for_update().get(id=seat_id, is_available=True)
    seat.is_available = False
    seat.save()
```

Use `select_for_update` when:
- Preventing race conditions (seat booking, inventory)
- Read-then-write operations where stale reads cause data corruption

## API Architecture (DRF)

### Convention: 1 API Class = 1 Entity

```
# List API
class MoviePublicViewSet(ReadOnlyModelViewSet):
    # GET /api/movies/  → list
    # GET /api/movies/{id}/ → retrieve

# Admin CRUD API
class MovieAdminViewSet(ModelViewSet):
    # GET    /api/admin/movies/      → list
    # POST   /api/admin/movies/      → create
    # GET    /api/admin/movies/{id}/ → retrieve
    # PUT/PATCH /api/admin/movies/{id}/ → update
    # DELETE /api/admin/movies/{id}/ → destroy
```

### When to add custom actions vs new ViewSet

```python
# Custom action (stays in same ViewSet)
@action(detail=True, methods=["post"])
def anular(self, request, pk=None): ...

# New ViewSet (separate endpoint, different permissions/serializers)
class MovieSearchViewSet(ReadOnlyModelViewSet): ...
```

Rule: If the action requires different permissions, serializers, or pagination → new ViewSet. Otherwise → custom action.

## Imports Organization

### Module-level imports (do at top)

```python
# 1. Standard library
import os
from datetime import timedelta

# 2. Django / DRF
from django.db import models, transaction
from rest_framework import serializers, viewsets

# 3. Internal apps (absolute path)
from apps.core.services.base import BaseService
from apps.core.data_classes import ServiceResult
from apps.movies.models import Genre

# 4. Same app (relative)
from .models import Movie
from .serializers import MovieSerializer
```

## Testing Structure

```
tests/
└── apps/
    └── {app}/
        ├── test_services.py    # Service unit tests
        ├── test_views.py        # API integration tests
        ├── test_models.py       # Model validation tests (if needed)
        └── test_selectors.py    # Selector tests (if adopting)
```

## Growth Rules (Hard)

| If... | Then... |
|-------|---------|
| App has 5+ models | Consider splitting into sub-apps |
| services.py > 300 lines | Split into `services/` module |
| Same query in 3+ files | Extract to `selectors.py` |
| View has business logic | Move to service |
| Serializer has `create()`/`update()` logic | Move to service |
| Nested serializers > 2 levels | Flatten or use separate endpoints |
| 3+ services share validation | Extract to `validators.py` |
| App imports from another app 5+ times | Consider if domains need merging |
| settings.py > 300 lines | Split by concern (auth, storage, celery, etc.) |
