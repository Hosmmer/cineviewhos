# Movie Admin — Feature Specification

## 1. Feature Summary

CineViewHos currently has only authentication (LOGIN-001). This feature adds the **movies domain** — the core content of the platform. It provides:

- A **backoffice admin panel** (React SPA) where staff users can create, edit, and soft-delete movies and genres.
- A **public catalog** on the Home page where any authenticated user can browse active movies in a responsive grid.
- A **permission model** enforcing that only `is_staff=True` users can modify content; regular authenticated users are read-only.

This feature establishes the base of the platform's content layer and demonstrates the full-stack CRUD patterns (service layer, DRF viewsets, React Query + Formik forms, dark cinematic UI) that future features will follow.

## 2. Data Model / Entities Involved

### Created

#### Genre (`apps/movies/models.py`)
| Field | Type | Constraints |
|-------|------|------------|
| id | AutoField (PK) | |
| name | CharField(max_length=100) | unique, required |
| created_at | DateTimeField | auto_now_add (via TimeStampedMixin) |
| updated_at | DateTimeField | auto_now (via TimeStampedMixin) |

#### Movie (`apps/movies/models.py`)
| Field | Type | Constraints |
|-------|------|------------|
| id | AutoField (PK) | |
| title | CharField(max_length=255) | required |
| description | TextField | required, min 10 chars |
| director | CharField(max_length=255) | required |
| actors | TextField | required, comma-separated names |
| duration_minutes | PositiveIntegerField | required, 1-600 |
| release_year | IntegerField | required, 1900 - current_year+5 |
| poster | ImageField(upload_to='posters/') | required, JPEG/PNG/WebP, max 5MB |
| price | DecimalField(max_digits=10, decimal_places=2) | required, >= 0.00 |
| genre | ForeignKey(Genre, on_delete=PROTECT) | required |
| is_active | BooleanField(default=True) | soft-delete flag |
| created_at | DateTimeField | auto_now_add (via TimeStampedMixin) |
| updated_at | DateTimeField | auto_now (via TimeStampedMixin) |

### Referenced (not modified)
- `apps/common/models.py` — `User(AbstractUser)` — `is_staff` field used for admin permission checks
- `apps/common/permissions.py` — `IsAdminUser` permission class reused for staff-only endpoints
- `apps/utils/models.py` — `TimeStampedMixin` inherited by both Genre and Movie

## 3. Business Rules and Constraints

### Authorization
| Rule | Description |
|------|-------------|
| **Staff-only mutations** | POST/PATCH/DELETE on `/api/admin/movies/` and `/api/admin/genres/` require `is_staff=True`. Non-staff receive HTTP 403. Movie updates use PATCH (partial) to allow preserving the poster when not re-uploaded. |
| **Authenticated read** | GET on `/api/movies/` and `/api/movies/{id}/` require authentication. Unauthenticated requests receive HTTP 401. |
| **Soft-delete via is_active** | DELETE sets `is_active=False` rather than removing the row. Only staff can trigger this. |

### Validation
| Field | Rule |
|-------|------|
| title | 1-255 characters, required |
| description | Minimum 10 characters, required |
| director | 1-255 characters, required |
| actors | Non-empty, required |
| duration_minutes | Integer, min 1, max 600 |
| release_year | Integer, min 1900, max current_year + 5 |
| price | Decimal, min 0.00 |
| poster | File extension in ['.jpg', '.jpeg', '.png', '.webp'], max size 5 MB |
| genre | Must reference an existing Genre ID |
| genre.name | 1-100 characters, unique |

### Poster Image Handling
- Poster URLs are served as relative paths (e.g., `/media/posters/image.jpg`) to avoid hardcoding Docker internal hostnames.
- The Vite dev server proxies `/media` requests to the Django backend for development serving.
- FormData requests for file uploads use auto-detected `multipart/form-data` Content-Type (axios removes the `application/json` default when FormData is detected).

### Genre Deletion Protection
- A Genre referenced by any Movie cannot be deleted (`on_delete=PROTECT`). Attempting to do so returns HTTP 400 with an error message.

### Movie Listing (Public)
- GET `/api/movies/` returns only movies with `is_active=True`.
- Supports pagination (default 20/page, inherited from DRF settings).
- Supports ordering by `title`, `release_year`, `created_at` (via `OrderingFilter`).
- Supports search by `title` and `director` (via `SearchFilter`).
- Supports filtering by `genre_id` (via `DjangoFilterBackend`).

### Admin Movie Listing
- GET `/api/admin/movies/` returns ALL movies (active and inactive).
- Same filtering, searching, and ordering as public listing.

## 4. Acceptance Criteria

### Backend — Models
- [ ] Running migrations creates `movies_genre` and `movies_movie` tables with all columns from the data model above.
- [ ] `is_active` defaults to `True` for new Movie records.
- [ ] Deleting a Genre that is referenced by a Movie raises `ProtectedError`.

