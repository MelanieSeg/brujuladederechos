import React, { useState, useRef, useEffect, useContext } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../services/axios";
import { format, parseISO, isValid } from "date-fns";
import { truncateComentario } from "../utils/truncarComentario";
import Calendario from "./Objects/Calendario";
import Paginacion from "./Objects/Paginacion";
import Formulario from "./Objects/Formulario";
import Cargando from "./Objects/Cargando";
import { Toast, showSuccess} from "./Objects/Toast";
import { ThemeContext } from '../utils/ThemeContext';

export default function ComentariosRecolectados() {
  const [defaultComentarios] = useState([
    
  ]);

  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState({
    PENDIENTE_CLASIFICACION: true,
    CLASIFICADO: true,
  });
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDateType, setSelectedDateType] = useState("");
  const commentsPerPage = 10;

  const dropdownRef = useRef(null);
  const gravedadButtonRef = useRef(null);
  const dateDropdownRef = useRef(null);
  const dateButtonRef = useRef(null);
  const calendarRef = useRef(null);

  // Estados para manejar la eliminación
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await api.get("/comments/get-all-comments-scraped");
        setComentarios(response.data.data);
      } catch (err) {
        setComentarios(defaultComentarios);
        console.log("Error al obtener los comentarios", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComentarios();
  }, [defaultComentarios]);

  console.log(comentarios);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        gravedadButtonRef.current &&
        !gravedadButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        isDateDropdownOpen &&
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(event.target)
      ) {
        setIsDateDropdownOpen(false);
      }
      if (
        isCalendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isDateDropdownOpen, isCalendarOpen]);

  const handleGravedadClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleEstadoChange = (estado) => {
    setSelectedEstado((prevState) => ({
      ...prevState,
      [estado]: !prevState[estado],
    }));
  };

  const limpiarSeleccion = () => {
    setSelectedEstado({
      PENDIENTE_CLASIFICACION: false,
      CLASIFICADO: false,
    });
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case "PENDIENTE_CLASIFICACION":
        return isDarkMode 
          ? "bg-gray-600 text-gray-200" 
          : "bg-gray-300 text-gray-800";
      case "CLASIFICADO":
        return isDarkMode 
          ? "bg-gray-700 text-gray-200" 
          : "bg-gray-200 text-gray-800";
      default:
        return isDarkMode 
          ? "bg-gray-500 text-white" 
          : "bg-gray-500 text-white";
    }
  };

  const toggleDateDropdown = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
    setIsCalendarOpen(false);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDateOptionClick = (option) => {
    if (option === "desde" || option === "hasta") {
      setSelectedDateType(option);
      setIsCalendarOpen(true);
    } else if (option === "eliminar") {
      setFechaDesde("");
      setFechaHasta("");
      setIsDateDropdownOpen(false);
      setIsCalendarOpen(false);
    }
  };

  const handleDateClick = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (selectedDateType === "desde") {
      setFechaDesde(formattedDate);
    } else if (selectedDateType === "hasta") {
      setFechaHasta(formattedDate);
    }
    setIsCalendarOpen(false);
  };

  const renderDropdown = () => {
    return isDropdownOpen && (
      <div 
        ref={dropdownRef} 
        className={`absolute mt-2 w-56 rounded-md shadow-lg ring-1 z-10 
          ${isDarkMode 
            ? 'bg-gray-800 ring-gray-700 text-white' 
            : 'bg-white ring-black ring-opacity-5 text-gray-700'
          }`}
      >
        <div className="py-1">
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEstado.PENDIENTE_CLASIFICACION}
                onChange={() => handleEstadoChange("PENDIENTE_CLASIFICACION")}
                className={`form-checkbox 
                  ${isDarkMode 
                    ? 'text-indigo-400 bg-gray-700 border-gray-600' 
                    : 'text-gray-500'
                  }`}
              />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                Pendiente
              </span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEstado.CLASIFICADO}
                onChange={() => handleEstadoChange("CLASIFICADO")}
                className={`form-checkbox 
                  ${isDarkMode 
                    ? 'text-indigo-400 bg-gray-700 border-gray-600' 
                    : 'text-gray-500'
                  }`}
              />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                Clasificado
              </span>
            </label>
          </div>
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button 
              onClick={limpiarSeleccion} 
              className={`block w-full text-left px-4 py-2 text-sm 
                ${isDarkMode 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    { title: "Comentario", width: 200, halign: 'left' },
    { title: "Estado", width: 60, halign: 'center' },
    { title: "Sitio Web", width: 120, halign: 'left' },
    { title: "Fecha", width: 140, halign: 'center' },
  ];

  const formatData = (comentario) => {
    const comentarioTexto = comentario.comentario;
    const estado =
      comentario.estado === "PENDIENTE_CLASIFICACION" ? "Pendiente" : "Clasificado";
    const sitioWeb = comentario.sourceUrl;
    const fecha = isValid(parseISO(comentario.fechaScraping))
      ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
      : "Fecha Inválida";

    return [comentarioTexto, estado, sitioWeb, fecha];
  };

  const filteredComments = comentarios.filter((comentario) => {
    const estadoMatch = selectedEstado[comentario.estado];
    const dateMatch =
      (!fechaDesde || format(parseISO(comentario.fechaScraping), "yyyy-MM-dd") >= fechaDesde) &&
      (!fechaHasta || format(parseISO(comentario.fechaScraping), "yyyy-MM-dd") <= fechaHasta);
    return estadoMatch && dateMatch;
  });

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // Funciones para manejar la eliminación de comentarios
  const confirmarEliminarComentario = (comentario) => {
    setComentarioAEliminar(comentario);
    setMostrarModalEliminar(true);
    setReason("");
  };

  const manejarEliminarComentario = () => {
    //mas adelante se implementara
    setComentarios((prevComentarios) =>
      prevComentarios.filter((c) => c.id !== comentarioAEliminar.id)
    );

    setMostrarModalEliminar(false);
    setComentarioAEliminar(null);
    setReason("");

    // Mostrar toast de éxito utilizando la función importada
    showSuccess("Comentario borrado exitosamente.", true, () => {
      // mas adelante se implementara
    });
  };

  const manejarCancelarEliminar = () => {
    setMostrarModalEliminar(false);
    setComentarioAEliminar(null);
    setReason("");
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
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md 
                ${isDarkMode 
                  ? 'bg-red-700 text-white hover:bg-red-600' 
                  : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`p-8 min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Contenedor de Toasts */}
      <Toast />

      <div className="flex-grow">
        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Comentarios recolectados
        </h2>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {/* Botón de Fecha con Dropdown */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={toggleDateDropdown}
                className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
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
              }`}  />
                <span>Fecha</span>
                </div>
              </button>
              {isDateDropdownOpen && (
                <div
                  ref={dateDropdownRef}
                  className={`absolute mt-2 w-48 rounded-md shadow-lg z-20 
                    ${isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-white' 
                      : 'bg-white text-gray-700'
                    }`}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 text-base 
                      ${isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    onClick={() => handleDateOptionClick("desde")}
                  >
                    Desde 
                    {fechaDesde && (
                      <span className={`ml-2 mx-2 text-sm px-2 py-1 rounded-full 
                        ${isDarkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {fechaDesde}
                      </span>
                    )}
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-base 
                      ${isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    onClick={() => handleDateOptionClick("hasta")}
                  >
                    Hasta {fechaHasta && (
                      <span className={`ml-2 text-sm px-2 py-1 rounded-full 
                        ${isDarkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {fechaHasta}
                      </span>
                    )}
                  </button>
                  <div className={`border-t 
                  ${isDarkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                  }`}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm 
                        ${isDarkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      onClick={() => handleDateOptionClick("eliminar")}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              {isCalendarOpen && (
                <div ref={calendarRef} className="absolute left-0 mt-2 calendario-container z-50">
                  <Calendario onDateSelect={handleDateClick} />
                </div>
              )}
            </div>

            {/* Botón de Estado con Dropdown */}
            <div className="relative">
              <button
                ref={gravedadButtonRef}
                onClick={handleGravedadClick}
                className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
                  ${isDropdownOpen 
                    ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                <div className="flex items-center space-x-2">
                <PlusIcon className={`w-5 h-5 ${
                isDarkMode 
                  ? 'text-white group-hover:text-gray-200' 
                  : 'text-gray-500'
              }`}  />
                <span>Estado</span>
                </div>
              </button>
              {isDropdownOpen && renderDropdown()}
            </div>
          </div>

          {/* Inputs de Fecha y Botón de Descarga */}
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className={`border rounded px-4 py-2 focus:outline-none focus:ring-2 
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'}`}
            />
            <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className={`border rounded px-4 py-2 focus:outline-none focus:ring-2 
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'}`}
            />
            {/* Componente Formulario para descargar el PDF */}
            <Formulario 
              comentariosFiltrados={filteredComments} 
              columns={columns}
              formatData={formatData}
              fileName="comentarios_recolectados.pdf"
            />
          </div>
        </div>

        {/* Tabla de Comentarios */}
        <div className="overflow-x-auto">
          <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg border-collapse`}>
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {['Comentario', 'Estado', 'Sitio web', 'Fecha', 'Acciones'].map((header) => (
                <th 
                  key={header} 
                  className={`px-6 py-4 text-left font-medium border-b
                    ${isDarkMode 
                      ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-300'
                    }`}
                >
                  {header}
                </th>
              ))}
            </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <Cargando />
                  </td>
                </tr>
              ) : currentComments.length > 0 ? (
                currentComments.map((comentario, index) => (
                  <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <div className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {truncateComentario(comentario.comentario, 100)}
                      </div>
                    </td>
                    <td className="px-12 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(
                        comentario.estado
                      )}`}
                    >
                      {comentario.estado === "PENDIENTE_CLASIFICACION" ? 'Pendiente' : 'Clasificado'}
                    </span>
                  </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{comentario.sourceUrl}</td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {isValid(parseISO(comentario.fechaScraping)) 
                        ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy") 
                        : "Fecha Inválida"
                      }
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => confirmarEliminarComentario(comentario)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Eliminar comentario"
                      >
                        <TrashIcon className={`w-5 h-5 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-red-400' 
                        : 'text-gray-400 hover:text-red-500'
                    } cursor-pointer`} 
                  />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No hay comentarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <Paginacion
          paginaActual={currentPage}
          totalPaginas={totalPages}
          onPageChange={handlePageClick}
        />

        {/* Modal de Eliminación */}
        {mostrarModalEliminar && modalEliminarComentario}
      </div>
    </div>
  );
}
