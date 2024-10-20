import scrapy
import json
from server.utils.utils import get_base_url

class ComentariosAPISpider(scrapy.Spider):
    name = "comentarios_api_spider"
    allowed_domains = ['cache-comentarios.ecn.cl']
    start_urls = [
        'https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&url=https%3A%2F%2Fwww.emol.com%2Fnoticias%2FDeportes%2F2024%2F08%2F17%2F1140030%2Fmarcelodiaz-gustavoalvarez-frases-universidaddechile-ohiggins.html&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=true','https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&url=https%3A%2F%2Fwww.emol.com%2Fnoticias%2FDeportes%2F2024%2F08%2F17%2F1140021%2Fohiggins-universidaddechile-campeonato-nacional-goles.html&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=true',
        'https://cache-comentarios.ecn.cl/Comments/Api?action=getComments&url=https%3A%2F%2Fwww.emol.com%2Fnoticias%2FEconomia%2F2024%2F08%2F18%2F1139970%2Fsernac-andres-herrera.html&includePending=false&format=json&limit=10&order=TIME_DESC&rootComment=true'
    ]

    def parse(self, response):
        data = json.loads(response.text)
        comentarios = data.get('comments', [])
        news_url = response.url
        base_url = get_base_url(news_url)

        for comentario in comentarios:
            yield {
                'id': comentario.get('id'),
                'texto': comentario.get('text'),
                'likes': comentario.get('likes'),
                'fecha': comentario.get('time'),
            }
            custom_settings = {
                'FEEDS': {
                    'comentarios.json': {
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
            }
