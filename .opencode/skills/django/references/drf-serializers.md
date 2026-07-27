# DRF Serializers — CineViewHos

## Always Use `ModelSerializer`

```python
from rest_framework import serializers
```

Only exception: `CreateReservaSerializer` extends `serializers.Serializer` for write-only input DTOs.

## Meta Convention

```python
class Meta:
    model = SomeModel
    fields = ["id", "name", "description", "is_active", "created_at", "updated_at"]
    read_only_fields = ["id", "created_at", "updated_at"]
```

- **Explicit `fields` list** — never `__all__`
- `read_only_fields` always includes `id`, `created_at`, `updated_at`
- Fields ordered: id first, timestamps last

## Naming Patterns

| Pattern | Usage |
|---------|-------|
| `XxxSerializer` | Detail (retrieve/update/create) |
| `XxxListSerializer` | List action, fewer fields |
| `AdminXxxSerializer` | Admin-specific, fewer fields |
| `XxxDetailSerializer` | List with computed fields/counts |
| `CreateXxxSerializer` | Write-only input DTO |

## Related Data: Flat + Nested

Always provide BOTH the FK ID and nested detail:

```python
class MovieSerializer(serializers.ModelSerializer):
    genre_detail = GenreSerializer(source="genre", read_only=True)
    genre_name = serializers.CharField(source="genre.name", read_only=True)
    genre = serializers.PrimaryKeyRelatedField(queryset=...)  # for writes

    class Meta:
        model = Movie
        fields = ["id", "genre", "genre_detail", "genre_name", ...]
```

## Computed Fields

```python
seat_count = serializers.SerializerMethodField()

def get_seat_count(self, obj):
    return obj.seats.count()
```

## Context Usage

Pass data to serializers via `self.context`:
```python
# In view:
def get_serializer_context(self):
    context = super().get_serializer_context()
    context["funcion_id"] = self.request.query_params.get("funcion")
    return context

# In serializer:
funcion_id = self.context.get("funcion_id")
```

## Validation

- `validate_<field_name>(self, value)` per field
- Return cleaned value (`.strip()` for strings)
- Raise `serializers.ValidationError("Human readable message in English.")`
- Check: empty values, length limits, numeric ranges, FK existence, file type/size

## Custom Field: `RelativeImageField`

```python
class RelativeImageField(serializers.ImageField):
    def to_representation(self, value):
        if not value:
            return None
        return value.url
```

## Djoser Serializer Override

```python
from djoser.serializers import UserSerializer as DjoserUserSerializer

class UserSerializer(DjoserUserSerializer):
    avatar = RelativeImageField()
    roles = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta(DjoserUserSerializer.Meta):
        fields = ("id", "email", "username", "first_name", "last_name", "is_staff", "avatar", "roles")
        read_only_fields = ("id", "email", "username", "is_staff")
```

## Imports

```python
from rest_framework import serializers
from apps.domains.movies.models import Genre
from apps.domains.movies.serializers import RelativeImageField
```
