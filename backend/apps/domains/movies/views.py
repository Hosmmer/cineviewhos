from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminUser

from .models import Actor, Author, Director, Genre, Movie, MovieDisplayConfig
from .serializers import (
    ActorSerializer,
    AuthorSerializer,
    DirectorSerializer,
    GenreSerializer,
    MovieDisplayConfigSerializer,
    MovieListSerializer,
    MovieSerializer,
)
from .services import (
    ActorService,
    AuthorService,
    DirectorService,
    GenreService,
    MovieService,
)


class GenreAdminViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        genre = self.get_object()
        service = GenreService()
        result = service.delete_genre(genre)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class MovieAdminViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.select_related(
        "genre", "director_fk", "author_fk", "actor_fk", "display_config"
    ).prefetch_related("franjas").all()
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_serializer_class(self):
        if self.action == "list":
            return MovieListSerializer
        return MovieSerializer

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        movie = self.get_object()
        service = MovieService()
        result = service.soft_delete(movie)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)

    @action(detail=True, methods=["get", "patch"], url_path="display-config")
    def display_config(self, request, *args, **kwargs):
        movie = self.get_object()
        try:
            config = movie.display_config
        except MovieDisplayConfig.DoesNotExist:
            config = MovieDisplayConfig.objects.create(movie=movie)

        if request.method == "GET":
            serializer = MovieDisplayConfigSerializer(config)
            return Response(serializer.data)

        serializer = MovieDisplayConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DirectorAdminViewSet(viewsets.ModelViewSet):
    queryset = Director.objects.all()
    serializer_class = DirectorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        director = self.get_object()
        service = DirectorService()
        result = service.soft_delete(director)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class AuthorAdminViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        author = self.get_object()
        service = AuthorService()
        result = service.soft_delete(author)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)


class ActorAdminViewSet(viewsets.ModelViewSet):
    queryset = Actor.objects.all()
    serializer_class = ActorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        actor = self.get_object()
        service = ActorService()
        result = service.soft_delete(actor)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)
