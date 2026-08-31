from rest_framework import serializers

from ..models import Cine


class CineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cine
        fields = ["id", "name", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Cine name cannot be empty.")
        return value.strip()


class CineScheduleSerializer(serializers.ModelSerializer):
    salas = serializers.SerializerMethodField()

    class Meta:
        model = Cine
        fields = ["id", "name", "salas"]

    def get_salas(self, obj):
        result = []
        for sala in obj.salas.all().order_by("number"):
            funciones = sala.funciones.select_related("movie").order_by("start_time")
            result.append({
                "id": sala.id,
                "number": sala.number,
                "rows": sala.rows,
                "cols": sala.cols,
                "funciones": [
                    {
                        "id": f.id,
                        "movie_id": f.movie_id,
                        "movie_title": f.movie.title,
                        "start_time": f.start_time,
                        "is_active": f.is_active,
                    }
                    for f in funciones
                ],
            })
        return result
