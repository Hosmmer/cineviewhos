# Backend Custom — Django 3.0.7 + DRF 3.15 + PostgreSQL 16

## Stack
- **Django 3.0.7** + **Django REST Framework 3.15**
- **PostgreSQL 16**
- **JWT Auth**: djoser 2.1.0 + djangorestframework-simplejwt 4.8.0
- **Login**: username/email via custom `UsernameOrEmailBackend`
- **AUTH_USER_MODEL**: `"common.User"` (AbstractUser personalizado)
- **Email**: console por defecto, SMTP Gmail configurable via env vars
- **Admin**: jazzmin (tema moderno para Django Admin)
- **drf-spectacular** para OpenAPI 3.0 docs
- **django-cors-headers** para CORS
- **WhiteNoise** para servir estáticos
- **Login**: username/email via custom `UsernameOrEmailBackend`
- **AUTH_USER_MODEL**: `"common.User"` (AbstractUser personalizado)
- **Email**: console por defecto, SMTP Gmail configurable via env vars
- **Admin**: jazzmin (tema moderno para Django Admin)
- **drf-spectacular** para OpenAPI 3.0 docs
- **django-cors-headers** para CORS
- **WhiteNoise** para servir estáticos

## Dev commands
```bash
# Vía docker compose
docker compose -f compose.custom.yaml exec backend python manage.py migrate
docker compose -f compose.custom.yaml exec backend python manage.py createsuperuser
docker compose -f compose.custom.yaml exec backend pytest
docker compose -f compose.custom.yaml run --rm backend ruff check apps/ config/ tests/

# Shell
docker compose -f compose.custom.yaml exec backend python manage.py shell
```

## Project structure
```
backend/
  config/
    settings.py       # Django settings (PostgreSQL, JWT, djoser, CORS, DRF)
    urls.py           # Root URL config → /admin/, /api/ -> apps.urls
  apps/
    urls.py           # App-level URL routing (health/, auth/)
    common/           # Custom User model, auth backend, admin
    core/             # Servicios, data classes, decorators
  tests/
  manage.py
  requirements.txt
```

## Auth Endpoints (via djoser)
- `POST /api/auth/users/` — Register
- `POST /api/auth/jwt/create/` — Login (username o email)
- `POST /api/auth/jwt/refresh/` — Refresh token
- `GET  /api/auth/users/me/` — Perfil (requiere token)
- `POST /api/auth/users/reset_password/` — Solicitar restablecimiento
- `POST /api/auth/users/reset_password_confirm/` — Confirmar restablecimiento

## Architecture
- **Service layer**: lógica de negocio en `services.py`, nunca en views o models
- **Models**: solo schema (fields, indexes, `__str__`). Sin lógica de negocio.
- **Serializers**: validación de input + forma del output
- **Views**: solo HTTP glue (auth → validar → service → response)
- **Type annotations**: obligatorias en todos los parámetros y returns.

## Known Issues
- **psycopg2 2.9**: requiere monkey-patch de `utc_tzinfo_factory` en `settings.py` (ya aplicado)
- **Django 3.0.7**: `JSONField` requiere import de `django.contrib.postgres.fields`
- **SimpleJWT**: `AUTH_HEADER_TYPES = ("Bearer",)`

## Testing
```bash
pytest                          # Todos los tests
pytest tests/ -v                # Con verbose
```

## Environment variables
- `DJANGO_SECRET_KEY` — Secret key
- `DJANGO_DEBUG` — True/False
- `POSTGRES_*` — Conexión a PostgreSQL
- `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` — SMTP Gmail
- `DJOSER_DOMAIN` / `DJOSER_SITE_NAME` — Dominio para emails

## Skills
- `django-dev` — Desarrollo Django (`.opencode/skills/django/SKILL.md`)
