# CineViewHos 🎬

Plataforma cinematográfica full-stack con autenticación JWT, panel admin, catálogo de películas y tema oscuro cinematográfico.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Django 3.0.7 + DRF 3.15 + PostgreSQL 16 |
| **Auth** | djoser + djangorestframework-simplejwt |
| **Frontend** | React 18 + TypeScript + Vite 5 + TanStack Query + Formik |
| **UI** | Tailwind CSS — dark theme (cinematográfico) |
| **Contenedores** | Docker + docker-compose |

## Funcionalidades

### Autenticación
- Registro, login (username o email), JWT con refresh automático
- Password reset vía email con enlace seguro (UID + token)
- Roles: admin (`is_staff=True`) y usuario regular
- UI cinematográfica — full-screen en auth, navbar dinámica

### Gestión de Películas
- **Panel admin** (`/admin`) — sidebar con navegación a Movies y Géneros
- **CRUD completo** — crear, editar (PATCH parcial), soft-delete de películas
- **Géneros** — modelo normalizado con protección de integridad (PROTECT FK)
- **Posters** — upload con preview, validación de tipo/tamaño, URLs relativas
- **Catálogo público** — grilla responsive en Home con cards, skeletons, empty/error states
- **Permisos** — solo staff puede gestionar; usuarios regulares solo ven el catálogo

## Inicio rápido

```bash
# Todo el stack
docker compose -f compose.custom.yaml up -d

# Crear admin
docker compose -f compose.custom.yaml exec backend python manage.py createsuperuser
```

## Endpoints

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/users/` | Registro |
| POST | `/api/auth/jwt/create/` | Login |
| POST | `/api/auth/jwt/refresh/` | Refresh token |
| GET | `/api/auth/users/me/` | Perfil (incluye `is_staff`) |
| POST | `/api/auth/users/reset_password/` | Solicitar reset |
| POST | `/api/auth/users/reset_password_confirm/` | Confirmar reset |

### Películas (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/movies/` | Listar películas activas (pag, filtro, búsqueda, orden) |
| GET | `/api/movies/{id}/` | Detalle de película |
| GET | `/api/genres/` | Listar géneros |

### Admin (staff only)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/movies/` | Listar todas (activas + inactivas) |
| POST | `/api/admin/movies/` | Crear película |
| PATCH | `/api/admin/movies/{id}/` | Actualizar (parcial, preserva poster) |
| DELETE | `/api/admin/movies/{id}/` | Soft-delete (`is_active=False`) |
| GET/POST | `/api/admin/genres/` | Listar / Crear género |
| PUT | `/api/admin/genres/{id}/` | Actualizar género |
| DELETE | `/api/admin/genres/{id}/` | Eliminar (bloqueado si tiene películas) |

## Rutas Frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Auth | Home — catálogo de películas activas |
| `/login` | Público | Login |
| `/register` | Público | Registro |
| `/password/reset` | Público | Reset password |
| `/admin` | Staff | Redirect a `/admin/movies` |
| `/admin/movies` | Staff | Tabla de películas con acciones |
| `/admin/movies/create` | Staff | Formulario crear película |
| `/admin/movies/:id/edit` | Staff | Formulario editar película |
| `/admin/genres` | Staff | Tabla de géneros |
| `/admin/genres/create` | Staff | Formulario crear género |
| `/admin/genres/:id/edit` | Staff | Formulario editar género |

## Estructura del proyecto

```
backend/
├── apps/
│   ├── common/         ← User model, auth, permisos, djoser serializer
│   ├── core/           ← BaseService, ServiceResult, decorators
│   ├── utils/          ← TimeStampedMixin, slugify, encryption, choices
│   └── movies/         ← Genre/Movie models, serializers, views, services
├── config/             ← settings, urls, celery
├── tests/              ← pytest test suite
└── templates/          ← email templates

frontend/
├── src/
│   ├── api/            ← Axios instance + JWT interceptor
│   ├── components/     ← Navbar, AdminLayout, AdminSidebar, MovieCard, ProtectedRoute
│   ├── contexts/       ← AuthContext
│   ├── pages/          ← HomePage, auth pages, admin/ (CRUD pages)
│   ├── services/       ← authService, movieService
│   └── types/          ← TypeScript interfaces

thoughts/
├── wiki/               ← Documentación de dominio permanente
│   └── contexts/
│       ├── auth/       ← Glosario, CHANGELOG, ADRs, specs
│       └── movies/     ← Glosario, CHANGELOG, ADRs, specs
└── tickets/            ← Tickets de features
    ├── LOGIN-001/      ← Autenticación (completado)
    ├── MOVIE-DRAFT-002/← Spec inicial de películas (superseded)
    └── MOVIE-MANAGEMENT-003/ ← Gestión de películas (completado)
```

## Comandos útiles

```bash
# Backend
docker compose -f compose.custom.yaml exec backend python manage.py check
docker compose -f compose.custom.yaml exec backend pytest tests/ -v

# Frontend
cd frontend && npx tsc --noEmit
cd frontend && npm run build

# CI (1 workflow, 3 jobs: lint + frontend + backend)
# Se ejecuta solo en pull_request a main
```
