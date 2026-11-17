from django.conf import settings
from django.db import models

# Create your models here.
class Profile(models.Model):
    """Campos comunes a todos los usuarios, sin importar el rol."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,  # el id del perfil es el user.id
        related_name="profile",
    )
    phone = models.CharField(max_length=20, blank=True)
    document_number = models.CharField(max_length=30, unique=True, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Customer(Profile):
    """Proxy de Profile: sin tabla propia, solo para administrar clientes en el admin."""

    class Meta:
        proxy = True
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"