# Testing — CineViewHos Backend

## Framework

**pytest** with **pytest-django**. Config in `pytest.ini`:
```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests/**/*.py
testpaths = tests
addopts = --ds=config.settings
pythonpath = .
```

## Run Tests

```bash
pytest                          # all tests
pytest tests/apps/reservations/ # specific directory
pytest -k "test_create"         # keyword match
```

## Fixtures

### Shared (`tests/conftest.py`)
```python
@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()
```

### Domain Fixtures
```python
@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123")

@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username="admin", password="admin123", is_staff=True)

@pytest.fixture
def auth_client(api_client, client_user):
    from rest_framework_simplejwt.tokens import RefreshToken
    token = str(RefreshToken.for_user(client_user).access_token)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client

@pytest.fixture
def genre(db):
    return Genre.objects.create(name="Action")

@pytest.fixture
def movie(db, genre):
    return Movie.objects.create(title="Test Movie", genre=genre, ...)
```

## Test Organization

- **Service tests** (`test_services.py`): Test business logic directly
- **View tests** (`test_views.py`): Test HTTP endpoints
- Classes grouped by feature: `class TestSalaService:`, `class TestPublicReservaEndpoints:`
- Methods marked `@pytest.mark.django_db`
- Assertions use plain `assert`, not `self.assertEqual`

## Service Test Pattern

```python
class TestSalaService:
    @pytest.mark.django_db
    def test_create_sala_generates_seats(self):
        service = SalaService()
        result = service.create_sala(name="Sala 1", rows=5, cols=10)
        assert result.success
        assert Seat.objects.filter(sala_id=result.data["id"]).count() == 50

    @pytest.mark.django_db
    def test_create_duplicate_name(self):
        service = SalaService()
        service.create_sala(name="Sala 1", rows=3, cols=5)
        result = service.create_sala(name="Sala 1", rows=4, cols=8)
        assert not result.success
        assert result.status_code == 400
```

## View Test Pattern

```python
class TestPublicReservaEndpoints:
    @pytest.mark.django_db
    def test_create_reserva_success(self, auth_client, funcion, seats):
        response = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id, seats[1].id],
        }, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "confirmed"

    @pytest.mark.django_db
    def test_requires_auth(self, api_client):
        response = api_client.get("/api/movies/")
        assert response.status_code == 401
```

## Imports

```python
import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
```
