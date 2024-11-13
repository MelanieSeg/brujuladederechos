import pandas as pd
import re

def clean_text(text):
    if pd.isna(text):
        return ""
    # Eliminar caracteres especiales y texto entre corchetes
    text = re.sub(r'@\S+|\[.*?\]|[^a-zA-Z0-9\s]', '', text)
    return text.lower()

def preprocess_data(file_path, output_path):
    # Cargar el archivo
    df = pd.read_csv(file_path)

    # Renombrar columnas
    df.rename(columns={
        'NombreOriginalColumna1': 'sensibilidad_privacidad',
        'NombreOriginalColumna2': 'tiempo_desde_evento',
        'NombreOriginalColumna3': 'empatia_privacidad'
    }, inplace=True)
    
    # Limpiar comentarios
    df['comentario_limpio'] = df['comentario'].apply(clean_text)
    
    # Convertir valores numéricos a float
    df['sensibilidad_privacidad'] = df['sensibilidad_privacidad'].astype(float)
    df['tiempo_desde_evento'] = df['tiempo_desde_evento'].astype(float)
    df['empatia_privacidad'] = df['empatia_privacidad'].astype(float)
    
    # Guardar el archivo procesado
    df.to_csv(output_path, index=False)
    print("Archivo procesado y guardado en:", output_path)