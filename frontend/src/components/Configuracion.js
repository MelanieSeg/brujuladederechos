import React from 'react';
import './Configuracion.css';

const Configuracion = () => {
  return (
    <div className="page-container">
      {/* Sección: Frecuencia de Web Scraping */}
      <div className="section">
        <h2>Ajuste de Frecuencia de Web Scraping</h2>
        <div className="radio-group">
          <label>
            <input type="radio" name="scrapingFrequency" value="1hr" /> Cada 1 hora
          </label>
          <label>
            <input type="radio" name="scrapingFrequency" value="6hr" /> Cada 6 horas
          </label>
          <label>
            <input type="radio" name="scrapingFrequency" value="12hr" /> Cada 12 horas
          </label>
          <label>
            <input type="radio" name="scrapingFrequency" value="24hr" /> Cada 24 horas
          </label>
        </div>
        <button className="button">Activar Web Scraping</button>
      </div>

      {/* Sección: Cambio de Modo */}
      <div className="section">
        <h2>Cambio de Modo</h2>
        <div className="button-group">
          <button className="button">Activar Modo Oscuro</button>
          <button className="button">Activar Modo Blanco</button>
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