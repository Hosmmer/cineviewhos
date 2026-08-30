from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Actor


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
