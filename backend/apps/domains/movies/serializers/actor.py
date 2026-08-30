from rest_framework import serializers

from ..models import Actor


class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = [
            "id", "name", "birth_date", "city",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Actor name cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError(
                "Actor name must be 255 characters or fewer."
            )
        return value.strip()
