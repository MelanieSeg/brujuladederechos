# Usa Python 3.9 en una imagen liviana de Debian
FROM python:3.9-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo requirements.txt primero para aprovechar el caché de Docker
COPY ./requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia todos los archivos del proyecto al contenedor
COPY . /app

# Expone el puerto 5000 para Flask
EXPOSE 5000

# Comando para ejecutar la aplicación Flask
CMD ["python", "app.py"]

