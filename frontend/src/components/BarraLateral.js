import React, { useState, useEffect } from 'react';
import { BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function BarraLateral({ alternarNotificaciones }) {

  const { user, isLoading, logout } = useAuth()

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  const itemsDelMenu = [
    { nombre: 'Resumen', ruta: '/resumen' },
    { nombre: 'Comentarios recolectados', ruta: '/comentarios-recolectados' },
    { nombre: 'Comentarios pendientes', ruta: '/comentarios-pendientes' },
    { nombre: 'Comentarios clasificados', ruta: '/comentarios-clasificados' },
    { nombre: 'Historial de cambios', ruta: '/historial-de-cambios' },
    { nombre:'Panel Administrador',ruta:'/panel-administrador'},
    { nombre: 'Configuración', ruta: '/configuracion' },
  ];

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = async () => {
    try {

      await logout()

    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    // Hacer una solicitud para obtener los datos del usuario
    fetch('/api/users/me', {  // Asegúrate de que este endpoint exista en tu backend
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Enviar el token de autenticación
      },
    })
      .then((response) => response.json())
      .then((data) => {
        //obtener data de user si es necesario , por ahora no por que cn la data que viene en el payload de JWT es suficienete
      })
      .catch((error) => console.error('Error al obtener los datos del usuario:', error));
  }, []);

  return (
    <div>
      {/* Icono de hamburguesa visible solo en pantallas pequeñas */}
      <div className="md:hidden p-4 ml-4">
        <Bars3Icon className="h-8 w-8 text-gray-600 dark:text-white cursor-pointer" onClick={toggleSidebar} />
      </div>

      {/* Barra lateral */}
      <div
        className={`h-screen p-5 w-64 shadow-lg flex flex-col justify-between fixed z-10 transform transition-transform duration-300 md:relative ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 bg-light-bg dark:bg-dark-bg`} // Aquí cambiamos el color de fondo según el modo
      >
        <div className="flex flex-col flex-grow">
          {/* Encabezado y campana */}
          <div className="hidden md:flex items-center justify-between mb-10">
            <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">Brújula de Derechos Digitales</h1>
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-white cursor-pointer" onClick={alternarNotificaciones} />
          </div>

          {/* Menú */}
          <ul>
            {itemsDelMenu.map((item) => (
              <li
                key={item.nombre}
                className={`mb-4 font-semibold p-2 rounded-lg ${
                  location.pathname === item.ruta ? 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Link
                  to={item.ruta}
                  className="block"
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();  // Cerrar el sidebar en pantallas pequeñas
                  }}
                >
                  {item.nombre}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sección de foto de perfil y cerrar sesión */}
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <img src={user.profilePicture || "https://via.placeholder.com/40"} alt="Perfil" className="w-10 h-10 rounded-full" />
                  <span className="text-light-text dark:text-dark-text font-medium">{user.name}</span>
                </>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">Cargando usuario...</span>
              )}
            </div>
            <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}