import pytest
from datetime import time, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.domains.movies.models import Genre, Movie
from apps.domains.reservations.models import Cine, Franja, Funcion, Reserva, Sala, Seat
from apps.domains.reservations.services import (
    CineService,
    FranjaService,
    FuncionService,
    ReservaService,
    SalaService,
    classify_franja,
)

User = get_user_model()


def _seats(*seat_ids, name="Test Person"):
    return [{"seat_id": seat_id, "person_name": name} for seat_id in seat_ids]


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
def cine(db):
    return Cine.objects.create(name="Cine Test")


@pytest.fixture
def sala(db, cine):
    return Sala.objects.create(cine=cine, number=1, rows=5, cols=8)


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


@pytest.fixture
def franja_noche(db):
    return Franja.objects.create(
        name="Noche", start_time=time(18, 0), end_time=time(23, 59)
    )


class TestSalaService:
    @pytest.mark.django_db
    def test_create_sala_generates_seats(self, cine):
        service = SalaService()
        result = service.create_sala(cine_id=cine.id, number=2, rows=3, cols=4)
        assert result.success
        assert result.status_code == 201
        assert result.data["rows"] == 3
        assert result.data["cols"] == 4
        assert Seat.objects.filter(sala_id=result.data["id"]).count() == 12

    @pytest.mark.django_db
    def test_create_sala_duplicate_number(self, sala, cine):
        service = SalaService()
        result = service.create_sala(cine_id=cine.id, number=1, rows=2, cols=2)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_sala_invalid_dimensions(self, cine):
        service = SalaService()
        result = service.create_sala(cine_id=cine.id, number=1, rows=0, cols=5)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_sala_invalid_cine(self):
        service = SalaService()
        result = service.create_sala(cine_id=99999, number=1, rows=2, cols=2)
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_update_sala_number(self, sala, cine):
        service = SalaService()
        result = service.update_sala(sala, cine_id=cine.id, number=2)
        assert result.success
        sala.refresh_from_db()
        assert sala.number == 2

    @pytest.mark.django_db
    def test_update_sala_duplicate_number(self, sala, cine):
        Sala.objects.create(cine=cine, number=2, rows=2, cols=2)
        service = SalaService()
        result = service.update_sala(sala, cine_id=cine.id, number=2)
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


class TestCineService:
    @pytest.mark.django_db
    def test_create_cine(self):
        service = CineService()
        result = service.create_cine(name="Cine Guatapuri")
        assert result.success
        assert result.status_code == 201
        assert Cine.objects.filter(name="Cine Guatapuri").exists()

    @pytest.mark.django_db
    def test_create_cine_duplicate(self, cine):
        service = CineService()
        result = service.create_cine(name="Cine Test")
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_update_cine(self, cine):
        service = CineService()
        result = service.update_cine(cine, name="Cine Renamed")
        assert result.success
        cine.refresh_from_db()
        assert cine.name == "Cine Renamed"

    @pytest.mark.django_db
    def test_soft_delete_cine(self, cine):
        service = CineService()
        result = service.soft_delete(cine)
        assert result.success
        cine.refresh_from_db()
        assert not cine.is_active


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


class TestFranjaService:
    @pytest.mark.django_db
    def test_create_franja_success(self):
        service = FranjaService()
        result = service.create_franja(
            name="Manana", start_time=time(6, 0), end_time=time(12, 0)
        )
        assert result.success
        assert result.status_code == 201
        assert Franja.objects.filter(name="Manana").exists()

    @pytest.mark.django_db
    def test_create_franja_duplicate_name(self, franja_noche):
        service = FranjaService()
        result = service.create_franja(
            name="Noche", start_time=time(18, 0), end_time=time(23, 0)
        )
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_franja_invalid_range(self):
        service = FranjaService()
        result = service.create_franja(
            name="Invalid", start_time=time(18, 0), end_time=time(6, 0)
        )
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_update_franja(self, franja_noche):
        service = FranjaService()
        result = service.update_franja(
            franja_noche,
            name="Noche Tarde",
            start_time=time(18, 0),
            end_time=time(23, 59),
        )
        assert result.success
        franja_noche.refresh_from_db()
        assert franja_noche.name == "Noche Tarde"

    @pytest.mark.django_db
    def test_soft_delete_franja(self, franja_noche):
        service = FranjaService()
        result = service.soft_delete(franja_noche)
        assert result.success
        franja_noche.refresh_from_db()
        assert not franja_noche.is_active


