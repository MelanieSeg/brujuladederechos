import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../hooks/useSocket';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const socket = useSocket();
  const [totalComentarios, setTotalComentarios] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleNuevaNotificacion = (notificacion) => {
      if (notificacion.tipo === 'TOTAL_COMMENTS_INSERTED') {
        toast.success(
          `Se insertaron ${notificacion.totalComentarios} comentarios exitosamente.`,
          {
            duration: 5000,
          }
        );
        setTotalComentarios((prev) => prev + notificacion.totalComentarios);
      } else {
        setNotificaciones((prev) => [notificacion, ...prev]);
      }
    };

    socket.on('nueva_notificacion', handleNuevaNotificacion);

    socket.on('connect', () => {
      console.log('Socket.IO conectado');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
    });

    return () => {
      socket.off('nueva_notificacion', handleNuevaNotificacion);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  return (
    <NotificationsContext.Provider value={{ notificaciones, totalComentarios }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

