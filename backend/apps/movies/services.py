from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from .models import Genre, Movie


class GenreService(BaseService):

    def create_genre(self, name: str) -> ServiceResult:
        name = name.strip()
        existing = Genre.objects.filter(name=name).first()
        if existing:
            return self.error("A genre with this name already exists.", 400)
        genre = Genre.objects.create(name=name)
        return self.success(data={"id": genre.id, "name": genre.name})

    def update_genre(self, genre: Genre, name: str) -> ServiceResult:
        name = name.strip()
        existing = Genre.objects.filter(name=name).exclude(id=genre.id).first()
        if existing:
            return self.error("A genre with this name already exists.", 400)
        genre.name = name
        genre.save()
        return self.success(data={"id": genre.id, "name": genre.name})

    def delete_genre(self, genre: Genre) -> ServiceResult:
        if genre.movies.exists():
            return self.error(
                "Cannot delete genre because it is referenced by one or more movies.",
                400,
            )
        genre.delete()
        return self.success(status_code=204)


class MovieService(BaseService):

    def soft_delete(self, movie: Movie) -> ServiceResult:
        movie.is_active = False
        movie.save()
        return self.success(status_code=204)
