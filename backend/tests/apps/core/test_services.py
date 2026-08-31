from apps.core.data_classes import ServiceResult
from apps.core.services.base import BaseService


class TestServiceResult:
    def test_defaults(self):
        result = ServiceResult(success=True)
        assert result.success is True
        assert result.data is None
        assert result.error is None
        assert result.status_code == 200


class TestBaseService:
    def test_success(self):
        service = BaseService()
        result = service.success(data={"id": 1})
        assert result.success
        assert result.data == {"id": 1}
        assert result.status_code == 200

    def test_success_with_status(self):
        service = BaseService()
        result = service.success(status_code=201)
        assert result.status_code == 201

    def test_error(self):
        service = BaseService()
        result = service.error("boom", 400)
        assert not result.success
        assert result.error == "boom"
        assert result.status_code == 400
