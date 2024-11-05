import pika
import scrapy
from urllib.parse import quote
import json
from utils.utils import get_base_url
import os

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'comentarios_scraping_queue')

class EmolNewsSpider(scrapy.Spider):
    name = "emol_news_spider"
    allowed_domains = ['emol.com', 'cache-comentarios.ecn.cl']
    start_urls = ['https://www.emol.com/']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        )
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

    def close(self, reason):
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
        try:
            data = response.json()
        except json.JSONDecodeError:
            self.logger.error(f"No se pudo decodificar JSON para la URL: {response.url}")
            return

        comentarios = data.get('comments', [])
        for comentario in comentarios:
            comment_adjusted = {
                'id': str(comentario.get('id')),
                'texto': comentario.get('text'),
                'fecha': int(comentario.get('time')) if comentario.get('time') else None,
                'autor': comentario.get('creator'),
                'sourceUrl': response.meta.get('sourceUrl', 'https://www.emol.com'),
                'news_url': response.meta.get('news_url')
            }
            self.send_to_rabbitmq(comment_adjusted)

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
        except Exception as e:
            self.logger.error(f"Error al enviar comentario a RabbitMQ: {e}")

