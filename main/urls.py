from django.contrib import admin
from django.urls import path
from .views import index, table, tutorial

urlpatterns = [
    path("", index, name="index"),
    path("table/", table, name="table"),
    path("tutorial/", tutorial, name="tutorial"),
]