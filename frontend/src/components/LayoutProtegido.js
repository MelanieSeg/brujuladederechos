// LayoutProtegido.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import BarraLateral from "./BarraLateral";
import BarraDeNotificaciones from "./BarraDeNotificaciones";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../utils/ThemeContext";

const LayoutProtegido = () => {
  // Estados y hooks
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [barraLateralVisible, setBarraLateralVisible] = useState(true);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const { user, logout } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [notificacionesVisibles, setNotificacionesVisibles] = useState(false);
  const toggleNotificaciones = () => {
    setNotificacionesVisibles(!notificacionesVisibles);
  };
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const profileDropdownRef = useRef(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const toggleBarraLateral = () => {
    setBarraLateralVisible(!barraLateralVisible);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.log(err);
    }
  };

  // Manejar clics fuera del dropdown de perfil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && mobileSidebarVisible) {
        setMobileSidebarVisible(false);
      }

      if (!mobile && notificacionesVisibles) {
        setNotificacionesVisibles(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileSidebarVisible, notificacionesVisibles]);

  const LogoutModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50`}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-6 rounded-lg shadow-xl w-11/12 max-w-xs sm:max-w-sm`}
      >
        {/* Título */}
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-center">
          ¿Cerrar sesión?
        </h3>

        {/* Descripción */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Perderás acceso temporalmente a tu cuenta.
        </p>

        {/* Botones */}
        <div className="flex space-x-2">
          <button
            onClick={() => setLogoutModalVisible(false)}
            className={`flex-1 px-3 py-2 rounded-md text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`}
          >
            Cancelar
          </button>
          <button
            onClick={handleLogout}
            className={`flex-1 px-3 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition-colors duration-200`}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Sidebar para Desktop */}
      <div className="fixed top-0 left-0 z-40 hidden md:block h-screen transition-all duration-300 ease-in-out">
        <BarraLateral
          alternarNotificaciones={toggleNotificaciones}
          collapsed={!barraLateralVisible}
        />
        <button
          onClick={toggleBarraLateral}
          className="absolute top-4 -right-4 bg-white dark:bg-gray-800 shadow-md rounded-full p-1"
        >
          {barraLateralVisible ? (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar para Mobile */}
      {mobileSidebarVisible && isMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={toggleMobileSidebar}
          ></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform transform">
            <BarraLateral
              alternarNotificaciones={toggleNotificaciones}
              collapsed={false}
              isMobile={true}
            />
            <button
              onClick={toggleMobileSidebar}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 shadow-md rounded-full p-1"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out relative ${
          barraLateralVisible ? "md:ml-64" : "md:ml-16"
        }`}
      >
        {/* Top Bar para Mobile */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-md relative">
          {/* Botón Burger para abrir sidebar móvil */}
          {!mobileSidebarVisible && (
            <button onClick={toggleMobileSidebar} aria-label="Abrir menú">
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Título de la Aplicación */}
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">BDD</h1>

          {/* Contenedor para BellIcon y Profile Icon */}
          <div className="flex items-center space-x-4">
            {/* Botón de Notificaciones */}
            <button onClick={toggleNotificaciones} aria-label="Abrir notificaciones">
              <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Profile Icon in Top Bar (visible on mobile) */}
            {user && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownVisible(!profileDropdownVisible)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="Abrir menú de perfil"
                >
                  <img
                    src={user.image || "https://via.placeholder.com/40"}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full"
                    title={user.name}
                  />
                </button>
                {/* Dropdown Menu */}
                {profileDropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                    <div className="p-4 border-b dark:border-gray-700">
                      <p className="text-gray-800 dark:text-gray-200 font-semibold">
                        {user.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setLogoutModalVisible(true)}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Salir
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Outlet para Rutas Anidadas */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>

      {/* Barra de Notificaciones Fija */}
      {notificacionesVisibles && (
        <div
          className="fixed top-16 md:top-0 right-0 z-50 w-11/12 sm:w-8/12 md:w-70vw max-w-full p-4 md:p-6"
          // Ajusta el top para que no se superponga con la barra superior en móviles
        >
          <BarraDeNotificaciones
            visible={notificacionesVisibles}
            onClose={() => setNotificacionesVisibles(false)}
          />
        </div>
      )}

      {/* Modal de Logout */}
      {isLogoutModalVisible && <LogoutModal />}
    </div>
  );
};

export default LayoutProtegido;


///QUE FALTA 1.PREGUNTAR SI HAY QUE DEJARLO FIJO ARRIBA CUANDO LA BARRA CARGA NOTIFICACIONES O QUE SE ADAPTE AL SCROLL
//           2.IMPLEMENTAR FORMA QUE HAGA ESTO, SI TENIAS EL BARRA DE NOTIFICACIONES ABIERTO EN RESPONSIVO EN ESTE CASO CON LAYOUTPROTEGIDO
//             Y JUSTO LO COLOCAS NORMAL NO RESPONSIVO QUE SE ABRA LA BARRA DE NOTIFICACIONES QUE SE CARGA EN BARRA LATERAL, Y QUE LA DE
//             LAYOUT PROTEGIDO SE CIERRE COMO LO HACE ACTUALMENTE, Y VISCEVERSA 
//             