import subprocess
from flask import Flask, jsonify
from celery import Celery
import os

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

@celery.task(name="app.run_spider_task")
def run_spider_task():
    # Llama al comando `scrapy crawl emol_news_spider` como subproceso
    result = subprocess.run(
        ["scrapy", "crawl", "emol_news_spider"],
        cwd="scrapy_brujula",  # Asegúrate de que apunta al directorio correcto del proyecto Scrapy
        capture_output=True,
        text=True
    )
    # Captura la salida y errores del comando
    if result.returncode == 0:
        return "Scraping completado con éxito"
    else:
        return f"Error en el scraping: {result.stderr}"

# Endpoint para iniciar el scraping
@app.route('/start_scraping', methods=['POST'])
def start_scraping():
    # Inicia la tarea de Celery
    task = run_spider_task.delay()
    return jsonify({"message": "Scraping iniciado", "task_id": task.id}), 200

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Servidor Flask está recibiendo solicitudes correctamente"}), 200

@app.route('/task_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    task = run_spider_task.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {"state": task.state, "status": "La tarea está pendiente o en cola..."}
    elif task.state == 'SUCCESS':
        response = {"state": task.state, "status": "¡Tarea completada!"}
    else:
        response = {"state": task.state, "status": str(task.info)}
    return jsonify(response)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

