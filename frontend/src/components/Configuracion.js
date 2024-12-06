import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../utils/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import FormChangeUserPassword from './forms/Form-change-password-usuario';
import FormChangeProfilePicture from './forms/Form-upload-image-user';
import configApi from "../services/axiosUserConfigInstance.js"

const Configuracion = () => {


  const { user, logout } = useAuth()

  const { isDarkMode } = useContext(ThemeContext);
  const [webScrapingActivo, setWebScrapingActivo] = useState(false);
  const [frecuenciaScraping, setFrecuenciaScraping] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataConfig, setDataConfig] = useState([])


  const frequencyOptions = [
    { value: 0, label: 'Cada 10 minutos' },
    { value: 1, label: 'Cada 30 minutos' },
    { value: 2, label: 'Cada 1 hora' },
    { value: 3, label: 'Cada 3 horas' },
    { value: 4, label: 'Cada 8 horas' },
    { value: 5, label: 'Cada 12 horas' },
    { value: 6, label: 'Cada 24 horas' },
  ];

  useEffect(() => {
    const obtenerConfiguracion = async () => {
      try {
        const response = await configApi.get('/get-configuration');
        const config = response.data;

        setWebScrapingActivo(config.data[0].activo)
        setFrecuenciaScraping(config.data[0].frecuenciaScraping)
        setDataConfig(config.data[0])
      } catch (err) {
        console.error('Error al obtener la configuración:', err);
        setError('No se pudo cargar la configuración. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    obtenerConfiguracion();
  }, []);


  console.log(webScrapingActivo, frecuenciaScraping, dataConfig.id)


  const alternarWebScraping = async () => {
    if (frecuenciaScraping === '' || frecuenciaScraping === null) {
      return;
    }


    try {
      const nuevaEstado = !webScrapingActivo;
      await configApi.post('/change-configuration', {
        id: dataConfig.id,
        activo: nuevaEstado,
        frecuenciaScraping,
      });
      setWebScrapingActivo(nuevaEstado);
    } catch (err) {
      console.error('Error al actualizar la configuración:', err);
    }
  };

  const manejarCambioFrecuencia = async (event) => {
    const nuevaFrecuencia = Number(event.target.value);
    setFrecuenciaScraping(nuevaFrecuencia);

    try {
      await configApi.post('/change-configuration', {
        id: dataConfig.id,
        activo: webScrapingActivo,
        frecuenciaScraping: Number(nuevaFrecuencia),
      });
    } catch (err) {
      console.error('Error al actualizar la frecuencia:', err);
    }
  }

  return (
    <div className={`p-2 sm:p-4 min-h-screen lg:p-8 min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>

      <h2 className="text-2xl font-semibold mb-6">Configuración</h2>

      {user.rol === "ADMIN" &&
        <ConfigSection title="Ajuste de Frecuencia de Web Scraping" isDarkMode={isDarkMode}>
          <div className="space-y-4">
            {frequencyOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <input
                  type="radio"
                  name="scrapingFrequency"
                  value={option.value}
                  checked={frecuenciaScraping === option.value}
                  onChange={manejarCambioFrecuencia}
                  className={`mr-2 ${isDarkMode
                    ? 'text-blue-500 bg-gray-700 border-gray-600'
                    : 'text-blue-600'
                    }`}
                />
                <span className="text-lg">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 button-center">
            <button
              onClick={alternarWebScraping}
              className={`px-6 py-3 text-white rounded-md transition-all duration-300 ${webScrapingActivo
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
                }`}
            >
              {webScrapingActivo ? 'Desactivar Web Scraping' : 'Activar Web Scraping'}
            </button>
          </div>
        </ConfigSection>


      }

      {/* Cambiar Contraseña */}
      <ConfigSection title="Cambiar Contraseña" isDarkMode={isDarkMode}>
        <FormChangeUserPassword logoutFn={logout} />
      </ConfigSection>

      {/* Cambiar Foto de Perfil */}
      <ConfigSection title="Cambiar Foto de Perfil" isDarkMode={isDarkMode}>
        <FormChangeProfilePicture />
      </ConfigSection>

      {/* Actualizar Información de Contacto */}
      <ConfigSection title="Actualizar Información de Contacto" isDarkMode={isDarkMode}>
        <InputField
          label="Correo Electrónico"
          type="email"
          isDarkMode={isDarkMode}
        />
        <InputField
          label="Dirección"
          type="text"
          isDarkMode={isDarkMode}
        />
        <button
          className={`mt-4 w-full px-4 py-2 rounded-md ${isDarkMode
            ? 'bg-blue-700 text-white hover:bg-blue-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          Actualizar Información
        </button>
      </ConfigSection>

      {/* Preferencias de Comunicación */}
      <ConfigSection title="Preferencias de Comunicación" isDarkMode={isDarkMode}>
        <div className="space-y-2">
          <CheckboxField
            label="Recibir Actualizaciones por Email"
            isDarkMode={isDarkMode}
          />
        </div>
        <button
          className={`mt-4 w-full px-4 py-2 rounded-md ${isDarkMode
            ? 'bg-blue-700 text-white hover:bg-blue-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          Guardar Preferencias
        </button>
      </ConfigSection>
    </div>
  );
};

// Componentes reutilizables con soporte para modo oscuro

const ConfigSection = ({ title, children, isDarkMode }) => (
  <div className={`shadow-md rounded-lg p-6 mb-6 ${isDarkMode
    ? 'bg-gray-800 border border-gray-700'
    : 'bg-white border border-gray-200'
    }`}>
    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode
      ? 'text-gray-200'
      : 'text-gray-900'
      }`}>
      {title}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, type, isDarkMode }) => (
  <div className="mb-4">
    <label className={`block mb-1 ${isDarkMode
      ? 'text-gray-300'
      : 'text-gray-700'
      }`}>
      {label}:
    </label>
    <input
      type={type}
      placeholder={label}
      className={`w-full px-3 py-2 rounded-md border ${isDarkMode
        ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
        : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-400'
        }`}
    />
  </div>
);

const CheckboxField = ({ label, isDarkMode }) => (
  <label className={`flex items-center space-x-2 ${isDarkMode
    ? 'text-gray-300'
    : 'text-gray-700'
    }`}>
    <input
      type="checkbox"
      className={`form-checkbox ${isDarkMode
        ? 'text-blue-500 bg-gray-700 border-gray-600'
        : 'text-blue-600'}`}
    />
    <span>{label}</span>
  </label>
);

export default Configuracion;
