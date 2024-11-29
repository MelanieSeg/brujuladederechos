import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import Paginacion from './Objects/Paginacion';
import { ThemeContext } from '../utils/ThemeContext';
import api from '../services/axios';
import Cargando from './Objects/Cargando';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Mapeo de tipos de acción a textos más amigables
const TIPO_ACCION_MAP = {
  DESCARGAR_COMENTARIOS: 'Descarga de comentarios',
  CLASIFICAR_MANUALMENTE: 'Clasificación manual',
  EDITAR_COMENTARIO_CLASIFICADO: 'Edición de comentario',
  ELIMINAR_COMENTARIO_CLASIFICADO: 'Eliminación de comentario clasificado',
  ELIMINAR_COMENTARIO_RECOLECTADO: 'Eliminación de comentario recolectado',
  CREAR_USUARIO: 'Creación de usuario',
  DESACTIVAR_USUARIO: 'Desactivación de usuario',
};

// Mapeo de motivos a textos más amigables
const MOTIVO_ACCION_MAP = {
  REVISION: 'Revisión',
  SE_ENCONTRO_UN_ERROR: 'Error encontrado',
  CLASIFICACION_PREVIA_INCORRECTA: 'Clasificación incorrecta',
  RECLASIFICACION: 'Reclasificación',
  OTRO: 'Otro motivo'
};

