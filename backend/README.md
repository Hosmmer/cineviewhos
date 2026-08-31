# CineViewHos Backend

API del sistema de punto de venta (POS) y gestión de cine **CineViewHos**.

## Stack

- **Django 3.0.7** + **Django REST Framework**
- **PostgreSQL 16** (`psycopg2-binary`)
- **Redis 7** + **Celery 5** (tareas asíncronas)
- **Djoser + SimpleJWT** (autenticación)
- **drf-spectacular** (esquema OpenAPI)

## Estructura

El backend sigue una arquitectura orientada a servicios por entidad:

```
backend/
  apps/
    accounts/          # usuarios, auth y permisos
    core/              # middleware y utilidades compartidas
    data/              # módulos configurables del sistema
    domains/
      movies/          # películas, géneros, actores, directores
      modules/         # módulos habilitables
      reservations/    # reservas, bandas horarias, asientos nombrados
    urls.py            # enrutado raíz bajo /api/
  config/              # settings (base / local / production)
```

## Requisitos

- Docker + Docker Compose
- Make (opcional; los targets orquestan los contenedores)

## Configuración

1. Copia las variables de entorno:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Levanta los servicios (PostgreSQL, Redis, Celery, backend, frontend):

   ```bash
   make up
   ```

   - Frontend: `http://localhost:3000`
   - API: `http://localhost:8000`
   - XenodocIA: `http://localhost:5175`

## Migraciones

```bash
docker compose exec backend python manage.py migrate
```

## Tests

```bash
docker compose exec backend pytest
```

O en local, sin Docker:

```bash
cd backend && make test
```

## API

Todos los endpoints viven bajo `/api/`:

- `GET /api/health/` — health check
- `/api/auth/` — autenticación y registro (Djoser + JWT)
- `/api/admin/` — endpoints administrativos (películas, módulos, reservas)
- raíz `/api/` — endpoints públicos (cartelera, reservas)

Para interactuar con los endpoints autenticados, crea un usuario en `/api/auth/users/` y obtén un token en `/api/auth/jwt/create/`.

## Convención de commits

Conventional Commits con el ID de ticket:

```
feat(scope): descripción [XE-NNN]
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
