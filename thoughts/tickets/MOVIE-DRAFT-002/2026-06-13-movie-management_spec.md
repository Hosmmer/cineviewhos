# Movie Management Feature Specification

## 1. Feature Summary

Implement a movie management system for CineViewHos that allows staff users to create, view, and manage movies through an admin panel with a sidebar navigation. This feature provides the foundation for an e-commerce movie platform where staff can configure movies with images, descriptions, pricing, and other metadata.

**Business Value:** Enables content management for the movie catalog, separating administrative functionality from the public-facing storefront. Staff users can maintain the movie inventory without requiring direct database access.

## 2. Data Model / Entities Involved

### New Models

#### Genre (`backend/apps/movies/models.py`)
- `id` (AutoField, primary key)
- `name` (CharField, max_length=100, unique, required)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- One-to-Many with Movie (one genre can have many movies)

#### Movie (`backend/apps/movies/models.py`)
- `id` (AutoField, primary key)
- `title` (CharField, max_length=255, required)
- `description` (TextField, required)
- `release_year` (IntegerField, required)
- `genre` (ForeignKey to Genre, required)
- `duration_minutes` (IntegerField, required)
- `poster` (ImageField, upload_to='movies/posters/', required)
- `price` (DecimalField, max_digits=10, decimal_places=2, required)
- `is_active` (BooleanField, default=True)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- Many-to-One with Genre (many movies can belong to one genre)

**Database Constraints:**
- `title` cannot be empty
- `release_year` must be between 1900 and current year + 5
- `duration_minutes` must be positive
- `price` must be non-negative
- `poster` must be a valid image file

### Referenced Models (No Changes)

#### User (`backend/apps/common/models.py`)
- Used for permission checks (`is_staff=True`)
- No modifications to existing User model

## 3. Business Rules and Constraints

### Authorization Rules
- Only users with `is_staff=True` can access the movie management panel
- All movie management endpoints require JWT authentication
- Non-staff users receive 403 Forbidden when accessing admin routes

### Input Validation Rules
- `title`: Required, 1-255 characters
- `description`: Required, minimum 10 characters
- `release_year`: Required, integer between 1900 and (current year + 5)
- `genre`: Required, must reference existing Genre
- `duration_minutes`: Required, positive integer (1-600)
- `poster`: Required, valid image file (JPEG, PNG, WebP), max 5MB
- `price`: Required, decimal with 2 places, minimum 0.00
- `is_active`: Optional, defaults to True

### Data Integrity Constraints
- Genre `name` must be unique (case-insensitive)
- Movie `poster` images stored in `MEDIA_ROOT/movies/posters/`
- Deleting a Genre is blocked if movies reference it (PROTECT)
- Images served via `MEDIA_URL` in development

### Codebase Conventions
- Follow existing app structure: `apps/{domain}/` with models.py, views.py, serializers.py, urls.py
- Use `TimeStampedMixin` from `apps.utils.models` for created_at/updated_at
- Frontend uses Formik + Yup for forms, React Query for API calls
- Dark theme UI: gray-900 background, red-500 accents
- Sidebar navigation for admin panel (new layout pattern)

## 4. Acceptance Criteria (Testable)

### Backend API

- [ ] Given a staff user with valid JWT, when POST `/api/movies/` with valid data, then movie is created and returns 201
- [ ] Given a staff user with valid JWT, when GET `/api/movies/`, then returns paginated list of movies
- [ ] Given a staff user with valid JWT, when GET `/api/movies/{id}/`, then returns movie details
- [ ] Given a non-staff user with valid JWT, when POST `/api/movies/`, then returns 403 Forbidden
- [ ] Given a staff user, when POST `/api/movies/` with invalid poster file (>5MB), then returns 400 with validation error
- [ ] Given a staff user with valid JWT, when POST `/api/genres/` with valid data, then genre is created and returns 201
- [ ] Given a staff user, when DELETE `/api/genres/{id}/` where movies reference it, then returns 400 with error message
- [ ] Given valid image upload, when movie is created, then poster file exists at `MEDIA_ROOT/movies/posters/{filename}`

### Frontend UI

- [ ] Given a staff user logged in, when navigating to `/admin`, then sidebar navigation is visible
- [ ] Given a staff user, when clicking "Películas" in sidebar, then navigates to `/admin/movies` and displays movie list
- [ ] Given a staff user on `/admin/movies/create`, when filling form with valid data and submitting, then movie is created and user is redirected to movie list
- [ ] Given a staff user on movie creation form, when uploading poster image, then image preview is displayed before submission
- [ ] Given a non-staff user, when attempting to access `/admin/*` routes, then redirected to home page
- [ ] Given a staff user, when clicking "Géneros" in sidebar, then navigates to `/admin/genres` and displays genre list
- [ ] Given a staff user on genre creation, when submitting valid genre name, then genre is created and list updates
- [ ] Given sidebar navigation, when on `/admin/movies`, then "Películas" menu item is highlighted
- [ ] Given movie list view, when no movies exist, then displays empty state with "Create your first movie" CTA

### Image Handling

- [ ] Given a movie with poster, when GET `/api/movies/{id}/`, then `poster` field contains full URL to image
- [ ] Given valid image upload (JPEG/PNG/WebP), when creating movie, then image is saved and accessible via MEDIA_URL
- [ ] Given invalid image file (not JPEG/PNG/WebP), when uploading, then returns validation error

## 5. Out of Scope

- **Movie editing**: Only creation is implemented in this feature. Edit/update functionality deferred.
- **Movie deletion**: Soft delete via `is_active` flag only. Hard delete not implemented.
- **Bulk operations**: No bulk create/update/delete for movies or genres.
- **Advanced filtering**: Basic list view only. Search, filter by genre/year, sorting deferred.
- **Movie details page**: Only list and create views. Individual movie detail page deferred.
- **Public catalog**: Frontend storefront for non-staff users to browse movies not included.
- **Image optimization**: No automatic image resizing, compression, or thumbnail generation.
- **Multiple images**: Only one poster per movie. Gallery/screenshots not supported.
- **Movie relationships**: No actors, directors, or related movies fields.
- **Inventory management**: No stock tracking or availability management.
- **Categories beyond genre**: No tags, collections, or custom categorization.

## 6. Open Questions

None. All requirements have been clarified during the grill-with-docs session.

