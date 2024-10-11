import React, { useState, useEffect } from 'react';

const Configuracion = () => {
  const [webScrapingActivo, setWebScrapingActivo] = useState(false);
  const [frecuenciaScraping, setFrecuenciaScraping] = useState('');
  const [modoOscuro, setModoOscuro] = useState(() => {
    const savedMode = localStorage.getItem('modoOscuro');
    return savedMode === 'true' ? true : false;
  });

  // Al iniciar, se revisa el localStorage y aplica el modo de tema
  useEffect(() => {
    const frecuenciaGuardada = localStorage.getItem('frecuenciaScraping');
    if (frecuenciaGuardada) {
      setFrecuenciaScraping(frecuenciaGuardada);
    }

    // Aplica las clases iniciales según el modo
    if (modoOscuro) {
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
    } else {
      document.body.classList.add('bg-gray-100', 'text-gray-900');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }
  }, [modoOscuro]);

  const alternarWebScraping = () => {
    if (!frecuenciaScraping) {
      alert('Por favor, selecciona una frecuencia para el web scraping.');
    } else {
      setWebScrapingActivo(!webScrapingActivo);
    }
  };

  const manejarCambioFrecuencia = (event) => {
    const nuevaFrecuencia = event.target.value;
    setFrecuenciaScraping(nuevaFrecuencia);
    localStorage.setItem('frecuenciaScraping', nuevaFrecuencia);
  };

  const alternarModo = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem('modoOscuro', nuevoModo);

    if (nuevoModo) {
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
    } else {
      document.body.classList.add('bg-gray-100', 'text-gray-900');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }
  };

  return (
    <div className={`p-8 ${modoOscuro ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex-1`}>
      <h2 className="text-2xl font-semibold mb-6">Configuración</h2>

      {/* Frecuencia de Web Scraping */}
      <div className={`shadow-md rounded-lg p-6 mb-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Ajuste de Frecuencia de Web Scraping</h3>
        <div className="space-y-2">
          {['1hr', '6hr', '12hr', '24hr'].map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                name="scrapingFrequency"
                value={option}
                checked={frecuenciaScraping === option}
                onChange={manejarCambioFrecuencia}
                className="form-radio text-blue-600"
              />
              <span>Cada {option.replace('hr', ' hora')}{option !== '1hr' ? 's' : ''}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={alternarWebScraping}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${webScrapingActivo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {webScrapingActivo ? 'Activado Web Scraping' : 'Desactivado Web Scraping'}
          </button>
        </div>
      </div>

      {/* Cambio de Tema */}
      <div className={`shadow-md rounded-lg p-6 mb-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Cambio de Tema</h3>
        <button
          onClick={alternarModo}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {modoOscuro ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
        </button>
      </div>

      {/* Cambiar Contraseña */}
      <div className={`shadow-md rounded-lg p-6 mb-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Cambiar Contraseña</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Contraseña Actual:</label>
            <input type="password" placeholder="Contraseña Actual" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block mb-1">Nueva Contraseña:</label>
            <input type="password" placeholder="Nueva Contraseña" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block mb-1">Confirmar Nueva Contraseña:</label>
            <input type="password" placeholder="Confirmar Nueva Contraseña" className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Actualizar Contraseña
        </button>
      </div>

      {/* Cambiar Foto de Perfil */}
      <div className={`shadow-md rounded-lg p-6 mb-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Cambiar Foto de Perfil</h3>
        <div>
          <label className="block mb-1">Seleccionar Imagen:</label>
          <input type="file" className="w-full" />
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Actualizar Foto
        </button>
      </div>

      {/* Actualizar Información de Contacto */}
      <div className={`shadow-md rounded-lg p-6 mb-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Actualizar Información de Contacto</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Correo Electrónico:</label>
            <input type="email" placeholder="Correo Electrónico" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block mb-1">Dirección:</label>
            <input type="text" placeholder="Dirección" className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Actualizar Información
        </button>
      </div>

      {/* Preferencias de Comunicación */}
      <div className={`shadow-md rounded-lg p-6 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-xl font-semibold mb-4">Preferencias de Comunicación</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Recibir Actualizaciones por Email</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span>Recibir Notificaciones por SMS</span>
          </label>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
};

export default Configuracion;