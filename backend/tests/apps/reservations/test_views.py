import pytest
from datetime import time, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.domains.movies.models import Genre, Movie
from apps.domains.reservations.models import Cine, Franja, Funcion, Sala, Seat

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
def cine(db):
    return Cine.objects.create(name="Cine Test")


@pytest.fixture
def sala(db, cine):
    sala = Sala.objects.create(cine=cine, number=1, rows=5, cols=8)
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


@pytest.fixture
def franja_noche(db):
    return Franja.objects.create(
        name="Noche", start_time=time(18, 0), end_time=time(23, 59)
    )


def _seats_payload(*seat_ids, name="Test Person"):
    return [{"seat_id": seat_id, "person_name": name} for seat_id in seat_ids]


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
    def test_list_funcion_includes_franja(self, auth_client, movie, funcion, franja_noche):
        funcion.start_time = timezone.make_aware(
            timezone.datetime(2026, 8, 16, 21, 0), timezone.utc
        )
        funcion.save()
        response = auth_client.get(f"/api/funciones/?movie={movie.id}")
        assert response.status_code == 200
        results = response.json()["results"]
        assert results[0]["franja"] == "Noche"

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
        assert "franja" in data

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
            "seats": _seats_payload(seats[0].id, seats[1].id),
        }, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "confirmed"

    @pytest.mark.django_db
    def test_create_reserva_blank_name_rejected(self, auth_client, funcion, seats):
        response = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": [{"seat_id": seats[0].id, "person_name": "  "}],
        }, format="json")
        assert response.status_code == 400

    @pytest.mark.django_db
    def test_create_reserva_seat_taken(
        self, auth_client, client_user, funcion, seats
    ):
        auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": _seats_payload(seats[0].id),
        }, format="json")

        response = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": _seats_payload(seats[0].id, seats[1].id),
        }, format="json")
        assert response.status_code == 409

    @pytest.mark.django_db
    def test_list_my_reservas(self, auth_client, client_user, funcion, seats):
        auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": _seats_payload(seats[0].id),
        }, format="json")

        response = auth_client.get("/api/reservas/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_public_reserva_omits_person_name(self, auth_client, client_user, funcion, seats):
        create_resp = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": [{"seat_id": seats[0].id, "person_name": "Ana Perez"}],
        }, format="json")
        reserva_id = create_resp.json()["id"]

        response = auth_client.get(f"/api/reservas/{reserva_id}/")
        assert response.status_code == 200
        seats_data = response.json()["seats"]
        assert seats_data
        assert "person_name" not in seats_data[0]

    @pytest.mark.django_db
    def test_anular_own_reserva(self, auth_client, client_user, funcion, seats):
        create_resp = auth_client.post("/api/reservas/", {
            "funcion_id": funcion.id,
            "seats": _seats_payload(seats[0].id),
        }, format="json")
        reserva_id = create_resp.json()["id"]

        response = auth_client.post(f"/api/reservas/{reserva_id}/anular/")
        assert response.status_code == 200
        assert response.json()["status"] == "anulada"

    @pytest.mark.django_db
    def test_cannot_anular_others_reserva(
        self, auth_client, admin_client, admin_user, funcion, seats
    ):
        create_resp = admin_client.post("/api/admin/reservas/", {
            "funcion_id": funcion.id,
            "seats": _seats_payload(seats[0].id),
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
    def test_create_sala(self, admin_client, cine):
        response = admin_client.post("/api/admin/salas/", {
            "cine": cine.id,
            "number": 2,
            "rows": 5,
            "cols": 10,
        }, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["number"] == 2
        assert data["cine"] == cine.id

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
            user=client_user,
            funcion=funcion,
            seats=[{"seat_id": seats[0].id, "person_name": "Ana Perez"}],
        )

        response = admin_client.get("/api/admin/reservas/")
        assert response.status_code == 200
        data = response.json()
        results = data["results"]
        assert len(results) == 1

    @pytest.mark.django_db
    def test_admin_list_reservas_includes_person_name(
        self, admin_client, client_user, funcion, seats
    ):
        from apps.domains.reservations.services import ReservaService
        service = ReservaService()
        service.create_reserva(
            user=client_user,
            funcion=funcion,
            seats=[{"seat_id": seats[0].id, "person_name": "Ana Perez"}],
        )

        response = admin_client.get("/api/admin/reservas/")
        assert response.status_code == 200
        results = response.json()["results"]
        assert results[0]["seats"][0]["person_name"] == "Ana Perez"

    @pytest.mark.django_db
    def test_admin_create_reserva_on_behalf(self, admin_client, funcion, seats):
        response = admin_client.post("/api/admin/reservas/", {
            "funcion_id": funcion.id,
            "seats": [{"seat_id": seats[0].id, "person_name": "Cliente Uno"}],
        }, format="json")
        assert response.status_code == 201
        assert response.json()["status"] == "confirmed"

    @pytest.mark.django_db
    def test_admin_anular_reserva(
        self, admin_client, client_user, funcion, seats
    ):
        from apps.domains.reservations.services import ReservaService
        service = ReservaService()
        create_result = service.create_reserva(
            user=client_user,
            funcion=funcion,
            seats=[{"seat_id": seats[0].id, "person_name": "Ana Perez"}],
        )
        reserva_id = create_result.data["id"]

        response = admin_client.post(f"/api/admin/reservas/{reserva_id}/anular/")
        assert response.status_code == 200
        assert response.json()["status"] == "anulada"


class TestAdminFranjaEndpoints:
    @pytest.mark.django_db
    def test_create_franja(self, admin_client):
        response = admin_client.post("/api/admin/franjas/", {
            "name": "Tarde",
            "start_time": "12:00:00",
            "end_time": "18:00:00",
        }, format="json")
        assert response.status_code == 201
        assert response.json()["name"] == "Tarde"

    @pytest.mark.django_db
    def test_create_franja_invalid_range(self, admin_client):
        response = admin_client.post("/api/admin/franjas/", {
            "name": "Invalid",
            "start_time": "18:00:00",
            "end_time": "06:00:00",
        }, format="json")
        assert response.status_code == 400

    @pytest.mark.django_db
    def test_list_franjas(self, admin_client, franja_noche):
        response = admin_client.get("/api/admin/franjas/")
        assert response.status_code == 200
        assert response.json()["count"] == 1

    @pytest.mark.django_db
    def test_update_franja(self, admin_client, franja_noche):
        response = admin_client.patch(f"/api/admin/franjas/{franja_noche.id}/", {
            "name": "Noche Extendida",
        }, format="json")
        assert response.status_code == 200
        assert response.json()["name"] == "Noche Extendida"

    @pytest.mark.django_db
    def test_delete_franja_soft(self, admin_client, franja_noche):
        response = admin_client.delete(f"/api/admin/franjas/{franja_noche.id}/")
        assert response.status_code == 204
        franja_noche.refresh_from_db()
        assert not franja_noche.is_active

    @pytest.mark.django_db
    def test_franja_requires_admin(self, auth_client):
        response = auth_client.get("/api/admin/franjas/")
        assert response.status_code == 403


class TestAdminCineEndpoints:
    @pytest.mark.django_db
    def test_create_cine(self, admin_client):
        response = admin_client.post("/api/admin/cines/", {
            "name": "Guatapuri",
        }, format="json")
        assert response.status_code == 201
        assert response.json()["name"] == "Guatapuri"

    @pytest.mark.django_db
    def test_list_cines(self, admin_client, cine):
        response = admin_client.get("/api/admin/cines/")
        assert response.status_code == 200
        assert response.json()["count"] == 1

    @pytest.mark.django_db
    def test_cine_schedule(self, admin_client, cine, funcion):
        response = admin_client.get(f"/api/admin/cines/{cine.id}/schedule/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Cine Test"
        assert len(data["salas"]) == 1
        assert data["salas"][0]["number"] == 1
        assert len(data["salas"][0]["funciones"]) == 1
        assert data["salas"][0]["funciones"][0]["movie_title"] == "Test Movie"
