import json
import os
import re
from utils.text_processing import clean_text, standardize_values

def calculate_ibf(sensibilidad, intensidad):
    """Calcula el puntaje IBF usando sensibilidad e intensidad."""
    return (sensibilidad * 0.6) + (intensidad * 0.4)

def clean_mentions(text):
    """Elimina menciones y caracteres '&nbsp;' en el texto."""
    # Elimina menciones en formato "@nombre[12345]" y elimina "&nbsp;"
    text = re.sub(r'\s*@[^[]*\[[^\]]*\]', '', text)
    text = text.replace("&nbsp;", "")  # Elimina "&nbsp;"
    return text.strip()

def process_json_file(input_path, output_path):
    """Procesa un archivo JSONL (JSON Lines) aplicando limpieza, estandarización y cálculo de IBF."""
    processed_data = []
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    item = json.loads(line.strip())  # Carga cada línea como un objeto JSON
                    if 'texto' in item:
                        cleaned_text = clean_text(clean_mentions(item['texto']))
                        item['comentario_limpio'] = cleaned_text

                    if 'valores_ibf' in item:
                        standardized_values = standardize_values(item['valores_ibf'])
                        item['valores_ibf'] = standardized_values
                        item['ibf_score'] = calculate_ibf(
                            standardized_values.get('sensibilidad', 0),
                            standardized_values.get('intensidad', 0)
                        )

                    processed_data.append(item)

                except json.JSONDecodeError as e:
                    print(f"Error al decodificar la línea: {line.strip()}")
                    print(f"Detalle del error: {e}")

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=4)

        print(f"Archivo procesado y guardado en {output_path}")
    except Exception as e:
        print(f"Error inesperado: {e}")

def process_all_json_files(directories):
    """Procesa todos los archivos JSON en los directorios especificados."""
    for directory in directories:
        output_directory = os.path.join(directory, 'processed')
        os.makedirs(output_directory, exist_ok=True)

        for filename in os.listdir(directory):
            if filename.endswith('.json'):
                input_path = os.path.join(directory, filename)
                output_path = os.path.join(output_directory, f"processed_{filename}")
                process_json_file(input_path, output_path)

if __name__ == "__main__":
    input_directories = [
        os.path.join(os.path.dirname(__file__), '../results'),
        os.path.join(os.path.dirname(__file__), '../comentarios_emol')
    ]

    process_all_json_files(input_directories)

    process_all_json_files(input_directories)