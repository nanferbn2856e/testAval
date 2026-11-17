from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import (
    Command as StaticfilesRunserver,
)


class Command(StaticfilesRunserver):
    """runserver que toma su puerto por defecto de settings.PORT.

    Así `python manage.py runserver` arranca en el puerto definido en el
    archivo de settings del ambiente (dev.py: 8080), sin escribirlo a mano.
    Sigue aceptando un puerto explícito: `runserver 0.0.0.0:8080`.

    Para que Django use este comando en lugar del suyo, la app `users` debe
    estar listada ANTES de `django.contrib.staticfiles` en INSTALLED_APPS.
    """

    default_port = str(settings.PORT)
