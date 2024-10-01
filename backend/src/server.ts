import bodyParser from "body-parser";
import express from "express";
import loadRoutes from "./loaders/routes";
import cookieParser from "cookie-parser";
import cors from "cors";

const server = express();

server.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos HTTP que se permiten
    allowedHeaders: ["Content-Type", "Authorization"], // los headers permitidos
    credentials: true, // permitir enviar cookies
  }),
);

server.use(bodyParser.json());
server.use(cookieParser());

loadRoutes(server);

export default server;
