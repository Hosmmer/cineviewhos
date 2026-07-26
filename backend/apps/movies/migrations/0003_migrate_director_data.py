from django.db import migrations


def migrate_director_data(apps, schema_editor):
    Movie = apps.get_model("movies", "Movie")
    Director = apps.get_model("movies", "Director")

    director_name_to_id: dict[str, int] = {}

    for movie in Movie.objects.exclude(director="").exclude(director__isnull=True):
        name = movie.director.strip()
        if not name:
            continue

        if name not in director_name_to_id:
            director, _ = Director.objects.get_or_create(name=name)
            director_name_to_id[name] = director.id

        movie.director_fk_id = director_name_to_id[name]
        movie.save(update_fields=["director_fk"])


class Migration(migrations.Migration):

    dependencies = [
        ("movies", "0002_add_director_author_models"),
    ]

    operations = [
        migrations.RunPython(migrate_director_data, migrations.RunPython.noop),
    ]
