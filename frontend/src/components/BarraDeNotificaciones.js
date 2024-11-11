import React, { useEffect, useState } from 'react';
import { X as XMarkIcon, AlertTriangle, CheckCircle, BarChart2, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import userApi from '../services/axiosUserInstance';
const Notificacion = ({ mensaje, tipo, icono: IconoComponente, onClose }) => {




  const getStyle = () => {
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
  };

  return (
    <div className={`flex items-start justify-between p-4 mb-3 border-l-4 rounded ${getStyle()}`}>
      <div className="flex items-start">
        <IconoComponente className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{mensaje}</span>
      </div>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const BarraDeNotificaciones = ({ visible, onClose }) => {
  const { user } = useAuth()

  const [userNotifications, setUserNotifications] = useState([])



  useEffect(() => {


    async function getUserNotifications() {
      try {

        const response = await userApi.post("get-user-notifications")
        console.log(response)
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

  const removeNotification = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

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
    <div className="bg-white shadow-lg rounded-lg w-100 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Notificaciones</h2>
        </div>
        <div className="flex flex-nowrap overflow-x-auto pb-2">
          {categorias.map((categoria) => (
            <button
              key={categoria.key}
              onClick={() => setCategoriaActiva(categoria.key)}
              className={`px-2 py-1 text-sm rounded-full whitespace-nowrap mr-2 ${categoria.key === categoriaActiva
                ? 'bg-gray-200 text-black'
                : 'bg-write text-gray-600 hover:bg-gray-200'
                }`} >
              {categoria.label}
            </button>
          )).filter(Boolean)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {userNotifications.map((notification, index) => (
          <Notificacion
            key={index}
            mensaje={notification.message}
            tipo={notification.tipoNotificacionApp}
            icono={MessageSquare}
            onClose={() => removeNotification(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BarraDeNotificaciones;
