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
  const [mostrarNotificaciones, setMostrarNotificaciones] = React.useState(false);

  const alternarNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  return (
    <Router>
      <div className="flex bg-gray-50 min-h-screen">
        {/* Barra lateral fija */}
        <div className="fixed top-0 left-0 z-40 w-64 md:block hidden h-screen">
          <BarraLateral alternarNotificaciones={alternarNotificaciones} />
        </div>

        {/* Barra lateral móvil */}
        <div className="md:hidden">
          <BarraLateral alternarNotificaciones={alternarNotificaciones} />
        </div>

        {/* Contenido principal con margen ajustado */}
        <div className="flex-1 md:ml-64">
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



