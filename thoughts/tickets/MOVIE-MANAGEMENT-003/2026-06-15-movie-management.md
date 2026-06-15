# Movie Admin — Feature Summary

## Overview

Implement the movies domain for CineViewHos: Genre and Movie models, staff-only CRUD API endpoints, public read-only catalog, React admin panel with dark cinematic styling, and a movie grid on the Home page. Only `is_staff=True` users can manage content; regular authenticated users are read-only.

## Current State (Completed)

### Backend (Django 3.0.7 + DRF 3.15)
- [x] `Genre(TimeStampedMixin)` model — `name` (unique, max 100), timestamps
- [x] `Movie(TimeStampedMixin)` model — title, description, director, actors, duration_minutes, release_year, poster (ImageField), price (DecimalField), genre (FK PROTECT), is_active (soft-delete)
- [x] Admin API at `/api/admin/` — `GenreAdminViewSet` and `MovieAdminViewSet` with full CRUD, `IsAdminUser` permission
- [x] Public API at `/api/movies/` and `/api/genres/` — read-only, filtering by genre, search by title/director, ordering
- [x] Movie updates via PATCH (partial) to preserve poster when not re-uploaded
- [x] Soft-delete via `is_active=False` on movie DELETE
- [x] Genre deletion protected (PROTECT FK — can't delete genre with movies)
- [x] `RelativeImageField` serializer — returns relative URLs to avoid Docker hostname leaks
- [x] Custom djoser `UserSerializer` including `is_staff` field
- [x] Django Admin registration for Genre and Movie (Jazzmin)
- [x] MEDIA_URL/MEDIA_ROOT configured, development media serving via `static()`
- [x] All backend checks passing (0 issues)

### Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
- [x] Admin panel at `/admin` — fully protected by `AdminProtectedRoute` (auth + is_staff check)
- [x] `AdminLayout` with sidebar navigation (Movies, Genres, Back to Home)
- [x] Genre CRUD pages: list table with Edit/Delete, create/edit form (Formik + Yup)
- [x] Movie CRUD pages: paginated table with search, poster thumbnail, active/inactive badges, create/edit form with poster upload and preview
- [x] Delete confirmation modals for movies and genres
- [x] Home page (`/`) — responsive movie grid with `MovieCard` (poster, title, director, year, genre, duration, price)
- [x] Loading skeletons, empty state, error state with retry on Home page
- [x] Navbar "Admin" link visible only for staff users
- [x] Navbar hidden on `/admin/*` routes (replaced by admin sidebar)
- [x] 403 page for non-staff users accessing `/admin`
- [x] `/media` Vite proxy for poster image serving
- [x] Axios FormData Content-Type auto-detection for file uploads
- [x] TypeScript compiles cleanly (0 errors)

## Validation Rules (Movie)
| Field | Rule |
|-------|------|
| title | 1-255 characters, required |
| description | Minimum 10 characters, required |
| director | 1-255 characters, required |
| actors | Non-empty, comma-separated, required |
| duration_minutes | 1-600, required |
| release_year | 1900 to current_year+5, required |
| price | >= 0.00, required |
| poster | JPEG/PNG/WebP, max 5MB, required for create, optional for update |
| genre | Must reference existing Genre ID, required |

## Implementation Deviations from Plan
- **PATCH vs PUT**: Movie updates use PATCH to allow preserving poster when not re-uploaded
- **RelativeImageField**: Custom serializer field returns relative poster URLs to avoid Docker internal hostname in URLs
- **Vite /media proxy**: Added to forward media requests to Django backend
- **FormData Content-Type**: Axios interceptor auto-removes `application/json` header when data is FormData
- **Custom djoser serializer**: Extended to include `is_staff` in user response
- **Tailwind classes**: `h-18` changed to `h-[72px]` (not a valid Tailwind utility)

## What's NOT Done (Out of Scope)
- Movie detail page (clicking a card does not navigate)
- Public catalog page (movies shown only on Home)
- Bulk operations (batch delete, batch activate/deactivate)
- Advanced actor management (free-text comma-separated only)
- Movie ratings or reviews
- Trailers or video uploads
- Full-text search with PostgreSQL (uses Django's basic SearchFilter)
- Admin sidebar mobile toggle
- Production media file serving (S3/nginx)

## References
- Spec: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management_spec.md`
- Plan: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management_plan.md`



