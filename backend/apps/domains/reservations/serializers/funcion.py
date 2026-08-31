from rest_framework import serializers

from apps.domains.movies.models import Movie

from ..models import Funcion, Reserva, ReservaSeat
from .format import FormatSerializer
from .franja import FranjaNameMixin


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
