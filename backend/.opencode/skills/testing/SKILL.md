---
name: backend-testing
description: "Use when writing or fixing backend tests. Covers Pytest + Django patterns: fixture setup, view tests, service tests, serializer tests, model tests, API client, factories, and mocking."
metadata:
  version: "1.0.0"
  domain: backend
  stack: Pytest + pytest-django + Django 3.0.7 + DRF 3.15
  triggers: test, testing, pytest, fixture, conftest, factory, mock, assert, API test, view test, service test, serializer test, model test
  role: specialist
  scope: implementation
  output-format: code
---

# Backend Testing Expert (CineViewHos)

Senior testing specialist — Pytest + Django + DRF.

## When to Use This Skill

- Writing tests for views, services, serializers, or models
- Setting up test fixtures and factories
- Testing API endpoints with authentication
- Testing service layer business logic
- Mocking external dependencies
- Writing integration tests

## Test Setup

### pytest.ini

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = test_*.py
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
```

### conftest.py (backend/tests/conftest.py)

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from model_bakery import baker

User = get_user_model()


@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def auth_client(db):
    """Authenticated API client with a default user."""
    user = baker.make(User, username="testuser", email="test@test.com")
    client = APIClient()
    client.force_authenticate(user=user)
    client.user = user
    return client


@pytest.fixture
def admin_client(db):
    """Admin-authenticated API client."""
    user = baker.make(User, username="admin", email="admin@test.com", is_staff=True, is_superuser=True)
    client = APIClient()
    client.force_authenticate(user=user)
    client.user = user
    return client


@pytest.fixture
def make_user(db):
    """Factory fixture for creating users."""
    def _make_user(**kwargs):
        defaults = {"username": "user1", "email": "user1@test.com", "password": "testpass123"}
        defaults.update(kwargs)
        password = defaults.pop("password")
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()
        return user
    return _make_user
```

## API View Testing

### Testing a GET endpoint

```python
import pytest
from model_bakery import baker


class TestMovieListAPI:
    def test_list_movies_returns_200(self, api_client, db):
        baker.make("movies.Movie", _quantity=3)

        response = api_client.get("/api/movies/")

        assert response.status_code == 200
        assert len(response.data["results"]) == 3

    def test_list_movies_requires_auth(self, api_client):
        response = api_client.get("/api/admin/movies/")

        assert response.status_code == 401

    def test_list_movies_empty(self, auth_client):
        response = auth_client.get("/api/movies/")

        assert response.status_code == 200
        assert response.data["results"] == []
```

### Testing a POST endpoint

```python
class TestMovieCreateAPI:
    def test_create_movie_success(self, auth_client):
        data = {
            "title": "Inception",
            "year": 2010,
            "genre": "Sci-Fi",
            "description": "A mind-bending thriller",
        }

        response = auth_client.post("/api/admin/movies/", data, format="json")

        assert response.status_code == 201
        assert response.data["title"] == "Inception"
        assert response.data["year"] == 2010

    def test_create_movie_invalid_data(self, auth_client):
        data = {"title": ""}  # Missing required fields

        response = auth_client.post("/api/admin/movies/", data, format="json")

        assert response.status_code == 400
        assert "title" in response.data

    def test_create_movie_unauthorized(self, api_client):
        data = {"title": "Inception", "year": 2010}

        response = api_client.post("/api/admin/movies/", data, format="json")

        assert response.status_code == 401
```

### Testing a PUT/PATCH endpoint

```python
class TestMovieUpdateAPI:
    def test_update_movie_success(self, auth_client):
        movie = baker.make("movies.Movie", title="Old Title")
        data = {"title": "New Title"}

        response = auth_client.patch(f"/api/admin/movies/{movie.id}/", data, format="json")

        assert response.status_code == 200
        assert response.data["title"] == "New Title"

    def test_update_nonexistent_movie(self, auth_client):
        response = auth_client.patch("/api/admin/movies/99999/", {}, format="json")

        assert response.status_code == 404
```

### Testing a DELETE endpoint

```python
class TestMovieDeleteAPI:
    def test_delete_movie_success(self, auth_client):
        movie = baker.make("movies.Movie")

        response = auth_client.delete(f"/api/admin/movies/{movie.id}/")

        assert response.status_code == 204
        assert not Movie.objects.filter(id=movie.id).exists()
```

## Service Layer Testing

```python
import pytest
from model_bakery import baker
from apps.movies.services import MovieService


class TestMovieService:
    def test_create_movie_returns_result(self, db):
        data = {"title": "Inception", "year": 2010, "genre": "Sci-Fi"}

        result, error = MovieService.create_movie(data)

        assert error is None
        assert result is not None
        assert result.title == "Inception"

    def test_create_movie_without_title_returns_error(self, db):
        data = {"year": 2010}

        result, error = MovieService.create_movie(data)

        assert result is None
        assert error is not None
        assert "title" in error

    def test_get_movies_returns_queryset(self, db):
        baker.make("movies.Movie", _quantity=5)

        movies = MovieService.get_movies()

        assert movies.count() == 5

    def test_get_movie_by_id(self, db):
        movie = baker.make("movies.Movie", title="Test Movie")

        result, error = MovieService.get_movie_by_id(movie.id)

        assert error is None
        assert result.title == "Test Movie"

    def test_get_movie_by_id_not_found(self, db):
        result, error = MovieService.get_movie_by_id(99999)

        assert result is None
        assert error == "Movie not found"
```

