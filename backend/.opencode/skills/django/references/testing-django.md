# Testing Django — pytest-django

## Test Stack

| Tool | Role |
|---|---|
| `pytest` + `pytest-django` | Test runner |
| `APIClient` from DRF | HTTP client for views |
| `@pytest.mark.django_db` | Enables DB access per test / class |
| `unittest.mock.patch` | Mock external APIs |

```bash
pytest
pytest tests/ -v
pytest tests/test_file.py::TestClass::test_method -v -s
```

## conftest.py — Core Fixtures

```python
# tests/conftest.py
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@example.com",
        password="testpass",
        first_name="Test",
        last_name="User",
        is_active=True,
    )


@pytest.fixture
def authenticated_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client
```

> Always import `get_user_model()` in tests — never `django.contrib.auth.models.User`.

## Basic View Tests

```python
# tests/test_item_views.py
import pytest
from rest_framework import status
from .models import Item


@pytest.mark.django_db
class TestItemListCreateView:

    def test_list_requires_auth(self, client):
        res = client.get("/api/items/")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_items(self, authenticated_client):
        res = authenticated_client.get("/api/items/")
        assert res.status_code == status.HTTP_200_OK

    def test_create_item_success(self, authenticated_client):
        payload = {"name": "Test Item", "quantity": 10}
        res = authenticated_client.post("/api/items/", payload, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        assert Item.objects.count() == 1

    def test_create_item_validation(self, authenticated_client):
        res = authenticated_client.post("/api/items/", {}, format="json")
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert "name" in res.data
```

## Testing Services Independently

```python
# tests/test_item_services.py
import pytest
from .services import create_item
from .models import Item


@pytest.mark.django_db
class TestCreateItemService:

    def test_create_item_success(self, user):
        item, error = create_item(user=user, name="Test", quantity=5)
        assert error is None
        assert item is not None
        assert item.name == "Test"

    def test_create_item_invalid_quantity(self, user):
        item, error = create_item(user=user, name="Test", quantity=-1)
        assert item is None
        assert error is not None
```

## Testing Serializers

```python
# tests/test_item_serializers.py
import pytest
from .serializers import ItemCreateSerializer


class TestItemCreateSerializer:

    def test_valid_data(self):
        s = ItemCreateSerializer(data={"name": "Test", "quantity": 5})
        assert s.is_valid(), s.errors

    def test_missing_name(self):
        s = ItemCreateSerializer(data={"quantity": 5})
        assert not s.is_valid()
        assert "name" in s.errors
```

## Mocking External Services

```python
# tests/test_notifications.py
import pytest
from unittest.mock import patch


@pytest.mark.django_db
def test_create_item_sends_notification(user):
    with patch("apps.notifications.services.send_welcome") as mock_send:
        from .services import create_item
        item, error = create_item(user=user, name="Test", quantity=5)
        mock_send.assert_called_once()
```

## JWT Auth Tests

```python
# tests/test_auth.py
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestJWTAuth:

    def test_obtain_tokens(self, user):
        client = APIClient()
        res = client.post("/api/token/", {"email": user.email, "password": "testpass"}, format="json")
        assert res.status_code == status.HTTP_200_OK
        assert "access" in res.data

    def test_protected_endpoint(self, user):
        client = APIClient()
        token = str(RefreshToken.for_user(user).access_token)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = client.get("/api/items/")
        assert res.status_code != status.HTTP_401_UNAUTHORIZED
```

## Quick Reference

| Fixture | Returns |
|---|---|
| `user` | Active `User` instance |
| `authenticated_client` | `APIClient` with real JWT |

| Assert pattern | Use when |
|---|---|
| `assert res.status_code == 201` | Created |
| `assert Model.objects.count() == n` | DB side-effect check |
| `obj.refresh_from_db()` | Verify DB state after update |
| `mock.assert_called_once()` | External call fired |
| `assert "field" in res.data` | Error field present |
