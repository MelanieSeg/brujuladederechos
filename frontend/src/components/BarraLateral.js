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
  ArchiveBoxIcon,
  CogIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';

export default function BarraLateral({ collapsed = false, isMobile = false }) { // Added isMobile prop
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificacionesVisibles, setNotificacionesVisibles] = useState(false);
  const notificacionesRef = useRef(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

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
      icon: ArchiveBoxIcon, 
      label: 'Historial de cambios', 
      path: '/historial-de-cambios',
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
      // Vista colapsada solo iconos
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

    // Vista expandida iconos y etiquetas
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

  const LogoutModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50`}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-8 rounded-lg shadow-xl max-w-sm w-full`}
      >
        {/* Título */}
        <h3 className="text-2xl font-bold mb-4 text-center">
          ¿Estás seguro de que deseas cerrar sesión?
        </h3>
  
        {/* Descripción */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          Tu sesión actual se cerrará y perderás acceso temporalmente.
        </p>
  
        {/* Botones */}
        <div className="flex space-x-4">
          <button
            onClick={() => setLogoutModalVisible(false)}
            className={`flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
          >
            Cancelar
          </button>
          <button
            onClick={handleLogout}
            className={`flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200`}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`h-full min-h-screen p-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}
      `}>
      <div className="flex flex-col flex-grow">
        {/* Header Section */}
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
                aria-label="Alternar tema"
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6 text-white" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-black" />
                )}
              </button>
              
              {/* Condicionalmente renderizar el BellIcon solo si no es móvil */}
              {!isMobile && (
                <div className="relative">
                  <button onClick={toggleNotificaciones} className="mt-4" aria-label="Abrir notificaciones">
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
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow space-y-2">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Profile Section for Expanded Sidebar on Desktop Only */}
        {!collapsed && !isMobile && (
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
                  <div className="flex flex-col overflow-hidden"> {/* Fixed width and overflow hidden */}
                    <span 
                      className={`
                        ${isDarkMode ? 'text-white' : 'text-gray-900'} 
                        font-semibold 
                        truncate  
                        w-full    
                      `}
                    >
                      {user.name.split(' ')[0]} {/* Show only first name */}
                    </span>
                    {user.name.split(' ').length > 1 && (
                      <span 
                        className={`
                          ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                          text-sm 
                          truncate  
                          w-full    
                        `}
                      >
                        {user.name.split(' ').slice(1).join(' ')} {/* Show last names */}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando usuario...</span>
              )}
            </div>
            <button 
              onClick={() => setLogoutModalVisible(true)} 
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600"
              title="Salir"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Logout Button for Collapsed Sidebar on Desktop Only */}
        {collapsed && !isMobile && (
          <div 
            className={`mt-auto p-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-end`}
          >
            <button 
              onClick={() => setLogoutModalVisible(true)} 
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-600"
              title="Salir"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      {isLogoutModalVisible && <LogoutModal />}
    </div>
  );
}
/////////////////////////////////////////////////////////////////////////