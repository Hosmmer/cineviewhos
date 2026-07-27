# Views & Viewsets — CineViewHos

## View Types

All views use `ModelViewSet` or `ReadOnlyModelViewSet`:
```python
from rest_framework import viewsets
from rest_framework.decorators import action
```

## Admin vs Public Split

**Admin views** (`views.py`, `/api/admin/`):
```python
class GenreAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
```

**Public views** (`views_public.py`, `/api/`):
```python
class MoviePublicViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MovieSerializer
```

## Permissions

Simple static:
```python
permission_classes = [IsAuthenticated, IsAdminUser]
```

Dynamic via `get_permissions()`:
```python
def get_permissions(self):
    if self.action in ("create", "update", "partial_update", "destroy"):
        return [IsAuthenticated(), HasRole("admin")()]
    return [IsAuthenticated()]
```

Custom permissions (`apps/common/permissions.py`):
- `IsAdminUser` — checks `request.user.is_staff`
- `IsOwnerOrAdmin` — checks `obj.user == request.user` or `is_staff`
- `HasRole` — checks `request.user.roles.filter(slug=role_slug).exists()`

## Serializer Selection

```python
def get_serializer_class(self):
    if self.action == "list":
        return MovieListSerializer
    return MovieSerializer
```

## Service Call Pattern

```python
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = GenreService()
    result = service.create_genre(**serializer.validated_data)
    if result.success:
        return Response(result.data, status=result.status_code)
    return Response({"detail": result.error}, status=result.status_code)
```

**Always** return `{"detail": result.error}` for errors — matching DRF convention.

## Override `update()` to Force Partial

```python
def update(self, request, *args, **kwargs):
    kwargs["partial"] = True
    return super().update(request, *args, **kwargs)
```

## Custom Actions

```python
@action(detail=True, methods=["post"])
def anular(self, request, pk=None):
    reserva = self.get_object()
    service = ReservaService()
    result = service.anular_reserva(reserva, user=request.user)
    if result.success:
        return Response(result.data)
    return Response({"detail": result.error}, status=result.status_code)
```

## `get_queryset()` Override

Use for: filtering, `select_related()`, `prefetch_related()`, user scoping, query param filtering:

```python
def get_queryset(self):
    return Movie.objects.filter(is_active=True).select_related("genre", "director_fk")
```

## Imports

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.permissions import IsAdminUser, HasRole
from apps.domains.movies.services import MovieService
```
