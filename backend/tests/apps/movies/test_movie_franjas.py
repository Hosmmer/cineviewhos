import pytest
from datetime import time

from apps.domains.movies.models import Genre, Movie
from apps.domains.movies.serializers import MovieSerializer
from apps.domains.reservations.models import Franja


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
def franja(db):
    return Franja.objects.create(
        name="Noche", start_time=time(18, 0), end_time=time(23, 59)
    )


class TestMovieFranjas:
    @pytest.mark.django_db
    def test_write_franjas_via_serializer(self, movie, franja):
        serializer = MovieSerializer(movie, data={"franja_ids": [franja.id]}, partial=True)
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        movie.refresh_from_db()
        assert list(movie.franjas.values_list("id", flat=True)) == [franja.id]

    @pytest.mark.django_db
    def test_read_franjas_via_serializer(self, movie, franja):
        movie.franjas.set([franja.id])
        data = MovieSerializer(movie).data
        assert data["franjas"] == [{"id": franja.id, "name": "Noche"}]

    @pytest.mark.django_db
    def test_invalid_franja_id_rejected(self, movie):
        serializer = MovieSerializer(movie, data={"franja_ids": [999999]}, partial=True)
        assert not serializer.is_valid()

    @pytest.mark.django_db
    def test_clear_franjas_with_empty_list(self, movie, franja):
        movie.franjas.set([franja.id])
        serializer = MovieSerializer(movie, data={"franja_ids": []}, partial=True)
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        movie.refresh_from_db()
        assert movie.franjas.count() == 0
