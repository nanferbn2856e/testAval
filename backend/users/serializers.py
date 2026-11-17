from django.contrib.auth.models import Group, User
from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Profile
from .roles import CLIENTE


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)  # siempre = email
    email = serializers.EmailField(source="user.email")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    roles = serializers.SerializerMethodField()
    document_number = serializers.CharField(
        max_length=30, required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model = Profile
        fields = [
            "id", "username", "email", "first_name", "last_name", "password", "roles",
            "phone", "document_number", "address", "city", "created_at",
        ]
        read_only_fields = ["created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Al editar un perfil existente, el correo (y por tanto el usuario) y la
        # contraseña no se pueden cambiar: el correo pasa a solo lectura y
        # la contraseña deja de aceptarse.
        if isinstance(self.instance, Profile):
            self.fields["email"].read_only = True
            self.fields.pop("password", None)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_roles(self, obj):
        return [g.name for g in obj.user.groups.all()]

    def _current_user_id(self):
        return self.instance.user_id if isinstance(self.instance, Profile) else None

    def validate_email(self, value):
        value = value.strip().lower()
        qs = User.objects.filter(
            Q(email__iexact=value) | Q(username__iexact=value)
        ).exclude(pk=self._current_user_id())
        if qs.exists():
            raise serializers.ValidationError("El correo ya está registrado.")
        return value

    def validate_document_number(self, value):
        if not value:
            return None  # evita duplicados de cadenas vacías
        qs = Profile.objects.filter(document_number=value).exclude(pk=self._current_user_id())
        if qs.exists():
            raise serializers.ValidationError("El documento ya está registrado.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        password = validated_data.pop("password", None)
        role = self.context["role"]

        user_data["username"] = user_data["email"]  # el login es el correo

        user = User(**user_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()  # existe como dato, no puede iniciar sesión
        user.save()
        user.groups.add(Group.objects.get(name=role))
        return Profile.objects.create(user=user, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        # email y password no llegan aquí (solo lectura / eliminado en __init__),
        # así que solo se editan nombres y datos del perfil.
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(Q(email__iexact=value) | Q(username__iexact=value)).exists():
            raise serializers.ValidationError("El correo ya está registrado.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]  # el login es el correo
        user = User.objects.create_user(**validated_data)
        user.groups.add(Group.objects.get(name=CLIENTE))
        Profile.objects.create(user=user)
        return user

    def to_representation(self, instance):
        return {"id": instance.id, "username": instance.username, "email": instance.email}


class LoginSerializer(TokenObtainPairSerializer):
    """Login estándar JWT, y además devuelve los datos básicos y roles."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "is_superuser": self.user.is_superuser,
            "roles": [g.name for g in self.user.groups.all()],
        }
        return data