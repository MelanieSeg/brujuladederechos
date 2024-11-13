import React, { useState, useRef, useEffect, useContext } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import api from "../services/axios";
import { truncateComentario } from "../utils/truncarComentario";
import { format, parseISO, isValid } from "date-fns";
import Calendario from './Objects/Calendario';
import Paginacion from "./Objects/Paginacion";
import { useAuth } from "../hooks/useAuth";
import Formulario from "./Objects/Formulario";
import Cargando from "./Objects/Cargando";
import { ThemeContext } from "../utils/ThemeContext";
import { Toast, showSuccess, showError } from "./Objects/Toast";

export default function ComentariosPendientes() {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultadoEvaluacion, setResultadoEvaluacion] = useState("");
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
  const [clasificacion, setClasificacion] = useState({
    intensidadPrivacidad: '',
    elementoTiempo: '',
    empatiaPrivacidad: '',
    interesPublico: '',
    caracterPersonaPublico: '',
    origenInformacion: '',
    empatiaExpresion: ''
  });
  const fechaButtonRef = useRef(null);
  const calendarioRef = useRef(null);

  useEffect(() => {
    const fetchComentarios = async () => {
      setLoading(true);
      try {
        const response = await api.get("/comments/get-all-comments-pending");
        setComentarios(response.data.data);
        setComentariosFiltrados(response.data.data);
      } catch (err) {
        console.error("Error al obtener los comentarios", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComentarios();
  }, []);

  console.log(comentarios)

  useEffect(() => {
    filtrarComentarios();
  }, [fechaDesde, fechaHasta, comentarios]);

  // Función para evaluar el comentario a través del endpoint
  const evaluarComentario = async (comentario) => {
    try {
      const response = await fetch('/api/comments/ibf/evaluar-comentario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comentario)
      });
      const data = await response.json();
      return data.mensaje; // Esto devolverá si el comentario debe ser moderado o aprobado
    } catch (error) {
      console.error("Error al evaluar el comentario:", error);
      return "Error al evaluar el comentario";
    }
  };

  // Manejador para evaluar un comentario específico
  const manejarEvaluacion = async (comentario) => {
    const mensaje = await evaluarComentario(comentario);
    setResultadoEvaluacion(mensaje); // Guarda el resultado en el estado para mostrarlo
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === "empatiaPrivacidad" || name === "empatiaExpresion") {
      parsedValue = parseFloat(value);
    } else if (name !== "notas") {
      parsedValue = parseInt(value, 10);
    }

    setClasificacion({ ...clasificacion, [name]: parsedValue });
  };

  const enviarClasificacion = async () => {
    try {
      const response = await api.post("/comments/clasificar", {
        comentarioScrapedId: comentarioSeleccionado.id,
        clasificadorId: user.id,
        intensidadPrivacidad: Number(clasificacion.intensidadPrivacidad),
        elementoTiempo: Number(clasificacion.elementoTiempo),
        empatiaPrivacidad: Number(clasificacion.empatiaPrivacidad),
        interesPublico: Number(clasificacion.interesPublico),
        caracterPersonaPublico: Number(clasificacion.caracterPersonaPublico),
        origenInformacion: Number(clasificacion.origenInformacion),
        empatiaExpresion: Number(clasificacion.empatiaExpresion),
        userId: user.id
      });

      console.log('Clasificación guardada:', response.data);

      if (response.status === 200) {
        setBarraClasificacionVisible(false);
        // Mostrar toast de éxito
        showSuccess("Comentario clasificado exitosamente.");
        // Resetear el formulario de clasificación
        setClasificacion({
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
      console.error("Error al guardar la clasificación", error);
      console.log("Respuesta del servidor:", error.response?.data);
      showError("Error al guardar la clasificación: " + (error.response?.data?.msg || error.message));
    }
  };

  const columnasPendientes = [
    {
      title: "Comentario",
      width: 250,
      halign: 'left',
    },
    {
      title: "Sitio Web",
      width: 150,
      halign: 'left',
    },
    {
      title: "Fecha",
      width: 100,
      halign: 'center',
    },
    {
      title: "Acciones",
      width: 100,
      halign: 'center',
    },
  ];

  const formatData = (comentario) => [
    comentario.comentario,
    comentario.sourceUrl,
    isValid(parseISO(comentario.fechaScraping))
      ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
      : "Fecha Inválida"
  ];

  return (
    <div className={`p-8 min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Contenedor de Toasts */}
      <Toast />

      <div className="flex-grow">
        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Comentarios pendientes
        </h2>

        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <button
              ref={fechaButtonRef}
              onClick={() => setMostrarSelectorFecha(!mostrarSelectorFecha)}
              className={`px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 border 
                ${mostrarSelectorFecha
                  ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  <div className="flex items-center space-x-2">
              <PlusIcon className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-500'}`} />
              <span>Fecha</span>
              </div>
            </button>

            {mostrarSelectorFecha && !mostrarCalendario && (
              <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10 
                ${isDarkMode 
                  ? 'bg-dark-bg border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
                }`}>
                <div className="py-1">
                  <button
                    onClick={() => toggleCalendario('desde')}
                    className={`block w-full text-left px-4 py-2 text-base 
                      ${isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}>
                    Desde {fechaDesde && (
                      <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                        {fechaDesde}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => toggleCalendario('hasta')}
                    className={`block w-full text-left px-4 py-2 text-base 
                      ${isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}>
                    Hasta {fechaHasta && (
                      <span className="ml-2 mx-2 bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded-full">
                        {fechaHasta}
                      </span>
                    )}
                  </button>
                  <div className="border-t border-gray-200">
                    <button onClick={eliminarFiltro} className={`block w-full text-left px-4 py-2 text-sm 
                        ${isDarkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-500 hover:bg-gray-100'
                        }`}>
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

          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={fechaDesde}
              onChange={handleFechaDesdeChange}
              className={`border rounded px-4 py-2 focus:outline-none focus:ring-2 
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'}`}
            />
            <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={handleFechaHastaChange}
              className={`border rounded px-4 py-2 focus:outline-none focus:ring-2 
                ${isDarkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:ring-indigo-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'}`}
            />
            <Formulario 
              comentariosFiltrados={comentariosFiltrados} 
              columns={columnasPendientes} 
              formatData={formatData}
              fileName="comentarios_pendientes.pdf"
            />
          </div>
        </div>

        <div className={`min-w-full shadow-md rounded-lg border-collapse 
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full">
          <thead>
              <tr>
                {['Comentario', 'Sitio web', 'Fecha', 'Acciones'].map((header) => (
                  <th 
                    key={header} 
                    className={`px-6 py-4 text-left font-medium border-b
                      ${isDarkMode 
                        ? 'text-gray-300 border-gray-700' : 'text-gray-500 border-gray-300' 
                      }`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <Cargando />
                  </td>
                </tr>
              ) : comentariosAMostrar.length > 0 ? (
                comentariosAMostrar.map((comentario, index) => (
                  <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {truncateComentario(comentario.comentario)}
                    </td>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{comentario.sourceUrl}</td>
                    <td className={`px-6 py-4 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {isValid(parseISO(comentario.fechaScraping)) 
                        ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
                        : "Fecha Inválida"}
                    </td>
                    <td className="p-2">
                      <button
                        className={`py-2 px-4 rounded-lg 
                          ${isDarkMode 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        onClick={() => clasificarComentario(comentario)}
                      >
                        Clasificar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={`px-6 py-4 text-center 
                      ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    No hay comentarios para mostrar.
                  </td>
                </tr>
              )}
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
        <div className={`fixed right-0 top-0 h-screen w-[430px] shadow-lg p-6 opacity-100 border-l overflow-y-auto 
          ${isDarkMode 
            ? 'bg-dark-bg text-white border-l-gray-700' 
            : 'bg-white text-gray-800 border-l-gray-300'
          }`}>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">
              Clasificación manual de comentario
            </h2>
            <button
              onClick={() => setBarraClasificacionVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
              aria-label="Cerrar barra de clasificación"
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
                name="intensidadPrivacidad"
                value={clasificacion.intensidadPrivacidad}
                onChange={handleInputChange}
                placeholder="PR"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
              Grado de intrusión en la privacidad. Valor de 1 a 3.
            </p>

            <label className="block mt-4">
              Tiempo (0-1):
              <input
                type="number"
                min="0"
                max="1"
                name="elementoTiempo"
                value={clasificacion.elementoTiempo}
                onChange={handleInputChange}
                placeholder="T"
                step="0.1"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
              Tiempo relacionado con la información (antigüedad). Valor de 0 a 1.
            </p>

            <label className="block mt-4">
              Empatía hacia la privacidad (0-1):
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                name="empatiaPrivacidad"
                value={clasificacion.empatiaPrivacidad}
                onChange={handleInputChange}
                placeholder="E.Privacidad"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
              Empatía hacia la privacidad de la persona. Valor de 0 a 1.
            </p>

            <label className="block mt-4">
              Interés público (1-3):
              <input
                type="number"
                min="1"
                max="3"
                name="interesPublico"
                value={clasificacion.interesPublico}
                onChange={handleInputChange}
                placeholder="IP"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
            Nivel de interés público sobre el asunto. Valor de 1 a 3.
          </p>

            <label className="block mt-4">
              Figura pública (0-2):
              <input
                type="number"
                min="0"
                max="2"
                name="caracterPersonaPublico"
                value={clasificacion.caracterPersonaPublico}
                onChange={handleInputChange}
                placeholder="PF"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
              Indica si es una figura pública sobre el asunto. Valor de 0 a 2.
            </p>

            <label className="block mt-4">
              Origen de la información (-0.75 - 0):
              <input
                type="number"
                min="-1"
                max="0"
                name="origenInformacion"
                placeholder="OI"
                step={0.05}
                value={clasificacion.origenInformacion}
                onChange={handleInputChange}
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
              Origen de la información, si es legal o cuestionable. Valor de -0.75 a 0.
            </p>

            <label className="block mt-4">
              Empatía hacia la libertad de expresión (0-1):
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                name="empatiaExpresion"
                value={clasificacion.empatiaExpresion}
                onChange={handleInputChange}
                placeholder="E.Libertad"
                className={`border rounded w-full mt-1 p-1 
                  ${isDarkMode ? 'bg-dark-bg text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
               />
            </label>
            <p className={`text-sm mt-1 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-500' 
          }`}>
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
              onClick={enviarClasificacion}
            >
              Completar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
