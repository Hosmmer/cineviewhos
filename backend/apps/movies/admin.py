from django.contrib import admin

from .models import Actor, Author, Director, Genre, Movie


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at", "updated_at"]
    search_fields = ["name"]


@admin.register(Director)
class DirectorAdmin(admin.ModelAdmin):
    list_display = ["name", "birth_date", "city", "is_active", "created_at"]
    search_fields = ["name"]


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ["name", "birth_date", "city", "is_active", "created_at"]
    search_fields = ["name"]


@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ["name", "birth_date", "city", "is_active", "created_at"]
    search_fields = ["name"]


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "genre",
        "director_fk",
        "author_fk",
        "actor_fk",
        "release_year",
        "duration_minutes",
        "price",
        "is_active",
        "created_at",
    ]
    list_filter = ["genre", "is_active", "release_year"]
    search_fields = ["title"]
