from flask import Flask, request, jsonify
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import multiprocessing
import os
import sys
import json
import requests
from datetime import datetime
from functools import wraps
import jwt  # PyJWT
from jwt import PyJWTError
from dotenv import load_dotenv
import pika
import logging
from threading import Thread
from scrapy import signals
from scrapy.signalmanager import dispatcher
import utils.utils as utils  # Importa utils para usar las funciones de limpieza y estandarización
from utils.text_processing import clean_text, standardize_values


# Configuración de logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Cargar configuración de Scrapy y Flask
os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'server.comentarios_emol.settings')

app = Flask(__name__)

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, parent_dir)
logger.debug(f"Current directory: {current_dir}")
logger.debug(f"Parent directory added to sys.path: {parent_dir}")
logger.debug(f"sys.path: {sys.path}")

os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'server.comentarios_emol.settings')

# Prueba de importación
try:
    from server.comentarios_emol import settings as scrapy_settings
    logger.debug("Módulo 'server.comentarios_emol.settings' importado correctamente.")
except ModuleNotFoundError as e:
    logger.error(f"Error al importar 'server.comentarios_emol.settings': {e}")
    sys.exit(1)

load_dotenv()
app = Flask(__name__)

# Configuración de JWT
JWT_SECRET = os.getenv('JWT_SECRET')
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'comentarios_scraping_queue')
DEAD_LETTER_EXCHANGE = 'comentarios_scraping_queue_dead'

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

def publish_comments_to_rabbitmq(comments):
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        )
        channel = connection.channel()
        for comment in comments:
            message = json.dumps(comment)
            channel.basic_publish(
                exchange='',
                routing_key=RABBITMQ_QUEUE,
                body=message,
                properties=pika.BasicProperties(delivery_mode=2)
            )
            print(f"Publicado comentarios en RabbitMQ: {message}")
        connection.close()
    except Exception as e:
        print(f"Error al publicar en RabbitMQ: {e}")

def send_comments_to_rabbitmq():
    try:
        comments = []
        with open('comentarios_emol.json', 'r', encoding='utf-8') as f:
            for line in f:
                comment = json.loads(line)
                comment_adjusted = {
                    'id': str(comment.get('id')),
                    'texto': comment.get('texto'),
                    'fecha': int(comment.get('fecha')) if comment.get('fecha') else None,
                    'autor': comment.get('autor'),
                    'sourceUrl': comment.get('sourceUrl') or 'https://www.emol.com',
                    'news_url': comment.get('news_url')
                }
                comments.append(comment_adjusted)
        comments_to_send = comments[2555:3000]

        publish_comments_to_rabbitmq(comments_to_send)

    except Exception as e:
        print(f"Error enviando comentarios a RabbitMQ: {e}")

def run_spider(spider_name, **kwargs):
    try:
        settings = get_project_settings()
        process = CrawlerProcess(settings)

        def spider_closed(spider):
            send_comments_to_rabbitmq()

        dispatcher.connect(spider_closed, signal=signals.spider_closed)
        process.crawl(spider_name, **kwargs)
        process.start()
    except Exception as e:
        logger.exception(f"Error al ejecutar el spider {spider_name}: {e}")

# Endpoint para ejecutar el spider de comentarios
@app.route('/api/scrapping/emol/run-comentarios', methods=['POST'])
@token_required
def run_comentarios_spider():
    data = request.get_json()
    url = data.get('url') if data else None

    if not url:
        return jsonify({"error": "Se requiere una URL para ejecutar el spider"}), 400

    spider_process = multiprocessing.Process(target=run_spider, args=('comentarios_api_spider',), kwargs={'url': url})
    spider_process.start()
    return jsonify({"status": "Comentarios spider iniciado"}), 200

# Endpoint para ejecutar el spider de noticias de EMOL
@app.route('/api/scrapping/emol/run-news', methods=['POST'])
@token_required
def run_emol_news_spider():
    thread = Thread(target=run_spider, args=('emol_news_spider',))
    thread.start()
    return jsonify({"status": "Scraping en news de EMOL iniciado"}), 200

# Endpoint para preprocesar comentarios
@app.route('/api/comments/preprocess', methods=['POST'])
def preprocess_comment():
    data = request.json
    comentario = data.get('comentario', '')
    valores_ibf = data.get('valores_ibf', {})

    # Aplicar las funciones de limpieza y estandarización desde utils
    comentario_limpio = utils.clean_text(comentario)
    valores_ibf_estandarizados = utils.standardize_values(valores_ibf)

    result = {
        'comentario_limpio': comentario_limpio,
        'valores_ibf_estandarizados': valores_ibf_estandarizados
    }
    return jsonify(result)

# Endpoint de prueba
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Servidor Flask está recibiendo solicitudes correctamente"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)