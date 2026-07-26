from rest_framework import serializers

from apps.common.models import Role

from .models import Module


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "slug", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = [
            "id",
            "name",
            "slug",
            "icon",
            "route",
            "parent",
            "order",
            "roles",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ModuleTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            "id",
            "name",
            "slug",
            "icon",
            "route",
            "parent",
            "order",
            "is_active",
            "children",
        ]

    def get_children(self, obj):
        children = Module.objects.filter(parent=obj, is_active=True).order_by(
            "order", "name"
        )
        if not children.exists():
            return []
        return ModuleTreeSerializer(children, many=True).data
