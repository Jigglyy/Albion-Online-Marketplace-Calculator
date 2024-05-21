import json
from django.shortcuts import render
from pathlib import Path

# Create your views here.

def index(request):
    return render(request, 'index.html', {'current_page': 'index'})


def table(request):
    items_file_path = Path(__file__).resolve().parent / 'items.json'
    
    with open(items_file_path) as f:
        items = json.load(f)['items']

    return render(request, 'table.html', {'current_page': 'table', 'items': items})

def tutorial(request):
    return render(request, 'tutorial.html', {'current_page': 'tutorial'})