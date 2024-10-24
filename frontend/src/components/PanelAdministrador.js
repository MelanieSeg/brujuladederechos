// components/PanelAdministrador.js
import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Paginacion from './Objects/Paginacion';
import Cargando from './Objects/Cargando';

export default function PanelAdministrador() {
  // Datos temporales de moderadores
  const datosTemporalesModeradores = [
    { id: 1, nombre: 'John Doe', email: 'john@example.com', estado: 'Activo' },
    { id: 2, nombre: 'Claudia Ramírez', email: 'claudia@example.com', estado: 'Inactivo' },
    { id: 3, nombre: 'Jane Smith', email: 'jane@example.com', estado: 'Inactivo' },
    { id: 4, nombre: 'Alice Johnson', email: 'alice@example.com', estado: 'Inactivo' },
    { id: 5, nombre: 'Cesar Vásquez', email: 'cesar.vasquez@example.com', estado: 'Activo' },
    { id: 6, nombre: 'Camila Díaz', email: 'camila.diaz@example.com', estado: 'Activo' },
    { id: 7, nombre: 'Carolina Blanco', email: 'carolina.blanco@example.com', estado: 'Activo' },
    { id: 8, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
    { id: 9, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
    { id: 10, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
    { id: 11, nombre: 'John Doe', email: 'john@example.com', estado: 'Activo' },
    { id: 12, nombre: 'Claudia Ramírez', email: 'claudia@example.com', estado: 'Inactivo' },
    { id: 13, nombre: 'Jane Smith', email: 'jane@example.com', estado: 'Inactivo' },
    { id: 14, nombre: 'Alice Johnson', email: 'alice@example.com', estado: 'Inactivo' },
    { id: 15, nombre: 'Cesar Vásquez', email: 'cesar.vasquez@example.com', estado: 'Activo' },
    { id: 16, nombre: 'Camila Díaz', email: 'camila.diaz@example.com', estado: 'Activo' },
    { id: 17, nombre: 'Carolina Blanco', email: 'carolina.blanco@example.com', estado: 'Activo' },
    { id: 18, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
    { id: 19, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
    { id: 20, nombre: 'Usuario', email: 'usuario.apellido@example.com', estado: 'Activo' },
  ];
  const [loading, setLoading] = useState(true);
  const [moderadores, setModeradores] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [moderadorAEliminar, setModeradorAEliminar] = useState(null);
  const [moderadorAEditar, setModeradorAEditar] = useState(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [estado, setEstado] = useState('Activo');

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
    if (moderadorAEditar) {
      setNombre(moderadorAEditar.nombre);
      setEmail(moderadorAEditar.email);
      setEstado(moderadorAEditar.estado);
      setContraseña('');
      setConfirmarContraseña('');
    }
  }, [moderadorAEditar]);

  useEffect(() => {
    // Simula una carga de datos de 2 segundos
    const timer = setTimeout(() => {
      setModeradores(datosTemporalesModeradores);
      setLoading(false);
    }, 2000);

    // Limpia el timeout si el componente se desmonta
    return () => clearTimeout(timer);
  }, []);

  // Función para activar o desactivar un moderador
  const manejarActivarDesactivarModerador = (id, nuevoEstado) => {
    setModeradores(
      moderadores.map((mod) =>
        mod.id === id ? { ...mod, estado: nuevoEstado } : mod
      )
    );
  };

  
  // Función para confirmar la eliminación de un moderador
  const confirmarEliminarModerador = (id) => {
    setModeradorAEliminar(id);
    setMostrarModalEliminar(true);
  };

  // Función para eliminar un moderador
  const manejarEliminarModerador = () => {
    setModeradores(moderadores.filter((mod) => mod.id !== moderadorAEliminar));
    setMostrarModalEliminar(false);
    setModeradorAEliminar(null);
  };

  // Función para manejar la búsqueda
  const manejarCambioBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1); // Reiniciar a la primera página cuando se hace una búsqueda
  };

  // Filtrar moderadores según la búsqueda
  const moderadoresFiltrados = moderadores.filter((moderador) =>
    moderador.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    moderador.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculo de índices para la paginación
  const indiceUltimoModerador = paginaActual * moderadoresPorPagina;
  const indicePrimerModerador = indiceUltimoModerador - moderadoresPorPagina;
  const moderadoresAMostrar = moderadoresFiltrados.slice(
    indicePrimerModerador,
    indiceUltimoModerador
  );

  const totalPaginas = Math.ceil(
    moderadoresFiltrados.length / moderadoresPorPagina
  );

  // Función para agregar un nuevo moderador
  const handleAgregarModerador = (e) => {
    e.preventDefault();
    // Validaciones si es necesario
    const newId = moderadores.length
      ? Math.max(...moderadores.map((m) => m.id)) + 1
      : 1;
    const nuevoModerador = {
      id: newId,
      nombre,
      email,
      estado,
    };

    setModeradores([...moderadores, nuevoModerador]);
    setMostrarFormulario(false);
    resetFormFields();
  };

  // Función para manejar la edición del moderador
  const handleEditarModerador = (e) => {
    e.preventDefault();
    // Validaciones si es necesario
    setModeradores(
      moderadores.map((mod) =>
        mod.id === moderadorAEditar.id
          ? { ...mod, nombre, email, estado }
          : mod
      )
    );
    setMostrarFormularioEditar(false);
    setModeradorAEditar(null);
    resetFormFields();
  };

  // Formulario para agregar un nuevo moderador
  const formularioAgregarModerador = (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-md overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Agregar nuevo moderador</h3>
          <button
            onClick={() => {
              setMostrarFormulario(false);
              resetFormFields();
            }}
          >
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <form onSubmit={handleAgregarModerador}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del moderador"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email del moderador"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="**********"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Confirmar Contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              placeholder="**********"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Estado */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Estado del moderador
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(false);
                resetFormFields();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Completar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Formulario para editar un moderador existente
  const formularioEditarModerador = (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-md overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Editar moderador</h3>
          <button
            onClick={() => {
              setMostrarFormularioEditar(false);
              setModeradorAEditar(null);
              resetFormFields();
            }}
          >
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <form onSubmit={handleEditarModerador}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del moderador"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email del moderador"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Estado */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Estado del moderador
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                setMostrarFormularioEditar(false);
                setModeradorAEditar(null);
                resetFormFields();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal para confirmar la eliminación de un moderador
  const modalEliminarModerador = (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">¿Está seguro?</h3>
        <p className="text-sm text-gray-900 mb-4">
          Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del moderador y eliminará sus datos de nuestros servidores.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            ¿Por qué desea eliminar a este usuario? (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ingrese su justificación"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Confirme su contraseña
          </label>
          <input
            type="password"
            placeholder="********"
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => setMostrarModalEliminar(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={manejarEliminarModerador}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Panel de administración
      </h2>

      {/* Barra de Navegación Integrada */}
      <div className="mb-6 flex items-center justify-between">
        {/* Contenedor de búsqueda */}
        <div className="relative flex-grow mr-4" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            value={busqueda}
            onChange={manejarCambioBusqueda}
            placeholder="Buscar moderador..."
            className="w-full pr-10 p-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>

        {/* Botón "Agregar Nuevo Moderador" */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md h-10"
          onClick={() => setMostrarFormulario(true)}
        >
          Agregar Nuevo Moderador
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-sm rounded-md">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Nombre
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Email
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Estado
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <Cargando />
                </td>
              </tr>
            ) : moderadoresAMostrar.length > 0 ? (
              moderadoresAMostrar.map((moderador) => (
                <tr
                  key={moderador.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-gray-700">{moderador.nombre}</td>
                  <td className="px-6 py-4 text-gray-700">{moderador.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        moderador.estado === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {moderador.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* Contenedor de los botones de acción */}
                    <div className="flex items-center justify-between">
                      {/* Botón Activar/Desactivar */}
                      <div>
                        <button
                          onClick={() =>
                            manejarActivarDesactivarModerador(
                              moderador.id,
                              moderador.estado === 'Activo' ? 'Inactivo' : 'Activo'
                            )
                          }
                          className="px-4 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                          style={{ minWidth: '100px' }}
                        >
                          {moderador.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                      {/* Íconos de editar y eliminar */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => confirmarEliminarModerador(moderador.id)}
                          className="text-gray-500 hover:text-red-600"
                          aria-label="Eliminar moderador"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setModeradorAEditar(moderador);
                            setMostrarFormularioEditar(true);
                          }}
                          className="text-gray-500 hover:text-blue-600"
                          aria-label="Editar moderador"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No hay moderadores para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Componente de Paginación */}
      <div className="mt-4">
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual}
        />
      </div>

      {/* Formularios y Modales */}
      {mostrarFormulario && formularioAgregarModerador}
      {mostrarFormularioEditar && formularioEditarModerador}
      {mostrarModalEliminar && modalEliminarModerador}
    </div>
  );
}
