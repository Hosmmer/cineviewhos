# Movie Management (Initial Draft) — Implementation Plan

**Based on specification**: `thoughts/tickets/MOVIE-DRAFT-002/2026-06-13-movie-management_spec.md`

**Status**: Superseded by [MOVIE-MANAGEMENT-003](../../MOVIE-MANAGEMENT-003/2026-06-15-movie-management_plan.md).

## Overview

This plan covered the initial draft scope — create-only movie management with admin sidebar. It established the `apps/movies` Django app structure, Genre/Movie models, staff-only API, and React admin panel foundation that MOVIE-MANAGEMENT-003 later expanded into a full CRUD system.

## Phases

### Phase 1: Backend Models
- Create `apps/movies/` package (models.py, apps.py, admin.py)
- Genre model: `name` (unique, max 100) + TimeStampedMixin
- Movie model: title, description, release_year, genre (FK PROTECT), duration_minutes, poster (ImageField), price (DecimalField), is_active + TimeStampedMixin
- Settings: add `apps.movies` to INSTALLED_APPS, MEDIA_URL/MEDIA_ROOT
- Run migrations

### Phase 2: Backend API
- DRF serializers with validation (title, description, year, duration, price, poster file type/size)
- Staff-only ViewSets: MovieViewSet (POST create, GET list/retrieve), GenreViewSet (full CRUD)
- Permission: IsAuthenticated + IsAdminUser on write actions
- URL routing under `/api/`

### Phase 3: Frontend Admin Panel
- AdminLayout with sidebar (Películas, Géneros)
- Movie list page with empty state
- Movie create form with poster upload + preview (Formik + Yup)
- Genre list and create pages
- AdminProtectedRoute (auth + is_staff check)

## Implementation Deviations (from what MOVIE-MANAGEMENT-003 actually built)
- PUT was scoped here; MOVIE-MANAGEMENT-003 used PATCH
- Poster URLs planned as full URLs; MOVIE-MANAGEMENT-003 used RelativeImageField
- No public catalog; MOVIE-MANAGEMENT-003 added Home page grid
- No director/actors fields; MOVIE-MANAGEMENT-003 added them
- No editing or deletion; MOVIE-MANAGEMENT-003 added both

## References
- Specification: `thoughts/tickets/MOVIE-DRAFT-002/2026-06-13-movie-management_spec.md`
- Superseded by: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management_plan.md`


