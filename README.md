# Frontend proyecto Brujula de derechos (cd frontend)

## Tecnologías utilizadas
1. React
2. Tailwindcss

##  Instalación
Solo es necesario instalar  las dependencias de react para poder ejecutar el proyecto con npm install en el directorio cd frontend.
Luego ejecutar npm start para iniciar el proyecto.

##Iniciar sesion
Por defecto al ingresar a la pagina  se muestra un formulario de inicio de sesion, se debe rellenar el formulario con el usuario y contraseña, en canvas se le adjuntó en el mensaje junto al link del proyecto tanto los datos de un correo con permiso administrador  como el de un moderador para probar las diferencias que hay.

# Backend proyecto Brujula de derechos (cd backend)

## Tecnologías utilizadas
1. Node.JS
2. TS
3. PostgreSQL
4. Prisma ORM
5. RabbitMQ
6. Docker


## Paso a paso 

### Requisitos previos

Instalar docker para poder usar RabbitMQ 

- [Docker](https://docs.docker.com/desktop/install/windows-install/)

## Ejecutar docker compose para levantar los servicios 
- Antes que nada docker tiene que estar en ejecucion.

```bash
docker --version
```

- Cuando docker este corriendo abrimos una terminal en el directirio de backend (nodejs no el de flask)

**levantar docker-compose**
```bash
docker-compose up -d
```

Tenemos que ver algo parecido a esto cuando termine de descargar y levantar todas las imagenes necesarias:

 ✔ Network backend_app-network  Created                                                                                         
 ✔ Container rabbitmq           Started                                                                                         
 ✔ Container postgres           Started    

Si vemos eso significa que se ejecuto correctamente por lo que podemos ejecutar el backend sin problemas

```bash
npm run dev
```
Al ejecutar tenemos que ver una respuesta como esta:

```bash
Server listen on port 4000
[*] Esperando mensajes en la cola :comentarios_scraping_queue
CommentsConsumer conectado y escuchando RabbitMQ
```


### Detener servicios

```bash
docker-compose down
```


## Probar el Comunicacion de backend nodejs y flask con INSERT de comentarios usando RabbitMQ

### ADVERTENCIA 
** NO EJECUTEN EL SCRAPING MUY SEGUIDO... MAS QUE NADA PARA EVITAR QUE EMOL EN ESTE CASO BLOQUEE LA IP :(**.

Antes de comenzar con las pruebas, asegúrate de que el backend Flask esté corriendo junto con los servicios necesarios.

Para verificar que los servicios estén corriendo:

```bash
docker-compose ps
```

### Iniciar sesion en el backend de node.js

Para insertar comentarios, el usuario debe haber iniciado sesión en el backend de Node.js.

**1. Realiza la solicitud de inicio de sesión**:

- URL: http://localhost:4000/auth/login
- Método: POST
- Cabecera: Content-Type: application/json
**2. Cuerpo de la solicitud** :

El body de la solicitud tiene que ser este (usaurio existente en la DB):

```json
{
    "email": "usuario1.test@test.com",
    "password": "password123"
}
```

**3. Respuesta esperada**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbTFzczhoangwMDAwdG5oZTB5MTdrYjMzIiwiZW1haWwiOiJ1c3VhcmlvMS50ZXN0QHRlc3QuY29tIiwicm9sIjoiTU9ERVJBRE9SIiwiaWF0IjoxNzI4NTQwNTM5LCJleHAiOjE3Mjg1NDc3Mzl9.1lNDPKVbD3lB0_m2cSU2TrQwSEnc1gzJEO9eQpAwEuo",
    "user": {
        "id": "cm1ss8hjx0000tnhe0y17kb33",
        "name": "usuario1",
        "email": "usuario1.test@test.com",
        "emailVerified": "2024-10-03T04:20:30.554Z",
        "image": null,
        "rol": "MODERADOR",
        "createdAt": "2024-10-03T04:14:30.621Z",
        "updatedAt": "2024-10-03T04:20:30.557Z"
    }
}
```

#### IMPORTANTE : Copiar el accessToken


#### Insertar Comentarios 

Una vez que tengas el accessToken, puedes realizar la inserción de comentarios en el backend Flask.

**1. Realiza la solicitud al backend Flask**:

- URL: http://localhost:5000/api/scrapping/emol/run-news

- Método: POST

- Cabecera:

  - Content-Type: application/json
  - Authorization: Bearer <accessToken>

(Reemplaza <accessToken> por el valor que copiaste del paso anterior)

Tiene que verse algo asi :

```json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbTFzczhoangwMDAwdG5oZTB5MTdrYjMzIiwiZW1haWwiOiJ1c3VhcmlvMS50ZXN0QHRlc3QuY29tIiwicm9sIjoiTU9ERVJBRE9SIiwiaWF0IjoxNzI4NTQwNTM5LCJleHAiOjE3Mjg1NDc3Mzl9.1lNDPKVbD3lB0_m2cSU2TrQwSEnc1gzJEO9eQpAwEuo
```

** 2. Cuerpo de la solicitud ** :
No se necesita body para esta solicitud solo el `Authorizatio` en los `Headers`

** 3. Respuesta esperada**:

```plaintext
[x] Insertados 10 comentarios exitosamente.
[x] Insertados 10 comentarios exitosamente.
[x] Insertados 10 comentarios exitosamente.
```
