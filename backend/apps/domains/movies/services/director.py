from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Director


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
