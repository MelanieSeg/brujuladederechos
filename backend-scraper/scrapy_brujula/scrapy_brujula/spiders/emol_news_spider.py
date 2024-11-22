import pika
import scrapy
from urllib.parse import quote
import json
from utils.utils import get_base_url
import os
import re

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'comentarios_crudos_queue')



print("Configuración de RabbitMQ:")
print("Host:", RABBITMQ_HOST)
print("Puerto:", RABBITMQ_PORT)
print("Usuario:", RABBITMQ_USER)
print("Contraseña:", RABBITMQ_PASSWORD)
print("Cola:", RABBITMQ_QUEUE)




class EmolNewsSpider(scrapy.Spider):
    name = "emol_news_spider"
    allowed_domains = ['emol.com', 'cache-comentarios.ecn.cl']
    start_urls = ['https://www.emol.com/']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Configuración de RabbitMQ
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        )
        self.channel = self.connection.channel()
               # Declarar el intercambio de dead letters
        self.channel.exchange_declare(exchange='comentarios_dead_letter_exchange', exchange_type='direct', durable=True)

        # Declarar la cola de dead letters
        self.channel.queue_declare(queue='comentarios_dead_letter_queue', durable=True)

        # Vincular la cola de dead letters al intercambio de dead letters
        self.channel.queue_bind(exchange='comentarios_dead_letter_exchange', queue='comentarios_dead_letter_queue', routing_key='dead_letter_routing_key')

        # Declarar la cola de comentarios crudos con dead-letter arguments
        self.channel.queue_declare(
            queue=RABBITMQ_QUEUE,
            durable=True,
            arguments={
                'x-dead-letter-exchange': 'comentarios_dead_letter_exchange',
                'x-dead-letter-routing-key': 'dead_letter_routing_key'  
            }
        )


    def close(self, reason):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        super().close(reason)

    def parse(self, response):
        for link in response.css('a::attr(href)').getall():
            if link.startswith('/noticias/'):
                news_url = response.urljoin(link)
                yield scrapy.Request(news_url, callback=self.parse_news)

    def parse_news(self, response):
        news_url = response.url
        base_url = get_base_url(news_url)
        encoded_url = quote(news_url, safe='')

        api_url = (
            f"https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&"
            f"url={encoded_url}&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=true"
        )

        yield scrapy.Request(
            api_url,
            callback=self.parse_comments,
            meta={'news_url': news_url, 'sourceUrl': base_url}
        )

    def parse_comments(self, response):
        self.logger.info("Procesando comentarios de la URL: %s", response.url)
        try:
            data = response.json()
            self.logger.info("Datos decodificados correctamente.")
        except json.JSONDecodeError as e:
            self.logger.error(f"No se pudo decodificar JSON para la URL: {response.url}. Error: {e}")
            return

        comentarios = data.get('comments', [])
        self.logger.info("Comentarios obtenidos: %s", len(comentarios))
        for comentario in comentarios:
            try:
                comment_adjusted = {
                    'id': str(comentario.get('id')),
                    'texto': comentario.get('text'),
                    'fecha': int(comentario.get('time')) if comentario.get('time') else None,
                    'autor': comentario.get('creator'),
                    'sourceUrl': response.meta.get('sourceUrl', 'https://www.emol.com'),
                    'news_url': response.meta.get('news_url')
                }
                #comment_clasificado = self.procesar_y_clasificar_comentario(comment_adjusted)
                self.logger.info(comment_adjusted)
                self.send_to_rabbitmq(comment_adjusted)
            except Exception as e:
                self.logger.error(f"Error procesando comentario {comentario.get('id')}: {e}")


    def send_to_rabbitmq(self, comment):
        try:
            message = json.dumps(comment)
            self.channel.basic_publish(
                exchange='',
                routing_key=RABBITMQ_QUEUE,
                body=message,
                properties=pika.BasicProperties(delivery_mode=2)
            )
            self.logger.info(f"Comentario publicado en RabbitMQ: {message}")
        except pika.exceptions.AMQPConnectionError as e:
            self.logger.error(f"Error de conexión con RabbitMQ: {e}. Reintentando...")
            self.reconnect_rabbitmq()
            try:
                self.channel.basic_publish(
                    exchange='',
                    routing_key=RABBITMQ_QUEUE,
                    body=message,
                    properties=pika.BasicProperties(delivery_mode=2)
                )
                self.logger.info(f"Comentario publicado en RabbitMQ después de reconectar: {message}")
            except Exception as e:
                self.logger.error(f"No se pudo publicar el mensaje después de reconectar: {e}")
        except Exception as e:
            self.logger.error(f"Error al enviar el comentario a RabbitMQ: {e}")


    def reconnect_rabbitmq(self):
        """Función para reestablecer la conexión a RabbitMQ en caso de fallo"""
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
            )
            self.channel = self.connection.channel()
            self.channel.queue_declare(
                queue=RABBITMQ_QUEUE,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': 'comentarios_dead_letter_exchange',
                    'x-dead-letter-routing-key': 'dead_letter_routing_key'
                }
            )

            self.logger.info("Reconexión a RabbitMQ exitosa.")
        except Exception as e:
            self.logger.error(f"No se pudo reconectar a RabbitMQ: {e}")

