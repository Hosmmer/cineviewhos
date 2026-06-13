# ViewSets & Views — Django 3.0.7

## Core Principle

Views are HTTP glue. The sequence is always:

1. **Authenticate** — `permission_classes` handles it
2. **Validate input** — serializer
3. **Call service** — business logic lives in `services.py`
4. **Return response**

No business logic, no ORM calls, no side effects in views.

## Primary Pattern — APIView

Max 50 lines per method. Extract private helpers for anything longer.

```python
from typing import Any

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Item
from .serializers import ItemCreateSerializer, ItemListSerializer
from .services import create_item, get_item_by_id


class ItemView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get a single item",
        parameters=[
            OpenApiParameter("item_id", type=str, location=OpenApiParameter.PATH),
        ],
        responses={
            200: ItemListSerializer,
            404: OpenApiResponse(description="Not found"),
        },
    )
    def get(self, request, item_id):
        item = get_item_by_id(item_id=item_id, user=request.user)
        if not item:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ItemListSerializer(item).data)

    @extend_schema(
        summary="Create an item",
        request=ItemCreateSerializer,
        responses={
            201: ItemListSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request):
        serializer = ItemCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        item, error = create_item(user=request.user, **serializer.validated_data)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ItemListSerializer(item).data, status=status.HTTP_201_CREATED)
```

## List + Filter Pattern — generics.ListCreateAPIView

```python
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Item
from .serializers import ItemListSerializer, ItemCreateSerializer


class ItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ItemCreateSerializer
        return ItemListSerializer

    def get_queryset(self):
        return Item.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        item, error = create_item(user=self.request.user, **serializer.validated_data)
        if error:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": error})
```

## Pagination

```python
from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ItemListCreateView(generics.ListCreateAPIView):
    pagination_class = StandardPagination
```

## Permissions

```python
from rest_framework.permissions import IsAuthenticated, AllowAny

# Standard
permission_classes = [IsAuthenticated]

# Public endpoint
permission_classes = [AllowAny]
```

## @extend_schema — Required on Every Endpoint

```python
@extend_schema(
    summary="List items",
    description="Returns paginated list. Supports filtering by status and search by name.",
    parameters=[
        OpenApiParameter("status", type=str, required=False),
        OpenApiParameter("page", type=int, required=False),
        OpenApiParameter("page_size", type=int, required=False),
    ],
    responses={
        200: ItemListSerializer(many=True),
    },
    operation_id="item_list",
)
def get(self, request):
    ...
```

## URL Configuration

```python
# apps/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("items/", views.ItemListCreateView.as_view(), name="item-list-create"),
    path("items/<uuid:item_id>/", views.ItemView.as_view(), name="item-detail"),
]
```

## Response Conventions

```python
# 200 — successful GET / PUT / PATCH
return Response(serializer.data)

# 201 — successful POST
return Response(serializer.data, status=status.HTTP_201_CREATED)

# 204 — successful DELETE (no body)
return Response(status=status.HTTP_204_NO_CONTENT)

# 400 — validation error
return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 400 — service error
return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

# 404 — use get_object_or_404
item = get_object_or_404(Item, id=item_id)

# 409 — resource conflict
return Response({"detail": "Already exists."}, status=status.HTTP_409_CONFLICT)
```

## Quick Reference

| Use case | Class |
|---|---|
| Single resource (create/get/update/delete) | `APIView` |
| Filtered, paginated list + create | `generics.ListCreateAPIView` |
| Retrieve + update + delete | `generics.RetrieveUpdateDestroyAPIView` |
| Read-only list | `generics.ListAPIView` |

| Pattern | Status code |
|---|---|
| Successful create | 201 |
| Successful delete | 204 |
| Resource not found | 404 (via `get_object_or_404`) |
| Validation error | 400 |
| Not authenticated | 401 (automatic) |
