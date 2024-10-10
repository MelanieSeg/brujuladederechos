# Instrucciones de ejecucion


- Navegar al directorio del proyecto y abrir una terminal

## Crar un entorno virtual
Es buena practica crear un entorno virual y ejecutarlo cada vez que se use.

**instalar virtualenv**
```bash

pip install virtualenv 
```
**crear el entorno virtual**

```bash
virtualenv myenv
```

Con esto se va a generar una carpeta `myenv` en el directorio actual

## Activar el entorno virtual

```bash
./myenv/Scripts/activate.ps1
```
tambien si no les sale la carpeta /Scripts entonces prueben con : 

```bash
./myenv/bin/activate
```

Al activar se ver en la terminal un `(myenv)` en la linea de comandos lo indica que estamos dentro del entorno virtual

## Instalar dependencias
Cuando ya estemos en el entorno virtual tenemos que navegar a la carpeta `server`

```bash
cd server
```

**instalar dependencias**
```bash
pip install -r requirements.txt
```
```bash
pip install pika pyjwt python-dotenv
```

## Ejectuar el server
Ya en la carpeta server podemos ejecutar el server de flask 

```bash
python app.py
```

## Probar el scarper
si quieren probar solamente el scraper puede diriguirse desde `server`  a :

```bash
cd .\comentarios_emol\spiders\
```

y despues ejecutar el spider con lo siguiente :


```bash
scrapy runspider emol_news_spider.py -o <"nombre_del_archivo">.json
```

ejemplo : 

```bash
scrapy runspider emol_news_spider.py -o comentarios_test32.json
```

al ejecutarlo van a ver que en esa misma carpeta se creo un archivo tipo json con el nombre ingresado donde puede ven todos los comentarios scrapeados.



## Desactivar el entorno virual
Cuando terminemos de usar el server y queremos salir del entorno virutal tenemos que ingresar lo siguiente ne la terminal

```bash
deactivate
```


