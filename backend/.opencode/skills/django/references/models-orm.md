# Models & ORM — Django 3.0.7

## PostgreSQL Model Design

### Conventions

```python
import uuid
from django.db import models
from django.conf import settings


class Item(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ForeignKeys — use settings.AUTH_USER_MODEL
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
    )

    # Choices — use TextChoices (Django 3.0+)
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        ARCHIVED = "archived", "Archived"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )

    # JSONField — Django 3.0.7: from django.contrib.postgres.fields
    metadata = JSONField(default=dict, blank=True)

    # Timestamps — always both
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "items"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
            models.Index(fields=["owner", "status"]),
        ]

    def __str__(self):
        return f"Item {self.id}"
```

## Choices

Prefer `TextChoices` / `IntegerChoices` for in-model enums.
Use standalone `Enum` subclasses in `choices.py` for enums reused across apps.

```python
# In-model
class Status(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"

status = models.CharField(
    max_length=20,
    choices=Status.choices,
    default=Status.ACTIVE,
)

# Cross-app enum — apps/orders/choices.py
from enum import Enum

class OrderType(str, Enum):
    STANDARD = "standard"
    EXPRESS = "express"

# Usage
order_type = models.CharField(
    max_length=20,
    choices=[(t.value, t.name) for t in OrderType],
    default=OrderType.STANDARD.value,
)
```

## Relationships & on_delete

```python
# CASCADE — delete child when parent is deleted
owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

# PROTECT — prevent parent deletion while children exist
business = models.ForeignKey("business.Business", on_delete=models.PROTECT)

# SET_NULL — keep child, nullify FK
customer = models.ForeignKey(
    "customers.Customer", on_delete=models.SET_NULL, null=True, blank=True
)
```

## Query Optimization

### select_related vs prefetch_related

```python
# N+1 problem
for order in Order.objects.filter(business=business):
    print(order.customer.name)

# select_related — single JOIN for ForeignKey / OneToOne
orders = Order.objects.select_related("customer", "business").filter(business=business)

# prefetch_related — separate IN query for ManyToMany / reverse FK
orders = (
    Order.objects
    .select_related("customer")
    .prefetch_related("items")
    .filter(business=business, status=Order.Status.ACTIVE)
)

# Combined
def list_items(user_id):
    return (
        Item.objects
        .select_related("owner")
        .prefetch_related("tags")
        .filter(owner_id=user_id)
        .order_by("-created_at")
    )
```

### Partial Field Loading

```python
# only() — load only these columns
Item.objects.only("id", "status", "created_at").filter(owner=user)

# defer() — load all columns except these
Item.objects.defer("metadata").filter(owner=user)

# values() — return dicts instead of model instances
Item.objects.filter(owner=user).values("id", "status", "created_at")

# values_list() — return tuples
Item.objects.filter(owner=user).values_list("id", flat=True)
```

## F, Q, and Aggregate Expressions

```python
from django.db.models import Count, Sum, Avg, F, Q, Value
from django.db.models.functions import Coalesce

# F — column references (no Python round-trip)
StockItem.objects.filter(product_id=pid).update(quantity=F("quantity") + 10)

# Q — complex filters with OR / NOT
active_or_pending = Item.objects.filter(
    Q(status=Item.Status.ACTIVE) | Q(status="pending"),
    owner=user,
)

# annotate — computed per-row field
stats = (
    Item.objects
    .filter(owner=user)
    .values("status")
    .annotate(count=Count("id"), total=Coalesce(Sum("amount"), Value(0)))
)

# aggregate — single-row summary
summary = Item.objects.filter(owner=user).aggregate(
    total=Sum("amount"),
    count=Count("id"),
)
```

## Custom Manager

```python
class ItemQuerySet(models.QuerySet):
    def active(self):
        return self.filter(status=Item.Status.ACTIVE)

    def for_owner(self, user_id):
        return self.filter(owner_id=user_id)

    def with_related(self):
        return self.select_related("owner").prefetch_related("tags")


class ItemManager(models.Manager):
    def get_queryset(self):
        return ItemQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()


class Item(models.Model):
    objects = ItemManager()


# Usage
active_items = Item.objects.active().for_owner(user_id).with_related()
```

## Bulk Operations

```python
# bulk_create — mass insert, skips save() signal
Item.objects.bulk_create(
    [Item(owner=user, name=f"Item {i}") for i in range(100)],
    batch_size=500,
)

# bulk_update — mass update specific fields
items = list(Item.objects.filter(owner=user))
for item in items:
    item.status = Item.Status.ARCHIVED
Item.objects.bulk_update(items, ["status"], batch_size=500)

# update() — SQL UPDATE WHERE, fastest
Item.objects.filter(owner=user, status=Item.Status.INACTIVE).update(
    status=Item.Status.ARCHIVED
)
```

> `bulk_create` / `bulk_update` bypass `save()` and `post_save` signals.

## Indexes

```python
class Meta:
    indexes = [
        models.Index(fields=["owner_id"]),
        models.Index(fields=["owner", "status"]),
        models.Index(fields=["owner", "-created_at"]),
    ]

    constraints = [
        models.UniqueConstraint(
            fields=["owner", "slug"],
            name="unique_slug_per_owner",
        ),
        models.UniqueConstraint(
            fields=["owner", "code"],
            condition=models.Q(code__isnull=False),
            name="unique_code_per_owner",
        ),
    ]
```

## Migrations

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py makemigrations --check --dry-run  # CI-safe
```

### Adding a field to an existing table

```python
# Safe — nullable or with default
new_field = models.CharField(max_length=50, blank=True, default="")

# Safe — nullable FK
store = models.ForeignKey("store.Store", null=True, blank=True, on_delete=models.SET_NULL)

# Dangerous — non-null field with no default on existing rows
required_field = models.CharField(max_length=50)
```

### Data migration

```python
from django.db import migrations

def set_defaults(apps, schema_editor):
    Item = apps.get_model("myapp", "Item")
    Item.objects.filter(status__isnull=True).update(status="active")

class Migration(migrations.Migration):
    dependencies = [("myapp", "0012_add_status")]
    operations = [migrations.RunPython(set_defaults, migrations.RunPython.noop)]
```

## Quick Reference

| ORM tool | Use case |
|---|---|
| `select_related()` | FK / OneToOne — single JOIN |
| `prefetch_related()` | ManyToMany / reverse FK — separate IN query |
| `only()` / `defer()` | Partial column load |
| `values()` / `values_list()` | Read-only dicts / tuples |
| `annotate()` | Per-row computed fields |
| `aggregate()` | Single-row summary |
| `F()` | Column references at DB level |
| `Q()` | OR / NOT filter combinations |
| `bulk_create()` | Mass insert (bypasses `save()`) |
| `bulk_update()` | Mass field update (bypasses `save()`) |
| `update()` | SQL UPDATE WHERE (fastest) |
