// ComentariosPendientes.js
import React, { useState } from 'react';

export default function ComentariosPendientes() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [comentariosFiltrados, setComentariosFiltrados] = useState([]);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);

  const comentarios = [
    { texto: 'No estoy de acuerdo.', sitio: 'example.com', fecha: '2024-09-23' },
    { texto: 'Me encanta esta publicación.', sitio: 'example2.com', fecha: '2024-09-22' },
    // Agrega más comentarios según sea necesario
  ];

  const filtrarComentarios = () => {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);

    const filtrados = comentarios.filter((comentario) => {
      const fechaComentario = new Date(comentario.fecha);
      return fechaComentario >= desde && fechaComentario <= hasta;
    });

    setComentariosFiltrados(filtrados);
  };

  return (
    <div className="p-8">
      {/* Título con mayor margen arriba y abajo, más grande y en negrita */}
      <h2 className="text-3xl font-bold my-8">Comentarios Pendientes</h2>

      {/* Contenedor para el selector de fechas y el botón de filtrar */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => setMostrarSelectorFecha(!mostrarSelectorFecha)}
          className="bg-white text-gray-800 border border-gray-300 py-1 px-2 rounded cursor-pointer"
        >
          Fecha
        </button>

        {mostrarSelectorFecha && (
          <div className="flex items-center space-x-2 ml-2">
            <label className="flex items-center">
              Desde:
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="border p-1 rounded ml-1 bg-white"
              />
            </label>
            <label className="flex items-center">
              Hasta:
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="border p-1 rounded ml-1 bg-white"
              />
            </label>
            <button
              onClick={filtrarComentarios}
              className="bg-white text-gray-800 border border-gray-300 py-1 px-4 rounded cursor-pointer"
            >
              Filtrar
            </button>
          </div>
        )}
      </div>

      {/* Tabla de comentarios con el formato solicitado */}
      <div className="mt-8 bg-white shadow-md p-6 rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">Comentario</th>
              <th className="p-2 text-left">Sitio Web</th>
              <th className="p-2 text-left">Fecha de Clasificación</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(comentariosFiltrados.length > 0 ? comentariosFiltrados : comentarios).map((comentario, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{comentario.texto}</td>
                <td className="p-2">{comentario.sitio}</td>
                <td className="p-2">{comentario.fecha}</td>
                <td className="p-2">
                  <button className="bg-white text-gray-800 border border-gray-300 py-1 px-4 rounded">
                    Clasificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
