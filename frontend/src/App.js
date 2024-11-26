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
import FormConfirmarUsuario from './components/forms/Form-confirmar-usuario';
import RequiredRole from './components/RequiredRole';
import NoAutorizado from './components/NoAutorizado';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'sonner';
import RecuperarContraseña from './components/RecuperarContraseña';
import RestablecerContraseña from './components/RestablecerContraseña';

function App() {
  const [mostrarNotificaciones, setMostrarNotificaciones] = React.useState(false);

  const alternarNotificaciones = () => {
    setMostrarNotificaciones(!mostrarNotificaciones);
  };

  return (
    <ThemeProvider>
      <Toaster position={"top-right"} />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path='/login' element={
                <RutasPublicas>
                  <Login />
                </RutasPublicas>
              } />
              <Route path="/forgot-password" element={
                <RutasPublicas>
                  <RecuperarContraseña />
                </RutasPublicas>
              } />
              <Route path="/reset-password" element={
                <RutasPublicas>
                  <RestablecerContraseña />
                </RutasPublicas>
              } />
              <Route path='/confirmar-cuenta' element={
                <RutasPublicas>
                  <FormConfirmarUsuario />
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
                <Route path="/panel-administrador" element={
                  <RequiredRole requiredRole={"ADMIN"}>
                    <PanelAdministrador />
                  </RequiredRole>
                } />
                <Route path="/comentarios-clasificados" element={<ComentariosClasificados />} />
                <Route path="/historial-de-cambios" element={<HistorialDeCambios />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/" element={<Dashboard />} />
              </Route>

              <Route path='/no-autorizado' element={<NoAutorizado />} />

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
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;