# DRF Serializers — Django 3.0.7

## Core Principle

Serializers have **one job**: validate input or shape output.
Business logic goes in `services.py`. Never put ORM queries or side-effects inside serializers.

## Split Input vs Output Serializers

Use separate serializers for write operations and read responses.

```python
from rest_framework import serializers
from .models import Item


class ItemCreateSerializer(serializers.Serializer):
    """Input validation only — no model binding."""
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(min_value=0)
    tags = serializers.ListField(child=serializers.CharField(), required=False)


class ItemListSerializer(serializers.ModelSerializer):
    """Read-only response — shapes the output."""
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Item
        fields = ["id", "name", "status", "status_display", "owner_name", "quantity", "created_at"]
        read_only_fields = fields
```

## ModelSerializer

```python
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "description", "status", "quantity", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
```

## Field-Level Validation

```python
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["name", "code", "status"]

    def validate_code(self, value):
        qs = Item.objects.exclude(id=self.instance.id if self.instance else None)
        if qs.filter(code__iexact=value).exists():
            raise serializers.ValidationError("This code already exists.")
        return value.lower()
```

## Object-Level Validation (cross-field)

```python
class OrderCreateSerializer(serializers.Serializer):
    order_type = serializers.ChoiceField(choices=["dine_in", "delivery", "takeout"])
    table_number = serializers.IntegerField(required=False)
    delivery_address = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["order_type"] == "dine_in" and not attrs.get("table_number"):
            raise serializers.ValidationError({"table_number": "Required for dine-in."})
        if attrs["order_type"] == "delivery" and not attrs.get("delivery_address"):
            raise serializers.ValidationError({"delivery_address": "Required for delivery."})
        return attrs
```

## SerializerMethodField + @extend_schema_field

Always annotate `SerializerMethodField` return types with `@extend_schema_field`.

```python
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers


class ItemListSerializer(serializers.ModelSerializer):
    computed_value = serializers.SerializerMethodField()

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_computed_value(self, obj):
        return self.context.get("value_map", {}).get(str(obj.id))

    class Meta:
        model = Item
        fields = ["id", "name", "computed_value"]
```

## Passing Context from View to Serializer

```python
# In the view
serializer = ItemListSerializer(
    queryset, many=True,
    context={"request": request, "value_map": {str(i.id): v for i, v in data}},
)

# In the serializer
def get_computed_value(self, obj):
    return self.context["value_map"].get(str(obj.id))
```

## Query-Parameter Validation Serializer

```python
class ItemFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["active", "inactive"], required=False)
    from_date = serializers.DateField(required=False)
    to_date = serializers.DateField(required=False)
    page_size = serializers.IntegerField(min_value=1, max_value=100, default=20)

    def validate(self, attrs):
        if attrs.get("from_date") and attrs.get("to_date"):
            if attrs["from_date"] > attrs["to_date"]:
                raise serializers.ValidationError("from_date must be before to_date.")
        return attrs

# In view
param_serializer = ItemFilterSerializer(data=request.query_params)
if not param_serializer.is_valid():
    return Response(param_serializer.errors, status=400)
params = param_serializer.validated_data
```

## Quick Reference

| Pattern | When to use |
|---|---|
| `ModelSerializer` | Response shape or CRUD with direct model mapping |
| `Serializer` (plain) | Input validation, query params |
| `read_only_fields` | Fields never written by the client |
| `write_only=True` | Passwords, IDs accepted as input but not returned |
| `source="rel.field"` | Traverse FK in read-only fields |
| `SerializerMethodField` | Computed fields (annotate with `@extend_schema_field`) |
| `validate_<field>()` | Single-field business rule |
| `validate()` | Cross-field rule |
| `context` | Pass request-time data into the serializer |
