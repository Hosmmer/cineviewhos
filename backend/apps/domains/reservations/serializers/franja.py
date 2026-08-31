from rest_framework import serializers

from ..models import Franja
from ..services import classify_franja, get_active_franjas


class FranjaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Franja
        fields = ["id", "name", "start_time", "end_time", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start_time is not None and end_time is not None and start_time >= end_time:
            raise serializers.ValidationError(
                {"end_time": "start_time must be before end_time."}
            )
        return attrs


class FranjaNameMixin:
    def get_franja(self, obj):
        franjas = self.context.get("franjas")
        if franjas is None:
            franjas = get_active_franjas()
            self.context["franjas"] = franjas
        franja = classify_franja(obj.start_time, franjas)
        return franja.name if franja else None
