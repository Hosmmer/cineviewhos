from djoser.serializers import UserSerializer as DjoserUserSerializer
from rest_framework import serializers

from apps.domains.movies.serializers import RelativeImageField
from apps.common.models import Role, User


class UserSerializer(DjoserUserSerializer):
    avatar = RelativeImageField()
    roles = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta(DjoserUserSerializer.Meta):
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "is_staff",
            "avatar",
            "roles",
        )
        read_only_fields = ("id", "email", "username", "is_staff")


class UserAdminSerializer(serializers.ModelSerializer):
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=Role.objects.all())

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "is_staff", "is_active", "roles")
        read_only_fields = ("id", "username", "email")
