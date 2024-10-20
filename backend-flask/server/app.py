from flask import Flask, request, jsonify, send_file
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


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
app=Flask(__name__)
# Configuración de JWT
JWT_SECRET = os.getenv('JWT_SECRET')  # Para HMAC
# O para RSA:
# with open('path_to_public_key.pem') as f:
#     JWT_PUBLIC_KEY = f.read()
# Configuración de RabbitMQ
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
            pika.ConnectionParameters(host=RABBITMQ_HOST,port=RABBITMQ_PORT,credentials=credentials)
        )
        channel = connection.channel();
        
        ##esto es para asegurarno que el channel existe 
        # channel.queue_declare(queue=RABBITMQ_QUEUE,durable=True,arguments={
        #     'x-dead-letter-exchange':DEAD_LETTER_EXCHANGE,
        #     'x-dead-letter-routing-key':f"{RABBITMQ_QUEUE}_dead"
        # })

        for comment in comments:
            message = json.dumps(comment)        
            channel.basic_publish(
                exchange='',
                routing_key=RABBITMQ_QUEUE,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2
                )
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
                print("Comment adjusted:", comment_adjusted)
                comments.append(comment_adjusted)
        comments_to_send = comments[:600]

        publish_comments_to_rabbitmq(comments_to_send)

    except Exception as e:
        print(f"Error enviando comentarios a RabbitMQ: {e}")


def run_spider(spider_name, **kwargs):
    try:
        settings = get_project_settings()
        process = CrawlerProcess(settings)
        process.crawl(spider_name, **kwargs)
        process.start()  # Bloquea hasta que el spider termine
    except Exception as e:
        print(f"Error al ejecutar el spider {spider_name}: {e}")

# def send_comments_to_backend():
#     try:
#         comments = []
#         with open('comentarios_emol.json', 'r', encoding='utf-8') as f:
#             for line in f:
#                 comment = json.loads(line)
#                 comment_adjusted = {
#                     'id': str(comment.get('id')),
#                     'texto': comment.get('texto'),
#                     'fecha': int(comment.get('fecha')) if comment.get('fecha') else None,
#                     'autor': comment.get('autor'),
#                     'sourceUrl': comment.get('sourceUrl') or 'https://www.emol.com',
#                     'news_url': comment.get('news_url')
#                 }
#                 print("Comment adjusted:", comment_adjusted)
#                 comments.append(comment_adjusted)
#         comments_to_send = comments[:200]

#         data = {
#             "webSiteName": "https://www.emol.com",
#             "comments": comments_to_send
#         }

#         token = get_service_token()
#         if not token:
#             print("Unable to obtain authentication token.")
#             return

#         headers = {
#             'Content-Type': 'application/json',
#             'Authorization': f'Bearer {token}'
#         }

#         backend_url = 'http://localhost:4000/scraping/scraping-emol'
#         response = requests.post(backend_url, json=data, headers=headers)

#         if response.status_code == 200:
#             print("Comments sent successfully.")
#         else:
#             print(f"Failed to send comments. Status code: {response.status_code}")
#             print(f"Response: {response.text}")

#     except Exception as e:
#         print(f"Error sending comments to backend: {e}")

# def get_service_token():
#     service_login_url = 'http://localhost:4000/auth/login'
#     service_credentials = {
#         'email': os.getenv('SERVICE_EMAIL'),  # 'service_account@test.com'
#         'password': os.getenv('SERVICE_PASSWORD')  # 'secure_password'
#     }
#     response = requests.post(service_login_url, json=service_credentials)
#     if response.status_code == 200:
#         return response.json().get('accessToken')
#     else:
#         print(f"Failed to login as service account. Status code: {response.status_code}")
#         print(f"Response: {response.text}")
#         return None

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

@app.route('/api/scrapping/emol/run-news', methods=['POST'])
@token_required
def run_emol_news_spider():
    spider_process = multiprocessing.Process(target=run_spider, args=('emol_news_spider',))
    spider_process.start()
    spider_process.join()

    send_comments_to_rabbitmq()

    return jsonify({"status": "Scraping en news de EMOL iniciado"}), 200

@app.route('/api/scrapping/emol/run_spiders', methods=['POST'])
@token_required
def run_general_spider():
    data = request.get_json()
    spider_name = data.get("spider_name") if data else None

    if not spider_name:
        return jsonify({"error": "El nombre del spider a ejecutar es requerido"}), 400

    spider_args = data.get('args', {})

    spider_process = multiprocessing.Process(target=run_spider, args=(spider_name,), kwargs=spider_args)
    spider_process.start()
    return jsonify({"status": f"Spider {spider_name} ejecutado"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

