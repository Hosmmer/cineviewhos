from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService

from ..models import Cine, Sala


class SalaService(BaseService):

    def create_sala(self, cine_id: int, number: int, rows: int, cols: int) -> ServiceResult:
        if rows < 1 or cols < 1:
            return self.error("Rows and cols must be at least 1.", 400)
        if number < 1:
            return self.error("Number must be at least 1.", 400)

        try:
            cine = Cine.objects.get(id=cine_id, is_active=True)
        except Cine.DoesNotExist:
            return self.error("Cine not found.", 400)

        if Sala.objects.filter(cine=cine, number=number).exists():
            return self.error("This cine already has a sala with this number.", 400)

        sala = Sala.objects.create(cine=cine, number=number, rows=rows, cols=cols)

        return self.success(
            data={
                "id": sala.id,
                "cine": cine.id,
                "number": number,
                "rows": rows,
                "cols": cols,
            },
            status_code=201,
        )

    def update_sala(self, sala: Sala, cine_id: int, number: int) -> ServiceResult:
        if number < 1:
            return self.error("Number must be at least 1.", 400)

        try:
            cine = Cine.objects.get(id=cine_id, is_active=True)
        except Cine.DoesNotExist:
            return self.error("Cine not found.", 400)

        existing = Sala.objects.filter(cine=cine, number=number).exclude(id=sala.id).first()
        if existing:
            return self.error("This cine already has a sala with this number.", 400)

        sala.cine = cine
        sala.number = number
        sala.save()
        return self.success(data={"id": sala.id, "cine": cine.id, "number": number})

    def delete_sala(self, sala: Sala) -> ServiceResult:
        if sala.funciones.filter(is_active=True).exists():
            return self.error(
                "Cannot delete sala because it has active funciones.", 400
            )
        sala.delete()
        return self.success(status_code=204)
