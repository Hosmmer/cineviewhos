from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from .models import Actor, Author, Director, Genre, Movie


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


class DirectorService(BaseService):

    def create_director(
        self, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Director.objects.filter(name=name).first()
        if existing:
            return self.error("A director with this name already exists.", 400)
        director = Director.objects.create(
            name=name, birth_date=birth_date, city=city.strip()
        )
        return self.success(data={"id": director.id, "name": director.name})

    def update_director(
        self, director: Director, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Director.objects.filter(name=name).exclude(id=director.id).first()
        if existing:
            return self.error("A director with this name already exists.", 400)
        director.name = name
        director.birth_date = birth_date
        director.city = city.strip()
        director.save()
        return self.success(data={"id": director.id, "name": director.name})

    def soft_delete(self, director: Director) -> ServiceResult:
        director.is_active = False
        director.save()
        return self.success(status_code=204)


class AuthorService(BaseService):

    def create_author(
        self, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Author.objects.filter(name=name).first()
        if existing:
            return self.error("An author with this name already exists.", 400)
        author = Author.objects.create(
            name=name, birth_date=birth_date, city=city.strip()
        )
        return self.success(data={"id": author.id, "name": author.name})

    def update_author(
        self, author: Author, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Author.objects.filter(name=name).exclude(id=author.id).first()
        if existing:
            return self.error("An author with this name already exists.", 400)
        author.name = name
        author.birth_date = birth_date
        author.city = city.strip()
        author.save()
        return self.success(data={"id": author.id, "name": author.name})

    def soft_delete(self, author: Author) -> ServiceResult:
        author.is_active = False
        author.save()
        return self.success(status_code=204)


class ActorService(BaseService):

    def create_actor(
        self, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Actor.objects.filter(name=name).first()
        if existing:
            return self.error("An actor with this name already exists.", 400)
        actor = Actor.objects.create(
            name=name, birth_date=birth_date, city=city.strip()
        )
        return self.success(data={"id": actor.id, "name": actor.name})

    def update_actor(
        self, actor: Actor, name: str, birth_date=None, city: str = ""
    ) -> ServiceResult:
        name = name.strip()
        existing = Actor.objects.filter(name=name).exclude(id=actor.id).first()
        if existing:
            return self.error("An actor with this name already exists.", 400)
        actor.name = name
        actor.birth_date = birth_date
        actor.city = city.strip()
        actor.save()
        return self.success(data={"id": actor.id, "name": actor.name})

    def soft_delete(self, actor: Actor) -> ServiceResult:
        actor.is_active = False
        actor.save()
        return self.success(status_code=204)
