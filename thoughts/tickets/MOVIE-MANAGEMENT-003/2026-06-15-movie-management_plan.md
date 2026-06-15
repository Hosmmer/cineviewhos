# Movie Admin — Implementation Plan

**Based on specification**: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management_spec.md`

## Overview

This plan delivers the full movies domain for CineViewHos: Django models for Genre and Movie, staff-only CRUD API endpoints, public read-only catalog API, a React admin panel with dark cinematic styling, and a movie grid on the Home page.

Implementation follows existing project conventions: `TimeStampedMixin` for timestamps, `BaseService` pattern for business logic, DRF `ModelViewSet` for API endpoints, React Query + Formik + Yup for frontend, and Tailwind CSS dark theme.

## Specification Alignment

This plan implements all acceptance criteria from the spec:
- 2 new models (Genre, Movie) with all specified fields and constraints
- Staff-only admin CRUD endpoints (`/api/admin/movies/`, `/api/admin/genres/`)
- Public read-only endpoints (`/api/movies/`, `/api/genres/`)
- React admin panel with sidebar, movie/genre list tables, create/edit forms
- Home page movie grid for authenticated users
- Navbar "Admin" link for staff users
- All validation rules, soft-delete, genre protection

## Files to Create

1. `backend/apps/movies/__init__.py` — package init
2. `backend/apps/movies/apps.py` — AppConfig
3. `backend/apps/movies/models.py` — Genre and Movie models
4. `backend/apps/movies/admin.py` — Django Admin registration
5. `backend/apps/movies/serializers.py` — DRF serializers
6. `backend/apps/movies/views.py` — Admin and public ViewSets
7. `backend/apps/movies/urls.py` — API URL routing
8. `backend/apps/movies/services.py` — Service layer for movie/genre CRUD
9. `backend/tests/apps/test_movies_admin.py` — Admin endpoint tests
10. `backend/tests/apps/test_movies_public.py` — Public endpoint tests
11. `frontend/src/types/movies.ts` — TypeScript types
12. `frontend/src/services/movieService.ts` — API service functions
13. `frontend/src/contexts/AdminContext.tsx` — Admin auth guard context
14. `frontend/src/components/AdminProtectedRoute.tsx` — Staff-only route guard
15. `frontend/src/components/AdminLayout.tsx` — Admin shell with sidebar
16. `frontend/src/components/AdminSidebar.tsx` — Sidebar navigation
17. `frontend/src/components/MovieCard.tsx` — Home page movie card
18. `frontend/src/pages/admin/AdminDashboard.tsx` — Admin redirect/overview
19. `frontend/src/pages/admin/AdminMovieList.tsx` — Movie table with actions
20. `frontend/src/pages/admin/AdminMovieForm.tsx` — Movie create/edit form
21. `frontend/src/pages/admin/AdminGenreList.tsx` — Genre table with actions
22. `frontend/src/pages/admin/AdminGenreForm.tsx` — Genre create/edit form
23. `frontend/src/pages/MovieHomePage.tsx` — Home page with movie grid

## Files to Modify

1. `backend/config/settings.py` — add `apps.movies` to LOCAL_APPS, add MEDIA_URL/MEDIA_ROOT
2. `backend/apps/urls.py` — include movies URLs
3. `backend/config/urls.py` — add media serving for development
4. `frontend/src/App.tsx` — add admin + movie routes
5. `frontend/src/components/Navbar.tsx` — add "Admin" link for staff
6. `frontend/src/pages/HomePage.tsx` — replace placeholder with movie grid

## Dependencies

No new dependencies. All required packages are already installed:
- `Pillow==9.0.0` (for ImageField/poster upload)
- `djangorestframework`, `django-filters` (for ViewSets and filtering)
- `@tanstack/react-query`, `formik`, `yup` (for frontend data fetching and forms)

## Implementation Approach

Six phases, each independently verifiable. Phases 1-3 build the backend incrementally. Phases 4-6 build the frontend on top of the working API. Each phase includes backend tests mapped to spec acceptance criteria.

---

## Phase 1: Backend Models + Settings

### Overview
Create the `apps/movies` Django app with Genre and Movie ORM models, register them in Django Admin for easy seeding, configure media file handling, and apply migrations. This phase establishes the database foundation for everything else.

**Maps to spec**: All Backend — Models acceptance criteria.

### Files to Create

**File**: `backend/apps/movies/__init__.py`
**Purpose**: Package init (empty file).

**File**: `backend/apps/movies/apps.py`
**Purpose**: Django AppConfig for `apps.movies`.

**File**: `backend/apps/movies/models.py`
**Purpose**: Genre and Movie Django models.
**Key components**: `Genre(TimeStampedMixin)` with `name(CharField, unique, max_length=100)`, `Movie(TimeStampedMixin)` with `title`, `description`, `director`, `actors`, `duration_minutes`, `release_year`, `poster(ImageField)`, `price(DecimalField)`, `genre(ForeignKey, PROTECT)`, `is_active(BooleanField)`, `__str__` methods, `Meta` with `ordering`.

**File**: `backend/apps/movies/admin.py`
**Purpose**: Register Genre and Movie in Django Jazzmin admin for easy seeding.
**Key components**: `GenreAdmin`, `MovieAdmin` with `list_display`, `search_fields`, `list_filter`.

### Files to Modify

**File**: `backend/config/settings.py`
**Changes**: Add `"apps.movies"` to `LOCAL_APPS` list. Add `MEDIA_URL = "/media/"` and `MEDIA_ROOT = BASE_DIR / "media"` after STATIC_ROOT.
**Reason**: Register the new app; enable poster image uploads.

**File**: `backend/config/urls.py`
**Changes**: Add `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` to `urlpatterns` (only when DEBUG is True).
**Reason**: Serve uploaded poster images during development.

### Implementation Order

1. Create `backend/apps/movies/__init__.py` (empty file)
2. Create `backend/apps/movies/apps.py` with `MoviesConfig(AppConfig): name = "apps.movies"`
3. Create `backend/apps/movies/models.py` with `Genre(TimeStampedMixin)` and `Movie(TimeStampedMixin)` models
4. Create `backend/apps/movies/admin.py` with `GenreAdmin` and `MovieAdmin`
5. Edit `backend/config/settings.py`: add `"apps.movies"` to LOCAL_APPS, add MEDIA_URL and MEDIA_ROOT
6. Edit `backend/config/urls.py`: add development media serving
7. Run `python manage.py makemigrations movies` then `python manage.py migrate`

### Skills Required

Skills: (none)

### Success Criteria

**Automated Verification:**
- [ ] Migrations apply cleanly: `docker compose -f compose.custom.yaml run --rm backend python manage.py migrate`
- [ ] Django check passes: `docker compose -f compose.custom.yaml run --rm backend python manage.py check`

**Manual Verification:**
- [ ] Django Admin at `/admin/` shows Movies and Genres sections
- [ ] Can create a Genre via Django Admin
- [ ] Can create a Movie via Django Admin with poster upload

### Assumptions
- Media directory `backend/media/` is created automatically by Django on first upload
- `apps.movies` follows the same app structure as `apps.common` and `apps.core`
- Genre `on_delete=PROTECT` on Movie FK is the correct approach per spec

---

## Phase 2: Backend Serializers, ViewSets, Services + Admin API

### Overview
Build the DRF serializers for Genre and Movie, the service layer for business logic, and the admin ViewSets with CRUD operations protected by `IsAdminUser`. Wire up URL routing under `/api/admin/`.

**Maps to spec**: All Backend — Admin Endpoints (Staff) acceptance criteria.

### Files to Create

**File**: `backend/apps/movies/serializers.py`
**Purpose**: DRF serializers with validation.
**Key components**: `GenreSerializer(ModelSerializer)` with unique name validation, `MovieSerializer(ModelSerializer)` with all field validations (title 1-255, description min 10, duration 1-600, release_year 1900-current+5, price >=0, poster extension and size), nested genre read, genre_id write. `MovieListSerializer` for lighter list payloads.

**File**: `backend/apps/movies/services.py`
**Purpose**: Business logic layer following `BaseService` pattern.
**Key components**: `MovieService(BaseService)` — `create_movie`, `update_movie`, `soft_delete_movie` methods. `GenreService(BaseService)` — `create_genre`, `update_genre`, `delete_genre` methods. Each returns `ServiceResult`.

**File**: `backend/apps/movies/views.py`
**Purpose**: DRF ViewSets for admin CRUD.
**Key components**: `GenreAdminViewSet(ModelViewSet)` — full CRUD, `permission_classes=[IsAuthenticated, IsAdminUser]`. `MovieAdminViewSet(ModelViewSet)` — full CRUD with `destroy` overridden for soft-delete (sets `is_active=False`), same permissions. `MovieAdminViewSet.get_queryset()` returns all movies (including inactive).

**File**: `backend/apps/movies/urls.py`
**Purpose**: URL routing for admin endpoints.
**Key components**: Router registering admin viewsets under `admin/` prefix.

### Files to Modify

**File**: `backend/apps/urls.py`
**Changes**: Add `path("admin/", include("apps.movies.urls_admin"))` to urlpatterns.
**Reason**: Expose admin API routes under `/api/admin/`.

### Implementation Order

1. Create `backend/apps/movies/serializers.py` with GenreSerializer, MovieSerializer, MovieListSerializer
2. Create `backend/apps/movies/services.py` with MovieService and GenreService
3. Create `backend/apps/movies/views.py` with GenreAdminViewSet and MovieAdminViewSet
4. Create `backend/apps/movies/urls.py` with admin router
5. Edit `backend/apps/urls.py` to include movies admin URLs

### Skills Required

Skills: (none)

### Success Criteria

**Automated Verification:**
- [ ] Backend starts without import errors: `docker compose -f compose.custom.yaml up backend`

**Manual Verification:**
- [ ] Staff user can POST to `/api/admin/genres/` and receive 201
- [ ] Staff user can POST to `/api/admin/movies/` with valid data and receive 201
- [ ] Staff user can PUT `/api/admin/movies/{id}/` and receive 200
- [ ] Staff user can DELETE `/api/admin/movies/{id}/` and receive 204 (movie becomes inactive)
- [ ] POST with invalid data returns 400 with field errors
- [ ] Non-staff user receives 403 on admin endpoints
- [ ] Unauthenticated user receives 401 on admin endpoints

### Assumptions
- User model's `is_staff` field is populated correctly (requires `is_staff=True` for admin access)
- `IsAuthenticated` is the DRF default; admin viewsets explicitly require both `IsAuthenticated` AND `IsAdminUser`
- Service layer uses the existing `BaseService` / `ServiceResult` from `apps.core.services.base` and `apps.core.data_classes`

---

## Phase 3: Public API

### Overview
Build public read-only ViewSets for movies (active only) and genres with filtering, searching, and ordering. Wire up URL routing under `/api/`.

**Maps to spec**: All Backend — Public Endpoints (User) acceptance criteria.

### Files to Create

**File**: `backend/apps/movies/views_public.py`
**Purpose**: Public read-only ViewSets.
**Key components**: `MoviePublicViewSet(ReadOnlyModelViewSet)` — `queryset=Movie.objects.filter(is_active=True)`, `permission_classes=[IsAuthenticated]`, `filter_backends` with `DjangoFilterBackend` (filter by `genre`), `SearchFilter` (search `title`, `director`), `OrderingFilter` (order by `title`, `release_year`, `created_at`). `GenrePublicViewSet(ReadOnlyModelViewSet)` — all genres, `permission_classes=[IsAuthenticated]`.

**File**: `backend/apps/movies/urls_public.py`
**Purpose**: URL routing for public endpoints.
**Key components**: Router registering public viewsets.

### Files to Modify

**File**: `backend/apps/urls.py`
**Changes**: Add `path("", include("apps.movies.urls_public"))` to urlpatterns.
**Reason**: Expose public API routes under `/api/movies/` and `/api/genres/`.

### Implementation Order

1. Create `backend/apps/movies/views_public.py` with MoviePublicViewSet and GenrePublicViewSet
2. Create `backend/apps/movies/urls_public.py` with public router
3. Edit `backend/apps/urls.py` to include movies public URLs

### Skills Required

Skills: (none)

### Success Criteria

**Manual Verification:**
- [ ] Authenticated user can GET `/api/movies/` and receive paginated active movies
- [ ] `GET /api/movies/?genre={id}` filters by genre
- [ ] `GET /api/movies/?search=batman` searches by title/director
- [ ] `GET /api/movies/?ordering=release_year` orders results
- [ ] `GET /api/genres/` returns all genres
- [ ] Unauthenticated user receives 401 on movie endpoints

### Assumptions
- Public viewsets use `ReadOnlyModelViewSet` from DRF which only exposes `list` and `retrieve`
- Pagination, filtering, search, and ordering defaults from DRF settings are sufficient
- Movie public detail (`retrieve`) includes nested genre serializer

---

## Phase 4: Frontend Foundation (Types, Services, Admin Layout)

### Overview
Create TypeScript types for Movie and Genre, API service functions, an admin route guard (checking `is_staff`), the admin shell layout with sidebar navigation, and wire up React Router for admin routes.

**Maps to spec**: Frontend — Navigation acceptance criteria, admin route structure.

### Files to Create

**File**: `frontend/src/types/movies.ts`
**Purpose**: TypeScript interfaces for Movie and Genre.
**Key components**: `Genre { id, name, created_at, updated_at }`, `Movie { id, title, description, director, actors, duration_minutes, release_year, poster, price, genre, genre_name, is_active, created_at, updated_at }`, `MovieFormData`, `GenreFormData`, `PaginatedResponse<T>`.

**File**: `frontend/src/services/movieService.ts`
**Purpose**: API service functions for movies and genres.
**Key components**: `fetchMovies(params)`, `fetchMovie(id)`, `createMovie(formData)`, `updateMovie(id, formData)`, `deleteMovie(id)`, `fetchAdminMovies(params)`, `fetchGenres()`, `createGenre(name)`, `updateGenre(id, name)`, `deleteGenre(id)`. Uses `djangoApi` from `@/api/django`. Movie create/edit uses `multipart/form-data` for poster upload.

**File**: `frontend/src/components/AdminProtectedRoute.tsx`
**Purpose**: Route guard checking both authentication and `is_staff`.
**Key components**: Checks `useAuth().user?.is_staff`. If not staff, renders 403 page. If not authenticated, redirects to `/login`.

**File**: `frontend/src/components/AdminLayout.tsx`
**Purpose**: Admin shell wrapping all `/admin/*` routes.
**Key components**: Flex layout with `AdminSidebar` on the left and `<Outlet />` content area on the right. Dark theme (`bg-gray-900`).

**File**: `frontend/src/components/AdminSidebar.tsx`
**Purpose**: Sidebar navigation for admin panel.
**Key components**: Links to `/admin/movies`, `/admin/genres`, "Back to Home" (`/`). Highlights current route using `useLocation()`. Brand logo at top. Styled with dark theme (`bg-gray-950`, `text-gray-300`, active link with `text-red-500` and left border).

**File**: `frontend/src/pages/admin/AdminDashboard.tsx`
**Purpose**: Simple redirect from `/admin` to `/admin/movies`.
**Key components**: `useEffect` + `useNavigate` redirect.

### Files to Modify

**File**: `frontend/src/types/auth.ts`
**Changes**: Add `is_staff?: boolean` to `User` interface.
**Reason**: Need `is_staff` for admin route guard and navbar "Admin" link.

**File**: `frontend/src/App.tsx`
**Changes**: Add lazy imports for admin pages, add admin route group wrapped in `AdminProtectedRoute` + `AdminLayout`, extract admin path check for navbar hiding.
**Reason**: Wire up admin routes with staff-only protection.

**File**: `frontend/src/components/Navbar.tsx`
**Changes**: Add "Admin" link button between username and logout for staff users (`user?.is_staff`). Use `Link to="/admin"`.
**Reason**: Staff users need navigation to the admin panel.

### Implementation Order

1. Create `frontend/src/types/movies.ts` with all interfaces
2. Edit `frontend/src/types/auth.ts` to add `is_staff` to User
3. Create `frontend/src/services/movieService.ts` with all API functions
4. Create `frontend/src/components/AdminProtectedRoute.tsx`
5. Create `frontend/src/components/AdminSidebar.tsx`
6. Create `frontend/src/components/AdminLayout.tsx`
7. Create `frontend/src/pages/admin/AdminDashboard.tsx`
8. Edit `frontend/src/App.tsx` to add admin routes
9. Edit `frontend/src/components/Navbar.tsx` to add Admin link

### Skills Required

Skills: (none)

### Success Criteria

**Manual Verification:**
- [ ] Navigating to `/admin` as staff user renders admin layout with sidebar
- [ ] Navigating to `/admin` as regular user shows 403 page
- [ ] Navigating to `/admin` while unauthenticated redirects to `/login`
- [ ] Sidebar links highlight correctly based on current route
- [ ] "Back to Home" link in sidebar navigates to `/`
- [ ] Navbar shows "Admin" link for staff users
- [ ] Navbar does NOT show "Admin" link for regular users
- [ ] Navbar is hidden on `/admin/*` routes

### Assumptions
- `djoser`'s `/auth/users/me/` endpoint returns `is_staff` in the user object. If not, we may need a custom user serializer.
- Admin layout uses React Router's `<Outlet />` for nested routing
- All admin pages are wrapped in `<Suspense>` with the existing loader component

---

## Phase 5: Frontend Admin Genre Pages

### Overview
Build the Genre list page (table with Edit/Delete actions) and Genre create/edit form pages. Uses React Query for data fetching and Formik + Yup for form handling.

**Maps to spec**: Frontend — Admin Pages acceptance criteria for genres.

### Files to Create

**File**: `frontend/src/pages/admin/AdminGenreList.tsx`
**Purpose**: Table of all genres with Edit/Delete actions.
**Key components**: `useQuery` for fetching genres, table with columns (Name, Actions), Edit button navigates to `/admin/genres/:id/edit`, Delete button shows confirmation dialog then calls delete API, success/error toast messages. Loading state with skeleton rows.

**File**: `frontend/src/pages/admin/AdminGenreForm.tsx`
**Purpose**: Create and edit genre form.
**Key components**: Uses `useParams` to detect create vs edit mode. `useQuery` to fetch genre for edit mode. Formik form with `name` field (required, 1-100 chars). Yup validation schema. On submit, calls `createGenre` or `updateGenre`. Redirects to `/admin/genres` on success.

### Files to Modify

**File**: `frontend/src/App.tsx`
**Changes**: Add routes for `/admin/genres`, `/admin/genres/create`, `/admin/genres/:id/edit` inside the admin route group.
**Reason**: Register new admin page routes.

### Implementation Order

1. Create `frontend/src/pages/admin/AdminGenreList.tsx`
2. Create `frontend/src/pages/admin/AdminGenreForm.tsx`
3. Edit `frontend/src/App.tsx` to add genre routes

### Skills Required

Skills: (none)

### Success Criteria

**Manual Verification:**
- [ ] `/admin/genres` displays a table of all genres
- [ ] Edit button navigates to edit form with pre-filled name
- [ ] Delete button shows confirmation dialog
- [ ] Delete with no referencing movies succeeds
- [ ] Delete with referencing movies shows error message
- [ ] Create form validates name is not empty
- [ ] Create form validates name is 1-100 chars
- [ ] Duplicate genre name shows error

### Assumptions
- Formik `onSubmit` handles API errors by setting field errors via `setFieldError`
- Success messages use a simple toast or inline notification (not a library; keep it lightweight)
- Genre pages follow same dark theme as auth pages (`bg-gray-900`, `border-gray-700/50`)

---

## Phase 6: Frontend Admin Movie Pages + Home Page

### Overview
Build the Movie list page (table with poster thumbnails, status badges, Edit/Delete actions), Movie create/edit form (with poster file upload and preview), and transform the HomePage from placeholder to a responsive movie card grid with loading/empty/error states.

**Maps to spec**: Frontend — Admin Pages (movies), Frontend — Home Page acceptance criteria.

### Files to Create

**File**: `frontend/src/pages/admin/AdminMovieList.tsx`
**Purpose**: Paginated table of all movies with actions.
**Key components**: `useQuery` with pagination params, table columns (Poster thumbnail 48x72, Title, Genre, Director, Year, Duration, Price formatted, Active badge green/red, Edit/Delete buttons). Delete shows confirmation dialog, calls soft-delete, refreshes list. Pagination controls at bottom.

**File**: `frontend/src/pages/admin/AdminMovieForm.tsx`
**Purpose**: Create and edit movie form with poster upload.
**Key components**: Multipart form with all Movie fields. Poster input shows preview after selection. Genre dropdown populated from genres API. Yup validation matching backend rules. `FormData` for file upload. Edit mode pre-fills all fields including existing poster image.

**File**: `frontend/src/components/MovieCard.tsx`
**Purpose**: Single movie card for the home page grid.
**Key components**: Props: Movie. Renders poster image (aspect-[2/3]), hover overlay with title, director, year, genre, duration ("142 min"), price (formatted currency). Dark gradient overlay on hover.

**File**: `frontend/src/pages/MovieHomePage.tsx`
**Purpose**: Home page component with movie grid.
**Key components**: `useQuery` fetching `/api/movies/`, responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`), loading state with skeleton cards, empty state ("No movies available yet" with film icon), error state with retry button.

### Files to Modify

**File**: `frontend/src/App.tsx`
**Changes**: Add routes for `/admin/movies`, `/admin/movies/create`, `/admin/movies/:id/edit`. Update Home route to use `MovieHomePage` instead of `HomePage`.
**Reason**: Register movie admin routes and new home page.

**File**: `frontend/src/pages/HomePage.tsx`
**Changes**: Replace entire component body with `MovieHomePage` import and re-export (or rename).
**Reason**: Transform from placeholder to actual movie grid.

### Implementation Order

1. Create `frontend/src/components/MovieCard.tsx`
2. Create `frontend/src/pages/MovieHomePage.tsx`
3. Create `frontend/src/pages/admin/AdminMovieList.tsx`
4. Create `frontend/src/pages/admin/AdminMovieForm.tsx`
5. Edit `frontend/src/pages/HomePage.tsx` to use MovieHomePage
6. Edit `frontend/src/App.tsx` to add movie admin routes

### Skills Required

Skills: (none)

### Success Criteria

**Manual Verification:**
- [ ] `/admin/movies` displays paginated table with all columns
- [ ] Active badge shows green for `is_active=True`, red for `is_active=False`
- [ ] Delete button shows confirmation then soft-deletes
- [ ] Create form validates all fields per spec rules
- [ ] Poster upload shows preview before submit
- [ ] Poster file type validation rejects .gif
- [ ] Edit form pre-fills all fields including existing poster
- [ ] Successful create/edit redirects to `/admin/movies`
- [ ] Home page (`/`) shows responsive grid of movie cards
- [ ] Each card shows poster, title, director, year, genre, duration, price
- [ ] Loading state shows skeleton cards
- [ ] Empty state shows message when no movies exist
- [ ] Error state shows error with retry button

### Assumptions
- Poster preview uses `URL.createObjectURL()` for local file preview
- Movie list uses server-side pagination from DRF
- Price formatting uses `Intl.NumberFormat` for currency
- Duration display appends " min" to the number
- The `HomePage.tsx` keeps the hero banner section and replaces only the placeholder grid below it

---

## Testing Strategy

### Backend Tests (`backend/tests/apps/`)

**`test_movies_models.py`**:
- `test_genre_str` — Genre `__str__` returns name
- `test_movie_str` — Movie `__str__` returns title
- `test_movie_defaults_is_active_true` — new Movie has `is_active=True`
- `test_genre_protects_referenced_movies` — deleting a genre with movies raises `ProtectedError`

**`test_movies_admin_api.py`**:
- `test_staff_can_create_movie` — POST 201 with valid data
- `test_staff_can_update_movie` — PUT 200
- `test_staff_can_soft_delete_movie` — DELETE sets is_active=False, returns 204
- `test_create_movie_validates_title_required` — POST empty title returns 400
- `test_create_movie_validates_description_length` — POST short description returns 400
- `test_create_movie_validates_release_year_range` — POST year 1800 returns 400
- `test_create_movie_validates_duration_range` — POST duration 0 returns 400
- `test_create_movie_validates_price` — POST negative price returns 400
- `test_create_movie_validates_genre_exists` — POST invalid genre_id returns 400
- `test_staff_can_create_genre` — POST 201
- `test_create_genre_duplicate_name` — POST duplicate returns 400
- `test_staff_can_update_genre` — PUT 200
- `test_non_staff_forbidden` — non-staff user gets 403 on admin endpoints
- `test_unauthenticated_returns_401` — no token gets 401 on admin endpoints

**`test_movies_public_api.py`**:
- `test_authenticated_can_list_movies` — GET returns paginated active movies
- `test_list_excludes_inactive_movies` — inactive movies not in response
- `test_filter_by_genre` — `?genre=1` filters correctly
- `test_search_by_title` — `?search=batman` finds by title
- `test_order_by_release_year` — `?ordering=release_year` orders ascending
- `test_unauthenticated_returns_401` — no token gets 401 on public endpoints

### Manual Testing Checklist

1. Create staff user: `python manage.py createsuperuser` → set `is_staff=True`
2. Create regular user via register page
3. Login as staff → verify "Admin" link in navbar
4. Login as regular → verify NO "Admin" link
5. Visit `/admin` as regular → verify 403 page
6. Visit `/admin` unauthenticated → verify redirect to login
7. Staff: Create genre → verify it appears in list
8. Staff: Create movie with poster → verify it appears in admin list
9. Staff: Edit movie → verify changes persist
10. Staff: Delete movie → verify it disappears from home page, still visible in admin
11. Regular: Visit home → verify movie grid with active movies only
12. Try to delete genre that has movies → verify error message

## Performance Considerations

- Poster images: thumbnail rendering on the admin list page should use CSS sizing (not resizing server-side), keeping implementation simple
- Movie list pagination is server-side (20/page default) — frontend does NOT fetch all movies at once
- Genre list is small enough to fetch all at once without pagination
- React Query provides caching and stale-while-revalidate for all API calls

## Migration Notes

- New models only — no data migrations needed
- `makemigrations` generates one migration file for the `movies` app
- `MEDIA_ROOT = BASE_DIR / "media"` directory must exist or be auto-created
- Docker volume should mount or persist the media directory to avoid losing uploaded posters

## References

- Specification: `thoughts/tickets/MOVIE-MANAGEMENT-003/2026-06-15-movie-management_spec.md`
- Backend conventions: `backend/apps/utils/models.py:4` (TimeStampedMixin), `backend/apps/core/services/base.py:5` (BaseService)
- Permission classes: `backend/apps/common/permissions.py:4` (IsAdminUser)
- DRF settings: `backend/config/settings.py:117` (REST_FRAMEWORK config)
- Frontend conventions: `frontend/src/api/django.ts:3` (Axios instance), `frontend/src/services/authService.ts:1` (service pattern)
- Auth guard: `frontend/src/components/ProtectedRoute.tsx:4` (ProtectedRoute pattern)

## Implementation Deviations

The following deviations from the original plan were made during implementation:

### 1. PATCH instead of PUT for movie updates
**Original plan**: PUT for full movie updates.
**Actual**: Movie updates use PATCH (partial update). When editing a movie without re-uploading the poster, PATCH preserves the existing poster file. PUT required all fields including the file, causing a "No file submitted" error.

### 2. RelativeImageField for poster URLs
**Original plan**: Standard DRF ImageField.
**Actual**: Custom `RelativeImageField` serializer field returns relative URLs (`/media/posters/...`) instead of absolute URLs (`http://backend:8000/media/...`). The Vite proxy runs inside Docker, causing Django to build absolute URLs with the internal Docker hostname that the browser cannot reach.

### 3. Vite proxy for /media
**Original plan**: Not mentioned.
**Actual**: Added `/media` proxy to `vite.config.ts` to forward media requests to the Django backend. Without this, poster images were not served to the browser.

### 4. FormData Content-Type handling
**Original plan**: Manual `Content-Type: multipart/form-data` header.
**Actual**: Removed manual header; axios interceptor now auto-detects `FormData` and removes the default `application/json` header, letting the browser set `multipart/form-data` with the correct boundary.

### 5. Custom djoser UserSerializer
**Original plan**: Assumed djoser returned `is_staff`.
**Actual**: Created `apps/common/serializers.py` with `UserSerializer` that extends djoser's serializer to include `is_staff` field. Registered in DJOSER settings under `SERIALIZERS.user` and `SERIALIZERS.current_user`.

### 6. Admin poster thumbnail sizing
**Original plan**: Tailwind `h-18` class.
**Actual**: Changed to `h-[72px]` — `h-18` is not a valid Tailwind utility class and was rendering height as 0px, making posters invisible.

## Assumptions Summary

1. `djoser`'s `/auth/users/me/` response includes `is_staff` field (or will be added to serializer)
2. Docker volume or bind mount handles media persistence in development
3. No additional npm/pip packages needed — all required dependencies are already installed
4. Frontend uses `react-router-dom` v6 nested routes with `<Outlet />` for admin layout
5. Admin sidebar stays fixed/sticky — does not collapse or have mobile toggle in v1
6. Toast/success messages use a simple inline component, not a third-party library
7. Genre pages do not need pagination (small dataset expected)
