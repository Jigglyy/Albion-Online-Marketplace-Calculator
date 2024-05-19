# myapp/templatetags/custom_filters.py
from django import template
from django.utils.safestring import mark_safe
import re

register = template.Library()

@register.filter(name='colorize_city')
def colorize_city(value):
    color_map = {
        'Caerleon': 'darkred',
        'Bridgewatch': 'darkorange',
        'Fort Sterling': 'grey',
        'Lymhurst': 'green',
        'Martlock': 'blue',
        'Thetford': 'purple'
    }
    
    for city, color in color_map.items():
        if city in value:
            return mark_safe(f'<td style="color: {color};">{value}</td>')
    return mark_safe(f'<td>{value}</td>')

@register.filter(name='item_image')
def item_image(item_id):
    base_url = "https://render.albiononline.com/v1/item/"
    return mark_safe(
        f'<img src="{base_url}{item_id}" alt="{item_id}" title="{item_id}" style="width: 20px; height: 20px; display: block; margin: auto;">'
        f'<span class="text-xs">{item_id}</span>'
        f'</div>'
    )
    
@register.filter(name='quality_description')
def quality_description(value):
    quality_map = {
        '1': ('Normal', ''),
        '2': ('Good', 'color: gray;'),       # Iron
        '3': ('Outstanding', 'color: saddlebrown;'), # Bronze
        '4': ('Excellent', 'color: silver;'),   # Silver
        '5': ('Master Piece', 'color: goldenrod;') # Gold
    }
    description, style = quality_map.get(str(value), (value, ''))
    return mark_safe(f'<span style="{style}">{description}</span>')

@register.filter(name='item_image_crafting')
def item_image(item_id):
    base_url = "https://render.albiononline.com/v1/item/"
    return mark_safe(
        f'<img src="{base_url}{item_id}" alt="{item_id}" title="{item_id}" style="width: 20px; height: 20px; display: block; margin: auto;">'
        f'</div>'
    )