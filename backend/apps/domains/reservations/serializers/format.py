from rest_framework import serializers

from ..models import Format


class FormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Format
        fields = ["id", "name", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Format name cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError(
                "Format name must be 100 characters or fewer."
            )
        return value.strip()
