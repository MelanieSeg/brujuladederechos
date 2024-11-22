import pika
import json
import os
import logging
import re
import unicodedata
from datetime import datetime
import dateparser
import pandas as pd
import numpy as np
import time  

import spacy
from pysentimiento import create_analyzer
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer, util
from fuzzywuzzy import process

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')

RAW_COMMENTS_QUEUE = os.getenv('RAW_COMMENTS_QUEUE', 'comentarios_crudos_queue')
ANALYZED_COMMENTS_QUEUE = os.getenv('ANALYZED_COMMENTS_QUEUE', 'comentarios_scraping_queue')

DEAD_LETTER_EXCHANGE = 'comentarios_dead_letter_exchange'
DEAD_LETTER_ROUTING_KEY = 'dead_letter_routing_key'

logger.info("Cargando modelos y recursos...")

def normalizar_texto(texto):
    texto = texto.lower()
    texto = ''.join((c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn'))
    texto = re.sub(r'[^a-zA-Z\s]', '', texto)
    texto = ' '.join(texto.split())
    return texto

def limpiar_texto(texto):
    texto = re.sub(r'&nbsp;|<.*?>', '', texto)
    texto = texto.lower().strip()
    texto = normalizar_texto(texto)
    return texto

def lematizar_texto(texto):
    doc = nlp(texto)
    return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct])

def detectar_entidades_persona(texto):
    doc = nlp(texto)
    personas = [ent.text for ent in doc.ents if ent.label_ == 'PER']
    return personas

def extraer_fecha(texto):
    doc = nlp(texto)
    fechas = [ent.text for ent in doc.ents if ent.label_ == 'DATE']
    fechas_parsed = []
    for fecha_texto in fechas:
        fecha = dateparser.parse(fecha_texto, languages=['es'])
        if fecha:
            fechas_parsed.append(fecha)
    return min(fechas_parsed) if fechas_parsed else None

def calcular_factor_tiempo(texto):
    fecha_evento = extraer_fecha(texto)
    if fecha_evento:
        dias_diferencia = (datetime.now() - fecha_evento).days
        if dias_diferencia < 3 * 365:
            return 0
        elif dias_diferencia < 7 * 365:
            return 0.25
        elif dias_diferencia < 10 * 365:
            return 0.5
        elif dias_diferencia < 13 * 365:
            return 0.75
        else:
            return 1
    return 0

def asignar_gravedad(sentimiento, emocion):
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
    return 'moderada'

def evaluar_interes_publico(texto):
    texto_embedding = modelo_embeddings.encode(texto)
    max_similitud = 0
    nivel_interes = 0

    for nivel, embeddings in embeddings_temas.items():
        similitudes = util.cos_sim(texto_embedding, embeddings).cpu().numpy().flatten()
        max_similitud_nivel = max(similitudes)
        if max_similitud_nivel > max_similitud:
            max_similitud = max_similitud_nivel
            nivel_interes = nivel

    return nivel_interes

def evaluar_origen_informacion(texto):
    palabras_clave = ['hackeado', 'filtrado', 'confidencial', 'secreto']
    for palabra in palabras_clave:
        if palabra in texto:
            return -0.75
    return 0

def asignar_empatia(sentimiento, emocion):
    if emocion in ['sadness', 'fear', 'disgust']:
        return 0.75
    elif emocion in ['joy', 'surprise']:
        return 0.25
    return 0.5

def es_figura_publica(nombre_persona, nombres_figuras_publicas):
    mejor_coincidencia = process.extractOne(nombre_persona, nombres_figuras_publicas)
    if mejor_coincidencia and mejor_coincidencia[1] >= 90:
        return mejor_coincidencia[0]
    else:
        return None

def verificar_figuras_publicas(lista_personas, nombres_figuras_publicas):
    figuras_encontradas = []
    for persona in lista_personas:
        persona_normalizada = normalizar_texto(persona)
        coincidencia = es_figura_publica(persona_normalizada, nombres_figuras_publicas)
        if coincidencia:
            figuras_encontradas.append(coincidencia)
    return figuras_encontradas

