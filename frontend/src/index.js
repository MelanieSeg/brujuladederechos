import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { DarkModeProvider } from './context/DarkModeContext'; // Importa el proveedor de contexto

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <DarkModeProvider> {/* Envuelve tu aplicación dentro del proveedor */}
      <App />
    </DarkModeProvider>
  </React.StrictMode>
);