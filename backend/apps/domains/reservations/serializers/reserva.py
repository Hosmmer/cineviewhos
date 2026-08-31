from rest_framework import serializers

from ..models import Funcion, Reserva, ReservaSeat


class ReservaSeatSerializer(serializers.ModelSerializer):
    seat_id = serializers.IntegerField(source="seat.id")
    row = serializers.IntegerField(source="seat.row")
    col = serializers.IntegerField(source="seat.col")

    class Meta:
        model = ReservaSeat
        fields = ["id", "seat_id", "row", "col"]


class AdminReservaSeatSerializer(ReservaSeatSerializer):
    class Meta(ReservaSeatSerializer.Meta):
        fields = ReservaSeatSerializer.Meta.fields + ["person_name"]


class ReservaSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    movie_title = serializers.CharField(source="funcion.movie.title", read_only=True)
    sala_name = serializers.CharField(source="funcion.sala.display_name", read_only=True)
    start_time = serializers.DateTimeField(source="funcion.start_time", read_only=True)
    seats = ReservaSeatSerializer(source="reserva_seats", many=True, read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id", "user", "user_name",
            "funcion", "movie_title", "sala_name", "start_time",
            "status", "confirmed_at", "seats",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "confirmed_at", "created_at", "updated_at"]


class ReservaListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    movie_title = serializers.CharField(source="funcion.movie.title", read_only=True)
    sala_name = serializers.CharField(source="funcion.sala.display_name", read_only=True)
    start_time = serializers.DateTimeField(source="funcion.start_time", read_only=True)
    seat_count = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            "id", "user", "user_name",
            "funcion", "movie_title", "sala_name", "start_time",
            "status", "confirmed_at", "seat_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "confirmed_at", "created_at", "updated_at"]

    def get_seat_count(self, obj):
        return obj.reserva_seats.count()


class AdminReservaSerializer(ReservaSerializer):
    seats = AdminReservaSeatSerializer(source="reserva_seats", many=True, read_only=True)


class AdminReservaListSerializer(ReservaListSerializer):
    seats = AdminReservaSeatSerializer(source="reserva_seats", many=True, read_only=True)

    class Meta(ReservaListSerializer.Meta):
        fields = [
            "id", "user", "user_name",
            "funcion", "movie_title", "sala_name", "start_time",
            "status", "confirmed_at", "seats",
            "created_at", "updated_at",
        ]


class CreateReservaSeatSerializer(serializers.Serializer):
    seat_id = serializers.IntegerField()
    person_name = serializers.CharField(max_length=150)

    def validate_person_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("person_name cannot be empty.")
        return value.strip()


class CreateReservaSerializer(serializers.Serializer):
    funcion_id = serializers.IntegerField()
    seats = serializers.ListField(
        child=CreateReservaSeatSerializer(), min_length=1
    )

    def validate_funcion_id(self, value):
        if not Funcion.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Funcion not found or is not active.")
        return value
