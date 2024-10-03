import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BarraLateral from './components/BarraLateral';
import Dashboard from './components/Dashboard';
import BarraDeNotificaciones from './components/BarraDeNotificaciones';
import ComentariosPendientes from './components/ComentariosPendientes';
import ComentariosClasificados from './components/ComentariosClasificados';
import HistorialDeCambios from './components/HistorialDeCambios';
import ComentariosRecolectados from './components/ComentariosRecolectados';
import Configuracion from './components/Configuracion'; // Importación correcta del componente

function App() {
  // Estado para manejar si la barra de notificaciones está visible o no
  const [mostrarNotificaciones, setMostrarNotificaciones] = React.useState(false);

  // Función para alternar la visibilidad de las notificaciones
  const alternarNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  return (
    <Router>
      <div className="relative flex bg-gray-50">
        {/* Barra lateral que ahora usa Link en lugar de cambiar el estado */}
        <BarraLateral alternarNotificaciones={alternarNotificaciones} />

        <div className="flex-1">
          {/* Mostramos la barra de notificaciones si mostrarNotificaciones es true */}
          {mostrarNotificaciones && <BarraDeNotificaciones />}

          {/* Configuramos las rutas para las diferentes vistas */}
          <Routes>
            <Route path="/resumen" element={<Dashboard />} />
            <Route path="/comentarios-recolectados" element={<ComentariosRecolectados />} />
            <Route path="/comentarios-pendientes" element={<ComentariosPendientes />} />
            <Route path="/comentarios-clasificados" element={<ComentariosClasificados />} />
            <Route path="/historial-de-cambios" element={<HistorialDeCambios />} />
            
            {/* Ruta para el componente de configuraciones */}
            <Route path="/configuracion" element={<Configuracion />} />

            {/* Ruta por defecto */}
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;