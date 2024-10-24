// src/components/ComentariosClasificados.js

import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import Calendario from './Objects/Calendario';
import Paginacion from './Objects/Paginacion';
import api from '../services/axios';
import { truncateComentario } from '../utils/truncarComentario';
import Cargando from './Objects/Cargando';
import { useAuth } from "../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ComentariosClasificados() {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
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

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const commentsPerPage = 10;

  const calendarRef = useRef(null);
  const calendarButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const gravedadButtonRef = useRef(null);

  // Estados para edición de puntuación
  const [barraEdicionVisible, setBarraEdicionVisible] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [puntuacion, setPuntuacion] = useState({
    intensidadPrivacidad: '',
    elementoTiempo: '',
    empatiaPrivacidad: '',
    interesPublico: '',
    caracterPersonaPublico: '',
    origenInformacion: '',
    empatiaExpresion: ''
  });
  const puntuacionRef = useRef(null);

  // Estados para manejar la eliminación
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");

  // Estado temporal para almacenar el comentario eliminado (para Deshacer)
  const [comentarioEliminado, setComentarioEliminado] = useState(null);

  useEffect(() => {
    const fetchComentariosClasificados = async () => {
      try {
        const response = await api.get('/comments/get-all-classified-comments');
        console.log(response.data.data);
        setComentarios(response.data.data);
      } catch (err) {
        setComentarios([]);
        console.log('Error al obtener los comentarios', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComentariosClasificados();
  }, []);

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

      // Cerrar la barra de edición si se hace clic fuera
      if (
        barraEdicionVisible &&
        puntuacionRef.current &&
        !puntuacionRef.current.contains(event.target)
      ) {
        setBarraEdicionVisible(false);
        setComentarioSeleccionado(null);
        setPuntuacion({
          intensidadPrivacidad: '',
          elementoTiempo: '',
          empatiaPrivacidad: '',
          interesPublico: '',
          caracterPersonaPublico: '',
          origenInformacion: '',
          empatiaExpresion: ''
        });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen, isDropdownOpen, barraEdicionVisible]);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

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
      case 'GRAVE':
        return 'bg-red-500 text-white';
      case 'MODERADA':
        return 'bg-yellow-400 text-white';
      case 'LEVE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const mapGravedad = (gravedadApi) => {
    switch (gravedadApi.toUpperCase()) {
      case 'LEVE':
        return 'Baja';
      case 'MODERADA':
        return 'Moderada';
      case 'ALTA':
        return 'Alta';
      default:
        return 'Desconocida';
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
      <div
        ref={calendarRef}
        className="absolute top-full left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
      >
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
    const gravedadMapeada = mapGravedad(
      comentario.gravedad ? comentario.gravedad : 'Desconocida'
    );

    const gravedadMatch =
      selectedGravedad[gravedadMapeada] || gravedadMapeada === 'Desconocida';

    let dateMatch = true;
    if (selectedDate) {
      const comentarioDate = new Date(comentario.fechaClasificacion);
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
      const comentarioDate = new Date(comentario.fechaClasificacion);
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

    const rows = commentsToDownload.map((comment) => [
      `"${comment.comentario.replace(/"/g, '""')}"`,
      mapGravedad(comment?.gravedad ? comment.gravedad : 'Desconocida'),
      comment.comentario.sitioWeb.nombre,
      isValid(parseISO(comment.fechaClasificacion)) ? format(parseISO(comment.fechaClasificacion), 'dd-MM-yyyy') : "Fecha Inválida",
    ]);

    if (commentsToDownload.length === 0) {
      alert('No hay comentarios en el rango de fechas seleccionado.');
      return;
    }

    const headers = [
      'Comentario',
      'Gravedad',
      'Sitio web',
      'Fecha de clasificación',
    ];

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

  // Funciones para editar puntuación
  const editarComentario = (comentario) => {
    setComentarioSeleccionado(comentario);
    setBarraEdicionVisible(true);
    setPuntuacion({
      intensidadPrivacidad: comentario.intensidadPrivacidad || '',
      elementoTiempo: comentario.elementoTiempo || '',
      empatiaPrivacidad: comentario.empatiaPrivacidad || '',
      interesPublico: comentario.interesPublico || '',
      caracterPersonaPublico: comentario.caracterPersonaPublico || '',
      origenInformacion: comentario.origenInformacion || '',
      empatiaExpresion: comentario.empatiaExpresion || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === "empatiaPrivacidad" || name === "empatiaExpresion") {
      parsedValue = parseFloat(value);
    } else if (name !== "notas") {
      parsedValue = parseInt(value, 10);
    }

    setPuntuacion({ ...puntuacion, [name]: parsedValue });
  };

  const enviarEdicion = async () => {
    try {
      const comentarioId = comentarioSeleccionado.comentario.id; // Asegúrate de obtener el ID correcto

      const response = await api.post("/comments/clasificar", {
        comentarioScrapedId: comentarioId,
        clasificadorId: user.id,
        intensidadPrivacidad: Number(puntuacion.intensidadPrivacidad),
        elementoTiempo: Number(puntuacion.elementoTiempo),
        empatiaPrivacidad: Number(puntuacion.empatiaPrivacidad),
        interesPublico: Number(puntuacion.interesPublico),
        caracterPersonaPublico: Number(puntuacion.caracterPersonaPublico),
        origenInformacion: Number(puntuacion.origenInformacion),
        empatiaExpresion: Number(puntuacion.empatiaExpresion),
        userId: user.id
      });

      console.log('Edición de clasificación guardada:', response.data);

      if (response.status === 200) {
        setBarraEdicionVisible(false);
        toast.success("Edición de clasificación guardada exitosamente", {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Actualizar el comentario en el estado
        setComentarios((prevComentarios) =>
          prevComentarios.map((comentario) =>
            comentario.comentario.id === comentarioId
              ? { ...comentario, ...puntuacion }
              : comentario
          )
        );
        // Resetear el formulario de edición
        setComentarioSeleccionado(null);
        setPuntuacion({
          intensidadPrivacidad: '',
          elementoTiempo: '',
          empatiaPrivacidad: '',
          interesPublico: '',
          caracterPersonaPublico: '',
          origenInformacion: '',
          empatiaExpresion: ''
        });
      }
    } catch (error) {
      console.error("Error al guardar la edición de clasificación", error);
      console.log("Respuesta del servidor:", error.response?.data);
      toast.error("Error al guardar la edición de clasificación: " + (error.response?.data?.msg || error.message), {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Funciones para manejar la eliminación de comentarios
  const confirmarEliminarComentario = (comentario) => {
    setComentarioAEliminar(comentario);
    setMostrarModalEliminar(true);
    setPassword("");
    setReason("");
  };

  const manejarEliminarComentario = () => {
    // Simular la eliminación: remover el comentario del estado
    setComentarios((prevComentarios) =>
      prevComentarios.filter(
        (comentario) => comentario.comentario.id !== comentarioAEliminar.comentario.id
      )
    );

    // Almacenar el comentario eliminado para poder deshacer
    setComentarioEliminado(comentarioAEliminar);

    // Mostrar el toast de eliminación
    const now = new Date();
    const formattedDate = format(now, "dd-MM-yyyy HH:mm:ss");
    const toastId = toast.success(
      <div className="flex flex-col">
        <div>Comentario borrado exitosamente.</div>
        <div className="text-sm text-gray-600">Fecha y hora: {formattedDate}</div>
        <button
          onClick={() => deshacerEliminacion()}
          className="mt-2 text-blue-500 underline text-sm"
        >
          Deshacer
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );

    // Cerrar el modal y resetear estados
    setMostrarModalEliminar(false);
    setComentarioAEliminar(null);
    setPassword("");
    setReason("");
  };

  const manejarCancelarEliminar = () => {
    setMostrarModalEliminar(false);
    setComentarioAEliminar(null);
    setPassword("");
    setReason("");
  };

  const deshacerEliminacion = () => {
    if (comentarioEliminado) {
      setComentarios((prevComentarios) => [comentarioEliminado, ...prevComentarios]);
      toast.dismiss(); // Cerrar el toast actual
      toast.info("Eliminación deshecha.", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setComentarioEliminado(null);
    }
  };

  // Modal para confirmar la eliminación de un comentario con campos de contraseña y motivo
  const modalEliminarComentario = (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">¿Está seguro de eliminar este comentario?</h3>
        <p className="text-sm text-gray-900 mb-4">
          Esta acción no se puede deshacer. Por favor, ingresa una contraseña y un motivo para la eliminación.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); manejarEliminarComentario(); }}>
          {/* Campo de Contraseña */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Campo de Motivo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Motivo de la eliminación
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ingresa el motivo (opcional)"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={manejarCancelarEliminar}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Calcular el número total de columnas
  const baseColumns = 8; // Ajusta según tus columnas base
  const detailedColumns = 6;
  const totalColumns = showDetailedColumns
    ? baseColumns + detailedColumns
    : baseColumns;

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      {/* Contenedor de Toasts */}
      <ToastContainer />

      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Comentarios clasificados
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4 md:flex-row flex-col">
          {/* Botón para el calendario */}
          <div className="relative">
            <button
              ref={calendarButtonRef}
              onClick={toggleCalendar}
              className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:bg-gray-100"
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span>
                {selectedDate ? (
                  <span>
                    Fecha:{' '}
                    <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                      {format(new Date(selectedDate), 'dd/MM/yyyy')}
                    </span>
                  </span>
                ) : (
                  'Fecha'
                )}
              </span>
            </button>
            {isCalendarOpen && renderCalendar()}
          </div>

          {/* Botón de Gravedad con Dropdown y funcionalidad de mostrar columnas detalladas */}
          <div className="relative">
            <button
              ref={gravedadButtonRef}
              onClick={handleGravedadClick}
              className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:bg-gray-100"
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span>Gravedad</span>
            </button>
            {isDropdownOpen && renderDropdown()}
          </div>

          {/* Botón Quitar Filtros */}
          <button
            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
            onClick={() => {
              setSelectedDate(null);
              setSelectedGravedad({
                Baja: true,
                Moderada: true,
                Alta: true,
              });
              setStartDate(null);
              setEndDate(null);
              setPaginaActual(1);
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

      {/* Tabla de Comentarios */}
      <table className="min-w-full bg-white shadow-md rounded-lg table-fixed border-collapse">
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
          {loading ? (
            <tr>
              <td colSpan={totalColumns} className="px-6 py-4 text-center">
                <Cargando />
              </td>
            </tr>
          ) : currentComentarios.length > 0 ? (
            currentComentarios.map((comentario, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-6 py-4">
                  <input type="checkbox" className="mr-2" />
                  {truncateComentario(comentario.comentario.comentario)}
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
                      comentario?.gravedad
                    )}`}
                  >
                    {mapGravedad(
                      comentario?.gravedad ? comentario.gravedad : 'Desconocida'
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {comentario.comentario?.sitioWeb?.nombre
                    ? comentario?.comentario?.sitioWeb?.nombre
                    : 'latercera.com'}
                </td>
                <td className="px-6 py-4">
                  {isValid(parseISO(comentario.fechaClasificacion))
                    ? format(parseISO(comentario.fechaClasificacion), 'dd-MM-yyyy')
                    : "Fecha Inválida"}
                </td>
                <td className="px-6 py-4 flex justify-end space-x-2">
                  <button
                    onClick={() => confirmarEliminarComentario(comentario)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    aria-label="Eliminar comentario"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>

                  <button
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => editarComentario(comentario)}
                    aria-label="Editar comentario"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={totalColumns} className="px-6 py-4 text-center">
                No hay comentarios para mostrar.
              </td>
            </tr>
          )}
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

      {/* Modal de Eliminación */}
      {mostrarModalEliminar && modalEliminarComentario}

      {/* Panel lateral para editar puntuación */}
      {barraEdicionVisible && (
        <div className="fixed right-0 top-0 h-screen w-[430px] bg-white shadow-lg p-6 opacity-100 border-l border-l-gray-300 overflow-y-auto z-20" ref={puntuacionRef}>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">
              Edición de clasificación de comentario
            </h2>
            <button
              onClick={() => {
                setBarraEdicionVisible(false);
                setComentarioSeleccionado(null);
                setPuntuacion({
                  intensidadPrivacidad: '',
                  elementoTiempo: '',
                  empatiaPrivacidad: '',
                  interesPublico: '',
                  caracterPersonaPublico: '',
                  origenInformacion: '',
                  empatiaExpresion: ''
                });
              }}
              className="text-gray-500 hover:text-gray-700 text-lg"
              aria-label="Cerrar barra de edición"
            >
              &#10005;
            </button>
          </div>
          <br />
          <p>
            <strong>Comentario:</strong>
          </p>
          <p>{comentarioSeleccionado?.comentario?.comentario}</p>

          <div className="mt-4">
            <label className="block mt-2">
              Privacidad intrusiva:
              <input
                type="number"
                min="1"
                max="3"
                name="intensidadPrivacidad"
                value={puntuacion.intensidadPrivacidad}
                onChange={handleInputChange}
                placeholder="PR"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Grado de intrusión en la privacidad. Valor de 1 a 3.
            </p>

            <label className="block mt-4">
              Tiempo (0-1):
              <input
                type="number"
                min="0"
                max="1"
                name="elementoTiempo"
                value={puntuacion.elementoTiempo}
                onChange={handleInputChange}
                placeholder="T"
                step="0.1"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Tiempo relacionado con la información (antigüedad). Valor de 0 a 1.
            </p>

            <label className="block mt-4">
              Empatía hacia la privacidad (0-1):
              <input
                type="number"
                min="0"
                max="1"
                name="empatiaPrivacidad"
                value={puntuacion.empatiaPrivacidad}
                onChange={handleInputChange}
                placeholder="E.Privacidad"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Empatía hacia la privacidad de la persona. Valor de 0 a 1.
            </p>

            <label className="block mt-4">
              Interés público (1-3):
              <input
                type="number"
                min="1"
                max="3"
                name="interesPublico"
                value={puntuacion.interesPublico}
                onChange={handleInputChange}
                placeholder="IP"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Nivel de interés público sobre el asunto. Valor de 1 a 3.
            </p>

            <label className="block mt-4">
              Figura pública (1-2):
              <input
                type="number"
                min="1"
                max="2"
                name="caracterPersonaPublico"
                value={puntuacion.caracterPersonaPublico}
                onChange={handleInputChange}
                placeholder="PF"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Indica si es una figura pública sobre el asunto. Valor de 1 a 2.
            </p>

            <label className="block mt-4">
              Origen de la información (-0.75 - 0):
              <input
                type="number"
                min="-0.75"
                max="0"
                name="origenInformacion"
                placeholder="OI"
                step={0.05}
                value={puntuacion.origenInformacion}
                onChange={handleInputChange}
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Origen de la información, si es legal o cuestionable. Valor de -0.75 a 0.
            </p>

            <label className="block mt-4">
              Empatía hacia la libertad de expresión (0-1):
              <input
                type="number"
                min="0"
                max="1"
                name="empatiaExpresion"
                value={puntuacion.empatiaExpresion}
                onChange={handleInputChange}
                placeholder="E.Libertad"
                className="border rounded w-full mt-1 p-1"
                required
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Empatía hacia la libertad de expresión. Valor de 0 a 1.
            </p>
          </div>

          <div className="flex mt-6 justify-between">
            <button
              onClick={() => {
                setBarraEdicionVisible(false);
                setComentarioSeleccionado(null);
                setPuntuacion({
                  intensidadPrivacidad: '',
                  elementoTiempo: '',
                  empatiaPrivacidad: '',
                  interesPublico: '',
                  caracterPersonaPublico: '',
                  origenInformacion: '',
                  empatiaExpresion: ''
                });
              }}
              className="bg-red-600 text-white py-2 px-4 rounded w-[48%]"
            >
              Cancelar
            </button>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded w-[48%]"
              onClick={enviarEdicion}
            >
              Completar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
