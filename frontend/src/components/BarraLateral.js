import React, { useState, useRef, useContext } from 'react';
import { BellIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { ThemeContext } from '../utils/ThemeContext';
import BarraDeNotificaciones from './BarraDeNotificaciones';
import { useAuth } from '../hooks/useAuth';

export default function BarraLateral() {
  const { user, isLoading, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();
  const [notificacionesVisibles, setNotificacionesVisibles] = useState(false);
  const notificacionesRef = useRef(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const toggleNotificaciones = () => {
    setNotificacionesVisibles(!notificacionesVisibles);
  };

  const itemsDelMenu = [
    { nombre: 'Resumen', ruta: '/resumen' },
    { nombre: 'Comentarios recolectados', ruta: '/comentarios-recolectados' },
    { nombre: 'Comentarios pendientes', ruta: '/comentarios-pendientes' },
    { nombre: 'Comentarios clasificados', ruta: '/comentarios-clasificados' },
    { nombre: 'Historial de cambios', ruta: '/historial-de-cambios' },
    ...(user?.rol === 'ADMIN' ? [{ nombre: 'Panel de administración', ruta: '/panel-administrador' }] : []),
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
      <div className="md:hidden p-4 ml-4">
        <Bars3Icon className="h-8 w-8 text-gray-600 dark:text-white cursor-pointer" onClick={toggleSidebar} />
      </div>

      <div
        className={`h-screen p-5 w-64 shadow-lg flex flex-col justify-between fixed z-10 transform transition-transform duration-300 md:relative ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className="flex flex-col flex-grow">
          <div className="hidden md:flex items-center justify-between mb-10">
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Brújula de Derechos Digitales
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6 text-white" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-black" />
                )}
              </button>
              <div className="relative">
                <button onClick={toggleNotificaciones} className="mt-4">
                  <BellIcon className="h-6 w-6" />
                </button>
                <div ref={notificacionesRef} className="absolute top-0 left-full">
                  <BarraDeNotificaciones
                    visible={notificacionesVisibles}
                    onClose={() => setNotificacionesVisibles(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          <ul>
            {itemsDelMenu.map((item) => (
              <li
                key={item.nombre}
                className={`mb-4 font-semibold p-2 rounded-lg ${location.pathname === item.ruta
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
