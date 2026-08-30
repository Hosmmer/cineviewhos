from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Role, User
from .permissions import HasRole, IsAdminUser
from .serializers import RoleSerializer, UserAdminSerializer


class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    http_method_names = ["get", "patch", "head", "options"]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), HasRole("admin")()]
        return [IsAuthenticated()]
