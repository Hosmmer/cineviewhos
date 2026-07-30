import os

from django.utils import timezone
from rest_framework import serializers

from .models import Actor, Author, Director, Genre, Movie, MovieDisplayConfig


class RelativeImageField(serializers.ImageField):
    def to_representation(self, value):
        if not value:
            return None
        return value.url


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Genre name cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError(
                "Genre name must be 100 characters or fewer."
            )
        return value.strip()


class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = [
            "id", "name", "birth_date", "city",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Director name cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError(
                "Director name must be 255 characters or fewer."
            )
        return value.strip()


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


class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = [
            "id", "name", "birth_date", "city",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Actor name cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError(
                "Actor name must be 255 characters or fewer."
            )
        return value.strip()


class MovieListSerializer(serializers.ModelSerializer):
    genre_name = serializers.CharField(source="genre.name", read_only=True)
    director_name = serializers.CharField(source="director_fk.name", read_only=True)
    author_name = serializers.CharField(source="author_fk.name", read_only=True)
    actor_name = serializers.CharField(source="actor_fk.name", read_only=True)
    poster = RelativeImageField(read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "director_name",
            "author_name",
            "actor_name",
            "release_year",
            "duration_minutes",
            "poster",
            "price",
            "genre",
            "genre_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MovieDisplayConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieDisplayConfig
        fields = [
            "show_director",
            "show_author",
            "show_actor",
            "show_description",
            "show_duration",
            "show_release_year",
            "show_price",
            "show_genre",
        ]


class MovieSerializer(serializers.ModelSerializer):
    genre_detail = GenreSerializer(source="genre", read_only=True)
    genre_name = serializers.CharField(source="genre.name", read_only=True)
    director_detail = DirectorSerializer(source="director_fk", read_only=True)
    director_name = serializers.CharField(source="director_fk.name", read_only=True)
    author_detail = AuthorSerializer(source="author_fk", read_only=True)
    author_name = serializers.CharField(source="author_fk.name", read_only=True)
    actor_detail = ActorSerializer(source="actor_fk", read_only=True)
    actor_name = serializers.CharField(source="actor_fk.name", read_only=True)
    poster = RelativeImageField()
    display_config = MovieDisplayConfigSerializer(read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "duration_minutes",
            "release_year",
            "poster",
            "price",
            "genre",
            "genre_detail",
            "genre_name",
            "director_fk",
            "director_detail",
            "director_name",
            "author_fk",
            "author_detail",
            "author_name",
            "actor_fk",
            "actor_detail",
            "actor_name",
            "is_active",
            "display_config",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError("Title must be 255 characters or fewer.")
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters."
            )
        return value.strip()

    def validate_duration_minutes(self, value):
        if value < 1:
            raise serializers.ValidationError("Duration must be at least 1 minute.")
        if value > 600:
            raise serializers.ValidationError("Duration cannot exceed 600 minutes.")
        return value

    def validate_release_year(self, value):
        current_year = timezone.now().year
        if value < 1900:
            raise serializers.ValidationError("Release year cannot be before 1900.")
        if value > current_year + 5:
            raise serializers.ValidationError(
                f"Release year cannot be later than {current_year + 5}."
            )
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_poster(self, value):
        if value:
            ext = os.path.splitext(value.name)[1].lower()
            allowed = [".jpg", ".jpeg", ".png", ".webp"]
            if ext not in allowed:
                raise serializers.ValidationError(
                    f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed)}"
                )
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Poster file size must be under 5 MB."
                )
        return value

    def validate_genre(self, value):
        if not Genre.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Selected genre does not exist.")
        return value

    def validate_director_fk(self, value):
        if value is not None and not Director.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Selected director does not exist.")
        return value

    def validate_author_fk(self, value):
        if value is not None and not Author.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Selected author does not exist.")
        return value

    def validate_actor_fk(self, value):
        if value is not None and not Actor.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Selected actor does not exist.")
        return value
