import server from "./server";
import http from 'http'
import { Server } from 'socket.io'


import dotenv from 'dotenv'
import NotificationsConsumer from "./components/notifications/notifications.consumer";


dotenv.config()

const httpServer = http.createServer(server)

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

/*
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Token de autenticación requerido"));
  }
  try {
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});
*/


io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}, Usuario: ${(socket as any).user}`);

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const notificationsConsumer = new NotificationsConsumer(io);
notificationsConsumer.connect()



//TODO: Poner el puerto en las variables de entorno
//TODO: Usar process.env.PORT
httpServer.listen(4000, () => {
  console.log(`Servidor escuchando en el puerto ${4000}`)
})
