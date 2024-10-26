// src/ComentariosPendientes.js

import React, { useState, useRef, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import api from "../services/axios";
import { truncateComentario } from "../utils/truncarComentario";
import { format, parseISO, isValid } from "date-fns";
import Calendario from './Objects/Calendario';
import Paginacion from "./Objects/Paginacion";
import { useAuth } from "../hooks/useAuth";
import Formulario from "./Objects/Formulario";
import Cargando from "./Objects/Cargando";
import { Toast, showSuccess, showError } from "./Objects/Toast"; // Importar Toast y funciones de toast

export default function ComentariosPendientes() {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const response = await api.get("/comments/get-all");
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
  ];

  const formatData = (comentario) => [
    comentario.comentario,
    comentario.sourceUrl,
    isValid(parseISO(comentario.fechaScraping))
      ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
      : "Fecha Inválida"
  ];

  return (
    <div className="p-8 flex flex-col">
      {/* Contenedor de Toasts */}
      <Toast />

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
            <Formulario 
              comentariosFiltrados={comentariosFiltrados} 
              columns={columnasPendientes} 
              formatData={formatData}
              fileName="comentarios_pendientes.pdf"
            />
          </div>
        </div>

        <div className="min-w-full bg-white shadow-md rounded-lg border-collapse">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Comentario</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Sitio web</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Fecha</th>
                <th className="p-2 text-left"></th>
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
                  <tr key={index} className="border-b">
                    <td className="px-6 py-4">
                      {truncateComentario(comentario.comentario)}
                    </td>
                    <td className="p-2">{comentario.sourceUrl}</td>
                    <td className="p-2">
                      {isValid(parseISO(comentario.fechaScraping)) 
                        ? format(parseISO(comentario.fechaScraping), "dd-MM-yyyy")
                        : "Fecha Inválida"}
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
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
        <div className="fixed right-0 top-0 h-screen w-[430px] bg-white shadow-lg p-6 opacity-100 border-l border-l-gray-300 overflow-y-auto">
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
                name="elementoTiempo"
                value={clasificacion.elementoTiempo}
                onChange={handleInputChange}
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
                name="empatiaPrivacidad"
                value={clasificacion.empatiaPrivacidad}
                onChange={handleInputChange}
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
                name="interesPublico"
                value={clasificacion.interesPublico}
                onChange={handleInputChange}
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
                name="caracterPersonaPublico"
                value={clasificacion.caracterPersonaPublico}
                onChange={handleInputChange}
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
                name="origenInformacion"
                placeholder="OI"
                step={0.05}
                value={clasificacion.origenInformacion}
                onChange={handleInputChange}
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
                name="empatiaExpresion"
                value={clasificacion.empatiaExpresion}
                onChange={handleInputChange}
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
