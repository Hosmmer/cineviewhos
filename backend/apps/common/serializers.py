from djoser.serializers import UserSerializer as DjoserUserSerializer

from apps.movies.serializers import RelativeImageField


class UserSerializer(DjoserUserSerializer):
    avatar = RelativeImageField()

    class Meta(DjoserUserSerializer.Meta):
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "is_staff",
            "avatar",
        )
        read_only_fields = ("id", "email", "username", "is_staff")
