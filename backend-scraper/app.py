import subprocess
from flask import Flask, jsonify,request
from celery import Celery
import os
from flask_cors import CORS
import jwt  
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/start_scraping": {"origins": "http://localhost:3000"}})
app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND')

JWT_SECRET = os.getenv('JWT_SECRET',)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            return jsonify({'error': 'Token de autenticación requerido'}), 401

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = decoded
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'El token ha expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401

        return f(*args, **kwargs)
    return decorated


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
        cwd="scrapy_brujula",  
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        return "Scraping completado con éxito"
    else:
        return f"Error en el scraping: {result.stderr}"

# Endpoint para iniciar el scraping
@app.route('/start_scraping', methods=['POST'])
@token_required
def start_scraping():
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

