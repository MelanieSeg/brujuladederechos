import React, { useState, useRef, useContext } from 'react';
import { BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { ThemeContext } from '../utils/ThemeContext';
import BarraDeNotificaciones from './BarraDeNotificaciones';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  DocumentCheckIcon, 
  ClockIcon, 
  CogIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';

export default function BarraLateral({ collapsed = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificacionesVisibles, setNotificacionesVisibles] = useState(false);
  const notificacionesRef = useRef(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const toggleNotificaciones = () => {
    setNotificacionesVisibles(!notificacionesVisibles);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    { 
      icon: HomeIcon, 
      label: 'Resumen', 
      path: '/resumen',
      requiredRole: ['ADMIN', 'MODERADOR']
    },
    { 
      icon: DocumentTextIcon, 
      label: 'Comentarios recolectados', 
      path: '/comentarios-recolectados',
      requiredRole: ['ADMIN', 'MODERADOR']
    },
    { 
      icon: ClockIcon, 
      label: 'Comentarios pendientes', 
      path: '/comentarios-pendientes',
      requiredRole: ['ADMIN', 'MODERADOR']
    },
    { 
      icon: DocumentCheckIcon, 
      label: 'Comentarios clasificados', 
      path: '/comentarios-clasificados',
      requiredRole: ['ADMIN', 'MODERADOR']
    },
    { 
      icon: UserGroupIcon, 
      label: 'Panel administrador', 
      path: '/panel-administrador',
      requiredRole: ['ADMIN']
    },
    { 
      icon: CogIcon, 
      label: 'Configuración', 
      path: '/configuracion',
      requiredRole: ['ADMIN', 'MODERADOR']
    }
  ];

  const renderMenuItem = (item) => {
    // Verificar si el usuario tiene el rol requerido
    const hasRequiredRole = item.requiredRole.includes(user?.rol);
    
    if (!hasRequiredRole) return null;

    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    if (collapsed) {
      // Vista colapsada: solo iconos
      return (
        <Link 
          key={item.path}
          to={item.path}
          className={`
            flex items-center justify-center p-3 rounded-lg 
            ${isActive 
              ? (isDarkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-blue-100 text-blue-600')
              : (isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-200')
            }
          `}
        >
          <Icon className="h-6 w-6" />
        </Link>
      );
    }

    // Vista expandida: iconos y etiquetas
    return (
      <Link 
        key={item.path}
        to={item.path}
        className={`
          flex items-center space-x-3 p-3 rounded-lg 
          ${isActive 
            ? (isDarkMode 
              ? 'bg-gray-700 text-white' 
              : 'bg-blue-100 text-blue-600')
            : (isDarkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-600 hover:bg-gray-200')
          }
        `}
      >
        <Icon className="h-6 w-6" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div 
      className={`h-full p-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex flex-col flex-grow">
        <div className="mb-4 flex items-center justify-between">
          {!collapsed ? (
            <h1 
              className={`text-xl font-semibold
                ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
              `}
            >
              Brújula de Derechos Digitales
            </h1>
          ) : (
            <h1 
              className={`text-xl font-bold 
                ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
              `}
            >
              BDD
            </h1>
          )}

          {!collapsed && (
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
                {notificacionesVisibles && (
                  <div className="fixed inset-0 w-0 z-50" onClick={() => setNotificacionesVisibles(false)}>
                    <div 
                      ref={notificacionesRef} 
                      className="absolute"
                      style={{
                        top: notificacionesRef.current?.parentElement?.getBoundingClientRect().bottom ?? 40,
                        left: notificacionesRef.current?.parentElement?.getBoundingClientRect().left ?? 250,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BarraDeNotificaciones
                        visible={notificacionesVisibles}
                        onClose={() => setNotificacionesVisibles(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-grow space-y-2">
          {menuItems.map(renderMenuItem)}
        </nav>

        {!collapsed && (
          <div 
            className={`mt-auto p-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}
          >
            <div className="flex items-center space-x-4">
            {user ? (
              <>
                <img
                  src={user.image || 'https://via.placeholder.com/40'}
                  alt="Perfil"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col overflow-hidden"> {/* Ancho fijo y overflow hidden */}
                  <span 
                    className={`
                      ${isDarkMode ? 'text-white' : 'text-gray-900'} 
                      font-semibold 
                      truncate  // Trunca el texto que se desborde
                      w-full    // Asegura que ocupe todo el ancho disponible
                    `}
                  >
                    {user.name.split(' ')[0]} {/* Muestra solo el primer nombre */}
                  </span>
                  {user.name.split(' ').length > 1 && (
                    <span 
                      className={`
                        ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                        text-sm 
                        truncate  // Trunca el texto que se desborde
                        w-full    // Asegura que ocupe todo el ancho disponible
                      `}
                    >
                      {user.name.split(' ').slice(1).join(' ')} {/* Muestra apellidos */}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando usuario...</span>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      )}

        {collapsed && (
          <div className="mt-auto flex flex-col items-center space-y-4">
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
            {user && (
              <img
                src={user.image || 'https://via.placeholder.com/40'}
                alt="Perfil"
                className="w-10 h-10 rounded-full"
                title={user.name}
              />
            )}
            <button onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}