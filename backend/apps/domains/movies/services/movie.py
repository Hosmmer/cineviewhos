from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Movie


class MovieService(BaseService):

    def soft_delete(self, movie: Movie) -> ServiceResult:
        movie.is_active = False
        movie.save()
        return self.success(status_code=204)
