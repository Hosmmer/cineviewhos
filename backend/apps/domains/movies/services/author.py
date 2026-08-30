from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Author


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
