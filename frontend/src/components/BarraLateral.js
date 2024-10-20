import React, { useState, useEffect, useContext } from 'react';
import { BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { ThemeContext } from '../utils/ThemeContext'; // Importamos el contexto del tema
import { useAuth } from '../hooks/useAuth'; // Autenticación

export default function BarraLateral({ alternarNotificaciones }) {
  const { user, isLoading, logout } = useAuth(); // Obtenemos datos de autenticación

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext); // Usamos el contexto global del tema

  const itemsDelMenu = [
    { nombre: 'Resumen', ruta: '/resumen' },
    { nombre: 'Comentarios recolectados', ruta: '/comentarios-recolectados' },
    { nombre: 'Comentarios pendientes', ruta: '/comentarios-pendientes' },
    { nombre: 'Comentarios clasificados', ruta: '/comentarios-clasificados' },
    { nombre: 'Historial de cambios', ruta: '/historial-de-cambios' },
    { nombre: 'Panel de administración', ruta: '/panel-administracion' },
    { nombre: 'Configuración', ruta: '/configuracion' },
  ];

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err);
    }
  };

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
        } md:translate-x-0 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} // Usamos el estado del contexto
      >
        <div className="flex flex-col flex-grow">
          {/* Encabezado y campana */}
          <div className="hidden md:flex items-center justify-between mb-10">
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Brújula de Derechos Digitales
            </h1>
            <div className="flex items-center space-x-4">
              {/* Botón de modo claro/oscuro */}
              <button
                onClick={toggleTheme} // Alternamos entre modo oscuro y claro usando el contexto
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6 text-white" /> // Icono de sol en modo oscuro
                ) : (
                  <MoonIcon className="h-6 w-6 text-black" /> // Icono de luna en modo claro
                )}
              </button>
              <BellIcon className="h-6 w-6 cursor-pointer" onClick={alternarNotificaciones} />
            </div>
          </div>

          {/* Menú */}
          <ul>
            {itemsDelMenu.map((item) => (
              <li
                key={item.nombre}
                className={`mb-4 font-semibold p-2 rounded-lg ${
                  location.pathname === item.ruta
                    ? `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`
                    : `hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`
                }`}
              >
                <Link
                  to={item.ruta}
                  className="block"
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  {item.nombre}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sección de foto de perfil y cerrar sesión */}
          <div className={`mt-auto p-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <img
                    src={user.profilePicture || 'https://via.placeholder.com/40'}
                    alt="Perfil"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{user.name}</span>
                </>
              ) : (
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando usuario...</span>
              )}
            </div>
            <button onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}