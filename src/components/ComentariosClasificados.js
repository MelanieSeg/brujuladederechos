import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';

export default function ComentariosClasificados() {
  const [comentarios] = useState([
    // Comentarios originales (10)
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
    { comentario: 'Excelente relación calidad-precio.', gravedad: 'Alta', sitio: 'ejemplo.com', fecha: 'Jul 15, 2024', t: 1, ePrivacidad: 1, pi: 1, pf: 2, oi: 0, eLibertad: 1 },
  
  ]);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedGravedad, setSelectedGravedad] = useState({
    Baja: true,
    Moderada: true,
    Alta: true,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Nuevo estado para alternar entre columnas básicas y detalladas
  const [showDetailedColumns, setShowDetailedColumns] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10; // Número de comentarios por página

  // Refs para detectar clics fuera
  const calendarRef = useRef(null);
  const calendarButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const gravedadButtonRef = useRef(null);

  // Manejar clics fuera del calendario y dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Si el calendario está abierto y el clic no está dentro del calendario ni en el botón
      if (
        isCalendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }

      // Si el dropdown está abierto y el clic no está dentro del dropdown ni en el botón de gravedad
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

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Cambiar la visibilidad de las columnas detalladas y abrir el dropdown al hacer clic en Gravedad
  const handleGravedadClick = () => {
    setShowDetailedColumns(!showDetailedColumns);
    setDropdownOpen(!isDropdownOpen);
  };

  const handleGravedadChange = (gravedad) => {
    setSelectedGravedad((prevState) => ({
      ...prevState,
      [gravedad]: !prevState[gravedad],
    }));
    setCurrentPage(1); // Reiniciar a la primera página al cambiar filtros
  };

  const limpiarSeleccion = () => {
    setSelectedGravedad({
      Baja: false,
      Moderada: false,
      Alta: false,
    });
    setCurrentPage(1); // Reiniciar a la primera página al limpiar filtros
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

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setIsCalendarOpen(false); // Cerrar calendario después de seleccionar la fecha
    setCurrentPage(1); // Reiniciar a la primera página al seleccionar una fecha
  };

  const renderCalendar = () => {
    const days = [];
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let i = 1; i <= monthEnd.getDate(); i++) {
      days.push(i);
    }

    return (
      <div ref={calendarRef} className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 w-64">
        <div className="text-center font-bold mb-2">{today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}</div>
        <div className="grid grid-cols-7 gap-2">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day, index) => (
            <div key={index} className="text-gray-500 text-sm">{day}</div>
          ))}
          {days.map((day) => (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`w-full p-2 rounded-full ${
                selectedDate === day
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdown = () => {
    return (
      <div ref={dropdownRef} className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1">
          <div className="px-4 py-2 text-sm text-gray-700 font-semibold flex items-center">
            {/* Icono de lupa */}
            <span className="mr-2">🔍</span>
            Prioridad
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Baja}
                onChange={() => handleGravedadChange('Baja')}
                className="form-checkbox text-green-500"
              />
              <span className="flex items-center">
                {/* Flecha hacia abajo */}
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
                {/* Flecha derecha */}
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
                {/* Flecha hacia arriba */}
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

  // Cálculos para la paginación
  const filteredComentarios = comentarios.filter(comentario => selectedGravedad[comentario.gravedad]);

  const totalPages = Math.ceil(filteredComentarios.length / commentsPerPage);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComentarios = filteredComentarios.slice(indexOfFirstComment, indexOfLastComment);

  // Manejadores de paginación
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Comentarios clasificados</h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          {/* Botón para el calendario */}
          <button
            ref={calendarButtonRef}
            onClick={toggleCalendar}
            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
          >
            <PlusIcon className="w-5 h-5 text-gray-500" />
            <span>{selectedDate ? `Fecha: ${selectedDate}` : 'Fecha'}</span>
          </button>

          {isCalendarOpen && renderCalendar()}

          {/* Botón de Gravedad con Dropdown y funcionalidad de mostrar columnas detalladas */}
          <div className="relative">
            <button
              ref={gravedadButtonRef}
              onClick={handleGravedadClick}
              className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span>Gravedad</span>
            </button>
            {isDropdownOpen && renderDropdown()}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="date"
            className="border border-gray-300 rounded px-4 py-2 bg-white"
          />
          <span>-</span>
          <input
            type="date"
            className="border border-gray-300 rounded px-4 py-2 bg-white"
          />
          <button className="bg-black text-white px-4 py-2 rounded-md">Descargar</button>
        </div>
      </div>

      <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left font-medium text-gray-500">Comentario</th>
            {/* Renderizar las columnas adicionales si showDetailedColumns es true */}
            {showDetailedColumns && (
              <>
                <th className="px-6 py-4 text-left font-medium text-gray-500">T</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">E.Privacidad</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">PI</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">PF</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">OI</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">E.Libertad</th>
              </>
            )}
            <th className="px-6 py-4 text-left font-medium text-gray-500">Gravedad</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500">Sitio web</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500">Fecha de clasificación</th>
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(comentario.gravedad)}`}>
                  {comentario.gravedad}
                </span>
              </td>
              <td className="px-6 py-4">{comentario.sitio}</td>
              <td className="px-6 py-4">{comentario.fecha}</td>
              <td className="px-6 py-4 flex justify-end space-x-2">
                <button className="text-gray-500 hover:text-red-600">
                  🗑️
                </button>
                <button className="text-gray-500 hover:text-blue-600">
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de Paginación */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-gray-500">⬅️</span>
          <span>Anterior</span>
        </button>
        
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handlePageClick(num)}
              className={`px-4 py-2 rounded-full ${num === currentPage ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {num}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-100 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full text-gray-500">➡️</span>
          <span>Siguiente</span>
        </button>
      </div>
    </div>
  );
}
