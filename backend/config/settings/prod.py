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
# True en un servidor con HTTPS real; False solo para la prueba local por http
COOKIES_SECURE = env.bool("COOKIES_SECURE", default=True)
SESSION_COOKIE_SECURE = COOKIES_SECURE
CSRF_COOKIE_SECURE = COOKIES_SECURE

# --- Archivos estáticos con WhiteNoise ---
_security_idx = MIDDLEWARE.index("django.middleware.security.SecurityMiddleware")
MIDDLEWARE.insert(_security_idx + 1, "whitenoise.middleware.WhiteNoiseMiddleware")

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# --- Detrás de un proxy / balanceador con HTTPS ---
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --- HSTS: configurable, 0 en local ---
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0)

# --- Documentación de la API apagada en prod ---
ENABLE_API_DOCS = False