import React, { useState, useEffect, useContext } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Paginacion from './Objects/Paginacion';
import Cargando from './Objects/Cargando';
import api from '../services/axios';
import userApi from '../services/axiosUserInstance';
import FormCreateUser from './forms/Form-crear-usuario';
import FormUpdateUser from './forms/Form-update-usuario';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../utils/ThemeContext';
import ModalEliminarModerador from './modals/Modal-eliminar-usuario';

export default function PanelAdministrador() {
  const [moderadores, setModeradores] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [moderadorAEliminar, setModeradorAEliminar] = useState(null);
  const [moderadorAEditar, setModeradorAEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [estado, setEstado] = useState('Activo');
  const navigate = useNavigate()
  const { isDarkMode } = useContext(ThemeContext);

  const moderadoresPorPagina = 10;

  // Función para reiniciar los campos del formulario
  const resetFormFields = () => {
    setNombre('');
    setEmail('');
    setContraseña('');
    setConfirmarContraseña('');
    setEstado('Activo');
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true); // Comienza la carga
        const response = await userApi.get("/");
        setModeradores(response.data);
      } catch (err) {
        console.log(`Error al obtener los usuarios`, err);
      } finally {
        setLoading(false); // Termina la carga
      }
    }
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (moderadorAEditar) {
      setNombre(moderadorAEditar.name);
      setEmail(moderadorAEditar.email);
      setEstado(moderadorAEditar.isActive);
      setContraseña('');
      setConfirmarContraseña('');
    }
  }, [moderadorAEditar]);

  const cambiarStateUsuario = async function (userId, currentState) {
    try {
      const response = await userApi.patch("/deactivate-user", { id: userId, isActive: !currentState })
      console.log(response)
    } catch (err) {
      console.log(err)
    }
  }

  // Función para activar o desactivar un moderador
  const manejarActivarDesactivarModerador = (id, currentState) => {
    setModeradores(
      moderadores.map((mod) =>
        mod.id === id ? { ...mod, isActive: !mod.isActive } : mod
      )
    );

    cambiarStateUsuario(id, currentState)
  };

  // Función para confirmar la eliminación de un moderador
  const confirmarEliminarModerador = (moderador) => {
    setModeradorAEliminar(moderador);
    setMostrarModalEliminar(true);
  };

  // Función para eliminar un moderador
  const manejarEliminarModerador = () => {
    setModeradores(moderadores.filter((mod) => mod.id !== moderadorAEliminar.id));
    setMostrarModalEliminar(false);
    setModeradorAEliminar(null);
  };

  // Función para manejar la búsqueda
  const manejarCambioBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página cuando se hace una búsqueda
  };

  // Filtrar moderadores según la búsqueda
  const moderadoresFiltrados = moderadores?.filter((moderador) =>
    moderador.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    moderador.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculo de índices para la paginación
  const indiceUltimoModerador = paginaActual * moderadoresPorPagina;
  const indicePrimerModerador = indiceUltimoModerador - moderadoresPorPagina;
  const moderadoresAMostrar = moderadoresFiltrados?.slice(
    indicePrimerModerador,
    indiceUltimoModerador
  );

  const totalPaginas = Math.ceil(
    moderadoresFiltrados?.length / moderadoresPorPagina
  );

  // Función para agregar un nuevo moderador
  const handleAgregarModerador = (e) => {
    e.preventDefault();
    setMostrarFormulario(false);
    resetFormFields();
  };

  // Función para manejar la edición del moderador
  const handleEditarModerador = (e) => {
    e.preventDefault();
    setMostrarFormularioEditar(false);
    setModeradorAEditar(null);
    resetFormFields();
  };

  // Formulario para agregar un nuevo moderador
  const formularioAgregarModerador = (
    <div 
      className={`fixed inset-0 ${isDarkMode 
          ? 'bg-gray-900 bg-opacity-70' 
          : 'bg-gray-800 bg-opacity-50'
      } flex justify-center sm:justify-end items-center sm:items-start`}>
      <div 
        className={`w-full sm:max-w-md h-auto p-6 shadow-md overflow-y-auto ${
          isDarkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
        }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 
            className={`text-xl font-bold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
            Agregar nuevo moderador
          </h3>
          <button
            onClick={() => {
              setMostrarFormulario(false);
              resetFormFields();
            }}
            className={`hover:bg-opacity-10 rounded-full p-1 ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}>
            <XMarkIcon 
              className={`h-6 w-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`} 
            />
          </button>
        </div>
        <FormCreateUser />
      </div>
    </div>
  );

  // Formulario para editar un moderador existente
  const formularioEditarModerador = (
    <div 
      className={`fixed inset-0 ${isDarkMode 
          ? 'bg-gray-900 bg-opacity-70' 
          : 'bg-gray-800 bg-opacity-50'
      } flex justify-center sm:justify-end items-center sm:items-start`}>
      <div 
        className={`w-full sm:max-w-md h-auto p-6 shadow-md overflow-y-auto ${
          isDarkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
        }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 
            className={`text-xl font-bold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>
            Editar moderador
          </h3>
          <button
            onClick={() => {
              setMostrarFormularioEditar(false);
              setModeradorAEditar(null);
              resetFormFields();
            }}
            className={`hover:bg-opacity-10 rounded-full p-1 ${
              isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}>
            <XMarkIcon 
              className={`h-6 w-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`} />
          </button>
        </div>
        <FormUpdateUser userData={moderadorAEditar} />
      </div>
    </div>
  );

  return (
    <div className={`p-4 min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>

      <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Panel de administración
      </h2>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        {/* Campo de Búsqueda */}
        <div className="w-full sm:w-1/3 relative">
          <input
            type="text"
            value={busqueda}
            onChange={manejarCambioBusqueda}
            placeholder="Buscar moderador..."
            className={`w-full pr-10 p-2 border rounded-md focus:outline-none focus:ring-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-800'} focus:ring-blue-500`}
          />
          <MagnifyingGlassIcon className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md h-10 w-full sm:w-auto"
          onClick={() => setMostrarFormulario(true)}
        >
          <div className="flex items-center space-x-2">
            <UserPlusIcon className="w-5 h-5" />
            <span>Agregar nuevo moderador</span>
          </div>
        </button>
      </div>

      {/* Vista de Tabla para Pantallas Grandes */}
      <div className="overflow-x-auto hidden sm:block">
        <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <thead>
            <tr>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Nombre
              </th>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Email
              </th>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Estado
              </th>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Email verificado
              </th>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Modificar estado
              </th>
              <th className={`px-6 py-4 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td 
                  colSpan={6} 
                  className={`px-6 py-4 text-center 
                    ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                >
                  <Cargando />
                </td>
              </tr>
            ) : moderadoresAMostrar.length === 0 ? (
              <tr>
                <td 
                  colSpan={6} 
                  className={`px-6 py-4 text-center 
                    ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
                >
                  No se encontraron moderadores
                </td>
              </tr>
            ) : (moderadoresAMostrar.map((moderador) => (
              <tr
                key={moderador.id}
                className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{moderador.name}</td>
                <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{moderador.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${moderador.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {moderador.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${moderador.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {moderador.emailVerified ? "Verificado" : "No Verificado"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => manejarActivarDesactivarModerador(moderador.id, moderador.isActive)}
                    className={`px-4 py-1 text-sm font-semibold 
                    ${isDarkMode ? 'text-gray-300 bg-gray-700 border border-gray-500 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200'} rounded-md`}
                    style={{ minWidth: '100px' }}
                  >
                    {moderador.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
                <td className={`px-6 py-4 flex items-center space-x-2`}>
                  <button
                    onClick={() => confirmarEliminarModerador(moderador)}
                    className={`text-gray-500 hover:text-red-600 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                  >
                    <TrashIcon className={`w-5 h-5 ${
                      isDarkMode 
                        ? 'text-white group-hover:text-gray-200' 
                        : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => {
                      setModeradorAEditar(moderador);
                      setMostrarFormularioEditar(true);
                    }}
                    className={`text-gray-500 hover:text-blue-600 ${isDarkMode ? 'hover:text-blue-400' : ''}`}
                  >
                    <PencilIcon className={`w-5 h-5 ${
                      isDarkMode 
                        ? 'text-white group-hover:text-gray-200' 
                        : 'text-gray-500'}`} />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Pantallas Pequeñas */}
      <div className="block sm:hidden">
        {loading ? (
          <Cargando />
        ) : moderadoresAMostrar.length > 0 ? (
          moderadoresAMostrar.map((moderador) => (
            <div key={moderador.id} className={`border rounded-md p-4 mb-4 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{moderador.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => confirmarEliminarModerador(moderador)}
                    className={`text-gray-500 hover:text-red-600 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                  >
                    <TrashIcon className={`w-5 h-5 ${
                      isDarkMode 
                        ? 'text-white group-hover:text-gray-200' 
                        : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => {
                      setModeradorAEditar(moderador);
                      setMostrarFormularioEditar(true);
                    }}
                    className={`text-gray-500 hover:text-blue-600 ${isDarkMode ? 'hover:text-blue-400' : ''}`}
                  >
                    <PencilIcon className={`w-5 h-5 ${
                      isDarkMode 
                        ? 'text-white group-hover:text-gray-200' 
                        : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <p><strong>Email:</strong> {moderador.email}</p>
              <p>
                <strong>Estado:</strong> 
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${moderador.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {moderador.isActive ? "Activo" : "Inactivo"}
                </span>
              </p>
              <p>
                <strong>Email Verificado:</strong> 
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${moderador.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {moderador.emailVerified ? "Verificado" : "No Verificado"}
                </span>
              </p>
              <button
                onClick={() => manejarActivarDesactivarModerador(moderador.id, moderador.isActive)}
                className={`mt-2 w-full px-4 py-2 text-sm font-semibold 
                ${isDarkMode ? 'text-gray-300 bg-gray-700 border border-gray-500 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200'} rounded-md`}
              >
                {moderador.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))
        ) : (
          <div className={`text-center py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No se encontraron moderadores
          </div>
        )}
      </div>

      {/* Componente de Paginación */}
      <div className="flex justify-center mt-4">
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual}
        />
      </div>

      {/* Formularios y Modales */}
      {mostrarFormulario && formularioAgregarModerador}
      {mostrarFormularioEditar && formularioEditarModerador}
      {mostrarModalEliminar &&
        <ModalEliminarModerador
          isOpen={mostrarModalEliminar}
          onClose={() => setMostrarModalEliminar(false)}
          onDelete={manejarEliminarModerador}
          moderador={moderadorAEliminar}
        />
      }
    </div>
  );
}
