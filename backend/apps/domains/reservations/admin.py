from django.contrib import admin

from .models import Cine, Franja


@admin.register(Cine)
class CineAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]


@admin.register(Franja)
class FranjaAdmin(admin.ModelAdmin):
    list_display = ["name", "start_time", "end_time", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
