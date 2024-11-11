# Scrapy settings for scrapy_brujula project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))


BOT_NAME = "scrapy_brujula"

SPIDER_MODULES = ["scrapy_brujula.spiders"]
NEWSPIDER_MODULE = "scrapy_brujula.spiders"

SPLASH_URL = os.getenv('SPLASH_URL', 'http://localhost:8050')


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
