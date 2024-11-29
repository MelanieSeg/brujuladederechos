import React, { useEffect, useState, useContext } from 'react';
import { X as XMarkIcon, AlertTriangle, CheckCircle, BarChart2, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import userApi from '../services/axiosUserInstance';
import { ThemeContext } from '../utils/ThemeContext';
const Notificacion = ({ mensaje, tipo, icono: IconoComponente, onClose, notificationId }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    try {
      // Enviar solicitud al backend para marcar la notificación como leída
      await userApi.post("/read-notification", { notificationId });
      setIsClosing(true); // Inicia la animación de salida
      setTimeout(() => {
        onClose(notificationId); // Elimina la notificación después de la animación
      }, 600);
    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error);
    }
  };

  const getStyle = () => {
    if (isDarkMode) {
      switch (tipo) {
        case "INSERT_COMENTARIOS":
          return 'bg-blue-900 border-blue-700 text-blue-300';
        case 'Informe':
          return 'bg-green-900 border-green-700 text-green-300';
        case 'Alerta':
          return 'bg-amber-900 border-amber-700 text-amber-300';
        case 'Urgente':
          return 'bg-red-900 border-red-700 text-red-300';
        default:
          return 'bg-gray-900 border-gray-700 text-gray-300';
      }
    } else {
      switch (tipo) {
        case "INSERT_COMENTARIOS":
          return 'bg-blue-50 border-blue-200 text-blue-800';
        case 'Informe':
          return 'bg-green-50 border-green-200 text-green-800';
        case 'Alerta':
          return 'bg-amber-50 border-amber-200 text-amber-800';
        case 'Urgente':
          return 'bg-red-50 border-red-200 text-red-800';
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    }
  };

  return (
    <div
      className={`flex items-start justify-between p-4 mb-3 border-l-4 rounded transform transition-transform duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } ${getStyle()}`}
    >
      <div className="flex items-start">
        <IconoComponente className={`h-5 w-5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-white/70' : ''}`} />
        <span className="text-sm font-medium">{mensaje}</span>
      </div>
      <button onClick={handleClose} className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const BarraDeNotificaciones = ({ visible, onClose }) => {
  const { user } = useAuth()
  const { isDarkMode } = useContext(ThemeContext);
  const [userNotifications, setUserNotifications] = useState([])



  useEffect(() => {
    async function getUserNotifications() {
      try {
        const response = await userApi.post("get-user-notifications")
        setUserNotifications(response.data.data)

      } catch (err) {
        console.log("[ERROR AL CONSEGUIR LAS NOTIFICACIONES DEL USUARIO]", err)
      }
    }

    getUserNotifications()


  }, [])


  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [notifications, setNotifications] = useState([
    {
      icono: MessageSquare,
      mensaje: "Se han recolectado 50 nuevos comentarios.",
      tipo: "Actualización"
    },
    {
      icono: AlertTriangle,
      mensaje: "Tienes 30 comentarios pendientes de clasificación.",
      tipo: "Alerta"
    },
    {
      icono: AlertTriangle,
      mensaje: "Se han detectado 5 comentarios clasificados como graves.",
      tipo: "Urgente"
    },
    {
      icono: Settings,
      mensaje: "La configuración de web scraping ha sido modificada.",
      tipo: "Actualización"
    },
    {
      icono: BarChart2,
      mensaje: "Resumen semanal: 200 comentarios clasificados, 85% de aprobación.",
      tipo: "Informe"
    },
  ]);

  const removeNotification = async (id) => {
    try {
      await userApi.post("/read-notification", { notificationId: id });

      setUserNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id)
      );


    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
    }
  };

  if (!visible) return null;

  const filteredNotifications = categoriaActiva === 'todas'
    ? notifications
    : notifications.filter(n => n.tipo === categoriaActiva);

  const categorias = [
    { key: 'todas', label: 'Todas' },
    { key: 'Actualización', label: 'Actualización' },
    { key: 'Informe', label: 'Informe' },
    { key: 'Alerta', label: 'Alerta' },
    { key: 'Urgente', label: 'Urgente' }
  ];

  if (!visible) return null;

  return (
    <div className={`
      ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg rounded-lg w-100 flex flex-col max-h-[600px]`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Notificaciones</h2>
          {userNotifications.length > 0 && (
            <span className={`rounded-full px-2 py-1 text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {userNotifications.length}
            </span>
          )}
        </div>
        <div className="flex flex-nowrap overflow-x-auto pb-2">
          {categorias.map((categoria) => (
            <button
              key={categoria.key}
              onClick={() => setCategoriaActiva(categoria.key)}
              className={`px-2 py-1 text-sm rounded-full whitespace-nowrap mr-2
                ${categoria.key === categoriaActiva
                  ? (isDarkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-black')
                  : (isDarkMode
                    ? 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-200')}`}>
              {categoria.label}
            </button>
          )).filter(Boolean)}
        </div>
      </div>
      <div className={`flex flex-col gap-2 p-4 overflow-y-auto scrollbar-thin  
        ${isDarkMode
          ? 'scrollbar-thumb-gray-700 scrollbar-track-gray-800'
          : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'}`}>
        {userNotifications.map((notification, index) => (
          <Notificacion
            key={notification.id}
            mensaje={notification.message}
            tipo={notification.tipoNotificacionApp}
            icono={MessageSquare}
            onClose={() => removeNotification(notification.id)}
            notificationId={notification.id} // Asegúrate de pasar el ID de la notificación
          />
        ))}
      </div>
    </div>
  );
};

export default BarraDeNotificaciones;
