# 1. Imagen base de Python
FROM python:3.10-slim

# 2. Establecer variables de entorno para evitar problemas de buffer en Python
ENV PYTHONUNBUFFERED=1

# 3. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# 4. Copiar los archivos de dependencias
COPY requirements.txt .

# 5. Instalar las dependencias del sistema necesarias y limpiar caché de apt
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 6. Actualizar pip, setuptools y wheel, instalar dependencias, descargar modelos y limpiar caché de pip
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt && \
    python -m spacy download es_core_news_sm && \
    python -m nltk.downloader punkt stopwords wordnet omw-1.4 && \
    rm -rf /root/.cache/pip

# 7. Copiar el resto de la aplicación
COPY figuras_publicas.csv .
COPY . /app

# 8. Comando para ejecutar el servicio
CMD ["python", "app.py"]

