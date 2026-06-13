---
name: django-dev
description: "Use when building or modifying the Django backend. Covers Django 3.0.7 + DRF 3.15 patterns: service-layer architecture, djoser+JWT auth, custom User model, psycopg2 compatibility, serializer validation, DRF viewsets/APIView, PostgreSQL models."
metadata:
  version: "1.1.0"
  domain: backend
  stack: Django 3.0.7 + DRF 3.15 + PostgreSQL 16 + djoser + simplejwt
  triggers: Django, DRF, serializer, viewset, service, model, migration, endpoint, permissions, djoser, JWT, auth
  role: specialist
  scope: implementation
  output-format: code
---

# Django Custom Backend Expert

Senior Django specialist — Django 3.0.7 + DRF 3.15 + djoser 2.1.0.

## When to Use This Skill

- Adding or modifying API endpoints
- Designing or altering PostgreSQL models
- Writing service layer functions
- Building DRF serializers with validation
- Configuring djoser auth (register, login, password reset)
- Writing tests with pytest-django

## Critical Project-Specific Details

- **Django 3.0.7** (not 5.0) — `JSONField` requiere `from django.contrib.postgres.fields import JSONField`
- **DRF 3.15** (not 3.17) — `@extend_schema` via drf-spectacular
- **AUTH_USER_MODEL = "common.User"** — custom `User(AbstractUser)` in `apps/common/models.py`
- **djoser 2.1.0** for auth — URLs at `/api/auth/`. Settings via `DJOSER` dict in `settings.py`
- **simplejwt 4.8.0** — JWT tokens. `SIMPLE_JWT` config with 15min access, 1d refresh
- **psycopg2 2.9** — requires monkey-patch of `utc_tzinfo_factory` in settings.py
- **Login**: `UsernameOrEmailBackend` accepts username OR email
- **Email**: console backend by default; SMTP Gmail via env vars
- **SITE_ID = 1** with `django.contrib.sites` for djoser email links

## Core Workflow

1. **Identify the layer** — model, serializer, service, or view? Each has one job.
2. **Design the model** — `created_at`/`updated_at` via `TimeStampedMixin`, no business logic.
3. **Run migrations** — `python manage.py makemigrations && python manage.py migrate`.
4. **Write the serializer** — validate all input here. Never use `request.data` raw.
5. **Implement the service** — all business logic returns `(result, error)` tuples.
6. **Write the view** — thin: verify access → validate input → call service → return response.
7. **Wire URL** — in `apps/urls.py` with explicit `path()`.
8. **Write tests** — views, services, serializers. `pytest` must pass.

## Auth Pattern (djoser)

```python
# settings.py
DJOSER = {
    "LOGIN_FIELD": "username",
    "USER_CREATE_PASSWORD_RETYPE": True,
    "SEND_ACTIVATION_EMAIL": False,
    "SEND_CONFIRMATION_EMAIL": True,
    "PASSWORD_RESET_CONFIRM_URL": "password/reset/confirm/{uid}/{token}",
    "DOMAIN": "localhost:3000",
    "SITE_NAME": "CineViewHos",
    "SERIALIZERS": {},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}
```

## Psycopg2 Monkey-Patch (required)

```python
# config/settings.py
import django.db.backends.postgresql.utils as pg_utils
_original_utc = pg_utils.utc_tzinfo_factory
def _patched_utc_tzinfo_factory(conn):
    try:
        return _original_utc(conn)
    except AssertionError:
        pass
pg_utils.utc_tzinfo_factory = _patched_utc_tzinfo_factory
```

## Constraints

### MUST DO
- **Service layer for all business logic** — views only do HTTP glue
- **Type annotations on every function**
- **Max 50 lines per function/method**
- **`select_related` / `prefetch_related`** when traversing FK/M2M
- **Serializer validation** — always call `serializer.is_valid()` and use `validated_data`
- **`@extend_schema`** on every endpoint (drf-spectacular)
- **Tests** — views, services, serializers

### MUST NOT DO
- Business logic in models or views
- Raw SQL with user-supplied strings — use the ORM
- `request.data` without serializer validation
- Storing secrets in `settings.py` — use `os.getenv()`
- `DEBUG=True` in staging/production

## Django 3.0.7 Notes

- **`JSONField`** is in `django.contrib.postgres.fields`, NOT `django.db.models`
- **No async views** — Django 3.0 doesn't support them
- **`TextChoices`** / `IntegerChoices` — use `from django.db.models import TextChoices`
- **`UniqueConstraint`** — available in `Meta.constraints`

## Output Template

When implementing a new feature, deliver in this order:
1. **Model** — fields, indexes, `__str__`, `Meta`
2. **Migration** — confirm it was created
3. **Serializer(s)** — input validator + response serializer
4. **Service** — business logic
5. **View** — thin, auth check, serializer, service call, `@extend_schema`
6. **URL wiring** — in `apps/urls.py`
7. **Tests** — arrange / act / assert for success and failure paths
