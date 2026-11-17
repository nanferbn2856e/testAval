from .base import *

DEBUG = False
APP_NAME = "customers-prod"
STARTUP_MESSAGE = "Ejecutando en PROD"
PORT = 9090  # puerto de gunicorn en producción

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

STATIC_ROOT = BASE_DIR / "staticfiles"

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True