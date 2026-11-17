from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group, User
from django.db import transaction

from .models import Customer
from .roles import CLIENTE


class CustomerAdminForm(forms.ModelForm):
    username = forms.CharField(label="Usuario", max_length=150)
    email = forms.EmailField(label="Correo")
    first_name = forms.CharField(label="Nombre", max_length=150)
    last_name = forms.CharField(label="Apellido", max_length=150, required=False)
    password = forms.CharField(
        label="Contraseña",
        required=False,
        min_length=8,
        widget=forms.PasswordInput(render_value=False),
        help_text=(
            "Opcional. Al crear: si queda vacía, el cliente existe pero no puede iniciar sesión. "
            "Al editar: si queda vacía, se conserva la actual."
        ),
    )

    class Meta:
        model = Customer
        fields = ["phone", "document_number", "address", "city"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            user = self.instance.user
            for name in ("username", "email", "first_name", "last_name"):
                self.fields[name].initial = getattr(user, name)

    def _other_users(self):
        qs = User.objects.all()
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        return qs

    def clean_username(self):
        value = self.cleaned_data["username"]
        if self._other_users().filter(username=value).exists():
            raise forms.ValidationError("El usuario ya existe.")
        return value

    def clean_email(self):
        value = self.cleaned_data["email"]
        if self._other_users().filter(email__iexact=value).exists():
            raise forms.ValidationError("El correo ya está registrado.")
        return value

    def clean_document_number(self):
        return self.cleaned_data.get("document_number") or None  # evita duplicados de ""


class LoginFilter(admin.SimpleListFilter):
    """Separa quienes tienen contraseña de quienes solo existen como dato."""

    title = "acceso"
    parameter_name = "acceso"

    def lookups(self, request, model_admin):
        return (
            ("si", "Puede iniciar sesión"),
            ("no", "Sin login (solo dato)"),
        )

    def queryset(self, request, queryset):
        # Django marca las contraseñas inutilizables con el prefijo "!"
        if self.value() == "si":
            return queryset.exclude(user__password__startswith="!")
        if self.value() == "no":
            return queryset.filter(user__password__startswith="!")
        return queryset


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    form = CustomerAdminForm
    list_display = (
        "user_id", "username", "email", "first_name", "last_name",
        "phone", "city", "puede_login", "created_at",
    )
    list_display_links = ("user_id", "username")
    search_fields = (
        "user__username", "user__email", "user__first_name", "user__last_name",
        "document_number", "phone", "city",
    )
    search_help_text = "Busca por usuario, correo, nombre, apellido, documento, teléfono o ciudad."
    list_filter = (LoginFilter, "user__is_active", "city", "created_at")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    list_per_page = 25
    fieldsets = (
        ("Cuenta", {"fields": ("username", "email", "password")}),
        ("Datos personales", {"fields": ("first_name", "last_name", "document_number")}),
        ("Contacto", {"fields": ("phone", "address", "city")}),
    )

    # --- columnas calculadas desde auth_user ---
    @admin.display(description="ID", ordering="user_id")
    def user_id(self, obj):
        return obj.user_id

    @admin.display(description="Usuario", ordering="user__username")
    def username(self, obj):
        return obj.user.username

    @admin.display(description="Correo", ordering="user__email")
    def email(self, obj):
        return obj.user.email

    @admin.display(description="Nombre", ordering="user__first_name")
    def first_name(self, obj):
        return obj.user.first_name

    @admin.display(description="Apellido", ordering="user__last_name")
    def last_name(self, obj):
        return obj.user.last_name

    @admin.display(description="Login", boolean=True)
    def puede_login(self, obj):
        return obj.user.has_usable_password()

    # --- solo usuarios del grupo Cliente ---
    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .filter(user__groups__name=CLIENTE)
            .select_related("user")
        )

    # --- crear / editar: User + grupo + Profile en una transacción ---
    @transaction.atomic
    def save_model(self, request, obj, form, change):
        data = form.cleaned_data
        user = obj.user if change else User()
        user.username = data["username"]
        user.email = data["email"]
        user.first_name = data["first_name"]
        user.last_name = data.get("last_name", "")

        if data.get("password"):
            user.set_password(data["password"])
        elif not change:
            user.set_unusable_password()
        user.save()

        if not change:
            user.groups.add(Group.objects.get(name=CLIENTE))
            obj.user = user
        obj.save()

    # --- eliminar: borra el User (el Profile se va por CASCADE) ---
    @transaction.atomic
    def delete_model(self, request, obj):
        obj.user.delete()

    @transaction.atomic
    def delete_queryset(self, request, queryset):
        User.objects.filter(pk__in=list(queryset.values_list("pk", flat=True))).delete()