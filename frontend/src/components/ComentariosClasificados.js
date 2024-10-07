// components/ComentariosClasificados.js
import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Calendario from './Objects/Calendario';
import Paginacion from './Objects/Paginacion';

export default function ComentariosClasificados() {
  const [comentarios] = useState([
    { comentario: 'No me gustó mucho', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'La interfaz es confusa.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 14, 2024', t: 2, ePrivacidad: 1, pi: 2, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'No me gustó mucho', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Podría ser mejor.', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'No estoy satisfecho', gravedad: 'Alta', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Hay muchos errores aquí', gravedad: 'Moderada', sitio: 'quora.com', fecha: 'Jul 4, 2024', t: 3, ePrivacidad: 1, pi: 0, pf: 3, oi: -0.75, eLibertad: 0 },
    { comentario: 'No es lo que esperaba', gravedad: 'Alta', sitio: 'quora.com', fecha: 'Jul 4, 2024', t: 1, ePrivacidad: 1, pi: 0, pf: 3, oi: 0, eLibertad: 1 },
    { comentario: 'Esto es completamente inútil.', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Terrible experiencia, no lo recomiendo.', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Decepcionante, muy mal hecho.', gravedad: 'Alta', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Es lo peor que he leído.', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Inaceptable, una total pérdida de tiempo.', gravedad: 'Moderada', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Excelente servicio.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 5, 2024', t: 1, ePrivacidad: 1, pi: 2, pf: 3, oi: 0.5, eLibertad: 1 },
    { comentario: 'Muy útil y fácil de usar.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 6, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Buena calidad.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 7, 2024', t: 2, ePrivacidad: 1, pi: 2, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'No cumple con las expectativas.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 8, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Servicio al cliente deficiente.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 9, 2024', t: 3, ePrivacidad: 1, pi: 0, pf: 3, oi: -0.5, eLibertad: 0 },
    { comentario: 'Producto llegó dañado.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 10, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Tiempo de entrega rápido.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 11, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'El producto no coincide con la descripción.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 12, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Muy satisfecho con la compra.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 13, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'La interfaz es confusa.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 14, 2024', t: 2, ePrivacidad: 1, pi: 2, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Excelente relación calidad-precio.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 15, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Excelente servicio.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 5, 2024', t: 1, ePrivacidad: 1, pi: 2, pf: 3, oi: 0.5, eLibertad: 1 },
    { comentario: 'Muy útil y fácil de usar.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 6, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Buena calidad.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 7, 2024', t: 2, ePrivacidad: 1, pi: 2, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'No cumple con las expectativas.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 8, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Servicio al cliente deficiente.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 9, 2024', t: 3, ePrivacidad: 1, pi: 0, pf: 3, oi: -0.5, eLibertad: 0 },
    { comentario: 'Producto llegó dañado.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 10, 2024', t: 2, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'Tiempo de entrega rápido.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 11, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'El producto no coincide con la descripción.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 12, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'Muy satisfecho con la compra.', gravedad: 'Baja', sitio: 'ejemplo.com', fecha: 'Jul 13, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
    { comentario: 'La interfaz es confusa.', gravedad: 'Moderada', sitio: 'ejemplo.com', fecha: 'Jul 14, 2024', t: 2, ePrivacidad: 1, pi: 2, pf: 2, oi: 0, eLibertad: 1 },
    { comentario: 'No me gustó mucho', gravedad: 'Baja', sitio: 'latercera.com', fecha: 'Jul 4, 2024', t: 0, ePrivacidad: 1, pi: 1, pf: 1, oi: 0, eLibertad: 1 },
  ]);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedGravedad, setSelectedGravedad] = useState({
    Baja: true,
    Moderada: true,
    Alta: true,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [showDetailedColumns, setShowDetailedColumns] = useState(false);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const commentsPerPage = 10;

  const calendarRef = useRef(null);
  const calendarButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const gravedadButtonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isCalendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }

      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        gravedadButtonRef.current &&
        !gravedadButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen, isDropdownOpen]);


  const handleGravedadClick = () => {
    setShowDetailedColumns(!showDetailedColumns);
    setDropdownOpen(!isDropdownOpen);
  };

  const handleGravedadChange = (gravedad) => {
    setSelectedGravedad((prevState) => ({
      ...prevState,
      [gravedad]: !prevState[gravedad],
    }));
    setPaginaActual(1);
  };

  const limpiarSeleccion = () => {
    setSelectedGravedad({
      Baja: false,
      Moderada: false,
      Alta: false,
    });
    setPaginaActual(1);
  };

  const getBadgeColor = (gravedad) => {
    switch (gravedad) {
      case 'Alta':
        return 'bg-red-500 text-white';
      case 'Moderada':
        return 'bg-yellow-400 text-white';
      case 'Baja':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
    setPaginaActual(1);
  };

  const renderCalendar = () => {
    return (
      <div ref={calendarRef} className="absolute">
        <Calendario onDateSelect={handleDateSelect} />
      </div>
    );
  };
  

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
      >
        <div className="py-1">
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Baja}
                onChange={() => handleGravedadChange('Baja')}
                className="form-checkbox text-green-500"
              />
              <span className="flex items-center">
                <span className="mr-2">↓</span>
                <span className="text-gray-700">Baja</span>
              </span>
              <span className="ml-auto text-gray-500">36</span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Moderada}
                onChange={() => handleGravedadChange('Moderada')}
                className="form-checkbox text-yellow-500"
              />
              <span className="flex items-center">
                <span className="mr-2">→</span>
                <span className="text-gray-700">Moderada</span>
              </span>
              <span className="ml-auto text-gray-500">33</span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Alta}
                onChange={() => handleGravedadChange('Alta')}
                className="form-checkbox text-red-500"
              />
              <span className="flex items-center">
                <span className="mr-2">↑</span>
                <span className="text-gray-700">Alta</span>
              </span>
              <span className="ml-auto text-gray-500">31</span>
            </label>
          </div>
          <div className="border-t border-gray-200">
            <button
              onClick={limpiarSeleccion}
              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredComentarios = comentarios.filter((comentario) => {
    const gravedadMatch = selectedGravedad[comentario.gravedad];

    let dateMatch = true;
    if (selectedDate) {
      const comentarioDate = new Date(comentario.fecha);
      comentarioDate.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      dateMatch = comentarioDate.getTime() >= selectedDateOnly.getTime();
    }

    return gravedadMatch && dateMatch;
  });

  const totalPaginas = Math.ceil(filteredComentarios.length / commentsPerPage);

  const indexOfLastComment = paginaActual * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComentarios = filteredComentarios.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const handlePageChange = (pageNumber) => {
    setPaginaActual(pageNumber);
  };

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert('Por favor, seleccione ambas fechas para descargar el reporte.');
      return;
    }

    if (startDate > endDate) {
      alert('La fecha de inicio debe ser anterior o igual a la fecha de fin.');
      return;
    }

    const commentsToDownload = comentarios.filter((comentario) => {
      const comentarioDate = new Date(comentario.fecha);
      comentarioDate.setHours(0, 0, 0, 0);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      return (
        comentarioDate.getTime() >= start.getTime() &&
        comentarioDate.getTime() <= end.getTime()
      );
    });

    if (commentsToDownload.length === 0) {
      alert('No hay comentarios en el rango de fechas seleccionado.');
      return;
    }

    const headers = ['Comentario', 'Gravedad', 'Sitio web', 'Fecha de clasificación'];
    const rows = commentsToDownload.map((comment) => [
      `"${comment.comentario.replace(/"/g, '""')}"`,
      comment.gravedad,
      comment.sitio,
      comment.fecha,
    ]);

    let csvContent =
      headers.join(',') + '\n' + rows.map((e) => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute('download', 'reporte_comentarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Comentarios clasificados
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 md:flex-row flex-col">
          {/* Botón para el calendario */}
        <button
          ref={calendarButtonRef}
          onClick={toggleCalendar}
          className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm md:my-4 my-2 relative"
        >
          <PlusIcon className="w-5 h-5 text-gray-500" />
          <span>
            {selectedDate ? (
              <span>
                Fecha: <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                  {format(new Date(selectedDate), 'dd/MM/yyyy')}
                </span>
              </span>
            ) : (
              'Fecha'
            )}
          </span>
          {isCalendarOpen && (
            <div
              ref={calendarRef}
              className="absolute top-full left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <Calendario onDateSelect={handleDateSelect} />
            </div>
          )}
        </button>


          {/* Botón de Gravedad con Dropdown y funcionalidad de mostrar columnas detalladas */}
          <div className="relative">
            <button
              ref={gravedadButtonRef}
              onClick={handleGravedadClick}
              className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm md:my-4 my-2"
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span>Gravedad</span>
            </button>
            {isDropdownOpen && renderDropdown()}
          </div>
          
          <button
          className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm md:my-4 my-2"
          onClick={() => {
            setSelectedDate(null);
            setSelectedGravedad({
              Baja: true,
              Moderada: true,
              Alta: true,
            });
          }}
        >
          Quitar filtros
          <XMarkIcon className="w-5 h-5 stroke-2 text-gray-500 mx-1" />
        </button>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="date"
            className="border border-gray-300 rounded px-4 py-2 bg-white"
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setStartDate(date);
            }}
          />
          <span>-</span>
          <input
            type="date"
            className="border border-gray-300 rounded px-4 py-2 bg-white"
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setEndDate(date);
            }}
          />
          <button
            className="bg-black text-white px-4 py-2 rounded-md"
            onClick={handleDownload}
          >
            Descargar
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left font-medium text-gray-500">
              Comentario
            </th>
            {/* Renderizar las columnas adicionales si showDetailedColumns es true */}
            {showDetailedColumns && (
              <>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  T
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  E.Privacidad
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  PI
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  PF
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  OI
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  E.Libertad
                </th>
              </>
            )}
            <th className="px-6 py-4 text-left font-medium text-gray-500">
              Gravedad
            </th>
            <th className="px-6 py-4 text-left font-medium text-gray-500">
              Sitio web
            </th>
            <th className="px-6 py-4 text-left font-medium text-gray-500">
              Fecha de clasificación
            </th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {currentComentarios.map((comentario, index) => (
            <tr key={index} className="border-t border-gray-200">
              <td className="px-6 py-4">
                <input type="checkbox" className="mr-2" />
                {comentario.comentario}
              </td>
              {/* Renderizar los datos adicionales si showDetailedColumns es true */}
              {showDetailedColumns && (
                <>
                  <td className="px-6 py-4">{comentario.t}</td>
                  <td className="px-6 py-4">{comentario.ePrivacidad}</td>
                  <td className="px-6 py-4">{comentario.pi}</td>
                  <td className="px-6 py-4">{comentario.pf}</td>
                  <td className="px-6 py-4">{comentario.oi}</td>
                  <td className="px-6 py-4">{comentario.eLibertad}</td>
                </>
              )}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(
                    comentario.gravedad
                  )}`}
                >
                  {comentario.gravedad}
                </span>
              </td>
              <td className="px-6 py-4">{comentario.sitio}</td>
              <td className="px-6 py-4">{comentario.fecha}</td>
              <td className="px-6 py-4 flex justify-end space-x-2">
                <button className="text-gray-500 hover:text-red-600">
                  <TrashIcon className="h-5 w-5" />
                </button>

                <button className="text-gray-500 hover:text-blue-600">
                  <PencilIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Componente de Paginación */}
      <div className="mt-4">
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
