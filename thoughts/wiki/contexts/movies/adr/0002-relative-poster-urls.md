# Return relative poster URLs instead of absolute URLs

Movie poster URLs returned by the API use a custom `RelativeImageField` serializer that returns relative paths (e.g., `/media/posters/image.jpg`) instead of absolute URLs. The standard DRF `ImageField` calls `build_absolute_uri()` which uses the request's Host header. Since the frontend accesses the backend through a Vite proxy inside Docker, Django sees the internal Docker hostname (`backend:8000`) and builds absolute URLs the browser cannot reach.

**Alternatives considered**: Configuring Django's `USE_X_FORWARDED_HOST` — rejected because it adds middleware complexity and doesn't solve the base URL problem. Using `request.build_absolute_uri()` with a custom host — rejected because the request context isn't available at the serializer field level without significant refactoring.
