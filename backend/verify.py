import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()
from apps.common.models import User
from apps.domains.movies.models import Movie
print("CineViewHos:")
print(f"  Usuarios: {User.objects.count()}")
print(f"  Peliculas: {Movie.objects.count()}")
u = User.objects.first()
m = Movie.objects.first()
print(f"  user={u.username if u else 'N/A'}, movie={m.title if m else 'N/A'}")
