import logging

from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate

logger = logging.getLogger(__name__)


def create_roles(sender, **kwargs):
    from django.contrib.auth.models import Group

    from .roles import ROLES

    for name in ROLES:
        Group.objects.get_or_create(name=name)


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        logger.info("[%s] %s", settings.APP_NAME, settings.STARTUP_MESSAGE)
        post_migrate.connect(create_roles, sender=self)