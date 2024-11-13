from urllib.parse import urlparse, urlunparse
import re

# Función para obtener la URL base
def get_base_url(url):
    parsed_url = urlparse(url)
    base_url = urlunparse((parsed_url.scheme, parsed_url.netloc, '', '', '', ''))
    return base_url

# Función para limpiar y procesar texto
def clean_text(text):
    # Elimina caracteres especiales y convierte a minúsculas
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.lower()

# Función para estandarizar valores numéricos
def standardize_values(data):
    for key, value in data.items():
        if isinstance(value, (int, float)):
            data[key] = float(value)  # Convertir a float
    return data