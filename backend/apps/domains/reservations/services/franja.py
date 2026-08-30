from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Franja


def get_active_franjas() -> list[Franja]:
    return list(Franja.objects.filter(is_active=True).order_by("start_time"))


def classify_franja(start_time, franjas=None) -> Franja | None:
    """Return the active Franja whose [start_time, end_time) contains start_time's
    time-of-day, or None if no band matches (rendered as "Sin franja")."""
    if start_time is None:
        return None
    t = start_time.time() if hasattr(start_time, "time") else start_time
    franjas = franjas if franjas is not None else get_active_franjas()
    for franja in franjas:
        if franja.start_time <= t < franja.end_time:
            return franja
    return None


class FranjaService(BaseService):

    def create_franja(self, name: str, start_time, end_time) -> ServiceResult:
        name = name.strip()
        if Franja.objects.filter(name=name).exists():
            return self.error("A franja with this name already exists.", 400)
        if start_time >= end_time:
            return self.error("start_time must be before end_time.", 400)

        franja = Franja.objects.create(
            name=name, start_time=start_time, end_time=end_time
        )
        return self.success(
            data={"id": franja.id, "name": franja.name},
            status_code=201,
        )

    def update_franja(self, franja: Franja, name: str, start_time, end_time) -> ServiceResult:
        name = name.strip()
        existing = Franja.objects.filter(name=name).exclude(id=franja.id).first()
        if existing:
            return self.error("A franja with this name already exists.", 400)
        if start_time >= end_time:
            return self.error("start_time must be before end_time.", 400)

        franja.name = name
        franja.start_time = start_time
        franja.end_time = end_time
        franja.save()
        return self.success(data={"id": franja.id, "name": franja.name})

    def soft_delete(self, franja: Franja) -> ServiceResult:
        franja.is_active = False
        franja.save()
        return self.success(status_code=204)
