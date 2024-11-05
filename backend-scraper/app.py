from flask import Flask, request, jsonify
from functools import wraps
from celery import Celery
from scrapy_brujula.scrapy_brujula.spiders.emol_news_spider import EmolNewsSpider
from scrapy.crawler import CrawlerRunner
from twisted.internet import reactor
from crochet import setup, wait_for
import jwt
import os

setup()  # Configura Crochet para ejecutar Scrapy con Twisted en segundo plano

app = Flask(__name__)
app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND')
JWT_SECRET = os.getenv('JWT_SECRET')  # Llave secreta para JWT

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

# Configuración de CrawlerRunner para Scrapy
runner = CrawlerRunner()

# Decorador para verificar el token JWT
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

# Definir la tarea de Celery para ejecutar el spider
@celery.task
@wait_for(timeout=300)  # Espera hasta 5 minutos
def run_spider_task():
    d = runner.crawl(EmolNewsSpider)
    return d

# Endpoint protegido para iniciar el spider
@app.route('/start_spider', methods=['POST'])
@token_required
def start_spider():
    # Inicia el spider como una tarea asincrónica de Celery
    task = run_spider_task.delay()
    return jsonify({"message": "Spider iniciado", "task_id": task.id}), 200

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Servidor Flask está recibiendo solicitudes correctamente"}), 200

if __name__ == "__main__":
    app.run(debug=True)

