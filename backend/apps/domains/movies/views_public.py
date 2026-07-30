from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from .models import Actor, Author, Director, Genre, Movie
from .serializers import (
    ActorSerializer,
    AuthorSerializer,
    DirectorSerializer,
    GenreSerializer,
    MovieListSerializer,
    MovieSerializer,
)


class MoviePublicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Movie.objects.filter(is_active=True).select_related(
        "genre", "director_fk", "author_fk", "actor_fk", "display_config"
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["genre"]
    search_fields = ["title"]
    ordering_fields = ["title", "release_year", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return MovieListSerializer
        return MovieSerializer


class GenrePublicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]


class DirectorPublicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Director.objects.filter(is_active=True)
    serializer_class = DirectorSerializer
    permission_classes = [IsAuthenticated]


class AuthorPublicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Author.objects.filter(is_active=True)
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


class ActorPublicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Actor.objects.filter(is_active=True)
    serializer_class = ActorSerializer
    permission_classes = [IsAuthenticated]
