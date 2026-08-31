from .admin import (
    ActorAdminViewSet,
    AuthorAdminViewSet,
    DirectorAdminViewSet,
    GenreAdminViewSet,
    MovieAdminViewSet,
)
from .public import (
    ActorPublicViewSet,
    AuthorPublicViewSet,
    DirectorPublicViewSet,
    GenrePublicViewSet,
    MoviePublicViewSet,
)

__all__ = [
    "ActorAdminViewSet",
    "AuthorAdminViewSet",
    "DirectorAdminViewSet",
    "GenreAdminViewSet",
    "MovieAdminViewSet",
    "ActorPublicViewSet",
    "AuthorPublicViewSet",
    "DirectorPublicViewSet",
    "GenrePublicViewSet",
    "MoviePublicViewSet",
]
