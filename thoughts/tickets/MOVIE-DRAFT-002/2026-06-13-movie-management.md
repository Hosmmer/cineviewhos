# Movie Management (Initial Draft) — Feature Summary

## Overview

Initial draft specification for a movie management system for CineViewHos. This ticket scoped movie and genre models, staff-only admin panel with sidebar navigation, movie creation form with poster upload, and basic listing views. **Superseded by [MOVIE-MANAGEMENT-003](../MOVIE-MANAGEMENT-003/2026-06-15-movie-management.md)** which expanded scope to include editing, soft-delete, director/actors fields, Home page catalog, public API, and full CRUD for both movies and genres.

## What This Ticket Covers (Draft Scope)

### Backend
- Genre model: `id`, `name`, `created_at`, `updated_at`
- Movie model: `id`, `title`, `description`, `release_year`, `genre` (FK), `duration_minutes`, `poster` (ImageField), `price` (DecimalField), `is_active`, `created_at`, `updated_at`
- Staff-only endpoints: POST create movie, GET list/retrieve movies, full CRUD genres
- Validations: title 1-255, description min 10, release_year 1900-current+5, duration 1-600, price >= 0, poster JPEG/PNG/WebP max 5MB
- Permission: `is_staff=True` for write operations, JWT auth for all

### Frontend
- Admin panel at `/admin` with sidebar navigation (Películas, Géneros)
- Movie list page (`/admin/movies`) with empty state CTA
- Movie create form (`/admin/movies/create`) with poster upload and preview
- Genre list and create pages (`/admin/genres`)
- Non-staff users redirected from `/admin/*`

## What Changed in MOVIE-MANAGEMENT-003

| Aspect | MOVIE-DRAFT-002 (Draft) | MOVIE-MANAGEMENT-003 (Implemented) |
|--------|-----------------|------------------------|
| Director | Not included | CharField, required |
| Actors | Not included | TextField, required |
| Movie editing | Out of scope | PATCH update with poster preservation |
| Movie deletion | Out of scope | Soft-delete via `is_active=False` |
| Public catalog | Out of scope | Home page movie grid |
| Public API | Not scoped | Read-only `/api/movies/` + `/api/genres/` |
| Search/filtering | Out of scope | SearchFilter + DjangoFilterBackend |
| Ordering | Out of scope | OrderingFilter by title, year, created_at |
| Poster URLs | Full URL | RelativeImageField (relative) |
| is_staff exposure | Not scoped | Custom djoser UserSerializer |

## References
- Spec: `thoughts/tickets/MOVIE-DRAFT-002/2026-06-13-movie-management_spec.md`
- Plan: `thoughts/tickets/MOVIE-DRAFT-002/2026-06-13-movie-management_plan.md`
- Superseded by: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management.md`


