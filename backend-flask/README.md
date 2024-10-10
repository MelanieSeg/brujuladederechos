# Instrucciones de ejecucion


- Navegar al directorio del proyecto y abrir una terminal

## Crar un entorno virtual
Es buena practica crear un entorno virual y ejecutarlo cada vez que se use.

**instalar virtualenv**
```bash

pip install virtualenv 
```

**crear el entorno virtual**
Para crear un entorno virtual llamado myenv, ejecuta el siguiente comando en el directorio del proyecto:

```bash
virtualenv myenv
```
Esto generará una carpeta myenv en el directorio actual.


## Activar el entorno virtual(Windows)

```bash
./myenv/Scripts/activate.ps1
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
si quieren probar solamente el scraper tienes que navegar desde `server`  a :

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

Al ejecutarlo, verás que en la misma carpeta se crea un archivo JSON con el nombre que especificaste. En ese archivo se almacenarán todos los comentarios que el scraper haya recolectado.



## Desactivar el entorno virtual
Cuando terminemos de usar el server y queremos salir del entorno virutal tenemos que ingresar lo siguiente en la terminal

```bash
deactivate
```


