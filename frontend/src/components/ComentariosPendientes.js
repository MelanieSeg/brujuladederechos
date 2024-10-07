import React, { useState, useRef, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import api from "../services/axios";
import { truncateComentario } from "../utils/truncarComentario";
import { format, parseISO, isValid } from "date-fns";
import Calendario from './Objects/Calendario';
import Paginacion from "./Objects/Paginacion";

export default function ComentariosPendientes() {
  const [comentarios, setComentarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [comentariosPorPagina] = useState(10);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [comentariosFiltrados, setComentariosFiltrados] = useState([]);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [calendarioTipo, setCalendarioTipo] = useState(null);
  const [barraClasificacionVisible, setBarraClasificacionVisible] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const fechaButtonRef = useRef(null);
  const calendarioRef = useRef(null);

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await api.get("/comments/get-all");
        setComentarios(response.data.data);
        setComentariosFiltrados(response.data.data);
      } catch (err) {
        console.error("Error al obtener los comentarios", err);
      }
    };

    fetchComentarios();
  }, []);

  useEffect(() => {
    filtrarComentarios();
  }, [fechaDesde, fechaHasta, comentarios]);

  const filtrarComentarios = () => {
    if (!fechaDesde && !fechaHasta) {
      setComentariosFiltrados(comentarios);
      return;
    }

    const desde = fechaDesde ? parseISO(fechaDesde) : null;
    const hasta = fechaHasta ? parseISO(fechaHasta) : null;

    const filtrados = comentarios.filter((comentario) => {
      const fechaComentario = parseISO(comentario.fechaScraping);
      if (!isValid(fechaComentario)) return false;
      
      if (desde && hasta) {
        return fechaComentario >= desde && fechaComentario <= hasta;
      } else if (desde) {
        return fechaComentario >= desde;
      } else if (hasta) {
        return fechaComentario <= hasta;
      }
      return true;
    });

    setComentariosFiltrados(filtrados);
    setPaginaActual(1);
  };

  const indiceUltimoComentario = paginaActual * comentariosPorPagina;
  const indicePrimerComentario = indiceUltimoComentario - comentariosPorPagina;
  const comentariosAMostrar = comentariosFiltrados.slice(indicePrimerComentario, indiceUltimoComentario);
  const totalPaginas = Math.ceil(comentariosFiltrados.length / comentariosPorPagina);

  const eliminarFiltro = () => {
    setFechaDesde("");
    setFechaHasta("");
    setComentariosFiltrados(comentarios);
    setPaginaActual(1);
    setMostrarSelectorFecha(false);
    setMostrarCalendario(false);
    setCalendarioTipo(null);
  };

  const toggleCalendario = (tipo) => {
    if (calendarioTipo === tipo && mostrarCalendario) {
      setMostrarCalendario(false);
      setCalendarioTipo(null);
    } else {
      setMostrarCalendario(true);
      setCalendarioTipo(tipo);
      setMostrarSelectorFecha(false);
    }
  };

  const handleDateSelect = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    if (calendarioTipo === 'desde') {
      setFechaDesde(formattedDate);
      setMostrarSelectorFecha(true);
    } else if (calendarioTipo === 'hasta') {
      setFechaHasta(formattedDate);
    }
    setMostrarCalendario(false);
    setCalendarioTipo(null);
    setMostrarSelectorFecha(true);
  };


  const handleFechaDesdeChange = (e) => {
    setFechaDesde(e.target.value);
  };

  const handleFechaHastaChange = (e) => {
    setFechaHasta(e.target.value);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (fechaButtonRef.current && !fechaButtonRef.current.contains(event.target) &&
          calendarioRef.current && !calendarioRef.current.contains(event.target)) {
        setMostrarSelectorFecha(false);
        setMostrarCalendario(false);
        setCalendarioTipo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clasificarComentario = (comentario) => {
    setComentarioSeleccionado(comentario);
    setBarraClasificacionVisible(true);
  };

  return (
    <div className="p-8 flex flex-col">
      <div className="flex-grow">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Comentarios pendientes
        </h2>

        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <button
              ref={fechaButtonRef}
              onClick={() => setMostrarSelectorFecha(!mostrarSelectorFecha)}
              className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm" 
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span>Fecha</span>
            </button>

            {mostrarSelectorFecha && !mostrarCalendario && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => toggleCalendario('desde')}
                    className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                  >
                    Desde {fechaDesde && (
                      <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                        {fechaDesde}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => toggleCalendario('hasta')}
                    className="w-full text-left py-2 px-4 text-gray-800 hover:bg-gray-200"
                  >
                    Hasta {fechaHasta && (
                      <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                        {fechaHasta}
                      </span>
                    )}
                  </button>
                  <div className="border-t border-gray-200">
                  <button onClick={eliminarFiltro} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
                    Limpiar
                  </button>
                </div>
                </div>
              </div>
            )}

            {mostrarCalendario && (
              <div ref={calendarioRef} className="absolute left-0 mt-2 z-20">
                <Calendario onDateSelect={handleDateSelect} />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={fechaDesde}
              onChange={handleFechaDesdeChange}
              className="border border-gray-300 rounded px-4 py-2 bg-white"
            />
            <span>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={handleFechaHastaChange}
              className="border border-gray-300 rounded px-4 py-2 bg-white"
            />
            <button className="bg-black text-white px-4 py-2 rounded-md">
              Descargar
            </button>
          </div>
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
                  <td className="px-6 py-4">
                    {truncateComentario(comentario.comentario)}
                  </td>
                  <td className="p-2">{comentario.sourceUrl}</td>
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
              &#10005;
            </button>
          </div>
          <br />
          <p>
            <strong>Comentario:</strong>
          </p>
          <p>{comentarioSeleccionado?.comentario}</p>

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
              Tiempo relacionado con la información (antigüedad). Valor de 0 a 1.
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
              Origen de la información, si es legal o cuestionable. Valor de -0.75 a 0.
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
            >
              Completar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}