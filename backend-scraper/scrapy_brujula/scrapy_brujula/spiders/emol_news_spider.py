import pika
import scrapy
from urllib.parse import quote
import json
from utils.utils import get_base_url
import os
from pysentimiento import create_analyzer
import re

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'comentarios_scraping_queue')



print("Configuración de RabbitMQ:")
print("Host:", RABBITMQ_HOST)
print("Puerto:", RABBITMQ_PORT)
print("Usuario:", RABBITMQ_USER)
print("Contraseña:", RABBITMQ_PASSWORD)
print("Cola:", RABBITMQ_QUEUE)


modismos = {
    'achacarse': 'entristecerse',
    'achuntar': 'acertar',
    'al lote': 'desordenado',
    'al tiro': 'inmediatamente',
    'al toque': 'inmediatamente',
    'andar pato': 'no tener dinero',
    'apañar': 'acompañar',
    'apestarse': 'enojarse',
    'aperrar': 'ser valiente',
    'apitutado': 'tener buenos contactos',
    'apretado': 'tacaño',
    'arrugar': 'arrepentirse',
    'atao': 'problema',
    'avispado': 'inteligente',
    'bacán': 'excelente',
    'barsa': 'sinvergüenza',
    'buena leche': 'honesto',
    'bronca': 'enojo',
    'buche': 'estómago',
    'cabra': 'niña',
    'cabro': 'niño',
    'cabritas': 'palomitas de maíz',
    'cachar': 'entender',
    'cachureos': 'cosas inútiles',
    'cahuín': 'chisme',
    'calato': 'desnudo',
    'caleta': 'mucho',
    'carrete': 'fiesta',
    'colarse': 'entrar sin permiso',
    'condoro': 'error',
    'copete': 'bebida alcohólica',
    'curao': 'borracho',
    'chapa': 'alias',
    'choro': 'valiente',
    'chorearse': 'enojarse',
    'dar pelota': 'prestar atención',
    'dar jugo': 'decir incoherencias',
    'denso': 'serio',
    'doblado': 'muy borracho',
    'echar la foca': 'retar',
    'embarrarla': 'arruinar',
    'engrupir': 'seducir',
    'enrollado': 'complicado',
    'estirar la pata': 'morir',
    'fiambre': 'hediondo',
    'filo': 'no importa',
    'fome': 'aburrido',
    'fonda': 'fiesta de Fiestas Patrias',
    'fresco': 'atrevido',
    'gallo': 'persona',
    'gancho': 'amigo',
    'ganso': 'tonto',
    'gauchada': 'favor',
    'gil': 'tonto',
    'guacho': 'huérfano',
    'guagua': 'bebé',
    'guanaco': 'vehículo policial',
    'guata': 'barriga',
    'guater': 'inodoro',
    'hachazo': 'resaca',
    'hallulla': 'tipo de pan',
    'huaso': 'campesino',
    'huevón': 'tonto (o amigo, dependiendo del contexto)',
    'inflar': 'prestar atención',
    'inflado': 'sobrevalorado',
    'irse al chancho': 'excederse',
    'jarana': 'fiesta',
    'jote': 'persona insistente en el coqueteo',
    'julepe': 'miedo',
    'kiltro': 'perro mestizo',
    'la firme': 'la verdad',
    'la dura': 'la verdad',
    'lanza': 'ladrón',
    'lata': 'aburrimiento',
    'latero': 'aburrido',
    'la raja': 'excelente',
    'lesear': 'molestar',
    'leseras': 'tonterías',
    'liz taylor': 'listo',
    'lolo': 'joven',
    'longi': 'tonto',
    'luca': 'mil pesos',
    'machucado': 'golpeado',
    'mano de guagua': 'tacaño',
    'micro': 'autobús',
    'mina': 'mujer',
    'mino': 'hombre',
    'ene': 'mucho',
    'nanai': 'cariño',
    'ni ahí': 'no me importa',
    'ni un brillo': 'sin gracia',
    'ojo': 'atención',
    'onda': 'vibra',
    'once': 'merienda vespertina',
    'pal gato': 'enfermo',
    'pagar el piso': 'invitar con el primer sueldo',
    'paracaidista': 'invitado no deseado',
    'pasarlo chancho': 'divertirse',
    'patas negras': 'amante',
    'patiperro': 'viajero',
    'patudo': 'sinvergüenza',
    'pavear': 'distraerse',
    'pega': 'trabajo',
    'peludo': 'difícil',
    'picada': 'lugar económico',
    'piola': 'tranquilo',
    'pololeo': 'noviazgo',
    'previa': 'reunión antes de una fiesta',
    'queque': 'trasero',
    'quina': 'quinientos pesos',
    'quiubo': '¿qué pasó?',
    'rajado': 'rápido',
    'rasca': 'ordinario',
    'rico': 'agradable',
    'sacar la cresta': 'golpear',
    'sacar pica': 'provocar envidia',
    'sapo': 'soplón',
    'seco': 'talentoso',
    'socio': 'amigo',
    'taco': 'embotellamiento',
    'talla': 'broma',
    'tata': 'abuelo',
    'tirar a la chuña': 'dejar al azar',
    'tocar el violín': 'ser el tercero',
    'tollo': 'mentira',
    'tuto': 'sueño',
    'último': 'lo peor',
    'vaca': 'colecta de dinero',
    'viejo verde': 'hombre mayor que coquetea con jóvenes',
    'virarse': 'irse',
    'yapa': 'adicional',
    'yunta': 'mejor amigo',
    'zombi': 'cansado',
}