class TestClassifyFranja:
    @pytest.mark.django_db
    def test_classify_matches(self, franja_noche):
        start = timezone.make_aware(
            timezone.datetime(2026, 8, 16, 21, 0), timezone.utc
        )
        franja = classify_franja(start)
        assert franja is not None
        assert franja.name == "Noche"

    @pytest.mark.django_db
    def test_classify_none(self):
        start = timezone.make_aware(
            timezone.datetime(2026, 8, 16, 15, 0), timezone.utc
        )
        assert classify_franja(start) is None

    @pytest.mark.django_db
    def test_classify_recomputes_on_range_change(self):
        Franja.objects.create(
            name="Manana", start_time=time(6, 0), end_time=time(12, 0)
        )
        start = timezone.make_aware(
            timezone.datetime(2026, 8, 16, 11, 0), timezone.utc
        )
        assert classify_franja(start).name == "Manana"

        # change "Manana" to 06:00-10:00 -> 11:00 now has no band
        Franja.objects.filter(name="Manana").update(end_time=time(10, 0))
        assert classify_franja(start) is None

    @pytest.mark.django_db
    def test_classify_ignores_inactive(self, franja_noche):
        franja_noche.is_active = False
        franja_noche.save()
        start = timezone.make_aware(
            timezone.datetime(2026, 8, 16, 21, 0), timezone.utc
        )
        assert classify_franja(start) is None


class TestReservaService:
    @pytest.mark.django_db
    def test_create_reserva_success(self, user, funcion, seats):
        service = ReservaService()
        result = service.create_reserva(
            user=user,
            funcion=funcion,
            seats=_seats(seats[0].id, seats[1].id),
        )
        assert result.success
        assert result.status_code == 201
        assert result.data["status"] == "confirmed"

        reserva = Reserva.objects.get(id=result.data["id"])
        assert reserva.reserva_seats.count() == 2

    @pytest.mark.django_db
    def test_create_reserva_persists_person_name(self, user, funcion, seats):
        service = ReservaService()
        result = service.create_reserva(
            user=user,
            funcion=funcion,
            seats=[
                {"seat_id": seats[0].id, "person_name": "Ana Perez"},
                {"seat_id": seats[1].id, "person_name": "Luis Gomez"},
            ],
        )
        assert result.success
        reserva = Reserva.objects.get(id=result.data["id"])
        names = {rs.seat_id: rs.person_name for rs in reserva.reserva_seats.all()}
        assert names[seats[0].id] == "Ana Perez"
        assert names[seats[1].id] == "Luis Gomez"

    @pytest.mark.django_db
    def test_create_reserva_no_seats(self, user, funcion):
        service = ReservaService()
        result = service.create_reserva(user=user, funcion=funcion, seats=[])
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_reserva_blank_person_name_rejected(self, user, funcion, seats):
        service = ReservaService()
        result = service.create_reserva(
            user=user,
            funcion=funcion,
            seats=[{"seat_id": seats[0].id, "person_name": "   "}],
        )
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_create_reserva_seat_already_taken(self, user, funcion, seats):
        service = ReservaService()
        service.create_reserva(
            user=user, funcion=funcion, seats=_seats(seats[0].id)
        )

        other = User.objects.create_user(username="other", password="pw123")
        result = service.create_reserva(
            user=other, funcion=funcion, seats=_seats(seats[0].id, seats[1].id)
        )
        assert not result.success
        assert result.status_code == 409

    @pytest.mark.django_db
    def test_create_reserva_seat_wrong_sala(self, user, funcion, cine):
        other_sala = Sala.objects.create(cine=cine, number=2, rows=2, cols=2)
        other_seats = list(Seat.objects.filter(sala=other_sala))

        service = ReservaService()
        result = service.create_reserva(
            user=user,
            funcion=funcion,
            seats=_seats(other_seats[0].id),
        )
        assert not result.success
        assert result.status_code == 400

    @pytest.mark.django_db
    def test_anular_reserva_by_owner(self, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seats=_seats(seats[0].id)
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
            user=user, funcion=funcion, seats=_seats(seats[0].id)
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])

        result = service.anular_reserva(reserva, user=other_user)
        assert not result.success
        assert result.status_code == 403

    @pytest.mark.django_db
    def test_anular_reserva_by_admin(self, admin_user, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seats=_seats(seats[0].id)
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])

        result = service.anular_reserva(reserva, user=admin_user)
        assert result.success

    @pytest.mark.django_db
    def test_anular_already_anulada(self, user, funcion, seats):
        service = ReservaService()
        create_result = service.create_reserva(
            user=user, funcion=funcion, seats=_seats(seats[0].id)
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
            user=user, funcion=funcion, seats=_seats(seats[0].id)
        )
        reserva = Reserva.objects.get(id=create_result.data["id"])
        service.anular_reserva(reserva, user=user)

        result = service.create_reserva(
            user=user, funcion=funcion, seats=_seats(seats[0].id)
        )
        assert result.success
