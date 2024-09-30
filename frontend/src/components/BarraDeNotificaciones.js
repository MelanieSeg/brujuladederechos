import React from 'react';

// Componente de la barra de notificaciones
export default function BarraDeNotificaciones() {
  return (
    // Contenedor principal con posicionamiento absoluto
    <div className="absolute top-8 left-22 bg-white shadow-lg p-4 rounded-lg w-64 z-10">
      
      {/* Título de la barra de notificaciones */}
      <h2 className="font-bold text-lg mb-4">Notificaciones</h2>
      
      {/* Lista de notificaciones */}
      <ul>
        {/* Ejemplo de notificación */}
        <li className="border-b py-2">Ejemplo de notificación 1</li>
        <li className="border-b py-2">Ejemplo de notificación 2</li>
        <li className="py-2">Ejemplo de notificación 3</li>
      </ul>
    </div>
  );
}
