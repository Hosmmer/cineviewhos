from typing import Any

from ..data_classes import ServiceResult


class BaseService:
    def execute(self, **kwargs) -> ServiceResult:
        raise NotImplementedError

    def success(self, data: Any = None, status_code: int = 200) -> ServiceResult:
        return ServiceResult(success=True, data=data, status_code=status_code)

    def error(self, message: str, status_code: int = 400) -> ServiceResult:
        return ServiceResult(success=False, error=message, status_code=status_code)
