import React, { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import Paginacion from './Objects/Paginacion'; // Importa el componente de paginación

const changes = [
  {
    id: 1,
    comment: 'No me gustó mucho',
    website: 'latercera.com',
    date: '04-10-2024',
    reason: ['Revisión manual', 'Actualización'],
    column: 'Text',
    user: 'John Doe'
  },
  {
    id: 2,
    comment: 'Podría ser mejor.',
    website: 'latercera.com',
    date: '04-10-2024',
    reason: ['Revisión manual', 'Error'],
    column: 'Text',
    user: 'John Doe'
  },
  {
    id: 3,
    comment: 'No estoy satisfecho',
    website: 'latercera.com',
    date: '04-10-2024',
    reason: ['Revisión manual'],
    column: 'Text',
    user: 'John Doe'
  },
  {
    id: 4,
    comment: 'Hay muchos errores aquí',
    website: 'quora.com',
    date: '05-10-2024',
    reason: ['Error'],
    column: 'Text',
    user: 'John Doe'
  },
  {
    id: 5,
    comment: 'No es lo que esperaba',
    website: 'quora.com',
    date: '04-09-2024',
    reason: ['Revisión manual', 'Error', 'Actualización'],
    column: 'Text',
    user: 'John Doe'
  },
];

// Función para determinar el color de las etiquetas
const ReasonBadge = ({ reason }) => {
  const getColor = (reason) => {
    switch (reason) {
      case 'Revisión manual':
        return 'bg-purple-100 text-purple-800'; // Color morado del mockup
      case 'Error':
        return 'bg-red-100 text-red-800'; // Color rojo del mockup
      case 'Actualización':
        return 'bg-blue-100 text-blue-800'; // Color azul del mockup
      default:
        return 'bg-gray-100 text-gray-800'; // Color por defecto (gris)
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColor(reason)}`}>
      {reason}
    </span>
  );
};

export default function HistorialDeCambios() {
  const [paginaActual, setPaginaActual] = useState(1);
  const [changesPerPage] = useState(10); // Para paginación
  const [selectedChange, setSelectedChange] = useState(null); // Para mostrar detalles en barra lateral

  // Paginación: Calcular los cambios a mostrar en la página actual
  const indiceUltimoCambio = paginaActual * changesPerPage;
  const indicePrimerCambio = indiceUltimoCambio - changesPerPage;
  const cambiosAMostrar = changes.slice(indicePrimerCambio, indiceUltimoCambio);

  const totalPaginas = Math.ceil(changes.length / changesPerPage);

  const handleVerDetalles = (cambio) => {
    setSelectedChange(cambio); // Mostrar el detalle en la barra lateral
  };

  const handleCerrarDetalles = () => {
    setSelectedChange(null);
  };

  return (
    <div className="p-8 flex flex-col">
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Historial de cambios</h2>

        {/* Contenedor de tabla */}
        <div className="mt-8 bg-white shadow-md rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Comentario</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Sitio web</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Fecha de modificación</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Motivo de modificación</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Usuario</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Detalles</th> {/* Columna para los tres puntos */}
              </tr>
            </thead>
            <tbody className="space-y-4">
              {cambiosAMostrar.map((change) => (
                <tr key={change.id} className="border-b space-y-4">
                  <td className="px-6 py-4">{change.comment}</td>
                  <td className="px-6 py-4">{change.website}</td>
                  <td className="px-6 py-4">{change.date}</td>
                  <td className="px-6 py-4">
                    {change.reason.map((r) => (
                      <ReasonBadge key={r} reason={r} />
                    ))}
                  </td>
                  <td className="px-6 py-4">{change.user}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleVerDetalles(change)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación utilizando el componente */}
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={setPaginaActual} // Actualiza la página actual
        />
      </div>

      {/* Barra lateral para mostrar detalles */}
      {selectedChange && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full">
          {/* Barra lateral fija a la derecha */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white shadow-lg p-6">
            {/* Botón de cierre (solo la X) */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900">Detalle de modificación</h3>
              <button onClick={handleCerrarDetalles} className="text-gray-500 hover:text-gray-700 text-lg">
                &#10005; {/* Este es el símbolo de la X */}
              </button>
            </div>

            {/* Contenido */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700">Comentario:</p>
              <p className="text-base text-gray-900 mt-1">{selectedChange.comment}</p>

              <p className="text-sm font-semibold text-gray-700 mt-6">Detalles:</p>
              <textarea
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                rows="3"
                disabled
                value="El valor fue modificado debido a la detección de un error en el registro clasificación automática."
              />

              <p className="text-sm font-semibold text-gray-700 mt-6">Modificación realizada por:</p>
              <input
                type="text"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                disabled
                value={selectedChange.user}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