const ReasonBadge = ({ reason }) => {
  const getColor = (reason) => {
    switch (reason) {
      case MOTIVO_ACCION_MAP.REVISION:
        return 'bg-purple-100 text-purple-800';
      case MOTIVO_ACCION_MAP.SE_ENCONTRO_UN_ERROR:
        return 'bg-red-100 text-red-800';
      case MOTIVO_ACCION_MAP.CLASIFICACION_PREVIA_INCORRECTA:
        return 'bg-yellow-100 text-yellow-800';
      case MOTIVO_ACCION_MAP.RECLASIFICACION:
        return 'bg-blue-100 text-blue-800';
      case MOTIVO_ACCION_MAP.OTRO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColor(reason)} mr-1 mb-1 text-center`}
      style={{ display: 'inline-block', textAlign: 'center', minWidth: '60px' }}>
      {reason}
    </span>
  );
};

export default function HistorialDeCambios() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState(null);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [comentariosPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCambios, setTotalCambios] = useState(0);

  const { isDarkMode } = useContext(ThemeContext);
  const socket = useSocket();

  const indiceUltimoComentario = paginaActual * comentariosPorPagina;
  const indicePrimerComentario = indiceUltimoComentario - comentariosPorPagina;

  const changesAMostrar = changes.slice(
    indicePrimerComentario, 
    indiceUltimoComentario
  );

  const transformCambio = (nuevoCambio) => ({
    id: nuevoCambio.id,
    date: format(new Date(nuevoCambio.fecha), 'dd/MM/yyyy HH:mm'),
    user: nuevoCambio.usuario
      ? `${nuevoCambio.usuario.name} (${nuevoCambio.usuario.rol})`
      : 'Usuario no disponible',
    actionType: TIPO_ACCION_MAP[nuevoCambio.tipoAccion] || nuevoCambio.tipoAccion,
    reason: nuevoCambio.motivoAccion ? [MOTIVO_ACCION_MAP[nuevoCambio.motivoAccion]] : [],
    entity: nuevoCambio.entidad,
    entityId: nuevoCambio.entidadId,
    details: nuevoCambio.detalles,
    createdAt: format(new Date(nuevoCambio.createdAt), 'dd/MM/yyyy HH:mm'),
    comment: TIPO_ACCION_MAP[nuevoCambio.tipoAccion] || nuevoCambio.tipoAccion,
    website: nuevoCambio.entidadId || 'N/A',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auditoria/get-data', {
          params: { 
            page: paginaActual, 
            limit: comentariosPorPagina
          }
        });
  
        // Depuración para ver la estructura exacta de la respuesta
        console.log('Respuesta completa:', response);
        console.log('response.data:', response.data);
  
        // Determinar los datos de cambios
        const changesData = response.data.data || 
                             response.data.changes || 
                             response.data || 
                             [];
  
        // Determinar el total de cambios
        const total = response.data.total || 
                      response.data.count || 
                      changesData.length || 
                      0;
  
        // Transformar los cambios
        const transformedChanges = Array.isArray(changesData) 
          ? changesData.map(transformCambio) 
          : [];
  
        setChanges(transformedChanges);
        setTotalCambios(total);
        setTotalPaginas(Math.ceil(total / comentariosPorPagina));
        setError(null);
      } catch (error) {
        console.error('Error completo:', error);
        console.error('Respuesta del error:', error.response);
        setError('No se pudieron cargar los registros de cambios');
        toast.error('No se pudieron cargar los cambios');
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData();
  }, [paginaActual, comentariosPorPagina]);
  useEffect(() => {
    if (!socket) return;

    const handleNuevoCambio = (nuevoCambio) => {
      const transformedCambio = transformCambio(nuevoCambio);
      setChanges(prevChanges => [transformedCambio, ...prevChanges]);
      toast.info(`Nuevo cambio: ${transformedCambio.actionType}`);
    };

    socket.on('actualizacionCambios', handleNuevoCambio);
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Error de conexión en tiempo real');
    });

    return () => {
      socket.off('actualizacionCambios', handleNuevoCambio);
      socket.off('connect_error');
    };
  }, [socket]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPaginas) {
      setPaginaActual(newPage);
    }
  };

  const handleVerDetalles = (cambio) => {
    setSelectedChange(cambio);
  };

  const handleCerrarDetalles = () => {
    setSelectedChange(null);
  };

  if (error) {
    return (
      <div className={`p-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {error}
      </div>
    );
  }


  return (
    <div className={`p-4 sm:p-8 min-h-screen ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Historial de cambios
      </h2>

      {/* Vista de Tabla para Pantallas Grandes */}
      <div className="hidden sm:block">
        <div className={`mt-8 ${isDarkMode ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-md'} rounded-lg overflow-x-auto`}>
          <table className="min-w-full">
            <thead>
              <tr>
                {['Acción realizada', 'Fecha de modificación', 'Motivo de modificación', 'Usuario', 'Detalles'].map(
                  (header) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-left font-medium border-b max-w-xs ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="space-y-4">
              {loading ? (
                <tr>
                  <td 
                    colSpan={5} 
                    className={`px-6 py-4 text-center 
                      ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                  >
                    <div className="flex justify-center">
                      <Cargando />
                    </div>
                  </td>
                </tr>
              ) : changesAMostrar.length === 0 ? (
                <tr>
                  <td 
                    colSpan={5} 
                    className={`px-6 py-4 text-center 
                      ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
                  >
                    No hay cambios disponibles
                  </td>
                </tr>
              ) : (
                changesAMostrar.map((change) => (
                  <tr key={change.id} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 max-w-xs break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {change.comment}
                    </td>
                    <td className={`px-6 py-4 max-w-xs break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {change.date}
                    </td>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {change.reason.map((r) => (
                        <ReasonBadge key={r} reason={r} />
                      ))}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{change.user}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleVerDetalles(change)}
                        className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Vista de Tarjetas para Pantallas Pequeñas */}
      <div className="block sm:hidden space-y-4">
        {changesAMostrar.map((change) => (
          <div
            key={change.id}
            className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
              } shadow-md`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <p className="font-medium">{change.comment}</p>
                <p className="text-sm">{change.website}</p>
              </div>
              <button
                onClick={() => handleVerDetalles(change)}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium mb-1">Fecha de modificación:</p>
                <p className="text-sm">{change.date}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Motivo de modificación:</p>
                <div className="flex flex-wrap">
                  {change.reason.map((r) => (
                    <ReasonBadge key={r} reason={r} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Usuario:</p>
                <p className="text-sm">{change.user}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-4">
      <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual}
        />
      </div>

      {/* Panel lateral de detalles */}
      {selectedChange && (
        <div
          className={`fixed inset-0 ${isDarkMode ? 'bg-black' : 'bg-gray-600'} bg-opacity-50 z-30`}
          onClick={handleCerrarDetalles}
        >
          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-1/3 
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
            shadow-lg p-6`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalle de modificación
              </h3>
              <button
                onClick={handleCerrarDetalles}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-lg`}
              >
                &#10005;
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Acción realizada:
                </p>
                <p className={`text-base mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedChange.comment}
                </p>
              </div>

              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Detalles:
                </p>
                <textarea
                  className={`w-full mt-1 p-2 border rounded-md 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                  rows="3"
                  disabled
                  value={selectedChange.details || "No hay detalles disponibles"}
                />
              </div>

              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Modificación realizada por:
                </p>
                <input
                  type="text"
                  className={`w-full mt-1 p-2 border rounded-md 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                  disabled
                  value={selectedChange.user}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}