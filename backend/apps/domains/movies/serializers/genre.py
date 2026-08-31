from rest_framework import serializers

from ..models import Genre


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Genre name cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError(
                "Genre name must be 100 characters or fewer."
            )
        return value.strip()
