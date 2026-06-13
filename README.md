# CineViewHos 🎬

Plataforma cinematográfica full-stack con autenticación JWT, tema oscuro y experiencia tipo cine.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Django 3.0.7 + DRF 3.15 + PostgreSQL 16 |
| **Auth** | djoser + djangorestframework-simplejwt |
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **UI** | Tailwind CSS — dark theme (cinematográfico) |
| **Contenedores** | Docker + docker-compose |

## Funcionalidades

- **Autenticación** — registro, login (username o email), JWT con refresh automático
- **Password reset** — restablecimiento vía email con enlace seguro (UID + token)
- **UI cinematográfica** — tema oscuro, fondos gradient, acentos rojos, pantalla completa en auth
- **Admin** — Django jazzmin para gestión de usuarios

## Inicio rápido

```bash
# Backend
docker compose -f compose.custom.yaml up -d
docker compose -f compose.custom.yaml exec backend python manage.py migrate
docker compose -f compose.custom.yaml exec backend python manage.py createsuperuser

# Frontend (local)
cd frontend
npm install
npm run dev
```

## Comandos útiles

```bash
# Backend tests
docker compose -f compose.custom.yaml exec backend pytest

# Frontend build
cd frontend && npm run build

# Linting
docker compose -f compose.custom.yaml run --rm backend ruff check apps/ config/ tests/
```

## Endpoints de auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/users/` | Registro |
| POST | `/api/auth/jwt/create/` | Login |
| POST | `/api/auth/jwt/refresh/` | Refresh token |
| GET | `/api/auth/users/me/` | Perfil |
| POST | `/api/auth/users/reset_password/` | Solicitar reset |
| POST | `/api/auth/users/reset_password_confirm/` | Confirmar reset |

## Skills de desarrollo

Las skills de `.opencode/` guían la implementación:

- **Backend**: `django-dev` — Django 3.0.7, DRF 3.15, djoser
- **Frontend**: `react-dev` — React 18, Tailwind CSS, AuthContext

## Licencia

MIT
