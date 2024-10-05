import React, { useState, useRef, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import api from "../services/axios";
import { truncateComentario } from "../utils/truncarComentario";
import { format, parseISO } from "date-fns";
import Calendario from './Objects/Calendario';
import Paginacion from "./Objects/Paginacion";

export default function ComentariosPendientes() {
  const [comentarios, setComentarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1); // Estado para la página actual
  const [comentariosPorPagina] = useState(10); // Número de comentarios por página
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [comentariosFiltrados, setComentariosFiltrados] = useState([]);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [isCalendarOpenDesde, setIsCalendarOpenDesde] = useState(false);
  const [isCalendarOpenHasta, setIsCalendarOpenHasta] = useState(false);
  const [selectedDateDesde, setSelectedDateDesde] = useState("");
  const [selectedDateHasta, setSelectedDateHasta] = useState("");
  const [mostrarBarraClasificacion, setMostrarBarraClasificacion] =
    useState(false); // Estado para mostrar barra de clasificación
  const calendarDesdeRef = useRef(null);
  const calendarHastaRef = useRef(null);
  const [barraClasificacionVisible, setBarraClasificacionVisible] =
    useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);

  const clasificarComentario = (comentario) => {
    setComentarioSeleccionado(comentario);
    setBarraClasificacionVisible(true);
  };

  const defaultComentarios = [
    {
      autor: "Desconocido",
      comentario: "No estoy de acuerdo.",
      sourceUrl: "example.com",
      fechaScraping: "2024-09-23",
    },
    {
      autor: "Desconocido",
      comentario: "Me encanta esta publicacion.",
      sourceUrl: "example2.com",
      fechaScraping: "2024-09-22",
    },
    {
      autor: "Desconocido",
      comentario: "Buen trabajo, seguir asi.",
      sourceUrl: "example3.com",
      fechaScraping: "2024-09-21",
    },
  ];

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await api.get("/comments/get-all");
        setComentarios(response.data.data); //el slice provisorio
      } catch (err) {
        //este set es para que no se tenga que inciar el server para ver comentarios Pendientes , es mas que nada para evitar errores pero eso solo para produccion
        setComentarios(defaultComentarios);
        console.log("Error al obtener los comentarios", err);
      }
    };

    fetchComentarios();
  }, []);


  // Paginación: Cálculo de los comentarios a mostrar en función de la página
  const indiceUltimoComentario = paginaActual * comentariosPorPagina;
  const indicePrimerComentario = indiceUltimoComentario - comentariosPorPagina;
  const comentariosAMostrar =
  comentariosFiltrados.length > 0
    ? comentariosFiltrados.slice(
        indicePrimerComentario,
        indiceUltimoComentario
      )
    : comentarios.slice(indicePrimerComentario, indiceUltimoComentario);
  const totalPaginas = Math.ceil(
    (comentariosFiltrados.length > 0
      ? comentariosFiltrados.length
      : comentarios.length) / comentariosPorPagina,
  );

  useEffect(() => {
    filtrarComentarios();
  }, [fechaDesde, fechaHasta, comentarios]); 

  const filtrarComentarios = () => {
    if (!fechaDesde && !fechaHasta) {
      setComentariosFiltrados(comentarios);
      return;
    }
  
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;
  
    const comentariosFiltrados = comentarios.filter((comentario) => {
      const fechaComentario = new Date(comentario.fechaScraping);
      if (desde && hasta) {
        return fechaComentario >= desde && fechaComentario <= hasta;
      } else if (desde) {
        return fechaComentario >= desde;
      } else if (hasta) {
        return fechaComentario <= hasta;
      }
      return true;
    });
  
    setComentariosFiltrados(comentariosFiltrados); // Actualizar el estado con los comentarios filtrados
    console.log("Comentarios filtrados:", comentariosFiltrados); // Verifica el filtrado
  };
  
  const eliminarFiltro = () => {
    setFechaDesde("");
    setFechaHasta("");
    setSelectedDateDesde("");
    setSelectedDateHasta("");
    setComentariosFiltrados([]); // Restablecer a todos los comentarios
  };

  const toggleCalendarDesde = () => {
    setIsCalendarOpenDesde(!isCalendarOpenDesde);
  };
  
  const toggleCalendarHasta = () => {
    setIsCalendarOpenHasta(!isCalendarOpenHasta);
  };
  
  const handleDateSelectDesde = (date) => {
    setFechaDesde(format(date, "yyyy-MM-dd"));  // Guarda la fecha seleccionada en formato YYYY-MM-DD
    setIsCalendarOpenDesde(false);  // Cierra el calendario después de seleccionar la fecha
  };
  
  const handleDateSelectHasta = (date) => {
    setFechaHasta(format(date, "yyyy-MM-dd"));
    setIsCalendarOpenHasta(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpenDesde, isCalendarOpenHasta]);

  const toggleBarraClasificacion = () => {
    setMostrarBarraClasificacion(!mostrarBarraClasificacion);
  };

  return (
    <div className="p-8 flex flex-col">
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Comentarios pendientes
        </h2>

        {/* Contenedor principal que contiene el botón Fecha y el conjunto de inputs y botón Descargar */}
        <div className="flex justify-between items-center mb-4">
          {/* Botón Fecha alineado a la izquierda */}
          <button
            onClick={() => setMostrarSelectorFecha(!mostrarSelectorFecha)}
            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm" 
          >
            <PlusIcon className="w-5 h-5 text-gray-500" />
            <span>Fecha</span>
          </button>

          {/* Inputs de fecha y botón Descargar alineados a la derecha */}
          <div className="flex items-center space-x-2">
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
            <button className="bg-black text-white px-4 py-2 rounded-md">
              Descargar
            </button>
          </div>

          {mostrarSelectorFecha && (
            <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10" style={{ marginTop: '220px' }}> {/*Aqui es donde pones el margen para que no tape la fecha*/}
              <div className="rounded-md bg-white shadow-xs">
                <div className="py-1">
                  <button
                    onClick={toggleCalendarDesde}
                    className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                  >
                    Desde {selectedDateDesde && `(${selectedDateDesde})`}
                  </button>
                  {isCalendarOpenDesde && (
                    <Calendario onDateSelect={handleDateSelectDesde} />
                  )}
                  <button
                    onClick={toggleCalendarHasta}
                    className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                  >
                    Hasta {selectedDateHasta && `(${selectedDateHasta})`}
                  </button>
                  {isCalendarOpenHasta && (
                    <Calendario onDateSelect={handleDateSelectHasta} />
                  )}
                </div>
                <button
                  onClick={filtrarComentarios}
                  className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                >
                  Filtrar
                </button>
                <button
                  onClick={eliminarFiltro}
                  className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-100"
                >
                  Eliminar Filtro
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-full bg-white shadow-md rounded-lg border-collapse">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Comentario</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Sitio web</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Fecha de clasificación</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {comentariosAMostrar.map((comentario, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-4 text-left font-medium text-gray-500">
                    {truncateComentario(comentario.comentario)}
                  </td>
                  <td className="p-2">{comentario.sourceUrl}</td> {/* Asegúrate de que use la URL correcta */}
                  <td className="p-2">
                    {format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")}
                  </td>
                  <td className="p-2">
                    <button
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg"
                      onClick={() => clasificarComentario(comentario)}
                    >
                      Clasificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onPageChange={setPaginaActual}
          />
      </div>

      {/* Barra lateral para clasificación */}
      {barraClasificacionVisible && (
        <div className="fixed right-[0px] top-0 h-screen w-[430px] bg-white shadow-lg p-6 opacity-100 border-l border-l-gray-300 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">
              Clasificación manual de comentario
            </h2>
            <button
              onClick={() => setBarraClasificacionVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              &#10005; {/* Este es el símbolo de la X */}
            </button>
          </div>
          <br />
          <p>
            <strong>Comentario:</strong>
          </p>
          <p>{comentarioSeleccionado?.texto}</p>

          <div className="mt-4">
            <label className="block mt-2">
              Privacidad intrusiva:
              <input
                type="number"
                min="1"
                max="3"
                placeholder="PR"
                className="border rounded w-full mt-1 p-1"
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
                placeholder="T"
                step="0.1"
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Tiempo relacionado con la información (antigüedad). Valor de 0 a
              1.
            </p>

            <label className="block mt-4">
              Empatía hacia la privacidad (0-1):
              <input
                type="number"
                min="0"
                max="1"
                placeholder="E.Privacidad"
                className="border rounded w-full mt-1 p-1"
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
                placeholder="IP"
                className="border rounded w-full mt-1 p-1"
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
                placeholder="PF"
                className="border rounded w-full mt-1 p-1"
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
                placeholder="OI"
                step={0.05}
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Origen de la información, si es legal o cuestionable. Valor de
              -0.75 a 0.
            </p>

            <label className="block mt-4">
              Empatía hacia la libertad de expresión (0-1):
              <input
                type="number"
                min="0"
                max="1"
                placeholder="E.Libertad"
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <p className="text-gray-500 text-sm mt-1">
              Empatía hacia la libertad de expresión. Valor de 0 a 1.
            </p>
          </div>

          <div className="flex mt-6 justify-between">
            <button
              onClick={() => setBarraClasificacionVisible(false)}
              className="bg-red-600 text-white py-2 px-4 rounded w-[48%]"
            >
              Cancelar
            </button>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded w-[48%]"
              /*onClick={ Aquí puedes agregar la funcionalidad para completar }*/
            >
              Completar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
