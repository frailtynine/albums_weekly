import re

from django import template
from django.template.defaultfilters import truncatewords_html
from django.utils.safestring import mark_safe


register = template.Library()


@register.filter(name='class_name')
def class_name(instance):
    """Filter for template to check model name."""
    return instance.__class__.__name__

# Temporary solution for removing headline from Text content.
# I am too lazy to fix it in db for  now.
@register.filter(name='remove_first_h2')
def remove_first_h2(value):
    """Remove only the first <h2> tag from the HTML content."""
    return re.sub(r'<h2[^>]*>.*?<\/h2>', '', value, count=1)
