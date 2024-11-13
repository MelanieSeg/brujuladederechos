import re

# Función para limpiar y procesar texto
def clean_text(text):
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  # Eliminar caracteres especiales
    return text.lower()  # Convertir a minúsculas

# Función para estandarizar valores numéricos
def standardize_values(data):
    for key, value in data.items():
        if isinstance(value, (int, float)):
            data[key] = float(value)  # Convertir a float
    return data