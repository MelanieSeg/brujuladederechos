import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import BarraLateral from "./BarraLateral";
import BarraDeNotificaciones from "./BarraDeNotificaciones";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from '../hooks/useAuth'; 

const LayoutProtegido = ({ alternarNotificaciones, mostrarNotificaciones }) => {
  const [barraLateralVisible, setBarraLateralVisible] = useState(true);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false); // New state for mobile sidebar
  const { user, logout } = useAuth(); // obtener(usuario y logout funcion)
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
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


  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const profileDropdownRef = useRef(null);

  // Cerrar dropdown cuando cliqueando afuera
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
      {/* Sidebar for Desktop */}
      <div className="fixed top-0 left-0 z-40 hidden md:block h-screen transition-all duration-300 ease-in-out">
        <BarraLateral
          alternarNotificaciones={alternarNotificaciones}
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

      {/* Sidebar for Mobile */}
      {mobileSidebarVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={toggleMobileSidebar}
          ></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform transform">
            <BarraLateral
              alternarNotificaciones={alternarNotificaciones}
              collapsed={false} // Siempre extandido en movil
              isMobile={true} // Pass a prop to indicate mobile view
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out relative ${
          barraLateralVisible ? "md:ml-64" : "md:ml-16"
        }`}
      >
        {/* Top Bar for Mobile */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-md relative">
          <button onClick={toggleMobileSidebar}>
            <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">BDD</h1>
          {/* Profile Icon in Top Bar (visible on mobile) */}
          {user && (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownVisible(!profileDropdownVisible)}
                className="flex items-center space-x-2 focus:outline-none"
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
              {isLogoutModalVisible && <LogoutModal />}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="sticky top-0 right-0 z-50">
          {mostrarNotificaciones && <BarraDeNotificaciones />}
        </div>

        {/* Outlet for Nested Routes */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutProtegido;
