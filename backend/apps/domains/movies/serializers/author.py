from rest_framework import serializers

from ..models import Author


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = [
            "id", "name", "birth_date", "city",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Author name cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError(
                "Author name must be 255 characters or fewer."
            )
        return value.strip()
