from django.db import migrations


def migrate_actor_data(apps, schema_editor):
    Movie = apps.get_model("movies", "Movie")
    Actor = apps.get_model("movies", "Actor")

    actor_name_to_id: dict[str, int] = {}

    for movie in Movie.objects.exclude(actors="").exclude(actors__isnull=True):
        raw = movie.actors.strip()
        if not raw:
            continue

        first_name = raw.split(",")[0].strip()
        if not first_name:
            continue

        if first_name not in actor_name_to_id:
            actor, _ = Actor.objects.get_or_create(name=first_name)
            actor_name_to_id[first_name] = actor.id

        movie.actor_fk_id = actor_name_to_id[first_name]
        movie.save(update_fields=["actor_fk"])


class Migration(migrations.Migration):

    dependencies = [
        ("movies", "0005_add_actor_model"),
    ]

    operations = [
        migrations.RunPython(migrate_actor_data, migrations.RunPython.noop),
    ]
