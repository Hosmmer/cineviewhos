# Movies Domain Context

The Movies context manages the film catalog: genres, movie metadata, poster images, and role-based access (staff CRUD, user read-only).

## Language

**Admin Panel**: React SPA at `/admin` where staff users manage movies and genres. _Avoid_: backoffice, dashboard.

**AdminProtectedRoute**: Route guard that checks both authentication and `is_staff=True`. Renders a 403 page for unauthorized access. _Avoid_: staff guard.

**Genre**: A film category (Action, Comedy, Drama) stored as a normalized model with unique name.

**Movie**: A film entry with title, description, director, actors, duration, release year, poster image, price, genre, and active status.

**PATCH update**: Partial movie update used instead of PUT to preserve the poster file when editing other fields without re-uploading.

**Poster**: A movie's cover image (JPEG/PNG/WebP, max 5 MB). _Avoid_: cover, thumbnail, image.

**Public Catalog**: The read-only movie grid displayed on the Home page (`/`) for authenticated users. Only shows active movies (`is_active=True`).

**RelativeImageField**: Custom DRF serializer field that returns relative poster URLs (`/media/posters/...`) instead of absolute URLs to avoid leaking Docker internal hostnames.

**Soft-delete**: Deactivating a movie by setting `is_active=False` rather than removing the database row. _Avoid_: archive, deactivate.
