from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view, inline_serializer
from rest_framework import generics, permissions, serializers, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile
from .permissions import IsAdminRole
from .roles import ADMINISTRADOR, CLIENTE
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

# Declara el id de la ruta como entero (si no, Swagger lo muestra como string)
ID_PARAM = OpenApiParameter(
    name="id",
    type=int,
    location=OpenApiParameter.PATH,
    description="ID del usuario (user.id)",
)


def detail_id_param(cls):
    """Documenta el id de la ruta solo en las acciones que lo usan (/{id}/)."""
    return extend_schema_view(
        retrieve=extend_schema(parameters=[ID_PARAM]),
        update=extend_schema(parameters=[ID_PARAM]),
        partial_update=extend_schema(parameters=[ID_PARAM]),
        destroy=extend_schema(parameters=[ID_PARAM]),
    )(cls)


class RoleUserViewSet(viewsets.ModelViewSet):
    """CRUD completo de los usuarios de un rol. Cada rol hereda de esta clase."""

    role = None
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]  # por defecto, solo administradores

    def get_queryset(self):
        return (
            Profile.objects.filter(user__groups__name=self.role)
            .select_related("user")
            .prefetch_related("user__groups")
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["role"] = self.role
        return context

    def perform_destroy(self, instance):
        instance.user.delete()  # borra el User y, por CASCADE, el Profile


@extend_schema(
    tags=["Clientes"],
    description="Gestión de clientes (CRUD). No requiere token.",
)
@detail_id_param
class CustomerViewSet(RoleUserViewSet):
    role = CLIENTE
    permission_classes = [permissions.AllowAny]  # sin login requerido
    authentication_classes = []  # ignora cualquier token enviado


@extend_schema(
    tags=["Administradores"],
    description="Gestión de administradores (CRUD). Requiere token de un usuario Administrador.",
)
@detail_id_param
class AdministratorViewSet(RoleUserViewSet):
    role = ADMINISTRADOR


@extend_schema(
    tags=["Autenticación"],
    summary="Registro (crea un usuario con rol Cliente)",
    responses={
        201: inline_serializer(
            name="RegisterResponse",
            fields={
                "id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "email": serializers.EmailField(),
            },
        )
    },
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


@extend_schema(
    tags=["Autenticación"],
    summary="Login (devuelve tokens JWT y roles)",
    responses={
        200: inline_serializer(
            name="LoginResponse",
            fields={
                "access": serializers.CharField(),
                "refresh": serializers.CharField(),
                "user": inline_serializer(
                    name="LoginUser",
                    fields={
                        "id": serializers.IntegerField(),
                        "username": serializers.CharField(),
                        "email": serializers.EmailField(),
                        "first_name": serializers.CharField(),
                        "last_name": serializers.CharField(),
                        "is_superuser": serializers.BooleanField(),
                        "roles": serializers.ListField(child=serializers.CharField()),
                    },
                ),
            },
        )
    },
)
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer