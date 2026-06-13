import pytest
from django.urls import reverse


class TestHealthEndpoint:
    @pytest.mark.django_db
    def test_health_ok(self, api_client):
        url = reverse("health")
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
