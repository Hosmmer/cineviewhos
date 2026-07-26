from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from .models import Module


class ModuleService(BaseService):
    def get_tree_for_user(self, user):
        root_modules = Module.objects.filter(
            parent__isnull=True, is_active=True
        ).order_by("order", "name")

        visible_roots = []
        for module in root_modules:
            if not self._user_can_see(user, module):
                continue
            visible_roots.append(module)

        return visible_roots

    def _user_can_see(self, user, module):
        if not module.roles.exists():
            return True
        if not user.is_authenticated:
            return False
        return user.roles.filter(id__in=module.roles.values_list("id", flat=True)).exists()

    def create_module(self, **data) -> ServiceResult:
        module = Module.objects.create(**data)
        return self.success(data={"id": module.id, "name": module.name})

    def update_module(self, module, **data) -> ServiceResult:
        for field, value in data.items():
            setattr(module, field, value)
        module.save()
        return self.success(data={"id": module.id, "name": module.name})

    def delete_module(self, module) -> ServiceResult:
        module.delete()
        return self.success(status_code=204)
