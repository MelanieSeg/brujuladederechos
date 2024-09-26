import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/20/solid';

export default function ComentariosPendientes() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [comentariosFiltrados, setComentariosFiltrados] = useState([]);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [isCalendarOpenDesde, setIsCalendarOpenDesde] = useState(false);
  const [isCalendarOpenHasta, setIsCalendarOpenHasta] = useState(false);
  const [selectedDateDesde, setSelectedDateDesde] = useState('');
  const [selectedDateHasta, setSelectedDateHasta] = useState('');
  const calendarDesdeRef = useRef(null);
  const calendarHastaRef = useRef(null);

  const comentarios = [
    { texto: 'No estoy de acuerdo.', sitio: 'example.com', fecha: '2024-09-23' },
    { texto: 'Me encanta esta publicación.', sitio: 'example2.com', fecha: '2024-09-22' },
    { texto: 'Buen trabajo, seguir así.', sitio: 'example3.com', fecha: '2024-09-21' },
    { texto: 'Esto no es útil.', sitio: 'example4.com', fecha: '2024-09-20' },
    { texto: '¡Fantástico!', sitio: 'example5.com', fecha: '2024-09-19' },
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

  const eliminarFiltro = () => {
    setFechaDesde('');
    setFechaHasta('');
    setSelectedDateDesde('');
    setSelectedDateHasta('');
    setComentariosFiltrados([]); // Restablecer a todos los comentarios
  };

  const toggleCalendarDesde = () => {
    setIsCalendarOpenDesde(!isCalendarOpenDesde);
  };

  const toggleCalendarHasta = () => {
    setIsCalendarOpenHasta(!isCalendarOpenHasta);
  };

  const handleDateClickDesde = (day) => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Mes actual con ceros a la izquierda
    const year = today.getFullYear();
    setSelectedDateDesde(`${day}/${month}/${year}`); // Formato: día/mes/año
    setFechaDesde(`${year}-${month}-${day}`); // Para la comparación
    setIsCalendarOpenDesde(false);
  };

  const handleDateClickHasta = (day) => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Mes actual con ceros a la izquierda
    const year = today.getFullYear();
    setSelectedDateHasta(`${day}/${month}/${year}`); // Formato: día/mes/año
    setFechaHasta(`${year}-${month}-${day}`); // Para la comparación
    setIsCalendarOpenHasta(false);
  };

  const renderCalendar = (isDesde) => {
    const days = [];
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let i = 1; i <= monthEnd.getDate(); i++) {
      days.push(i);
    }

    return (
      <div className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 w-64">
        <div className="text-center font-bold mb-2">{today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}</div>
        <div className="grid grid-cols-7 gap-2">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day, index) => (
            <div key={index} className="text-gray-500 text-sm">{day}</div>
          ))}
          {days.map((day) => (
            <button
              key={day}
              onClick={isDesde ? () => handleDateClickDesde(day) : () => handleDateClickHasta(day)}
              className={`w-full p-2 rounded-full hover:bg-gray-200 text-gray-800`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isCalendarOpenDesde &&
        calendarDesdeRef.current &&
        !calendarDesdeRef.current.contains(event.target)
      ) {
        setIsCalendarOpenDesde(false);
      }
      if (
        isCalendarOpenHasta &&
        calendarHastaRef.current &&
        !calendarHastaRef.current.contains(event.target)
      ) {
        setIsCalendarOpenHasta(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpenDesde, isCalendarOpenHasta]);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold my-8">Comentarios Pendientes</h2>

      <div className="relative inline-block text-left mb-4">
        <div>
          <button
            onClick={() => setMostrarSelectorFecha(!mostrarSelectorFecha)}
            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
          >
              <PlusIcon className="w-5 h-5 text-gray-500" />
            Fecha
          </button>
        </div>

        {mostrarSelectorFecha && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10"> {/* Cambié right-0 por left-0 */}
            <div className="rounded-md bg-white shadow-xs">
              <div className="py-1">
                <button
                  onClick={toggleCalendarDesde}
                  className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                >
                  Desde {selectedDateDesde && `(${selectedDateDesde})`}
                </button>
                {isCalendarOpenDesde && (
                  <div ref={calendarDesdeRef}>{renderCalendar(true)}</div>
                )}
                <button
                  onClick={toggleCalendarHasta}
                  className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                >
                  Hasta {selectedDateHasta && `(${selectedDateHasta})`}
                </button>
                {isCalendarOpenHasta && (
                  <div ref={calendarHastaRef}>{renderCalendar(false)}</div>
                )}
                <button
                  onClick={filtrarComentarios}
                  className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                >
                  Filtrar
                </button>
                <button
                  onClick={eliminarFiltro}
                  className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                >
                  Eliminar Filtro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
