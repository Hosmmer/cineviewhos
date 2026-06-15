from django.contrib import admin

from .models import Genre, Movie


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at", "updated_at"]
    search_fields = ["name"]


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ["title", "genre", "director", "release_year", "duration_minutes", "price", "is_active", "created_at"]
    list_filter = ["genre", "is_active", "release_year"]
    search_fields = ["title", "director"]
