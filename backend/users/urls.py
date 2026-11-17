from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .apiViews import AdministratorViewSet, CustomerViewSet, LoginView, RegisterView

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("administrators", AdministratorViewSet, basename="administrator")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("", include(router.urls)),
]