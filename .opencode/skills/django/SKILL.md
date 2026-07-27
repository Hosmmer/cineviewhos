---
name: django
description: "Django + DRF patterns for CineViewHos. Service-layer architecture, model/serializer/view conventions, error handling, permissions, URL routing. Auto-loaded for backend/**/* files."
triggers:
  - models
  - serializers
  - views
  - services
  - urls
  - migrations
  - admin
  - permissions
  - auth
  - api
  - database
  - testing
  - architecture
  - structure
  - organization
  - folders
  - scaling
---

# Django CineViewHos

Django 3.0.7 + DRF project with strict **4-layer service-layer architecture**:

```
models.py → serializers.py → services.py → views.py
```

## Architecture Rules

1. **Models**: data shape + constraints. No business logic.
2. **Serializers**: validation + representation. No business logic.
3. **Services**: ALL business logic. Return `ServiceResult`. Never raise for business errors.
4. **Views**: validate serializer → call service → unwrap `ServiceResult` → return `Response`.

## BaseService + ServiceResult

```python
from apps.core.services.base import BaseService
from apps.core.data_classes import ServiceResult

class GenreService(BaseService):
    def create_genre(self, name: str, description: str = "") -> ServiceResult:
        if Genre.objects.filter(name__iexact=name).exists():
            return self.error("A genre with this name already exists.", 400)
        genre = Genre.objects.create(name=name, description=description)
        return self.success(data={"id": genre.id, "name": genre.name}, status_code=201)
```

### Service Rules
- Methods return `ServiceResult` (NEVER raise for business errors)
- Use `transaction.atomic()` for multi-step DB operations
- Use `select_for_update()` for race-condition prevention
- Status codes: 200 ok, 201 created, 204 deleted, 400 bad request, 403 forbidden, 404 not found, 409 conflict

## Views

```python
# Admin views (views.py) — permission_classes = [IsAuthenticated, IsAdminUser]
# Public views (views_public.py) — permission_classes = [IsAuthenticated]

def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = GenreService()
    result = service.create_genre(**serializer.validated_data)
    if result.success:
        return Response(result.data, status=result.status_code)
    return Response({"detail": result.error}, status=result.status_code)
```

### Key View Patterns
- Always return `{"detail": result.error}` for errors
- `get_serializer_class()` to switch by action (list vs detail)
- `get_queryset()` for `select_related`, `prefetch_related`, user scoping
- `get_permissions()` for dynamic permission selection
- `@action(detail=True, methods=["post"])` for custom routes
- Override `update()` to force `partial = True`

## Key Conventions

| Item | Convention |
|------|-----------|
| Model base | `TimeStampedMixin` (created_at, updated_at) |
| FK on_delete | PROTECT for references, CASCADE for owned children |
| Soft delete | `is_active = False`, never hard-delete entities with relationships |
| "Anular" | Never "cancelar" for reservations |
| Error messages | English |
| Field/spa names | Spanish where domain-appropriate (sala, funcion, reserva) |
| User FK | `settings.AUTH_USER_MODEL`, import via `get_user_model()` |
| Import order | stdlib → django/rest → `apps.*` |
| URL basename | `admin-{model}` for admin, `{model}` for public |
| Serializer fields | Explicit list, never `__all__`; id first, timestamps last |
| Serializer naming | `XxxSerializer` (detail), `XxxListSerializer` (list), `AdminXxxSerializer` (admin) |

## File Layout per App

```
apps/domains/{domain}/
├── models.py
├── serializers.py
├── services.py
├── views.py          # Admin endpoints (/api/admin/)
├── views_public.py   # Public endpoints (/api/)
├── urls.py            # Admin URLs (DefaultRouter)
├── urls_public.py     # Public URLs
└── admin.py           # Django admin (optional)
```

## Deep-Dive References

Read the relevant file BEFORE writing code:

| If writing... | Read... |
|--------------|---------|
| Models | `references/models-orm.md` — fields, Meta, soft delete, signals |
| Serializers | `references/drf-serializers.md` — naming, related data, validation |
| Views/ViewSets | `references/viewsets-views.md` — admin/public split, permissions, actions |
| Tests | `references/testing-django.md` — pytest fixtures, service/view test patterns |
| **Architecture** | `references/architecture.md` — project structure, scaling rules, service splitting |
