import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Role
from apps.accounts.permissions import HasRole, IsAdminUser, IsOwnerOrAdmin

User = get_user_model()


class _Request:
    def __init__(self, user):
        self.user = user


class TestIsAdminUser:
    @pytest.mark.django_db
    def test_staff_user_allowed(self):
        user = User.objects.create_user(username="a", password="pw", is_staff=True)
        assert IsAdminUser().has_permission(_Request(user), None)

    @pytest.mark.django_db
    def test_user_with_admin_role_allowed(self):
        role = Role.objects.create(name="Admin", slug="admin")
        user = User.objects.create_user(username="b", password="pw")
        user.roles.add(role)
        assert IsAdminUser().has_permission(_Request(user), None)

    @pytest.mark.django_db
    def test_regular_user_denied(self):
        user = User.objects.create_user(username="c", password="pw")
        assert not IsAdminUser().has_permission(_Request(user), None)


class TestHasRole:
    @pytest.mark.django_db
    def test_user_with_role_allowed(self):
        role = Role.objects.create(name="Admin", slug="admin")
        user = User.objects.create_user(username="d", password="pw")
        user.roles.add(role)
        assert HasRole("admin")().has_permission(_Request(user), None)

    @pytest.mark.django_db
    def test_user_without_role_denied(self):
        user = User.objects.create_user(username="e", password="pw")
        assert not HasRole("admin")().has_permission(_Request(user), None)


class TestIsOwnerOrAdmin:
    @pytest.mark.django_db
    def test_staff_can_access_any(self):
        user = User.objects.create_user(username="f", password="pw", is_staff=True)
        assert IsOwnerOrAdmin().has_object_permission(_Request(user), None, object())

    @pytest.mark.django_db
    def test_owner_can_access(self):
        user = User.objects.create_user(username="g", password="pw")
        obj = type("Obj", (), {"user": user})()
        assert IsOwnerOrAdmin().has_object_permission(_Request(user), None, obj)

    @pytest.mark.django_db
    def test_non_owner_denied(self):
        user = User.objects.create_user(username="h", password="pw")
        other = User.objects.create_user(username="i", password="pw")
        obj = type("Obj", (), {"user": other})()
        assert not IsOwnerOrAdmin().has_object_permission(_Request(user), None, obj)