## Serializer Testing

```python
from apps.movies.serializers import MovieSerializer


class TestMovieSerializer:
    def test_valid_data(self):
        data = {
            "title": "Inception",
            "year": 2010,
            "genre": "Sci-Fi",
            "description": "A thriller",
        }
        serializer = MovieSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["title"] == "Inception"

    def test_missing_required_field(self):
        data = {"title": "Inception"}  # Missing year
        serializer = MovieSerializer(data=data)

        assert not serializer.is_valid()
        assert "year" in serializer.errors

    def test_year_out_of_range(self):
        data = {"title": "Test", "year": 1800}
        serializer = MovieSerializer(data=data)

        assert not serializer.is_valid()
        assert "year" in serializer.errors

    def test_serializer_output(self, db):
        movie = baker.make("movies.Movie", title="Inception", year=2010)
        serializer = MovieSerializer(movie)

        assert serializer.data["title"] == "Inception"
        assert serializer.data["year"] == 2010
```

## Model Testing

```python
from apps.movies.models import Movie


class TestMovieModel:
    def test_create_movie(self, db):
        movie = Movie.objects.create(title="Inception", year=2010, genre="Sci-Fi")

        assert movie.id is not None
        assert str(movie) == "Inception"
        assert movie.created_at is not None
        assert movie.updated_at is not None

    def test_movie_ordering(self, db):
        movie1 = Movie.objects.create(title="B Movie", year=2020)
        movie2 = Movie.objects.create(title="A Movie", year=2021)

        movies = Movie.objects.all()

        assert movies[0].title == "B Movie"  # Or whatever ordering is defined
```

## Auth Testing

```python
class TestAuthEndpoints:
    def test_register_user_success(self, api_client, db):
        data = {
            "username": "newuser",
            "email": "new@test.com",
            "password": "securepass123",
            "re_password": "securepass123",
        }

        response = api_client.post("/api/auth/users/", data, format="json")

        assert response.status_code == 201
        assert User.objects.filter(username="newuser").exists()

    def test_login_success(self, api_client, db):
        user = User.objects.create_user(username="test", password="pass123")
        data = {"username": "test", "password": "pass123"}

        response = api_client.post("/api/auth/jwt/create/", data, format="json")

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_invalid_credentials(self, api_client, db):
        data = {"username": "noexist", "password": "wrong"}

        response = api_client.post("/api/auth/jwt/create/", data, format="json")

        assert response.status_code == 401
```

## Mocking Patterns

```python
from unittest.mock import patch, Mock


class TestWithMocks:
    @patch("apps.movies.services.send_notification")
    def test_mock_external_service(self, mock_send, db):
        mock_send.return_value = True

        result, error = MovieService.create_movie({"title": "Test", "year": 2020})

        assert error is None
        mock_send.assert_called_once()

    @patch("apps.common.services.requests.post")
    def test_mock_external_api(self, mock_post, db):
        mock_post.return_value = Mock(status_code=200, json=lambda: {"id": "ext-123"})

        result = call_external_api({"data": "value"})

        assert result == {"id": "ext-123"}
```

## Running Tests

```bash
# All tests
pytest

# Specific file
pytest tests/apps/test_movies.py

# Specific test class
pytest tests/apps/test_movies.py::TestMovieListAPI

# Specific test
pytest tests/apps/test_movies.py::TestMovieListAPI::test_list_movies_returns_200

# Verbose output
pytest -v

# Run and stop on first failure
pytest -x

# Run with coverage
pytest --cov=apps --cov-report=term-missing

# Exclude slow tests
pytest -m "not slow"

# Only integration tests
pytest -m integration
```

## Constraints

### MUST DO
- **Test all layers** — views, services, serializers, models. Each has separate tests.
- **Use APIClient for views** — `from rest_framework.test import APIClient`
- **Use `force_authenticate`** — never manually craft JWT tokens in tests
- **Test both success and failure** — every endpoint needs happy path + error tests
- **Use `model_bakery` for fixtures** — `baker.make("app.Model")`, not raw `Model.objects.create()`
- **Isolated tests** — each test creates its own data, no dependencies between tests
- **Test auth** — verify 401 for unauthenticated, 403 for unauthorized
- **`db` fixture** — add `db` to any test that touches the database
- **Assert on response shape** — check `response.data["results"]`, `response.data["detail"]`

### MUST NOT DO
- **Don't hardcode IDs** — use `movie.id` not `1`
- **Don't skip service tests** — services contain business logic, they need the most testing
- **Don't use sleep/wait** — Django test client is synchronous
- **Don't call real external APIs** — always mock external HTTP calls
- **Don't test Django/DRF internals** — test your code, not the framework
- **Don't use `TransactionTestCase` unless needed** — `TestCase` wraps in transaction by default
