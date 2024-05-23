from django.contrib import admin
from django.urls import path
from .views import index, table, tutorial, my_endpoint

urlpatterns = [
    path("", index, name="index"),
    path("table/", table, name="table"),
    path("tutorial/", tutorial, name="tutorial"),
    path("my-endpoint/", my_endpoint, name="my-endpoint"),
]