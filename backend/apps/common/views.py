from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.models import User
from apps.common.permissions import IsAdminUser
from apps.common.serializers import UserAdminSerializer


class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    http_method_names = ["get", "patch", "head", "options"]
