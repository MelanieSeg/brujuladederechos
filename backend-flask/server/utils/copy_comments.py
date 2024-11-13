import json
import os

# Ruta de los archivos
input_file = os.path.join(os.path.dirname(__file__), 'comentarios_emol.json')
output_file = os.path.join(os.path.dirname(__file__), 'comentarios_emol', 'comentarios.json')

try:
    # Lee el contenido de comentarios_emol.json
    with open(input_file, 'r', encoding='utf-8') as infile:
        data = json.load(infile)
        print(f"Contenido de {input_file} cargado correctamente.")

    # Escribe el contenido en comentarios.json
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(data, outfile, ensure_ascii=False, indent=4)
        print(f"Contenido copiado a {output_file} exitosamente.")

except Exception as e:
    print(f"Error al copiar los datos: {e}")