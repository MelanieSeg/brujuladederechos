# comentarios_emol/settings.py

BOT_NAME = 'comentarios_emol'

SPIDER_MODULES = ['comentarios_emol.spiders']
NEWSPIDER_MODULE = 'comentarios_emol.spiders'

# Configuraciones de Scrapy Splash (si las estás usando)
SPLASH_URL = 'http://localhost:8050'

DOWNLOADER_MIDDLEWARES = {
    'scrapy_splash.SplashCookiesMiddleware': 723,
    'scrapy_splash.SplashMiddleware': 725,
    'scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware': 810,
}

SPIDER_MIDDLEWARES = {
    'scrapy_splash.SplashDeduplicateArgsMiddleware': 100,
}

DUPEFILTER_CLASS = 'scrapy_splash.SplashAwareDupeFilter'
HTTPCACHE_STORAGE = 'scrapy_splash.SplashAwareFSCacheStorage'
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'  
# Configuración de FEEDS (ajusta según tus necesidades)
FEEDS = {
    'results/%(name)s_%(time)s.json': {  # Genera archivos con nombre de spider y timestamp
        'format': 'jsonlines',
        'encoding': 'utf8',
    },
}

# Opcional: Configuración de logging
LOG_LEVEL = 'INFO'