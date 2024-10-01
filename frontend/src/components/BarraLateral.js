import React, { useState } from 'react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline'; // Campanita y hamburguesa
import { Link } from 'react-router-dom'; // Usar Link para las rutas

// Componente de la barra lateral (Sidebar)
export default function BarraLateral({ alternarNotificaciones }) {
  // Estado para controlar la visibilidad de la barra lateral
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Menú de opciones en la barra lateral
  const itemsDelMenu = [
    { nombre: 'Resumen', ruta: '/resumen' },
    { nombre: 'Comentarios recolectados', ruta: '/comentarios-recolectados' },
    { nombre: 'Comentarios pendientes', ruta: '/comentarios-pendientes' },
    { nombre: 'Comentarios clasificados', ruta: '/comentarios-clasificados' },
    { nombre: 'Historial de cambios', ruta: '/historial-de-cambios' },
    { nombre: 'Configuración', ruta: '/configuracion' },
  ];

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div>
      {/* Icono de hamburguesa para pantallas pequeñas */}
      <div className="md:hidden p-4">
        <Bars3Icon
          className="h-8 w-8 text-gray-600 cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      {/* Barra lateral */}
      <div
        className={`bg-gray-50 h-screen p-5 w-64 shadow-lg flex flex-col justify-between absolute z-10 transition-transform duration-300 transform ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div>
          {/* Ocultar título y campanita en pantallas pequeñas */}
          <div className="hidden md:flex items-center justify-between mb-10">
            <h1 className="text-xl font-semibold">Brújula de Derechos Digitales</h1>
            {/* Icono de campana para alternar las notificaciones */}
            <BellIcon
              className="h-6 w-6 text-gray-600 cursor-pointer"
              onClick={alternarNotificaciones}
            />
          </div>

          {/* Lista de opciones en la barra lateral */}
          <ul>
            {itemsDelMenu.map((item) => (
              <li
                key={item.nombre}
                className="mb-4 font-semibold p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Link
                  to={item.ruta}
                  className="block"
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar(); // Cerrar el sidebar en pantallas pequeñas
                  }}
                >
                  {item.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
