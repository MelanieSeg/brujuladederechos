import React from 'react'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { format } from 'date-fns';

// Función para obtener la fecha y hora actual formateada
const obtenerFechaHora = () => {
  const ahora = new Date();
  return format(ahora, 'dd-MM-yyyy HH:mm:ss');
};

// Función para crear el contenido del toast con fecha y hora
const crearContenidoToast = (message, mostrarDeshacer = false, accionDeshacer = null) => {
  return (
    <div className="flex flex-col">
      <div className="font-semibold">{message}</div>
      <div className="text-sm text-gray-500">Fecha y Hora: {obtenerFechaHora()}</div>
      {mostrarDeshacer && accionDeshacer && (
        <button
          onClick={accionDeshacer}
          className="mt-2 text-blue-500 underline text-sm"
        >
          Deshacer
        </button>
      )}
    </div>
  );
};

// Funciones personalizadas para diferentes tipos de notificaciones
export const showSuccess = (message, mostrarDeshacer = false, accionDeshacer = null) => {
  toast.success(crearContenidoToast(message, mostrarDeshacer, accionDeshacer), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'bg-green-500 text-white rounded-lg p-4 shadow-lg', // Estilos de éxito
  });
};

export const showError = (message, mostrarDeshacer = false, accionDeshacer = null) => {
  toast.error(crearContenidoToast(message, mostrarDeshacer, accionDeshacer), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'bg-red-500 text-white rounded-lg p-4 shadow-lg', // Estilos de error
  });
};

export const showInfo = (message, mostrarDeshacer = false, accionDeshacer = null) => {
  toast.info(crearContenidoToast(message, mostrarDeshacer, accionDeshacer), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'bg-blue-500 text-white rounded-lg p-4 shadow-lg', // Estilos de información
  });
};

export const showWarning = (message, mostrarDeshacer = false, accionDeshacer = null) => {
  toast.warn(crearContenidoToast(message, mostrarDeshacer, accionDeshacer), {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'bg-yellow-500 text-white rounded-lg p-4 shadow-lg', // Estilos de advertencia
  });
};

// Componente Toast que incluye el ToastContainer
export const Toast = () => <ToastContainer />;