### Backend — Public Endpoints (User)
- [ ] `GET /api/movies/` returns paginated list of active movies only.
- [ ] `GET /api/movies/{id}/` returns movie detail with nested genre data.
- [ ] `GET /api/movies/?genre={id}` filters by genre.
- [ ] `GET /api/movies/?search=batman` searches by title and director.
- [ ] `GET /api/movies/?ordering=release_year` orders results.
- [ ] `GET /api/genres/` returns all genres.
- [ ] Unauthenticated requests to any movie endpoint return HTTP 401.

### Backend — Admin Endpoints (Staff)
- [ ] `POST /api/admin/movies/` with valid data creates a movie and returns HTTP 201.
- [ ] `PUT /api/admin/movies/{id}/` updates a movie and returns HTTP 200.
- [ ] `PATCH /api/admin/movies/{id}/` partially updates a movie.
- [ ] `DELETE /api/admin/movies/{id}/` sets `is_active=False` and returns HTTP 204.
- [ ] `POST /api/admin/movies/` with title shorter than 1 char returns HTTP 400.
- [ ] `POST /api/admin/movies/` with description shorter than 10 chars returns HTTP 400.
- [ ] `POST /api/admin/movies/` with release_year 1800 returns HTTP 400.
- [ ] `POST /api/admin/movies/` with duration_minutes 0 returns HTTP 400.
- [ ] `POST /api/admin/movies/` with price -5.00 returns HTTP 400.
- [ ] `POST /api/admin/movies/` with non-existent genre_id returns HTTP 400.
- [ ] `POST /api/admin/movies/` with poster > 5MB returns HTTP 400.
- [ ] `POST /api/admin/movies/` with poster as .gif returns HTTP 400.
- [ ] `POST /api/admin/genres/` creates a genre and returns HTTP 201.
- [ ] `POST /api/admin/genres/` with duplicate name returns HTTP 400.
- [ ] `PUT /api/admin/genres/{id}/` updates a genre.
- [ ] `DELETE /api/admin/genres/{id}/` with no referencing movies deletes the genre.
- [ ] `DELETE /api/admin/genres/{id}/` with referencing movies returns HTTP 400.
- [ ] Non-staff user calling any admin endpoint receives HTTP 403.
- [ ] Unauthenticated user calling any admin endpoint receives HTTP 401.

### Frontend — Admin Pages
- [ ] Navigating to `/admin` redirects to `/admin/movies`.
- [ ] `/admin` routes are protected by both authentication AND staff check. Non-staff see a 403 page.
- [ ] `/admin/movies` displays a paginated table of all movies (active and inactive) with columns: Poster (thumbnail), Title, Genre, Director, Year, Duration, Price, Active (badge), Actions (Edit/Delete buttons).
- [ ] `/admin/movies/create` shows a form with all Movie fields. Successful submission redirects to `/admin/movies` with a success message.
- [ ] `/admin/movies/:id/edit` pre-fills the form with existing data. Successful update redirects to `/admin/movies`.
- [ ] Delete button on movie list shows confirmation dialog. On confirm, sets movie inactive and refreshes list.
- [ ] `/admin/genres` displays a table of all genres with Edit/Delete actions.
- [ ] `/admin/genres/create` shows a form with the name field.
- [ ] `/admin/genres/:id/edit` pre-fills the genre name.
- [ ] Sidebar navigation is present on all `/admin/*` routes with links: "Movies", "Genres", "Back to Home".
- [ ] Admin sidebar highlights the current active section.
- [ ] Poster upload field accepts image files and shows preview before submit.

### Frontend — Home Page (User Catalog)
- [ ] `GET /` (HomePage) displays a responsive grid of active movie cards.
- [ ] Each card shows: poster image, title, director, release year, genre name, duration (e.g., "142 min"), price (formatted as currency).
- [ ] Grid is responsive: 1 column on mobile, 2 on tablet, 3-4 on desktop.
- [ ] Loading state shows skeleton cards while fetching.
- [ ] Empty state shows a friendly message when no movies exist.
- [ ] Error state shows an error message with a retry button.

### Frontend — Navigation
- [ ] Staff users see an "Admin" link in the Navbar.
- [ ] Regular users do not see the "Admin" link.
- [ ] Navbar is hidden on `/admin/*` routes (replaced by admin sidebar).

## 5. Out of Scope

- **Movie detail page** — clicking a movie card on the Home page does NOT navigate to a detail view (deferred).
- **Public catalog page** — movies are shown on Home only, no separate `/movies` public route.
- **Bulk operations** — no batch delete, batch activate/deactivate.
- **Advanced actor management** — actors are a free-text comma-separated field; no per-actor filtering or actor detail pages.
- **Movie ratings or reviews** — not included.
- **Trailers or video uploads** — poster images only.
- **Full-text search with PostgreSQL** — uses Django's basic `SearchFilter` (icontains), not PostgreSQL full-text search vectors.
- **Social login, MFA, rate limiting** — auth features already completed in LOGIN-001; no changes needed.
- **API schema documentation UI** — drf-spectacular is installed but exposing Swagger/Redoc UI is out of scope for this ticket.
- **Media file serving in production** — local development uses Django's `static()` serving. Production media serving (S3/nginx) is deferred.

## 6. Open Questions

_None._ All decisions were resolved during the grill-with-docs session.



