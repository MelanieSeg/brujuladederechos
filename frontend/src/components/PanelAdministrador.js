import React, { useState, useEffect } from 'react';
import {//
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Paginacion from './Objects/Paginacion';
import api from '../services/axios';
import userApi from '../services/axiosUserInstance';
import FormCreateUser from './forms/Form-crear-usuario';
import FormUpdateUser from './forms/Form-update-usuario';
import { useNavigate } from 'react-router-dom';
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

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [estado, setEstado] = useState('Activo');
  const navigate = useNavigate()


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
        const response = await userApi.get("/")
        setModeradores(response.data)
      } catch (err) {
        console.log(`Error al obtener los usuarios`, err)
      }
    }
    fetchUsuarios()
  }, [])


  useEffect(() => {
    if (moderadorAEditar) {
      setNombre(moderadorAEditar.name);
      setEmail(moderadorAEditar.email);
      setEstado(moderadorAEditar.isActive);
      setContraseña('');
      setConfirmarContraseña('');
    }
  }, [moderadorAEditar]);


  console.log(moderadores)

  const cambiarStateUsuario = async function (userId, currentState) {
    //http://localhost:4000/user/deactivate-user
    try {

      const response = await userApi.patch("/deactivate-user", { id: userId, isActive: currentState })
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
    console.log("select")
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

    //   setModeradores([...moderadores, nuevoModerador]);
    setMostrarFormulario(false);
    resetFormFields();
  };

  // Función para manejar la edición del moderador
  const handleEditarModerador = (e) => {
    e.preventDefault();
    // Validaciones si es necesario
    setMostrarFormularioEditar(false);
    setModeradorAEditar(null);
    resetFormFields();
  };

  // Formulario para agregar un nuevo moderador
  const formularioAgregarModerador = (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-md overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Agregar nuevo moderador</h3>
          <button onClick={() => {
            setMostrarFormulario(false);
            resetFormFields();
          }}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <FormCreateUser />
      </div>
    </div>
  );

  // Formulario para editar un moderador existente
  const formularioEditarModerador = (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-md overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Editar moderador</h3>
          <button onClick={() => {
            setMostrarFormularioEditar(false);
            setModeradorAEditar(null);
            resetFormFields();
          }}>
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <FormUpdateUser userData={moderadorAEditar} />
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-[#F9F9F9] flex-1 relative">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Panel de administración
      </h2>

      <div className="mb-4 flex items-center justify-between">
        {/* Campo de Búsqueda */}
      <div className=" w-1/3 relative">
        <input
          type="text"
          value={busqueda}
          onChange={manejarCambioBusqueda}
          placeholder="Buscar moderador..."
          className="w-full pr-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>
        <button
          onClick={() => {
            resetFormFields();
            setMostrarFormulario(true);
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" /> Agregar nuevo moderador
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
                Email verificado
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Modificar estado
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {moderadoresAMostrar.map((moderador) => (
              <tr
                key={moderador.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-gray-700">{moderador.name}</td>
                <td className="px-6 py-4 text-gray-700">{moderador.email}</td>
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
                    className="px-4 py-1 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    style={{ minWidth: '100px' }}
                  >
                    {moderador.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
                <td className="px-6 py-4 flex items-center space-x-2">
                  <button
                    onClick={() => confirmarEliminarModerador(moderador)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setModeradorAEditar(moderador);
                      setMostrarFormularioEditar(true);
                    }}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Componente de Paginación */}
      <div className="mt-6">
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual}
        />
      </div>

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
