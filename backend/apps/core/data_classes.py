from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class ServiceResult:
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    status_code: int = 200
