import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.domains.movies.models import Genre, Movie
from apps.domains.reservations.models import Funcion, Reserva, ReservaSeat, Sala, Seat
from apps.domains.reservations.services import FuncionService, ReservaService, SalaService

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123")


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin", password="admin123", is_staff=True
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="otheruser", password="other123"
    )


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
    return Sala.objects.create(name="Sala 1", rows=5, cols=8)


@pytest.fixture
def seats(sala):
    return list(Seat.objects.filter(sala=sala).order_by("row", "col"))


@pytest.fixture
def funcion(db, movie, sala):
    return Funcion.objects.create(
        movie=movie,
        sala=sala,
        start_time=timezone.now() + timedelta(hours=2),
    )


class TestSalaService:
    @pytest.mark.django_db
    def test_create_sala_generates_seats(self):
        service = SalaService()
        result = service.create_sala(name="Sala 2", rows=3, cols=4)
        assert result.success
        assert result.status_code == 201
        assert result.data["rows"] == 3
        assert result.data["cols"] == 4
        assert Seat.objects.filter(sala_id=result.data["id"]).count() == 12

    @pytest.mark.django_db
    def test_create_sala_duplicate_name(self, sala):
        service = SalaService()
        result = service.create_sala(name="Sala 1", rows=2, cols=2)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_sala_invalid_dimensions(self):
        service = SalaService()
        result = service.create_sala(name="Bad Sala", rows=0, cols=5)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_update_sala_name(self, sala):
        service = SalaService()
        result = service.update_sala(sala, name="Sala Updated")
        assert result.success
        sala.refresh_from_db()
        assert sala.name == "Sala Updated"

    @pytest.mark.django_db
    def test_update_sala_duplicate_name(self, sala):
        Sala.objects.create(name="Other Sala", rows=2, cols=2)
        service = SalaService()
        result = service.update_sala(sala, name="Other Sala")
        assert not result.success

    @pytest.mark.django_db
    def test_delete_sala_with_active_funcion_fails(self, sala, funcion):
        service = SalaService()
        result = service.delete_sala(sala)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_delete_sala_without_funcion(self, sala):
        service = SalaService()
        result = service.delete_sala(sala)
        assert result.success
        assert result.status_code == 204


class TestFuncionService:
    @pytest.mark.django_db
    def test_create_funcion_success(self, movie, sala):
        service = FuncionService()
        start = timezone.now() + timedelta(hours=3)
        result = service.create_funcion(movie=movie, sala=sala, start_time=start)
        assert result.success
        assert result.status_code == 201

    @pytest.mark.django_db
    def test_create_funcion_overlap_rejected(self, movie, sala, funcion):
        service = FuncionService()
        start = funcion.start_time + timedelta(minutes=30)
        result = service.create_funcion(movie=movie, sala=sala, start_time=start)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_funcion_no_overlap_after_end(self, movie, sala, funcion):
        service = FuncionService()
        start = funcion.start_time + timedelta(minutes=movie.duration_minutes + 5)
        result = service.create_funcion(movie=movie, sala=sala, start_time=start)
        assert result.success

    @pytest.mark.django_db
    def test_soft_delete_funcion(self, funcion):
        service = FuncionService()
        result = service.soft_delete(funcion)
        assert result.success
        funcion.refresh_from_db()
        assert not funcion.is_active


class TestReservaService:
    @pytest.mark.django_db
    def test_create_reserva_success(self, user, funcion, seats):
        service = ReservaService()
        seat_ids = [seats[0].id, seats[1].id]
        result = service.create_reserva(user=user, funcion=funcion, seat_ids=seat_ids)
        assert result.success
        assert result.status_code == 201
        assert result.data["status"] == "confirmed"

        reserva = Reserva.objects.get(id=result.data["id"])
        assert reserva.reserva_seats.count() == 2

    @pytest.mark.django_db
    def test_create_reserva_no_seats(self, user, funcion):
        service = ReservaService()
        result = service.create_reserva(user=user, funcion=funcion, seat_ids=[])
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_reserva_seat_already_taken(self, user, funcion, seats):
        service = ReservaService()
        service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )

        other = User.objects.create_user(username="other", password="pw123")
        result = service.create_reserva(
            user=other, funcion=funcion, seat_ids=[seats[0].id, seats[1].id]
        )
        assert not result.success
        assert result.status_code == 409

    @pytest.mark.django_db
    def test_create_reserva_seat_wrong_sala(self, user, funcion):
        other_sala = Sala.objects.create(name="Sala Other", rows=2, cols=2)
        other_seats = list(Seat.objects.filter(sala=other_sala))

        service = ReservaService()
        result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[other_seats[0].id]
        )
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_anular_reserva_by_owner(self, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])

        result = service.anular_reserva(reserva, user=user)
        assert result.success
        reserva.refresh_from_db()
        assert reserva.status == "anulada"

    @pytest.mark.django_db
    def test_anular_reserva_by_other_user_forbidden(
        self, user, other_user, funcion, seats
    ):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])

        result = service.anular_reserva(reserva, user=other_user)
        assert not result.success
        assert result.status_code == 403

    @pytest.mark.django_db
    def test_anular_reserva_by_admin(self, admin_user, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])

        result = service.anular_reserva(reserva, user=admin_user)
        assert result.success

    @pytest.mark.django_db
    def test_anular_already_anulada(self, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])
        service.anular_reserva(reserva, user=user)

        result = service.anular_reserva(reserva, user=user)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_anulada_seat_becomes_available(self, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])
        service.anular_reserva(reserva, user=user)

        result = service.create_reserva(
            user=user, funcion=funcion, seat_ids=[seats[0].id]
        )
        assert result.success
