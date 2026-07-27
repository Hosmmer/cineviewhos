from rest_framework import serializers

from apps.domains.movies.models import Movie

from .models import Funcion, Reserva, ReservaSeat, Sala, Seat


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


class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ["id", "name", "rows", "cols", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Sala name cannot be empty.")
        return value.strip()

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

    class Meta:
        model = Sala
        fields = [
            "id", "name", "rows", "cols",
            "seat_count", "active_funcion_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_seat_count(self, obj):
        return obj.seats.count()

    def get_active_funcion_count(self, obj):
        return obj.funciones.filter(is_active=True).count()


class FuncionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    sala_name = serializers.CharField(source="sala.name", read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "sala", "sala_name",
            "start_time", "available_seats", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_available_seats(self, obj):
        total = obj.sala.seats.count()
        occupied = ReservaSeat.objects.filter(
            reserva__funcion=obj,
            reserva__status=Reserva.Status.CONFIRMED,
        ).count()
        return total - occupied

    def validate_movie(self, value):
        if not Movie.objects.filter(id=value.id, is_active=True).exists():
            raise serializers.ValidationError("Selected movie does not exist or is not active.")
        return value


class FuncionDetailSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    movie_duration = serializers.IntegerField(source="movie.duration_minutes", read_only=True)
    sala_name = serializers.CharField(source="sala.name", read_only=True)
    sala_rows = serializers.IntegerField(source="sala.rows", read_only=True)
    sala_cols = serializers.IntegerField(source="sala.cols", read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "movie_duration",
            "sala", "sala_name", "sala_rows", "sala_cols",
            "start_time", "available_seats", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_available_seats(self, obj):
        total = obj.sala.seats.count()
        occupied = ReservaSeat.objects.filter(
            reserva__funcion=obj,
            reserva__status=Reserva.Status.CONFIRMED,
        ).count()
        return total - occupied


class AdminFuncionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    sala_name = serializers.CharField(source="sala.name", read_only=True)

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "sala", "sala_name",
            "start_time", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ReservaSeatSerializer(serializers.ModelSerializer):
    seat_id = serializers.IntegerField(source="seat.id")
    row = serializers.IntegerField(source="seat.row")
    col = serializers.IntegerField(source="seat.col")

    class Meta:
        model = ReservaSeat
        fields = ["id", "seat_id", "row", "col"]


class ReservaSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    movie_title = serializers.CharField(source="funcion.movie.title", read_only=True)
    sala_name = serializers.CharField(source="funcion.sala.name", read_only=True)
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
    sala_name = serializers.CharField(source="funcion.sala.name", read_only=True)
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


class CreateReservaSerializer(serializers.Serializer):
    funcion_id = serializers.IntegerField()
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1
    )

    def validate_funcion_id(self, value):
        if not Funcion.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Funcion not found or is not active.")
        return value
