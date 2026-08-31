from rest_framework import serializers

from ..models import Sala


class SalaSerializer(serializers.ModelSerializer):
    cine_name = serializers.CharField(source="cine.name", read_only=True)

    class Meta:
        model = Sala
        fields = ["id", "cine", "cine_name", "number", "rows", "cols", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_number(self, value):
        if value < 1:
            raise serializers.ValidationError("Number must be at least 1.")
        return value

    def validate_rows(self, value):
        if value < 1:
            raise serializers.ValidationError("Rows must be at least 1.")
        return value

    def validate_cols(self, value):
        if value < 1:
            raise serializers.ValidationError("Cols must be at least 1.")
        return value


class SalaDetailSerializer(serializers.ModelSerializer):
    seat_count = serializers.SerializerMethodField()
    active_funcion_count = serializers.SerializerMethodField()
    cine_name = serializers.CharField(source="cine.name", read_only=True)

    class Meta:
        model = Sala
        fields = [
            "id", "cine", "cine_name", "number", "rows", "cols",
            "seat_count", "active_funcion_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_seat_count(self, obj):
        return obj.seats.count()

    def get_active_funcion_count(self, obj):
        return obj.funciones.filter(is_active=True).count()
