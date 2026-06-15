from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminUser

from .models import Genre, Movie
from .serializers import GenreSerializer, MovieListSerializer, MovieSerializer
from .services import GenreService, MovieService


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
    queryset = Movie.objects.select_related("genre").all()
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
