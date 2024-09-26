import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline'; //campanita

// Componente de la barra lateral (Sidebar)
export default function BarraLateral({ vistaActiva, cambiarVistaActiva, alternarNotificaciones }) {
  // Menú de opciones en la barra lateral
  const itemsDelMenu = [
    { nombre: 'Resumen', etiqueta: 'Resumen' },
    { nombre: 'Comentarios recolectados', etiqueta: 'Comentarios recolectados' },
    { nombre: 'Comentarios pendientes', etiqueta: 'Comentarios pendientes' },
    { nombre: 'Comentarios clasificados', etiqueta: 'Comentarios clasificados' },
    { nombre: 'Historial de cambios', etiqueta: 'Historial de cambios' },
    { nombre: 'Configuración', etiqueta: 'Configuración' }
  ];

  return (
    <div className="bg-gray-50 h-screen p-5 w-64 shadow-lg flex flex-col justify-between relative">
      <div>
        {/* Título de la aplicación y campanita de notificaciones */}
        <div className="flex items-center justify-between mb-10 relative">
          <h1 className="text-xl font-semibold">Brújula de Derechos Digitales</h1>
          {/* Icono de campana para alternar las notificaciones */}
          <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer" onClick={alternarNotificaciones} />
        </div>

        {/* Lista de opciones en la barra lateral */}
        <ul>
          {itemsDelMenu.map((item) => {
            // Clase CSS que varía según si el elemento está activo
            const claseItem = vistaActiva === item.nombre 
              ? 'mb-4 font-semibold p-2 rounded-lg cursor-pointer bg-gray-300 text-gray-900' 
              : 'mb-4 font-semibold p-2 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-100';
            
            return (
              <li
                key={item.nombre}
                className={claseItem}
                onClick={() => cambiarVistaActiva(item.nombre)}
              >
                {item.etiqueta}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

