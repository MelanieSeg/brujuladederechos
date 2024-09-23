import React, { useState } from 'react';
import BarraLateral from './components/BarraLateral';
import Dashboard from './components/Dashboard';
import BarraDeNotificaciones from './components/BarraDeNotificaciones';

function App() {
  // Estado para manejar la vista activa
  const [vistaActiva, cambiarVistaActiva] = useState('Resumen');
  
  // Estado para manejar si la barra de notificaciones está visible o no
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // Función para alternar la visibilidad de las notificaciones
  const alternarNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  // Función para renderizar la vista según el estado de vistaActiva
  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'Resumen':
        return <Dashboard />;
      case 'Comentarios recolectados':
        return <div className="p-8">Contenido de Comentarios recolectados</div>;
      case 'Comentarios pendientes':
        return <div className="p-8">Contenido de Comentarios pendientes</div>;
      case 'Comentarios clasificados':
        return <div className="p-8">Contenido de Comentarios clasificados</div>;
      case 'Historial de cambios':
        return <div className="p-8">Contenido de Historial de cambios</div>;
      case 'Configuración':
        return <div className="p-8">Contenido de Configuración</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="relative flex bg-gray-50">
      {/* Barra lateral que recibe el estado de vista activa y la función para alternar notificaciones */}
      <BarraLateral vistaActiva={vistaActiva} cambiarVistaActiva={cambiarVistaActiva} alternarNotificaciones={alternarNotificaciones} />

      <div className="flex-1">
        {/* Mostramos la barra de notificaciones si mostrarNotificaciones es true */}
        {mostrarNotificaciones && <BarraDeNotificaciones />}
        
        {/* Renderizamos la vista según la opción seleccionada */}
        {renderizarVista()}
      </div>
    </div>
  );
}

export default App;