def asignar_pf_x(figuras_mencionadas, df_figuras_publicas):
    if figuras_mencionadas:
        valores_pf = []
        for figura in figuras_mencionadas:
            info_figura = df_figuras_publicas[df_figuras_publicas['nombre_normalizado'] == figura]
            if not info_figura.empty:
                categoria = info_figura.iloc[0]['categoria']
                if categoria == 'politica':
                    valores_pf.append(3)
                elif categoria == 'empresario':
                    valores_pf.append(2)
                else:
                    valores_pf.append(1)
            else:
                valores_pf.append(1)
        return max(valores_pf)
    else:
        return 0

def mapear_gravedad_a_pr(gravedad):
    if gravedad == 'leve':
        return 1
    elif gravedad == 'moderada':
        return 2
    elif gravedad == 'grave':
        return 3
    else:
        return 1

def interpretar_ibf(valor_ibf):
    if valor_ibf > 1:
        return 'PRIVACIDAD_PREDOMINA'
    elif valor_ibf < 1:
        return 'LIBERTAD_EXPRESION_PREDOMINA'
    else:
        return 'EQUILIBRIO_ENTRE_DERECHOS'

def connect_to_rabbitmq():
    while True:
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
            parameters = pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=credentials
            )
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            
            # Declarar el intercambio de dead letters
            channel.exchange_declare(exchange=DEAD_LETTER_EXCHANGE, exchange_type='direct', durable=True)
            
            # Declarar la cola de dead letters
            channel.queue_declare(queue='comentarios_dead_letter_queue', durable=True)
            
            # Vincular la cola de dead letters al intercambio de dead letters
            channel.queue_bind(exchange=DEAD_LETTER_EXCHANGE, queue='comentarios_dead_letter_queue', routing_key=DEAD_LETTER_ROUTING_KEY)
            
            # Declarar la cola RAW_COMMENTS_QUEUE
            channel.queue_declare(
                queue=RAW_COMMENTS_QUEUE,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': 'comentarios_dead_letter_exchange',
                    'x-dead-letter-routing-key': 'dead_letter_routing_key'
                }
            )

            channel.queue_declare(
                queue=ANALYZED_COMMENTS_QUEUE,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
                    'x-dead-letter-routing-key': DEAD_LETTER_ROUTING_KEY
                }
            )
            return connection, channel
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Error al conectar con RabbitMQ: {e}. Reintentando en 5 segundos...")
            time.sleep(5)

nlp = spacy.load('es_core_news_sm')

sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
emotion_analyzer = create_analyzer(task="emotion", lang="es")

# Cargar y normalizar figuras públicas
df_figuras_publicas = pd.read_csv('figuras_publicas.csv')

# Verificar que las columnas necesarias existen
if 'nombre' not in df_figuras_publicas.columns or 'categoria' not in df_figuras_publicas.columns:
    logger.error("El archivo 'figuras_publicas.csv' debe contener las columnas 'nombre' y 'categoria'.")
    raise ValueError("Columnas faltantes en 'figuras_publicas.csv'.")

df_figuras_publicas['nombre_normalizado'] = df_figuras_publicas['nombre'].apply(lambda x: normalizar_texto(x))
nombres_figuras_publicas = df_figuras_publicas['nombre_normalizado'].tolist()

# Inicializar modelo de embeddings
modelo_embeddings = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

temas_nivel_3 = ['gobierno', 'economía', 'salud pública', 'educación', 'seguridad nacional']
temas_nivel_2 = ['deportes', 'entretenimiento', 'tecnología', 'medio ambiente', 'cultura']
temas_nivel_1 = ['eventos locales', 'comunidad', 'sucesos menores', 'anécdotas personales']

embeddings_temas = {
    3: modelo_embeddings.encode(temas_nivel_3),
    2: modelo_embeddings.encode(temas_nivel_2),
    1: modelo_embeddings.encode(temas_nivel_1)
}

logger.info("Modelos y recursos cargados.")

