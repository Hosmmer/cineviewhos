from djoser.serializers import UserSerializer as DjoserUserSerializer
from rest_framework import serializers

from apps.domains.movies.serializers import RelativeImageField


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
