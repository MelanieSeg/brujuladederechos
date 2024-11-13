import subprocess
from flask import Flask, jsonify
from celery import Celery
import os
from utils.preprocessing import preprocess_data  # Importa la función de preprocesamiento

app = Flask(__name__)
app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND')

# Configuración de Celery
def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)
    return celery

celery = make_celery(app)

# Tarea de Celery para el scraping
@celery.task(name="app.run_spider_task")
def run_spider_task():
    result = subprocess.run(
        ["scrapy", "crawl", "emol_news_spider"],
        cwd="scrapy_brujula",  # Asegúrate de que apunta al directorio correcto del proyecto Scrapy
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        return "Scraping completado con éxito"
    else:
        return f"Error en el scraping: {result.stderr}"

# Nueva tarea de Celery para el preprocesamiento de datos
@celery.task(name="app.preprocess_data_task")
def preprocess_data_task(input_file, output_file):
    preprocess_data(input_file, output_file)
    return "Preprocesamiento completado con éxito"

# Endpoint para iniciar el scraping
@app.route('/start_scraping', methods=['POST'])
def start_scraping():
    # Inicia la tarea de Celery para el scraping
    task = run_spider_task.delay()
    return jsonify({"message": "Scraping iniciado", "task_id": task.id}), 200

# Endpoint para iniciar el preprocesamiento
@app.route('/start_preprocessing', methods=['POST'])
def start_preprocessing():
    # Ruta de entrada y salida para el preprocesamiento
    input_file = '/path/to/ComentarioScraped.csv'  # Ajusta esta ruta según tu archivo
    output_file = '/path/to/ComentariosProcesados.csv'  # Ajusta esta ruta para el archivo procesado
    # Inicia la tarea de Celery para el preprocesamiento
    task = preprocess_data_task.delay(input_file, output_file)
    return jsonify({"message": "Preprocesamiento iniciado", "task_id": task.id}), 200

# Endpoint para verificar el estado de la tarea
@app.route('/task_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    task = celery.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {"state": task.state, "status": "La tarea está pendiente o en cola..."}
    elif task.state == 'SUCCESS':
        response = {"state": task.state, "status": "¡Tarea completada!"}
    else:
        response = {"state": task.state, "status": str(task.info)}
    return jsonify(response)

# Endpoint para verificar el estado del servidor
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Servidor Flask está recibiendo solicitudes correctamente"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)