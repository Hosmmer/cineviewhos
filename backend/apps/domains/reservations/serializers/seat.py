from rest_framework import serializers

from ..models import Reserva, ReservaSeat, Seat


class SeatSerializer(serializers.ModelSerializer):
    is_occupied = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ["id", "row", "col", "is_occupied", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_is_occupied(self, obj):
        funcion_id = self.context.get("funcion_id")
        if not funcion_id:
            return False
        return ReservaSeat.objects.filter(
            seat=obj,
            reserva__funcion_id=funcion_id,
            reserva__status=Reserva.Status.CONFIRMED,
        ).exists()
