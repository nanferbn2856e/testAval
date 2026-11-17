from rest_framework.permissions import BasePermission

from .roles import ADMINISTRADOR


class IsAdminRole(BasePermission):
    """Permite el acceso solo al superusuario o a usuarios del grupo Administrador."""

    message = "Solo los administradores pueden realizar esta acción."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return user.is_superuser or user.groups.filter(name=ADMINISTRADOR).exists()
