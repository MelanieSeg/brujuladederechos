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
    <div className="flex flex-col space-y-1">
      <div className="font-semibold text-gray-800">{message}</div>
      <div className="text-sm text-gray-600">Fecha y Hora: {obtenerFechaHora()}</div>
      {mostrarDeshacer && accionDeshacer && (
        <button
          onClick={accionDeshacer}
          className="mt-2 text-blue-600 underline text-sm hover:text-blue-800 transition"
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
    hideProgressBar: false, // Habilitamos la barra de tiempo
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'bg-cream text-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500 w-[340px]', // Estilo para éxito
    progressClassName: 'bg-green-500 h-1 rounded-b-md', // Barra de progreso en verde
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
    className: 'bg-cream text-gray-800 rounded-lg shadow-md p-4 border-l-4 border-red-500 w-[340px]',
    progressClassName: 'bg-red-500 h-1 rounded-b-md', // Barra de progreso en rojo
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
    className: 'bg-cream text-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500 w-[340px]',
    progressClassName: 'bg-blue-500 h-1 rounded-b-md', // Barra de progreso en azul
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
    className: 'bg-cream text-gray-800 rounded-lg shadow-md p-4 border-l-4 border-yellow-500 w-[340px]',
    progressClassName: 'bg-yellow-500 h-1 rounded-b-md', // Barra de progreso en amarillo
  });
};

// Componente Toast que incluye el ToastContainer
export const Toast = () => (
  <ToastContainer
    position="top-right" // Mantiene el toast en la parte superior derecha
    toastClassName="flex items-center justify-between bg-cream text-gray-800 rounded-lg shadow-md p-4 m-4 w-[340px]"
    bodyClassName="text-sm"
    progressClassName="h-1"
  />
);
