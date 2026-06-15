from djoser.serializers import UserSerializer as DjoserUserSerializer


class UserSerializer(DjoserUserSerializer):
    class Meta(DjoserUserSerializer.Meta):
        fields = ("id", "email", "username", "first_name", "last_name", "is_staff")
        read_only_fields = ("id", "email", "username", "is_staff")
