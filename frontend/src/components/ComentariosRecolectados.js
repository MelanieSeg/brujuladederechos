// src/ComentariosRecolectados.js///////

import React, { useState, useRef, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from '@heroicons/react/24/outline';
import api from "../services/axios";
import { format, parseISO } from "date-fns";
import { truncateComentario } from "../utils/truncarComentario";
import Calendario from "./Objects/Calendario";
import Paginacion from "./Objects/Paginacion";

// **Importación añadida para el componente Formulario**
import Formulario from "./Objects/Formulario";

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


  //NOTA: los comentarios recolectados van a ser los mismo que los pendientes por ahora, esto hasta que este la clasificacion manual
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await api.get("/comments/get-all-comments-scraped");
        setComentarios(response.data.data);
      } catch (err) {
        //este set es para que no se tenga que inciar el server para ver comentarios Pendientes , es mas que nada para evitar errores pero eso solo para produccion
        setComentarios(defaultComentarios);
        console.log("Error al obtener los comentarios", err);
      }
    };

    fetchComentarios();
  }, []);


  console.log(comentarios)

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
    const formattedDate = date.toISOString().split("T")[0]; // Formateamos la fecha como "YYYY-MM-DD"
    if (selectedDateType === "desde") {
      setFechaDesde(formattedDate);
    } else if (selectedDateType === "hasta") {
      setFechaHasta(formattedDate);
    }
    setIsCalendarOpen(false); // Cerramos el calendario después de seleccionar la fecha
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

  const filteredComments = comentarios.filter((comentario) => {
    const estadoMatch = selectedEstado[comentario.estado]; // Ahora debería coincidir correctamente
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

  return (
    <div className="p-8 bg-[#FAF9F8] flex-1 relative">
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Comentarios recolectados
        </h2>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {/* Date button with dropdown */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={toggleDateDropdown}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
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

            {/* Estado button with dropdown */}
            <div className="relative">
              <button
                ref={gravedadButtonRef}
                onClick={handleGravedadClick}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm"
              >
                <PlusIcon className="w-5 h-5 text-gray-500" />
                <span>Estado</span>
              </button>
              {isDropdownOpen && renderDropdown()}
            </div>
          </div>

          {/* Date inputs and Download button */}
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white"
            />
            <span>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 bg-white"
            />
            {/* **Componente Formulario para descargar el PDF** */}
            <Formulario comentariosFiltrados={filteredComments} />
          </div>
        </div>

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
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {currentComments.map((comentario, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-6 py-4">{truncateComentario(comentario.comentario)}</td>
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
                <td className="px-6 py-4">{format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")}</td>
                <td className="px-6 py-4 text-right">
                  <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <Paginacion
          paginaActual={currentPage}
          totalPaginas={totalPages}
          onPageChange={handlePageClick}  // Este callback manejará el cambio de página
        />
      </div>
    </div>
  );
}
