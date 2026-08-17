from rest_framework import serializers

from apps.domains.movies.models import Movie

from .models import Cine, Format, Franja, Funcion, Reserva, ReservaSeat, Sala, Seat
from .services import classify_franja, get_active_franjas


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


class FuncionSerializer(FranjaNameMixin, serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    sala_name = serializers.CharField(source="sala.display_name", read_only=True)
    cine_name = serializers.CharField(source="sala.cine.name", read_only=True)
    sala_number = serializers.IntegerField(source="sala.number", read_only=True)
    available_seats = serializers.SerializerMethodField()
    formats = FormatSerializer(many=True, read_only=True)
    franja = serializers.SerializerMethodField()

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "sala", "sala_name",
            "cine_name", "sala_number",
            "start_time", "available_seats", "is_active",
            "formats", "franja",
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


class FuncionDetailSerializer(FranjaNameMixin, serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    movie_duration = serializers.IntegerField(source="movie.duration_minutes", read_only=True)
    sala_name = serializers.CharField(source="sala.display_name", read_only=True)
    cine_name = serializers.CharField(source="sala.cine.name", read_only=True)
    sala_number = serializers.IntegerField(source="sala.number", read_only=True)
    sala_rows = serializers.IntegerField(source="sala.rows", read_only=True)
    sala_cols = serializers.IntegerField(source="sala.cols", read_only=True)
    available_seats = serializers.SerializerMethodField()
    formats = FormatSerializer(many=True, read_only=True)
    franja = serializers.SerializerMethodField()

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "movie_duration",
            "sala", "sala_name", "cine_name", "sala_number",
            "sala_rows", "sala_cols",
            "start_time", "available_seats", "is_active",
            "formats", "franja",
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


class AdminFuncionSerializer(FranjaNameMixin, serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    sala_name = serializers.CharField(source="sala.display_name", read_only=True)
    format_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )
    format_names = serializers.SerializerMethodField(read_only=True)
    formats = FormatSerializer(many=True, read_only=True)
    franja = serializers.SerializerMethodField()

    class Meta:
        model = Funcion
        fields = [
            "id", "movie", "movie_title", "sala", "sala_name",
            "start_time", "is_active",
            "format_ids", "format_names", "formats", "franja",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_format_names(self, obj):
        return list(obj.formats.values_list("name", flat=True))


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
