import React, { useState, useEffect } from 'react';
import './Configuracion.css';

const Configuracion = () => {
  // Estado para manejar si el web scraping está activado
  const [webScrapingActivo, setWebScrapingActivo] = useState(false);
  // Estado para manejar la frecuencia seleccionada
  const [frecuenciaScraping, setFrecuenciaScraping] = useState('');
  // Estado para manejar el modo oscuro
  const [modoOscuro, setModoOscuro] = useState(false);

  // Cargar la selección guardada en localStorage al cargar la página
  useEffect(() => {
    const frecuenciaGuardada = localStorage.getItem('frecuenciaScraping');
    if (frecuenciaGuardada) {
      setFrecuenciaScraping(frecuenciaGuardada);
    }
  }, []);

  // Función para alternar el estado de web scraping
  const alternarWebScraping = () => {
    if (!frecuenciaScraping) {
      alert('Por favor, selecciona una frecuencia para el web scraping.');
    } else {
      setWebScrapingActivo(!webScrapingActivo);
    }
  };

  // Función para manejar el cambio de la frecuencia seleccionada
  const manejarCambioFrecuencia = (event) => {
    const nuevaFrecuencia = event.target.value;
    setFrecuenciaScraping(nuevaFrecuencia);
    // Guardar la frecuencia seleccionada en localStorage
    localStorage.setItem('frecuenciaScraping', nuevaFrecuencia);
  };

  // Función para alternar el modo oscuro y claro
  const alternarModo = () => {
    setModoOscuro(!modoOscuro);
    document.body.className = modoOscuro ? 'light-mode' : 'dark-mode'; // Aplica la clase de modo oscuro o claro
  };

  return (
    <div className="page-container">
      {/* Sección: Frecuencia de Web Scraping */}
      <div className="section">
        <h2>Ajuste de Frecuencia de Web Scraping</h2>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="scrapingFrequency"
              value="1hr"
              checked={frecuenciaScraping === '1hr'}
              onChange={manejarCambioFrecuencia}
            /> 
            Cada 1 hora
          </label>
          <label>
            <input
              type="radio"
              name="scrapingFrequency"
              value="6hr"
              checked={frecuenciaScraping === '6hr'}
              onChange={manejarCambioFrecuencia}
            /> 
            Cada 6 horas
          </label>
          <label>
            <input
              type="radio"
              name="scrapingFrequency"
              value="12hr"
              checked={frecuenciaScraping === '12hr'}
              onChange={manejarCambioFrecuencia}
            /> 
            Cada 12 horas
          </label>
          <label>
            <input
              type="radio"
              name="scrapingFrequency"
              value="24hr"
              checked={frecuenciaScraping === '24hr'}
              onChange={manejarCambioFrecuencia}
            /> 
            Cada 24 horas
          </label>
        </div>

        {/* Botón para activar/desactivar el Web Scraping */}
        <div className="button-center">
          <button
            onClick={alternarWebScraping}
            className={webScrapingActivo ? 'button-active' : 'button-inactive'}
          >
            {webScrapingActivo ? 'Activado Web Scraping' : 'Desactivado Web Scraping'}
          </button>
        </div>
      </div>

      {/* Sección: Cambio de Modo */}
      <div className="section">
        <h2>Cambio de Tema</h2>
        <div className="button-group">
          <button onClick={alternarModo} className="button">
            {modoOscuro ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
          </button>
        </div>
      </div>

      {/* Sección: Cambiar Contraseña */}
      <div className="section">
        <h2>Cambiar Contraseña</h2>
        <div className="form-group">
          <label>Contraseña Actual:</label>
          <input type="password" placeholder="Contraseña Actual" />
        </div>
        <div className="form-group">
          <label>Nueva Contraseña:</label>
          <input type="password" placeholder="Nueva Contraseña" />
        </div>
        <div className="form-group">
          <label>Confirmar Nueva Contraseña:</label>
          <input type="password" placeholder="Confirmar Nueva Contraseña" />
        </div>
        <button className="button">Actualizar Contraseña</button>
      </div>

      {/* Sección: Cambiar Foto de Perfil */}
      <div className="section">
        <h2>Cambiar Foto de Perfil</h2>
        <div className="form-group">
          <label>Seleccionar Imagen:</label>
          <input type="file" />
        </div>
        <button className="button">Actualizar Foto</button>
      </div>

      {/* Sección: Actualizar Información de Contacto */}
      <div className="section">
        <h2>Actualizar Información de Contacto</h2>
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input type="email" placeholder="Correo Electrónico" />
        </div>
        <div className="form-group">
          <label>Dirección:</label>
          <input type="text" placeholder="Dirección" />
        </div>
        <button className="button">Actualizar Información</button>
      </div>

      {/* Sección: Preferencias de Comunicación */}
      <div className="section">
        <h2>Preferencias de Comunicación</h2>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" /> Recibir Actualizaciones por Email
          </label>
          <label>
            <input type="checkbox" /> Recibir Notificaciones por SMS
          </label>
        </div>
        <button className="button">Guardar Preferencias</button>
      </div>
    </div>
  );
};

export default Configuracion;