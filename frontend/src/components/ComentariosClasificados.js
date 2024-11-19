import React, { useState, useRef, useEffect, useContext } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import Calendario from './Objects/Calendario';
import Paginacion from './Objects/Paginacion';
import Formulario from "./Objects/Formulario";
import api from '../services/axios';
import { truncateComentario } from '../utils/truncarComentario';
import Cargando from './Objects/Cargando';
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from '../utils/ThemeContext';
import { Toast, showSuccess, showError, showInfo } from "./Objects/Toast";

export default function ComentariosClasificados() {
  const { user } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);
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

  // Ajuste del renderCalendar para mejorar la visualización
  const renderCalendar = () => {
    return (
      <div
        ref={calendarRef}
        className={`absolute top-full left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10`}
      >
        <Calendario onDateSelect={handleDateSelect} />
      </div>
    );
  };

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className={`absolute mt-2 w-56 rounded-md shadow-lg ring-1 z-50 
          ${isDarkMode ? 'bg-gray-800 ring-gray-700 text-white' : 'bg-white ring-black ring-opacity-5 text-gray-700'}
        `}
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
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Baja</span>
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
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Moderada</span>
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
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Alta</span>
              </span>
              <span className="ml-auto text-gray-500">31</span>
            </label>
          </div>
          <div className="border-t border-gray-200">
            <button
              onClick={limpiarSeleccion}
              className={`w-full text-left px-4 py-2 text-sm 
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}
              `}
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

  const columnasClasificados = [
    {
      title: "Comentario",
      width: 250,
      halign: 'left',
    },
    {
      title: "Gravedad",
      width: 100,
      halign: 'center',
    },
    {
      title: "Sitio Web",
      width: 80,
      halign: 'center',
    },
    {
      title: "Fecha de Clasificación",
      width: 80,
      halign: 'center',
    },
  ];

  const formatData = (comentario) => [
    comentario.comentario.comentario, // Texto del comentario
    mapGravedad(comentario?.gravedad ? comentario.gravedad : 'Desconocida'), // Gravedad
    comentario.comentario.sitioWeb?.nombre || 'Sin sitio web', // Sitio web
    isValid(parseISO(comentario.fechaClasificacion))
      ? format(parseISO(comentario.fechaClasificacion), "dd-MM-yyyy")
      : "Fecha Inválida"
  ];

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
        showSuccess("Edición de clasificación guardada exitosamente.");
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
      showError("Error al guardar la edición de clasificación: " + (error.response?.data?.msg || error.message));
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
    showSuccess("Comentario borrado exitosamente.", true, deshacerEliminacion);

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
      showInfo("Eliminación deshecha.");
      setComentarioEliminado(null);
    }
  };

  // Modal para confirmar la eliminación de un comentario con campos de contraseña y motivo
  const modalEliminarComentario = (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 
      ${isDarkMode ? 'bg-opacity-70' : 'bg-opacity-50'}`}>
      <div className={`
        ${isDarkMode
          ? 'bg-gray-800 text-gray-200 border border-gray-700'
          : 'bg-white text-gray-900'}
        p-6 rounded-md shadow-lg max-w-md w-full`}>
        <h3 className={`text-lg font-semibold mb-2 
          ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ¿Está seguro de eliminar este comentario?
        </h3>
        <p className={`text-sm mb-4 
          ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          Esta acción no se puede deshacer. Por favor, ingresa una contraseña y un motivo para la eliminación.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); manejarEliminarComentario(); }}>
          {/* Campos de formulario */}
          <div className="mb-4">
            <label className={`block text-sm font-medium 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Motivo de la eliminación
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ingresa el motivo (opcional)"
              className={`mt-1 p-2 w-full rounded-md focus:outline-none focus:ring-2 
                ${isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:ring-indigo-500' 
                  : 'border-gray-300 focus:ring-blue-500'}`}
              rows={3}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={manejarCancelarEliminar}
              className={`px-4 py-2 rounded-md 
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md 
                ${isDarkMode 
                  ? 'bg-red-700 text-white hover:bg-red-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Calcular el número total de columnas
  const baseColumns = 4; // Comentario, Gravedad, Sitio Web, Fecha de Clasificación
  const detailedColumns = 7; // PR, T, E.Privacidad, PI, PF, OI, E.Libertad
  const totalColumns = showDetailedColumns
    ? baseColumns + detailedColumns
    : baseColumns;

  return (
    <div className={`p-2 sm:p-4 lg:p-8 min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Contenedor de Toasts */}
      <Toast />

      <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Comentarios clasificados
      </h2>

      {/* Controles de Filtro y Descarga */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center space-x-4">
          {/* Botón para el calendario */}
          <div className="relative">
            <button
              ref={calendarButtonRef}
              onClick={toggleCalendar}
              className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
                ${isCalendarOpen
                  ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                <span>
                  {selectedDate ? (
                    <span>
                      Fecha: <span className={`font-semibold`}>{format(new Date(selectedDate), 'dd/MM/yyyy')}</span>
                    </span>
                  ) : (
                    'Seleccionar Fecha'
                  )}
                </span>
              </div>
            </button>
            {isCalendarOpen && renderCalendar()}
          </div>

          {/* Botón de Gravedad con Dropdown y funcionalidad de mostrar columnas detalladas */}
          <div className="relative">
            <button
              ref={gravedadButtonRef}
              onClick={handleGravedadClick}
              className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
                ${isDropdownOpen
                  ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                <span>Gravedad</span>
              </div>
            </button>
            {isDropdownOpen && renderDropdown()}
          </div>

          {/* Botón Quitar Filtros */}
          <button
            className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
              bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-2`}
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
            <XMarkIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
            <span>Quitar Filtros</span>
          </button>
        </div>

        {/* Sección de Fechas y Descarga */}
        <div className="flex flex-wrap items-center space-x-4">
          {/* Contenedor Flex para alinear horizontalmente */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 w-28 sm:w-32
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
                }`}
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setStartDate(date);
                setPaginaActual(1);
              }}
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>-</span>
            <input
              type="date"
              className={`border rounded px-2 py-1 focus:outline-none focus:ring-2 w-28 sm:w-32
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
                }`}
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setEndDate(date);
                setPaginaActual(1);
              }}
            />
          </div>
          {/* Componente Formulario para descargar el PDF */}
          <Formulario 
            comentariosFiltrados={filteredComentarios} 
            columns={columnasClasificados} 
            formatData={formatData}
            fileName="comentarios_clasificados.pdf"
            className="w-auto" // Mantener la clase w-auto para responsividad
          />
        </div>
      </div>

      {/* Vista de Tabla para Pantallas Grandes */}
      <div className="overflow-x-auto hidden sm:block">
        <table className={`min-w-full table-fixed shadow-md rounded-lg border-collapse 
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <thead>
            <tr>
              <th className={`px-6 py-4 text-left font-medium border-b  
                ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                Comentario
              </th>
              {/* Renderizar las columnas adicionales si showDetailedColumns es true */}
              {showDetailedColumns && (
                <>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    PR
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    T
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    E.Privacidad
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    PI
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    PF
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    OI
                  </th>
                  <th className={`px-6 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                    E.Libertad
                  </th>
                </>
              )}
              <th className={`px-6 py-4 text-left font-medium border-b 
                  ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Gravedad
              </th>
              <th className={`px-6 py-4 text-left font-medium border-b 
                  ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                Sitio Web
              </th>
              <th className={`px-6 py-4 text-left font-medium border-b 
                  ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                Fecha de Clasificación
              </th>
              <th className={`px-6 py-4 text-left font-medium border-b 
                  ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Acciones</th>
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
                <tr key={index} className={`${isDarkMode 
                    ? 'border-b border-gray-700' : 'border-b border-gray-200'
                  } 
                  ${index % 2 === 0 
                    ? (isDarkMode ? 'bg-gray-800' : 'bg-white') 
                    : (isDarkMode ? 'bg-gray-850' : 'bg-gray-50')
                  }`}>
                  <td className={`px-6 py-4 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px] 
                    ${isDarkMode 
                      ? 'text-gray-300' 
                      : 'text-gray-900'
                    }`}>
                    {truncateComentario(comentario.comentario.comentario)}
                  </td>
                  {/* Renderizar los datos adicionales si showDetailedColumns es true */}
                  {showDetailedColumns && (
                    <>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.intensidadPrivacidad}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.elementoTiempo}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.empatiaPrivacidad}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.interesPublico}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.caracterPersonaPublico}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.origenInformacion}</td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.empatiaExpresion}</td>
                    </>
                  )}
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <span
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
                        ${getBadgeColor(comentario?.gravedad)}
                        ${isDarkMode ? 'bg-opacity-20' : ''}
                      `}>
                      {mapGravedad(
                        comentario?.gravedad ? comentario.gravedad : 'Desconocida'
                      )}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {comentario.comentario?.sitioWeb?.nombre
                      ? comentario?.comentario?.sitioWeb?.nombre
                      : 'latercera.com'}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {isValid(parseISO(comentario.fechaClasificacion))
                      ? format(parseISO(comentario.fechaClasificacion), 'dd-MM-yyyy')
                      : "Fecha Inválida"}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button
                      onClick={() => confirmarEliminarComentario(comentario)}
                      className={`
                        ${isDarkMode 
                          ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                        } cursor-pointer`}
                      aria-label="Eliminar comentario"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>

                    <button
                      className={`
                        ${isDarkMode 
                          ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'
                        } cursor-pointer`}
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
                <td colSpan={totalColumns} className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} text-center`}>
                  No hay comentarios para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Pantallas Pequeñas */}
      <div className="block sm:hidden flex flex-col items-center">
        <div className="space-y-4 w-full">
          {loading ? (
            <Cargando />
          ) : currentComentarios.length > 0 ? (
            currentComentarios.map((comentario, index) => (
              <div key={index} className={`w-full max-w-sm border p-4 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${getBadgeColor(comentario.gravedad)}`}></div>
                      <span className="ml-2 font-medium truncate">{comentario.comentario.sitioWeb?.nombre || 'latercera.com'}</span>
                    </div>
                    <div className="text-sm">
                      {isValid(parseISO(comentario.fechaClasificacion))
                        ? format(parseISO(comentario.fechaClasificacion), "dd-MM-yyyy")
                        : "Fecha Inválida"
                      }
                    </div>
                  </div>
                  <div className="text-sm">
                    {truncateComentario(comentario.comentario.comentario, 100)}
                  </div>
                  {showDetailedColumns && (
                    <div className="flex flex-col space-y-1">
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">PR:</span>
                        <span>{comentario.intensidadPrivacidad}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">T:</span>
                        <span>{comentario.elementoTiempo}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">E.Privacidad:</span>
                        <span>{comentario.empatiaPrivacidad}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">PI:</span>
                        <span>{comentario.interesPublico}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">PF:</span>
                        <span>{comentario.caracterPersonaPublico}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">OI:</span>
                        <span>{comentario.origenInformacion}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className="font-semibold">E.Libertad:</span>
                        <span>{comentario.empatiaExpresion}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => confirmarEliminarComentario(comentario)}
                      className={`text-gray-500 hover:text-red-600 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : ''}`}
                      aria-label="Eliminar comentario"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => editarComentario(comentario)}
                      className={`text-gray-500 hover:text-blue-600 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : ''}`}
                      aria-label="Editar comentario"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} text-center w-full`}>
              No hay comentarios para mostrar.
            </div>
          )}
        </div>
      </div>

      {/* Componente de Paginación */}
      <div className="flex justify-center mt-6">
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
        <div className={`fixed right-0 top-0 h-screen w-[430px] shadow-lg p-6 opacity-100 border-l overflow-y-auto 
          ${isDarkMode 
            ? 'bg-gray-800 text-white border-l-gray-700' 
            : 'bg-white text-gray-800 border-l-gray-300'
          }`} ref={puntuacionRef}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-400' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-400' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-400' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-400' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-300' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-300' : 'text-gray-500' }`}>
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
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}
                `}
                required/>
            </label>
            <p className={`text-sm mt-1 ${isDarkMode 
              ? 'text-gray-300' : 'text-gray-500' }`}>
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