print("Inicializando analizadores...")
sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
emotion_analyzer = create_analyzer(task="emotion", lang="es")
print("Analizadores inicializados.")

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
        self.channel.queue_declare(
            queue=RABBITMQ_QUEUE,
            durable=True,
            arguments={
                'x-dead-letter-exchange': 'comentarios_scraping_queue_dead',
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
                comment_clasificado = self.procesar_y_clasificar_comentario(comment_adjusted)
                self.logger.info(comment_clasificado)
                self.send_to_rabbitmq(comment_clasificado)
            except Exception as e:
                self.logger.error(f"Error procesando comentario {comentario.get('id')}: {e}")

    def procesar_y_clasificar_comentario(self, comentario):
        try:
            texto_limpio = self.limpiar_texto(comentario['texto'])
            sentimiento = sentiment_analyzer.predict(texto_limpio).output
            emocion = emotion_analyzer.predict(texto_limpio).output
            gravedad = self.clasificar_gravedad(sentimiento, emocion)

            comentario['texto_limpio'] = texto_limpio
            comentario['sentimiento'] = sentimiento
            comentario['emocion'] = emocion
            comentario['gravedad'] = gravedad
            return comentario
        except Exception as e:
            self.logger.error(f"Error al procesar y clasificar el comentario {comentario['id']}: {e}")
            # Puedes decidir si devolver el comentario sin clasificar o manejarlo de otra forma
            return comentario


    def limpiar_texto(self, texto):
        texto = re.sub(r'&nbsp;|<.*?>', '', texto)
        texto = texto.lower().strip()
        for modismo, significado in modismos.items():
            texto = re.sub(r'\b' + re.escape(modismo) + r'\b', significado, texto)
        return texto

    def clasificar_gravedad(self, sentimiento, emocion):
        if sentimiento == 'NEG':
            if emocion in ['anger', 'disgust', 'sadness']:
                return 'grave'
            else:
                return 'moderada'
        elif sentimiento == 'NEU':
            return 'leve'
        elif sentimiento == 'POS':
            if emocion in ['joy', 'surprise']:
                return 'leve'
            else:
                return 'moderada'
        else:
            return 'moderada'


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
                    'x-dead-letter-exchange': 'comentarios_scraping_queue_dead',
                    'x-dead-letter-routing-key': 'dead_letter_routing_key'
                }
            )

            self.logger.info("Reconexión a RabbitMQ exitosa.")
        except Exception as e:
            self.logger.error(f"No se pudo reconectar a RabbitMQ: {e}")

