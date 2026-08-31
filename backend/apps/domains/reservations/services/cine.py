from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Cine


class CineService(BaseService):

    def create_cine(self, name: str) -> ServiceResult:
        name = name.strip()
        if Cine.objects.filter(name=name).exists():
            return self.error("A cine with this name already exists.", 400)

        cine = Cine.objects.create(name=name)
        return self.success(data={"id": cine.id, "name": cine.name}, status_code=201)

    def update_cine(self, cine: Cine, name: str) -> ServiceResult:
        name = name.strip()
        existing = Cine.objects.filter(name=name).exclude(id=cine.id).first()
        if existing:
            return self.error("A cine with this name already exists.", 400)
        cine.name = name
        cine.save()
        return self.success(data={"id": cine.id, "name": cine.name})

    def soft_delete(self, cine: Cine) -> ServiceResult:
        if cine.salas.filter(funciones__is_active=True).exists():
            return self.error("Cannot delete cine because it has active funciones.", 400)
        cine.is_active = False
        cine.save()
        return self.success(status_code=204)
