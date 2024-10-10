import scrapy
from urllib.parse import quote
import json
from server.utils.utils import get_base_url

class EmolNewsSpider(scrapy.Spider):
    name = "emol_news_spider"
    allowed_domains = ['emol.com', 'cache-comentarios.ecn.cl']
    start_urls = [
        'https://www.emol.com/'
    ]

    custom_settings = {
        'FEEDS': {
            'comentarios_emol.json': {  # Se puede usar otro nombre si es necesario
                'format': 'jsonlines',
                'encoding': 'utf8',
            },
        },
        'DOWNLOADER_MIDDLEWARES': {
            'scrapy_splash.SplashCookiesMiddleware': 723,
            'scrapy_splash.SplashMiddleware': 725,
            'scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware': 810,
        },
        'SPIDER_MIDDLEWARES': {
             'scrapy_splash.SplashDeduplicateArgsMiddleware': 100,
        },
        'DUPEFILTER_CLASS': 'scrapy_splash.SplashAwareDupeFilter',
        'HTTPCACHE_STORAGE': 'scrapy_splash.SplashAwareFSCacheStorage',
    }

    def parse(self, response):
        # Extraer todos los enlaces que comienzan con '/noticias/'
        for link in response.css('a::attr(href)').getall():
            if link.startswith('/noticias/'):
                news_url = response.urljoin(link)
                yield scrapy.Request(news_url, callback=self.parse_news)

    def parse_news(self, response):
        news_url = response.url

        base_url = get_base_url(news_url)
        # Codificar la URL de manera segura
        encoded_url = quote(news_url, safe='')

        # Construir la URL de la API de comentarios
        api_url = (
            f"https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&"
            f"url={encoded_url}&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=true"
        )

        # Realizar una solicitud a la API de comentarios
        yield scrapy.Request(
            api_url,
            callback=self.parse_comments,
            meta={'news_url': news_url, 'sourceUrl':base_url}
        )

    def parse_comments(self, response):
        try:
            data = response.json()
        except json.JSONDecodeError:
            self.logger.error(f"No se pudo decodificar JSON para la URL: {response.url}")
            return

        comentarios = data.get('comments', [])

        for comentario in comentarios:
            yield {
                'news_url': response.meta.get('news_url'),
                'sourceUrl': response.meta.get('sourceUrl'),
                'id': comentario.get('id'),
                'texto': comentario.get('text'),
                'fecha': comentario.get('time'),
                'autor': comentario.get('creator'),
            }
