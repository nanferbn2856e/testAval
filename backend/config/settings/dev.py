from .base import *

DEBUG = True
APP_NAME = "customers-dev"
STARTUP_MESSAGE = "Ejecutando en DEV"
PORT = 8080  # lo usa `python manage.py runserver` (users/management/commands/runserver.py)

ALLOWED_HOSTS = ["*"]  # acceso por IP:puerto, sin dominio
CORS_ALLOW_ALL_ORIGINS = True