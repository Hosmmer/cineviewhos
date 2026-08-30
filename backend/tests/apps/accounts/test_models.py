import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Role

User = get_user_model()


class TestUserRoles:
    @pytest.mark.django_db
    def test_assign_default_role_on_create(self):
        Role.objects.create(name="Cliente", slug="cliente")
        user = User.objects.create_user(username="u1", password="pw123")
        assert user.roles.filter(slug="cliente").exists()

    @pytest.mark.django_db
    def test_no_default_role_when_cliente_missing(self):
        user = User.objects.create_user(username="u2", password="pw123")
        assert user.roles.count() == 0

    @pytest.mark.django_db
    def test_sync_staff_with_admin_role(self):
        Role.objects.create(name="Admin", slug="admin")
        user = User.objects.create_user(username="u3", password="pw123")
        user.roles.add(Role.objects.get(slug="admin"))
        user.refresh_from_db()
        assert user.is_staff

    @pytest.mark.django_db
    def test_sync_staff_removed_without_admin_role(self):
        role = Role.objects.create(name="Admin", slug="admin")
        user = User.objects.create_user(username="u4", password="pw123")
        user.roles.add(role)
        user.refresh_from_db()
        assert user.is_staff

        user.roles.remove(role)
        user.refresh_from_db()
        assert not user.is_staff


class TestRoleModel:
    @pytest.mark.django_db
    def test_role_str(self):
        role = Role.objects.create(name="Cliente", slug="cliente")
        assert str(role) == "Cliente"
