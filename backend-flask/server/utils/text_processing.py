import re

def clean_text(text):
    """Elimina caracteres especiales y convierte el texto a minúsculas."""
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.lower()

def standardize_values(data):
    """Estandariza los valores numéricos en el diccionario proporcionado."""
    for key, value in data.items():
        if isinstance(value, (int, float)):
            data[key] = float(value)  # Se convertira a un float
    return data