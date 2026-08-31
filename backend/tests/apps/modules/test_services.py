import pytest

from apps.domains.modules.models import Module
from apps.domains.modules.services import ModuleService


class TestModuleService:
    @pytest.mark.django_db
    def test_get_tree_for_user_empty(self):
        service = ModuleService()
        assert service.get_tree_for_user(None) == []

    @pytest.mark.django_db
    def test_create_module(self):
        service = ModuleService()
        result = service.create_module(
            name="Movies", slug="movies", icon="Film", route="/movies", order=1
        )
        assert result.success
        assert Module.objects.filter(slug="movies").exists()

    @pytest.mark.django_db
    def test_update_module(self):
        module = Module.objects.create(name="A", slug="a", icon="X")
        service = ModuleService()
        result = service.update_module(module, name="B")
        assert result.success
        module.refresh_from_db()
        assert module.name == "B"

    @pytest.mark.django_db
    def test_delete_module(self):
        module = Module.objects.create(name="A", slug="a", icon="X")
        service = ModuleService()
        result = service.delete_module(module)
        assert result.success
        assert result.status_code == 204
        assert not Module.objects.filter(id=module.id).exists()
