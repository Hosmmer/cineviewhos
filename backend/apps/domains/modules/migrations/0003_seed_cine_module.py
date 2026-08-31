from django.db import migrations


def seed_cine_module(apps, schema_editor):
    Module = apps.get_model("modules", "Module")
    parent = Module.objects.filter(slug="reservations-admin").first()
    if parent is None:
        return
    Module.objects.get_or_create(
        slug="admin-cines",
        defaults={
            "name": "Cines",
            "icon": "Building",
            "route": "reservations/cines",
            "parent": parent,
            "order": 10,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("modules", "0002_seed_franja_module"),
    ]

    operations = [
        migrations.RunPython(seed_cine_module, migrations.RunPython.noop),
    ]
