from django import forms
from django.contrib import admin

from apps.utils.lucide_icons import LUCIDE_ICONS

from .models import Module

ICON_CHOICES = [(name, name) for name in LUCIDE_ICONS]


class ModuleForm(forms.ModelForm):
    icon = forms.ChoiceField(
        choices=ICON_CHOICES,
        widget=forms.Select(attrs={"class": "vTextField"}),
    )

    class Meta:
        model = Module
        fields = "__all__"


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    form = ModuleForm
    list_display = ("name", "slug", "icon", "parent", "order", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug", "icon")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order", "name")
