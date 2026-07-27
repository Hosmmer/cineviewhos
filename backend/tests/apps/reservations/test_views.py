import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.domains.movies.models import Genre, Movie
from apps.domains.reservations.models import Funcion, Sala, Seat

User = get_user_model()


@pytest.fixture
def client_user(db):
    user = User.objects.create_user(username="client", password="client123")
    return user


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin", password="admin123", is_staff=True
    )


@pytest.fixture
def auth_client(client_user):
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken
    client = APIClient()
    token = str(RefreshToken.for_user(client_user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def admin_client(admin_user):
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken
    client = APIClient()
    token = str(RefreshToken.for_user(admin_user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def genre(db):
    return Genre.objects.create(name="Action")


@pytest.fixture
def movie(db, genre):
    return Movie.objects.create(
        title="Test Movie",
        description="A test movie description",
        duration_minutes=120,
        release_year=2024,
        poster="posters/test.jpg",
        price=15000,
        genre=genre,
    )


@pytest.fixture
def sala(db):
    sala = Sala.objects.create(name="Sala 1", rows=5, cols=8)
    return sala


@pytest.fixture
def funcion(db, movie, sala):
    return Funcion.objects.create(
        movie=movie,
        sala=sala,
        start_time=timezone.now() + timedelta(hours=2),
    )


@pytest.fixture
def seats(sala):
    return list(Seat.objects.filter(sala=sala).order_by("row", "col"))


class TestPublicFuncionEndpoints:
    @pytest.mark.django_db
    def test_list_funcion_for_movie(self, auth_client, movie, funcion):
        response = auth_client.get(f"/api/funciones/?movie={movie.id}")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) >= 1
        assert results[0]["movie_title"] == "Test Movie"

    @pytest.mark.django_db
    def test_list_funcion_inactive_hidden(self, auth_client, movie, funcion):
        funcion.is_active = False
        funcion.save()
        response = auth_client.get(f"/api/funciones/?movie={movie.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0

    @pytest.mark.django_db
    def test_retrieve_funcion_detail(self, auth_client, funcion):
        response = auth_client.get(f"/api/funciones/{funcion.id}/")
        assert response.status_code == 200
        data = response.json()
        assert data["movie_title"] == "Test Movie"
        assert data["sala_rows"] == 5
        assert data["sala_cols"] == 8

    @pytest.mark.django_db
    def test_list_seats_with_occupation(self, auth_client, funcion, seats):
        response = auth_client.get(f"/api/asientos/?funcion={funcion.id}")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert data["count"] == 40
        assert all(not s["is_occupied"] for s in results)


class TestPublicReservaEndpoints:
    @pytest.mark.django_db
    def test_create_reserva_success(self, auth_client, client_user, funcion, seats):
        response = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id, seats[1].id],
        }, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "confirmed"

    @pytest.mark.django_db
    def test_create_reserva_seat_taken(
        self, auth_client, client_user, funcion, seats
    ):
        auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id],
        }, format="json")

        response = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id, seats[1].id],
        }, format="json")
        assert response.status_code == 409

    @pytest.mark.django_db
    def test_list_my_reservas(self, auth_client, client_user, funcion, seats):
        auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id],
        }, format="json")

        response = auth_client.get("/api/reservas/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_anular_own_reserva(self, auth_client, client_user, funcion, seats):
        create_resp = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id],
        }, format="json")
        reserva_id = create_resp.json()["id"]

        response = auth_client.post(f"/api/reservas/{reserva_id}/anular/")
        assert response.status_code == 200
        assert response.json()["status"] == "anulada"

    @pytest.mark.django_db
    def test_cannot_anular_others_reserva(
        self, auth_client, admin_client, admin_user, funcion, seats
    ):
        create_resp = admin_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seat_ids": [seats[0].id],
        }, format="json")
        reserva_id = create_resp.json()["id"]

        response = auth_client.post(f"/api/reservas/{reserva_id}/anular/")
        assert response.status_code == 404


class TestAdminEndpoints:
    @pytest.mark.django_db
    def test_list_salas(self, admin_client, sala):
        response = admin_client.get("/api/admin/salas/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_create_sala(self, admin_client):
        response = admin_client.post("/api/admin/salas/", {
            "name": "New Sala",
            "rows": 5,
            "cols": 10,
        }, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Sala"

    @pytest.mark.django_db
    def test_delete_sala_without_funcion(self, admin_client, sala):
        response = admin_client.delete(f"/api/admin/salas/{sala.id}/")
        assert response.status_code == 204

    @pytest.mark.django_db
    def test_delete_sala_with_funcion_fails(self, admin_client, sala, funcion):
        response = admin_client.delete(f"/api/admin/salas/{sala.id}/")
        assert response.status_code == 400

    @pytest.mark.django_db
    def test_list_funciones_admin(self, admin_client, funcion):
        response = admin_client.get("/api/admin/funciones/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_create_funcion_admin(self, admin_client, movie, sala):
        start = timezone.now() + timedelta(hours=5)
        response = admin_client.post("/api/admin/funciones/", {
            "movie": movie.id,
            "sala": sala.id,
            "start_time": start.isoformat(),
        }, format="json")
        assert response.status_code == 201

    @pytest.mark.django_db
    def test_list_reservas_admin(self, admin_client, client_user, funcion, seats):
        from apps.domains.reservations.services import ReservaService
        service = ReservaService()
        service.create_reserva(
            user=client_user, funcion=funcion, seat_ids=[seats[0].id]
        )

        response = admin_client.get("/api/admin/reservas/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_admin_anular_reserva(
        self, admin_client, client_user, funcion, seats
    ):
        from apps.domains.reservations.services import ReservaService
        service = ReservaService()
        create_result = service.create_reserva(
            user=client_user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva_id = create_result.data["id"]

        response = admin_client.post(f"/api/admin/reservas/{reserva_id}/anular/")
        assert response.status_code == 200
        assert response.json()["status"] == "anulada"
