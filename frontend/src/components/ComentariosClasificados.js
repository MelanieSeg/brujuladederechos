import React, { useState, useRef, useEffect, useContext } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import Calendario, { DatePicker } from './Objects/Calendario'; // Importar correctamente
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
  const [loading, setLoading] = useState(true);
  const [showDetailedColumns, setShowDetailedColumns] = useState(false);


  // Estados para filtros
  const [isGravedadDropdownOpen, setGravedadDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false); // Cambio de nombre para mantener consistencia
  const [selectedGravedad, setSelectedGravedad] = useState({
    Baja: true,
    Moderada: true,
    Alta: true,
  });

  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const commentsPerPage = 10;

  // Refs para detectar clics fuera de los dropdowns
  const gravedadDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

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

  // Estados para manejo de eliminación
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);
  const [reason, setReason] = useState("");

  // Estado para deshacer eliminación
  const [comentarioEliminado, setComentarioEliminado] = useState(null);

  // Fetch de comentarios clasificados
  useEffect(() => {
    const fetchComentariosClasificados = async () => {
      try {
        const response = await api.get('/comments/get-all-classified-comments');
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

  // Manejo de clics fuera de los dropdowns y barra de edición
  useEffect(() => {
    function handleClickOutside(event) {
      // Cerrar Dropdown de Gravedad
      if (
        isGravedadDropdownOpen &&
        gravedadDropdownRef.current &&
        !gravedadDropdownRef.current.contains(event.target)
      ) {
        setGravedadDropdownOpen(false);
      }

      // Cerrar Dropdown de Fecha
      if (
        isDateDropdownOpen &&
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setIsDateDropdownOpen(false);
      }

      // Cerrar la barra de edición si se hace clic fuera
      if (
        barraEdicionVisible &&
        puntuacionRef.current &&
        !puntuacionRef.current.contains(event.target)
      ) {
        cerrarBarraEdicion();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGravedadDropdownOpen, isDateDropdownOpen, barraEdicionVisible]);

  // Funciones para togglear dropdowns
  const toggleGravedadDropdown = () => {
    setGravedadDropdownOpen(!isGravedadDropdownOpen);
  };

  const toggleDateDropdown = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };

  // Funciones para manejar cambios en Gravedad
  const handleGravedadChange = (gravedad) => {
    setSelectedGravedad((prevState) => ({
      ...prevState,
      [gravedad]: !prevState[gravedad],
    }));
    setPaginaActual(1);
  };

  const limpiarSeleccionGravedad = () => {
    setSelectedGravedad({
      Baja: false,
      Moderada: false,
      Alta: false,
    });
    setPaginaActual(1);
  };

  // Funciones para manejar edición de puntuación
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

  const cerrarBarraEdicion = () => {
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



      // Validaciones adicionales antes de enviar
      if (puntuacion.intensidadPrivacidad < 1 || puntuacion.intensidadPrivacidad > 3) {
        showError("Interferencia en la Privacidad debe estar entre 1 y 3.");
        return;
      }
      if (puntuacion.elementoTiempo < 0 || puntuacion.elementoTiempo > 1) {
        showError("Tiempo debe estar entre 0 y 1.");
        return;
      }
      if (puntuacion.empatiaPrivacidad < 0 || puntuacion.empatiaPrivacidad > 1) {
        showError("Empatía hacia la privacidad debe estar entre 0 y 1.");
        return;
      }
      if (puntuacion.interesPublico < 1 || puntuacion.interesPublico > 3) {
        showError("Interés Público debe estar entre 1 y 3.");
        return;
      }
      if (puntuacion.caracterPersonaPublico < 0 || puntuacion.caracterPersonaPublico > 3) {
        showError("Figura Pública debe estar entre 0 y 3.");
        return;
      }
      if (puntuacion.origenInformacion < -0.75 || puntuacion.origenInformacion > 0) {
        showError("Origen de la información debe estar entre -0.75 y 0.");
        return;
      }

      // Enviar datos al backend
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

      if (response.status === 200) {
        cerrarBarraEdicion();
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
      showError("Error al guardar la edición de clasificación: " + (error.response?.data?.msg || error.message));
    }
  };

  // Funciones para manejar eliminación de comentarios
  const confirmarEliminarComentario = (comentario) => {
    setComentarioAEliminar(comentario);
    setMostrarModalEliminar(true);
    setReason("");
  };

  const manejarEliminarComentario = async () => {
    if (!comentarioAEliminar) return;

    try {
      // Llamada a la API para eliminar el comentario
      const response = await api.delete(`/comments/delete/${comentarioAEliminar.comentario.id}`, {
        data: { motivo: reason },
      });
      if (response.status === 200) {
        // Remover el comentario del estado
        setComentarios((prevComentarios) =>
          prevComentarios.filter(
            (comentario) => comentario.comentario.id !== comentarioAEliminar.comentario.id
          )
        );

        // Almacenar el comentario eliminado para poder deshacer
        setComentarioEliminado(comentarioAEliminar);

        // Mostrar el toast de eliminación con opción para deshacer
        showSuccess("Comentario borrado exitosamente.", true, deshacerEliminacion);

        // Cerrar el modal y resetear estados
        setMostrarModalEliminar(false);
        setComentarioAEliminar(null);
        setReason("");
      }
    } catch (error) {
      console.error("Error al eliminar el comentario", error);
      showError("Error al eliminar el comentario: " + (error.response?.data?.msg || error.message));
    }
  };

  const manejarCancelarEliminar = () => {
    setMostrarModalEliminar(false);
    setComentarioAEliminar(null);
    setReason("");
  };

  const deshacerEliminacion = async () => {
    if (comentarioEliminado) {
      try {
        // Llamada a la API para restaurar el comentario
        const response = await api.post(`/comments/restore/${comentarioEliminado.comentario.id}`);
        if (response.status === 200) {
          // Agregar el comentario de nuevo al estado
          setComentarios((prevComentarios) => [comentarioEliminado, ...prevComentarios]);
          showInfo("Eliminación deshecha.");
          setComentarioEliminado(null);
        }
      } catch (error) {
        console.error("Error al restaurar el comentario", error);
        showError("Error al restaurar el comentario: " + (error.response?.data?.msg || error.message));
      }
    }
  };

  // Modal para confirmar la eliminación de un comentario con motivo
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

  // Funciones para renderizar los dropdowns
  const renderGravedadDropdown = () => (
    isGravedadDropdownOpen && (
      <div
        ref={gravedadDropdownRef}
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
                className={`form-checkbox 
                  ${isDarkMode
                    ? 'text-green-400 bg-gray-700 border-gray-600'
                    : 'text-green-500'
                  }`}
              />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Baja</span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Moderada}
                onChange={() => handleGravedadChange('Moderada')}
                className={`form-checkbox 
                  ${isDarkMode
                    ? 'text-yellow-400 bg-gray-700 border-gray-600'
                    : 'text-yellow-500'
                  }`}
              />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Moderada</span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGravedad.Alta}
                onChange={() => handleGravedadChange('Alta')}
                className={`form-checkbox 
                  ${isDarkMode
                    ? 'text-red-400 bg-gray-700 border-gray-600'
                    : 'text-red-500'
                  }`}
              />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Alta</span>
            </label>
          </div>
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={limpiarSeleccionGravedad}
              className={`w-full text-left px-4 py-2 text-sm
                ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}
              `}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderDateDropdown = () => (
    isDateDropdownOpen && (
      <div
        ref={dateDropdownRef}
        className={`absolute mt-2 rounded-md shadow-lg z-20 
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}
        `}
        style={{ width: '220px' }}
      >
        <div className="px-4 py-2">
          {/* Fecha Desde */}
          <div className="mb-4">
            <DatePicker
              selectedDate={fechaDesde}
              onDateChange={setFechaDesde}
              placeholder="Selecciona desde"
              isDarkMode={isDarkMode}
            />
          </div>
          {/* Fecha Hasta */}
          <div className="mb-4">
            <DatePicker
              selectedDate={fechaHasta}
              onDateChange={setFechaHasta}
              placeholder="Selecciona hasta"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              setFechaDesde(null);
              setFechaHasta(null);
            }}
            className={`w-full text-left px-4 py-2 text-sm
              ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}
            `}
          >
            Limpiar
          </button>
          </div>
        </div>
      </div>
    )
  );

  // Función para obtener el color de la gravedad
  const getBadgeColor = (gravedad) => {
    if (!gravedad) {
      return 'bg-gray-500 text-white';
    }
    switch (gravedad.toUpperCase()) {
      case 'GRAVE':
        return 'bg-red-500 text-white';
      case 'MODERADA':
        return 'bg-yellow-500 text-white';
      case 'LEVE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Función para mapear gravedad de la API a etiquetas legibles
  const mapGravedad = (gravedadApi) => {
    if (!gravedadApi) {
      return 'Desconocida';
    }
    switch (gravedadApi.toUpperCase()) {
      case 'LEVE':
        return 'Baja';
      case 'MODERADA':
        return 'Moderada';
      case 'GRAVE':
        return 'Alta';
      default:
        return 'Desconocida';
    }
  };

  // Filtrar comentarios según gravedad y fechas
  const filteredComentarios = comentarios.filter((comentario) => {
    const gravedadMapeada = mapGravedad(
      comentario.comentario.gravedad
    );

    const gravedadMatch =
      selectedGravedad[gravedadMapeada] || gravedadMapeada === 'Desconocida';

    const fechaComentario = parseISO(comentario.fechaClasificacion);

    const desdeMatch = fechaDesde ? fechaComentario >= fechaDesde : true;
    const hastaMatch = fechaHasta ? fechaComentario <= fechaHasta : true;

    const dateMatch = desdeMatch && hastaMatch;

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

  // Definir las columnas para PDF
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
    mapGravedad(comentario.comentario.gravedad), // Gravedad
    comentario.comentario.sourceUrl || 'Sin sitio web', // Sitio web
    isValid(parseISO(comentario.fechaClasificacion))
      ? format(parseISO(comentario.fechaClasificacion), "dd-MM-yyyy", { locale: es })
      : "Fecha Inválida"
  ];

  // Calcular el número total de columnas para la tabla
  const baseColumns = 5; // Comentario, Gravedad, Sitio Web, Fecha de Clasificación, Acciones
  const totalColumns = baseColumns;

  return (
    <div className={`p-2 sm:p-4 min-h-screen lg:p-8 flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Contenedor de Toasts */}
      <Toast />

      <div className="flex-grow">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Comentarios clasificados
        </h2>

        {/* Controles de Filtro y Descarga */}
        <div className="flex flex-wrap items-center justify-between space-y-2 md:space-y-0 md:space-x-0">
          <div className="flex flex-row flex-wrap items-center space-x-0 sm:space-x-2 lg:space-x-2">
            {/* Botón de Fecha con Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDateDropdown}
                className={`fecha-button px-4 py-2 mb-2 rounded-full text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 border 
                  ${isDateDropdownOpen
                    ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <PlusIcon className={`w-5 h-5 ${
                    isDarkMode
                      ? 'text-white group-hover:text-gray-200'
                      : 'text-gray-500'
                  }`} />
                  <span>Fecha</span>
                </div>
              </button>
              {renderDateDropdown()}
            </div>

            {/* Botón de Gravedad con Dropdown */}
            <div className="relative">
              <button
                onClick={toggleGravedadDropdown}
                className={`px-4 py-2 mb-2 rounded-full text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 border 
                  ${isGravedadDropdownOpen
                    ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <PlusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span>Gravedad</span>
                </div>
              </button>
              {renderGravedadDropdown()}
            </div>

            {/* Botón Quitar Filtros */}
            <button
              className={`px-2 py-2 mb-2 sm:px-4 py-2 rounded-full text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 border 
              bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-1 sm:space-x-2`}
              onClick={() => {
                setFechaDesde(null);
                setFechaHasta(null);
                setSelectedGravedad({
                  Baja: true,
                  Moderada: true,
                  Alta: true,
                });
                setPaginaActual(1);
              }}
            >
              <XMarkIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
              <span>Quitar Filtros</span>
            </button>
            <div className="relative">
            <button
            onClick={() => setShowDetailedColumns(!showDetailedColumns)}
            className={`px-2 py-2 mb-2 sm:px-4 py-2 rounded-full text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 border 
              bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-0 sm:space-x-0 lg:space-x-2`}
          >
            {showDetailedColumns ? 'Ocultar' : 'Mostrar variables'}
          </button>
            </div>
          </div>

          {/* Sección de Fechas y Descarga */}
          <div className="flex flex-row items-center space-x-4">
            {/* Contenedor Flex para alinear horizontalmente */}
            <div className="flex flex-row space-x-2 mb-2">
              {/* Reemplazar <input type="date"> con DatePicker */}
              <DatePicker
                selectedDate={fechaDesde}
                onDateChange={setFechaDesde}
                placeholder="Desde"
                isDarkMode={isDarkMode}
              />
              <span className={isDarkMode ? 'text-white mx-2' : 'text-gray-800 mx-2'}>-</span>
              <DatePicker
                selectedDate={fechaHasta}
                onDateChange={setFechaHasta}
                placeholder="Hasta"
                isDarkMode={isDarkMode}
              />
            </div>
            {/* Componente Formulario para descargar el PDF */}
            <Formulario
              comentariosFiltrados={filteredComentarios}
              columns={columnasClasificados}
              formatData={formatData}
              fileName="comentarios_clasificados.pdf"
              pdfTitle="Comentarios Clasificados"
              className="w-auto"
            />
          </div>
        </div>

        {/* Vista de Tabla para Pantallas Grandes */}
        <div className="overflow-x-auto w-full hidden sm:block mt-6">
          <table className={`min-w-full table-fixed ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg border-collapse`}>
            <thead>
              <tr>
                <th className={`px-6 py-4 text-left font-medium border-b
                ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                  Comentario
                </th>
                {showDetailedColumns && (
                  <>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      PR
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      T
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      E.Privacidad
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      PI
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      PF
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
                    ${isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                      OI
                    </th>
                    <th className={`px-2 py-4 text-left font-medium border-b 
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
                  <td colSpan={totalColumns}>
                    <Cargando />
                  </td>
                </tr>
              ) : currentComentarios.length > 0 ? (
                currentComentarios.map((comentario, index) => (
                  <tr key={index} className={`border-b ${isDarkMode
                    ? 'border-gray-700' : 'border-b border-gray-200'
                    } 
                  ${index % 2 === 0
                      ? (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      : (isDarkMode ? 'bg-gray-850' : 'bg-gray-50')
                    }`}>
                    <td className={`px-6 py-4 max-w-xs break-all overflow-ellipsis
                    ${isDarkMode
                        ? 'text-gray-300'
                        : 'text-gray-900'
                      }`}>
                      {truncateComentario(comentario.comentario.comentario)}
                    </td>
                    {showDetailedColumns && (
                      <>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.intensidadPrivacidad}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.elementoTiempo}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.empatiaPrivacidad}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.interesPublico}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.caracterPersonaPublico}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.origenInformacion}</td>
                        <td className={`px-2 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{comentario.comentario.empatiaExpresion}</td>
                      </>
                    )}
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <span
                        className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
                        ${getBadgeColor(comentario.comentario.gravedad)}
                        ${isDarkMode ? 'bg-opacity-20' : ''}
                      `}>
                        {mapGravedad(
                          comentario.comentario.gravedad)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 max-w-xs break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {comentario.comentario.sourceUrl || 'Sin sitio web'}
                    </td>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {isValid(parseISO(comentario.fechaClasificacion))
                        ? format(parseISO(comentario.fechaClasificacion), 'dd-MM-yyyy', { locale: es })
                        : "Fecha Inválida"}
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => confirmarEliminarComentario(comentario)}
                        className={`
                          ${isDarkMode
                            ? 'text-gray-400 hover:text-red-400' 
                            : 'text-gray-500 hover:text-red-500'
                          } cursor-pointer`}
                        aria-label="Eliminar comentario"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => editarComentario(comentario)}
                        className={`
                          ${isDarkMode
                            ? 'text-gray-400 hover:text-blue-400' 
                            : 'text-gray-500 hover:text-blue-500'
                          } cursor-pointer`}
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
                <div key={index} className={`w-full border p-4 rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${getBadgeColor(comentario.comentario.gravedad)}`}></div>
                        <span className="ml-2 font-medium truncate">{comentario.comentario.sourceUrl || 'Sin sitio web'}</span>
                      </div>
                      <div className="text-sm">
                        {isValid(parseISO(comentario.fechaClasificacion))
                          ? format(parseISO(comentario.fechaClasificacion), "dd-MM-yyyy", { locale: es })
                          : "Fecha Inválida"
                        }
                      </div>
                    </div>
                    <div className="text-sm break-all">
                      {truncateComentario(comentario.comentario.comentario, 100)}
                    </div>
                    {/* Agregamos el estado del comentario rodeado por el mismo color que en la vista de escritorio */}
                    <div className="mt-2">
                      <span
                        className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
                        ${getBadgeColor(comentario.comentario.gravedad)}
                        ${isDarkMode ? 'bg-opacity-20' : ''}
                      `}>
                        {mapGravedad(
                          comentario.comentario.gravedad
                        )}
                      </span>
                    </div>
                    {showDetailedColumns && (
                      <div className="flex flex-col space-y-1">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">PR:</span>
                          <span>{comentario.comentario.intensidadPrivacidad}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">T:</span>
                          <span>{comentario.comentario.elementoTiempo}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">E.Privacidad:</span>
                          <span>{comentario.comentario.empatiaPrivacidad}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">PI:</span>
                          <span>{comentario.comentario.interesPublico}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">PF:</span>
                          <span>{comentario.comentario.caracterPersonaPublico}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">OI:</span>
                          <span>{comentario.comentario.origenInformacion}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className="font-semibold">E.Libertad:</span>
                          <span>{comentario.comentario.empatiaExpresion}</span>
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
          <>
            {/* Fondo oscuro */}
            <div
              className={`fixed inset-0 z-20 ${isDarkMode
                ? 'bg-gray-900 bg-opacity-70'
                : 'bg-gray-800 bg-opacity-50'}`}
            ></div>
            <div className={`fixed right-0 top-0 h-screen w-full z-30 shadow-lg p-6 border-l overflow-y-auto sm:w-[430px]
          ${isDarkMode
                ? 'bg-gray-800 text-white border-l-gray-700'
                : 'bg-white text-gray-800 border-l-gray-300'
              }`}
              ref={puntuacionRef}>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">
                  Edición de clasificación de comentario
                </h2>
                <button
                  onClick={cerrarBarraEdicion}
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
              <p>{comentarioSeleccionado?.comentario.comentario}</p>

              <div className="mt-4">
                {/* Interferencia en la Privacidad */}
                <label className="block mt-2">
                  Interferencia en la Privacidad (1-3):
                  <input
                    type="number"
                    min="1"
                    max="3"
                    name="intensidadPrivacidad"
                    value={puntuacion.intensidadPrivacidad}
                    onChange={handleInputChange}
                    placeholder="PR"
                    className={`border rounded w-full mt-1 p-1 
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Grado de interferencia en la privacidad. Valor de 1 a 3.
                </p>

                {/* Tiempo */}
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
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Tiempo relacionado con la información (antigüedad). Valor de 0 a 1.
                </p>

                {/* Empatía hacia la Privacidad */}
                <label className="block mt-4">
                  Empatía hacia la privacidad (0-1):
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    name="empatiaPrivacidad"
                    value={puntuacion.empatiaPrivacidad}
                    onChange={handleInputChange}
                    placeholder="E.Privacidad"
                    className={`border rounded w-full mt-1 p-1 
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Empatía hacia la privacidad de la persona. Valor de 0 a 1.
                </p>

                {/* Interés Público */}
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
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Nivel de interés público sobre el asunto. Valor de 1 a 3.
                </p>

                {/* Figura Pública */}
                <label className="block mt-4">
                  Figura pública (0-3):
                  <input
                    type="number"
                    min="0"
                    max="3"  // Rango ajustado a 3
                    name="caracterPersonaPublico"
                    value={puntuacion.caracterPersonaPublico}
                    onChange={handleInputChange}
                    placeholder="PF"
                    className={`border rounded w-full mt-1 p-1 
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Indica si es una figura pública sobre el asunto. Valor de 0 a 3.
                </p>

                {/* Origen de la Información */}
                <label className="block mt-4">
                  Origen de la información (-0.75 - 0):
                  <input
                    type="number"
                    min="-0.75"  // Rango ajustado a -0.75
                    max="0"
                    name="origenInformacion"
                    placeholder="OI"
                    step={0.05}
                    value={puntuacion.origenInformacion}
                    onChange={handleInputChange}
                    className={`border rounded w-full mt-1 p-1 
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Origen de la información, si es legal o cuestionable. Valor de -0.75 a 0.
                </p>

                {/* Empatía hacia la Libertad de Expresión */}
                <label className="block mt-4">
                  Empatía hacia la libertad de expresión (0-1):
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    name="empatiaExpresion"
                    value={puntuacion.empatiaExpresion}
                    onChange={handleInputChange}
                    placeholder="E.Libertad"
                    className={`border rounded w-full mt-1 p-1 
        ${isDarkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                </label>
                <p className={`text-sm mt-1 ${isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-500'
                  }`}>
                  Empatía hacia la libertad de expresión. Valor de 0 a 1.
                </p>
              </div>

              <div className="flex mt-6 justify-between">
                <button
                  onClick={cerrarBarraEdicion}
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
          </>
        )}
      </div>
    </div>
  );
}