# Función principal para procesar
def procesar_comentario(comentario):
    texto = comentario.get('texto', '')
    if not texto:
        logger.warning(f"Comentario con ID {comentario.get('id')} tiene texto vacío.")
        return None

    texto_limpio = limpiar_texto(texto)
    texto_lematizado = lematizar_texto(texto_limpio)

    sentimiento = sentiment_analyzer.predict(texto_lematizado).output
    emocion = emotion_analyzer.predict(texto_lematizado).output
    gravedad = asignar_gravedad(sentimiento, emocion)

    factor_tiempo = calcular_factor_tiempo(texto_lematizado)
    interes_publico = evaluar_interes_publico(texto_lematizado)
    origen_informacion = evaluar_origen_informacion(texto_lematizado)
    empatia_privacidad = asignar_empatia(sentimiento, emocion)
    empatia_expresion = asignar_empatia(sentimiento, emocion)  # Definir de manera independiente si es necesario

    personas_mencionadas = detectar_entidades_persona(texto_lematizado)
    figuras_publicas_mencionadas = verificar_figuras_publicas(personas_mencionadas, nombres_figuras_publicas)
    pf_x = asignar_pf_x(figuras_publicas_mencionadas, df_figuras_publicas)
    pr_x = mapear_gravedad_a_pr(gravedad)
    V = 1  # constante

    # Calcular numerador y denominador
    numerador = V + pr_x + factor_tiempo + empatia_privacidad
    denominador = interes_publico + pf_x - origen_informacion + empatia_expresion
    denominador = denominador if denominador != 0 else 0.1  # evitar división por 0

    ibf = numerador / denominador
    resultado_ibf = interpretar_ibf(ibf)

    # Agregar los nuevos campos al comentario
    comentario.update({
        'texto_limpio': texto_limpio,
        'sentimiento': sentimiento,
        'emocion': emocion,
        'gravedad': gravedad,
        'factor_tiempo': factor_tiempo,
        'interes_publico': interes_publico,
        'origen_informacion': origen_informacion,
        'empatia_privacidad': empatia_privacidad,
        'empatia_expresion': empatia_expresion,
        'personas_mencionadas': personas_mencionadas,
        'figuras_publicas_mencionadas': figuras_publicas_mencionadas,
        'PF_x': pf_x,
        'PR_x': pr_x,
        'V': V,
        'numerador': numerador,
        'denominador': denominador,
        'ibf': ibf,
        'resultadoIbf': resultado_ibf,
        'fechaClasificacion': datetime.now().isoformat()
    })

    return comentario

# Consumir mensajes de RabbitMQ
def consume_comments():
    while True:
        try:
            connection, channel = connect_to_rabbitmq()

            def callback(ch, method, properties, body):
                try:
                    comentario = json.loads(body)
                    comentario_analizado = procesar_comentario(comentario)
                    if comentario_analizado:
                        channel.basic_publish(
                            exchange='',
                            routing_key=ANALYZED_COMMENTS_QUEUE,
                            body=json.dumps(comentario_analizado),
                            properties=pika.BasicProperties(delivery_mode=2)
                        )
                        ch.basic_ack(delivery_tag=method.delivery_tag)
                        logger.info(f"Comentario procesado y publicado: {comentario_analizado.get('id')}")
                    else:
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                except json.JSONDecodeError as e:
                    logger.error(f"Error al decodificar JSON: {e}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                except Exception as e:
                    logger.error(f"Error al procesar el comentario: {e}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=RAW_COMMENTS_QUEUE, on_message_callback=callback)
            logger.info("Esperando mensajes para procesar...")
            channel.start_consuming()
        except Exception as e:
            logger.error(f"Error en el consumidor: {e}. Reiniciando en 5 segundos...")
            time.sleep(5)

if __name__ == '__main__':
    try:
        consume_comments()
    except KeyboardInterrupt:
        logger.info("Servicio de análisis detenido por el usuario.")
    except Exception as e:
        logger.error(f"Error en el servicio de análisis: {e}")

