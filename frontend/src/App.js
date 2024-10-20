import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './utils/ThemeContext';
import BarraLateral from './components/BarraLateral';
import Dashboard from './components/Dashboard';
import ComentariosPendientes from './components/ComentariosPendientes';
import ComentariosClasificados from './components/ComentariosClasificados';
import HistorialDeCambios from './components/HistorialDeCambios';
import ComentariosRecolectados from './components/ComentariosRecolectados';
import Configuracion from './components/Configuracion';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import RutasProtegidas from './components/RutasProtegidas';
import LayoutProtegido from './components/LayoutProtegido';
import RutasPublicas from './components/RutasPublicas';
import PanelAdministrador from './components/PanelAdministrador';

function App() {
  const [mostrarNotificaciones, setMostrarNotificaciones] = React.useState(false);

  const alternarNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/login' element={
              <RutasPublicas>
                <Login />
              </RutasPublicas>
            } />

            <Route element={
              <RutasProtegidas>
                <LayoutProtegido
                  alternarNotificaciones={alternarNotificaciones}
                  mostrarNotificaciones={mostrarNotificaciones}
                />
              </RutasProtegidas>
            }>
              <Route path="/resumen" element={<Dashboard />} />
              <Route path="/comentarios-recolectados" element={<ComentariosRecolectados />} />
              <Route path="/comentarios-pendientes" element={<ComentariosPendientes />} />
              <Route path="/panel-administrador" element={<PanelAdministrador />} />
              <Route path="/comentarios-clasificados" element={<ComentariosClasificados />} />
              <Route path="/historial-de-cambios" element={<HistorialDeCambios />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/" element={<Dashboard />} />
            </Route>

            <Route
              path="*"
              element={
                <RutasProtegidas>
                  <LayoutProtegido
                    alternarNotificaciones={alternarNotificaciones}
                    mostrarNotificaciones={mostrarNotificaciones}
                  />
                </RutasProtegidas>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
