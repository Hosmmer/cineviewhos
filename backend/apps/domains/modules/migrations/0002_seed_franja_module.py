from django.db import migrations


def seed_franja_module(apps, schema_editor):
    Module = apps.get_model("modules", "Module")
    parent = Module.objects.filter(slug="reservations-admin").first()
    if parent is None:
        return
    Module.objects.get_or_create(
        slug="admin-franjas",
        defaults={
            "name": "Franjas",
            "icon": "Clock",
            "route": "reservations/franjas",
            "parent": parent,
            "order": 40,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("modules", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_franja_module, migrations.RunPython.noop),
    ]
