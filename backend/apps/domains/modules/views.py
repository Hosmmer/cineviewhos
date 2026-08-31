from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import HasRole

from .models import Module
from .serializers import ModuleSerializer, ModuleTreeSerializer
from .services import ModuleService


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    service_class = ModuleService

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), HasRole("admin")()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            if self.request.query_params.get("flat") == "true":
                return ModuleSerializer
            return ModuleTreeSerializer
        return ModuleSerializer

    def list(self, request, *args, **kwargs):
        if request.query_params.get("flat") == "true":
            queryset = Module.objects.filter(is_active=True).order_by("parent", "order", "name")
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        service = self.service_class()
        root_modules = service.get_tree_for_user(request.user)

        # filter children by user roles too
        def filter_children(module):
            filtered = []
            for child in Module.objects.filter(
                parent=module, is_active=True
            ).order_by("order", "name"):
                if service._user_can_see(request.user, child):
                    filtered.append(child)
            return filtered

        result = []
        for module in root_modules:
            children = filter_children(module)
            module._prefetched_children = children
            serializer = ModuleTreeSerializer(module, context={"request": request})
            data = serializer.data
            result.append(data)

        return Response(result)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        result = service.create_module(**serializer.validated_data)
        if result.success:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"detail": result.error}, status=result.status_code)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        service = self.service_class()
        result = service.update_module(instance, **serializer.validated_data)
        if result.success:
            return Response(serializer.data)
        return Response({"detail": result.error}, status=result.status_code)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        service = self.service_class()
        result = service.delete_module(instance)
        if result.success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": result.error}, status=result.status_code)
