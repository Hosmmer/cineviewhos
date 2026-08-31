from datetime import timedelta

from django.utils import timezone

from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Format, Funcion


class FuncionService(BaseService):

    def _get_funcion_end(self, funcion):
        return funcion.start_time + timedelta(minutes=funcion.movie.duration_minutes)

    def _check_overlap(self, sala, start_time, end_time, exclude_id=None):
        if not timezone.is_aware(start_time):
            start_time = timezone.make_aware(start_time, timezone.utc)
            end_time = timezone.make_aware(end_time, timezone.utc)

        queryset = Funcion.objects.filter(
            sala=sala,
            is_active=True,
        )
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)

        for f in queryset:
            f_start = f.start_time
            if not timezone.is_aware(f_start):
                f_start = timezone.make_aware(f_start, timezone.utc)
            f_end = f.start_time + timedelta(minutes=f.movie.duration_minutes)
            if not timezone.is_aware(f_end):
                f_end = timezone.make_aware(f_end, timezone.utc)
            if f_start < end_time and f_end > start_time:
                return f
        return None

    def create_funcion(
        self, movie, sala: Funcion, start_time, format_ids=None
    ) -> ServiceResult:
        end_time = start_time + timedelta(minutes=movie.duration_minutes)

        if self._check_overlap(sala, start_time, end_time):
            return self.error(
                "This sala already has a funcion scheduled during this time.", 400
            )

        funcion = Funcion.objects.create(
            movie=movie, sala=sala, start_time=start_time
        )
        if format_ids is not None:
            valid_ids = set(
                Format.objects.filter(id__in=format_ids).values_list("id", flat=True)
            )
            if len(valid_ids) != len(format_ids):
                return self.error("One or more format IDs are invalid.", 400)
            funcion.formats.set(format_ids)

        return self.success(
            data={
                "id": funcion.id,
                "start_time": str(funcion.start_time),
                "format_ids": list(funcion.formats.values_list("id", flat=True)),
            },
            status_code=201,
        )

    def update_funcion(
        self, funcion: Funcion, movie, sala: Funcion, start_time, format_ids=None
    ) -> ServiceResult:
        end_time = start_time + timedelta(minutes=movie.duration_minutes)

        if self._check_overlap(sala, start_time, end_time, exclude_id=funcion.id):
            return self.error(
                "This sala already has a funcion scheduled during this time.", 400
            )

        funcion.movie = movie
        funcion.sala = sala
        funcion.start_time = start_time
        funcion.save()
        if format_ids is not None:
            valid_ids = set(
                Format.objects.filter(id__in=format_ids).values_list("id", flat=True)
            )
            if len(valid_ids) != len(format_ids):
                return self.error("One or more format IDs are invalid.", 400)
            funcion.formats.set(format_ids)

        return self.success(
            data={
                "id": funcion.id,
                "start_time": str(funcion.start_time),
                "format_ids": list(funcion.formats.values_list("id", flat=True)),
            }
        )

    def soft_delete(self, funcion: Funcion) -> ServiceResult:
        funcion.is_active = False
        funcion.save()
        return self.success(status_code=204)
