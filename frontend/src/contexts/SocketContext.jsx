// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

// Proveedor del contexto
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      transports: ["websocket"], // Opcional: especificar el transporte
      reconnectionAttempts: 5, // Opcional: número máximo de intentos de reconexión
      reconnectionDelay: 1000, // Opcional: tiempo entre intentos de reconexión
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Conectado al servidor de Socket.IO");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Desconectado del servidor de Socket.IO:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Error de conexión Socket.IO:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};


