from django.db import migrations


def cleanup_removed_common_app(apps, schema_editor):
    ContentType = apps.get_model("contenttypes", "ContentType")
    ContentType.objects.filter(app_label="common", model__in=["user", "role"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(cleanup_removed_common_app, migrations.RunPython.noop),
    ]
