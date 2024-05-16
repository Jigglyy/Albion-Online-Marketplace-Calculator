from django.contrib import admin
from django.urls import path
from .views import index, table

urlpatterns = [
    path("", index, name="index"),
    path("table/", table, name="table"),
]