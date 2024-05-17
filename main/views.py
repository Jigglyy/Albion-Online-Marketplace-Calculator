from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, 'index.html', {'current_page': 'index'})


def table(request):
    return render(request, 'table.html', {'current_page': 'table'})

def tutorial(request):
    return render(request, 'tutorial.html', {'current_page': 'tutorial'})