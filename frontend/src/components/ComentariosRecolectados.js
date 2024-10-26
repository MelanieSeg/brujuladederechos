// src/ComentariosRecolectados.js

import React, { useState, useRef, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../services/axios";
import { format, parseISO, isValid } from "date-fns";
import { truncateComentario } from "../utils/truncarComentario";
import Calendario from "./Objects/Calendario";
import Paginacion from "./Objects/Paginacion";
import Formulario from "./Objects/Formulario";
import Cargando from "./Objects/Cargando";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ComentariosRecolectados() {
  const [defaultComentarios] = useState([
    {
      comentario: "No me gustó mucho",
      estado: "CLASIFICADO",
      sourceUrl: "latercera.com",
      fechaScraping: "2024-07-04",
    },
    {
      comentario: "Podría ser mejor.",
      estado: "CLASIFICADO",
      sourceUrl: "latercera.com",
      fechaScraping: "2024-07-04",
    },
    {
      comentario: "No estoy satisfecho",
      estado: "PENDIENTE_CLASIFICACION",
      sourceUrl: "latercera.com",
      fechaScraping: "2024-07-04",
    },
    {
      comentario: "Este es el comentario 11",
      estado: "CLASIFICADO",
      sourceUrl: "example.com",
      fechaScraping: "2024-07-04",
    },
    {
      comentario: "Este es el comentario 12",
      estado: "PENDIENTE_CLASIFICACION",
      sourceUrl: "example.com",
      fechaScraping: "2024-07-05",
    },
    {
      comentario: "Este es el comentario 13",
      estado: "PENDIENTE_CLASIFICACION",
      sourceUrl: "example.com",
      fechaScraping: "2024-07-06",
    },
    // ... (más comentarios)
  ]);

  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const [password, setPassword] = useState("");
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
        return "bg-gray-300 text-gray-800";
      case "CLASIFICADO":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-500 text-white";
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
      <div ref={dropdownRef} className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1">
          <div className="px-4 py-2 text-sm text-gray-700 font-semibold">Prioridad</div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEstado.PENDIENTE_CLASIFICACION}
                onChange={() => handleEstadoChange("PENDIENTE_CLASIFICACION")}
                className="form-checkbox text-gray-500"
              />
              <span className="text-gray-700">Pendiente</span>
            </label>
          </div>
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEstado.CLASIFICADO}
                onChange={() => handleEstadoChange("CLASIFICADO")}
                className="form-checkbox text-gray-500"
              />
              <span className="text-gray-700">Clasificado</span>
            </label>
          </div>
          <div className="border-t border-gray-200">
            <button onClick={limpiarSeleccion} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
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
    setPassword("");
    setReason("");
  };

  const manejarEliminarComentario = () => {
    const now = new Date();
    const formattedDate = format(now, "dd-MM-yyyy HH:mm:ss");
    const toastId = toast.success(
      <div className="flex flex-col">
        <div>Comentario borrado exitosamente.</div>
        <div className="text-sm text-gray-600">Fecha y hora: {formattedDate}</div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="mt-2 text-blue-500 underline text-sm"
        >
          Deshacer
        </button>
      </div>,
      {
        position: "top-right", // Corregido de toast.POSITION.TOP_RIGHT a "top-right"
        autoClose: 5000, // Duración en milisegundos
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
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
              // No es requerido para permitir entradas vacías
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
              // No es requerido para permitir entradas vacías
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

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      {/* Contenedor de Toasts */}
      <ToastContainer />

      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Comentarios recolectados
        </h2>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {/* Botón de Fecha con Dropdown */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={toggleDateDropdown}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:bg-gray-100"
              >
                <PlusIcon className="w-5 h-5 text-gray-500" />
                <span>Fecha</span>
              </button>
              {isDateDropdownOpen && (
                <div
                  ref={dateDropdownRef}
                  className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-20"
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                    onClick={() => handleDateOptionClick("desde")}
                  >
                    Desde 
                    {fechaDesde && (
                      <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                        {fechaDesde}
                      </span>
                    )}
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                    onClick={() => handleDateOptionClick("hasta")}
                  >
                    Hasta {fechaHasta && (
                      <span className="ml-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full ">
                        {fechaHasta}
                      </span>
                    )}
                  </button>
                  <div className="border-t border-gray-200">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                      onClick={() => handleDateOptionClick("eliminar")}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              {isCalendarOpen && (
                <div className="absolute left-0 mt-2 calendario-container z-50">
                  <Calendario onDateSelect={handleDateClick} />
                </div>
              )}
            </div>

            {/* Botón de Estado con Dropdown */}
            <div className="relative">
              <button
                ref={gravedadButtonRef}
                onClick={handleGravedadClick}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:bg-gray-100"
              >
                <PlusIcon className="w-5 h-5 text-gray-500" />
                <span>Estado</span>
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
              className="border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <table className="min-w-full bg-white shadow-md rounded-lg border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  Comentario
                </th>
                <th className="px-12 py-4 text-left font-medium text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  Sitio Web
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Acciones</th>
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
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-6 py-4 max-w-xs">
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
                    <td className="px-6 py-4">{comentario.sourceUrl}</td>
                    <td className="px-6 py-4">
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
                        <TrashIcon className="w-5 h-5" />
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
