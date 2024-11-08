"use client"

import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useSocket } from '../hooks/useSocket';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  // Estado inicial con datos temporales
  const [notificaciones, setNotificaciones] = useState([]);
  const socket = useSocket()
  const [periodo, setPeriodo] = useState('Diario');
  const [selectedMetric, setSelectedMetric] = useState('Total de comentarios analizados');
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [tasaAprobacion, setTasaAprobacion] = useState(0);
  const [barThickness, setBarThickness] = useState(30);


  useEffect(() => {
    if (!socket) return;

    socket.on("nueva_notificacion", (notificacion) => {
      setNotificaciones((prev) => [notificacion, ...prev]);
    });

    socket.on("connect", () => {
      console.log("Socket.IO conectado");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO desconectado:", reason);
    });

    return () => {
      socket.off("nueva_notificacion");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setBarThickness(20);
      } else {
        setBarThickness(30);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);


  console.log({
    notificaciones
  })

  // Datos temporales para demostración (serán reemplazados por datos del backend)
  const datosTemporales = {
    totalComentarios: 573,
    tasaAprobacion: 88,
    comentariosPendientes: 125,
    comentariosClasificados: 100,
    comentariosGraves: 25,
    ultimosComentarios: [
      { texto: 'No estoy de acuerdo.', estado: 'Aceptado' },
      { texto: 'Me encanta esta publicación.', estado: 'Aceptado' },
      { texto: 'Este comentario es ofensivo.', estado: 'Rechazado' },
    ],
    datosLineaClasificaciones: [25, 40, 50, 75, 117, 60, 80, 95, 70, 85, 55, 70, 90],
    datosLineaTasaAprobacion: [88, 90, 85, 92, 95, 100, 98, 105, 102, 110, 108, 115, 112],
    datosBarra: [750, 500, 650, 800, 900, 400, 600, 700, 850, 780, 880, 960],
    datosCircular: [40, 25, 15, 10, 10],
  };

  const datosTemporalesPorPeriodo = {
    Diario: {
      totalComentarios: 100,
      tasaAprobacion: 85,
    },
    Semanal: {
      totalComentarios: 700,
      tasaAprobacion: 90,
    },
    Mensual: {
      totalComentarios: 3000,
      tasaAprobacion: 88,
    },
    Anual: {
      totalComentarios: 36000,
      tasaAprobacion: 87,
    }
  };

  // Datos para los gráficos
  const labelsHoras = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00',
  ];

  const labelsMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const labelsDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para obtener el número de semanas en el mes actual
  const getWeeksInCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajustar para que la semana comience en lunes (1) en lugar de domingo (0)
    const firstDayOfWeek = firstDay.getDay() || 7;
    const lastDayOfWeek = lastDay.getDay() || 7;

    return Math.ceil((lastDay.getDate() + firstDayOfWeek - 1) / 7);
  };

  // Generar etiquetas para las semanas del mes actual
  const labelsSemanasDelMes = Array.from(
    { length: getWeeksInCurrentMonth() },
    (_, i) => `Semana ${i + 1}`
  );

  const datosBarra = {
    labels: periodo === 'Mensual' ? labelsSemanasDelMes : labelsMeses,
    datasets: [
      {
        label: 'Comentarios clasificados',
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        borderWidth: 1,
        hoverBackgroundColor: '#6366F1',
        hoverBorderColor: '#6366F1',
        data: datosTemporales.datosBarra.slice(0, periodo === 'Mensual' ? labelsSemanasDelMes.length : 12),
      },
    ],
  };

  const datosCircular = {
    labels: ['emol.cl', 'latercera.cl', 'quora.com', 'stackoverflow.com', 'reddit.com'],
    datasets: [
      {
        label: 'Comentarios por sitio web',
        data: datosTemporales.datosCircular,
        backgroundColor: [
          '#4F46E5', // emol.cl
          '#10B981', // latercera.cl
          '#F59E0B', // quora.com
          '#EF4444', // stackoverflow.com
          '#6366F1', // reddit.com
        ],
        hoverBackgroundColor: [
          '#6366F1', // emol.cl
          '#34D399', // latercera.cl
          '#FBBF24', // quora.com
          '#F87171', // stackoverflow.com
          '#818CF8', // reddit.com
        ],
        borderWidth: 1,
      },
    ],
  };

  // Leyenda personalizada para el gráfico circular
  const leyendaCircular = [
    { label: 'emol.cl', color: '#4F46E5' },
    { label: 'latercera.cl', color: '#10B981' },
    { label: 'quora.com', color: '#F59E0B' },
    { label: 'stackoverflow.com', color: '#EF4444' },
    { label: 'reddit.com', color: '#6366F1' },
  ];

  // Opciones de los gráficos
  const opcionesBarra = {
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 200 },
      },
    },
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    barThickness: barThickness,
  };

  const opcionesLinea = {
    maintainAspectRatio: false,
    responsive: true,
    width: '100%',
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 25 },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} análisis`,
        },
      },
    },
  };

  const opcionesCircular = {
    maintainAspectRatio: false,
    responsive: true,  // Asegurar que sea responsivo
    plugins: {
      legend: {
        display: false,  // Desactiva la leyenda dentro del gráfico
      },
    },
  };

  useEffect(() => {
    const datos = datosTemporalesPorPeriodo[periodo];
    setTotalComentarios(datos.totalComentarios);
    setTasaAprobacion(datos.tasaAprobacion);
  }, [periodo]);

  const getChartData = () => {
    switch (selectedMetric) {
      case 'Total de comentarios analizados':
        switch (periodo) {
          case 'Diario':
            return {
              data: {
                labels: labelsHoras,
                datasets: [
                  {
                    label: 'Total de comentarios analizados',
                    data: datosTemporales.datosLineaClasificaciones,
                    fill: true,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                  },
                ],
              },
            };
          case 'Semanal':
            return {
              data: {
                labels: labelsDias,
                datasets: [
                  {
                    label: 'Total de comentarios analizados (Semanal)',
                    data: datosTemporales.datosLineaClasificaciones.slice(0, 7),
                    fill: true,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                  },
                ],
              },
            };
          case 'Mensual':
            return {
              data: {
                labels: labelsSemanasDelMes,
                datasets: [
                  {
                    label: 'Total de comentarios analizados (Mensual)',
                    data: datosTemporales.datosBarra.slice(0, labelsSemanasDelMes.length),
                    fill: true,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                  },
                ],
              },
            };
          default:
            return null;
        }
      case 'Tasa de aprobación':
        switch (periodo) {
          case 'Diario':
            return {
              data: {
                labels: labelsHoras,
                datasets: [
                  {
                    label: 'Tasa de aprobación',
                    data: datosTemporales.datosLineaTasaAprobacion,
                    fill: true,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  },
                ],
              },
            };
          case 'Semanal':
            return {
              data: {
                labels: labelsDias,
                datasets: [
                  {
                    label: 'Tasa de aprobación (Semanal)',
                    data: datosTemporales.datosLineaTasaAprobacion.slice(0, 7),
                    fill: true,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  },
                ],
              },
            };
          case 'Mensual':
            return {
              data: {
                labels: labelsSemanasDelMes,
                datasets: [
                  {
                    label: 'Tasa de aprobación (Mensual)',
                    data: datosTemporales.datosLineaTasaAprobacion.slice(0, labelsSemanasDelMes.length),
                    fill: true,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  },
                ],
              },
            };
          default:
            return null;
        }
      default:
        return null;
    }
  };

  const { data } = getChartData() || {};

  // Obtener el mes y año actual
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return (
    <div className="p-8 bg-gray-100 flex-1 w-full">
      {/* Botones de selección de período */}
      <div className="mb-6 flex space-x-2">
        {['Diario', 'Semanal', 'Mensual', 'Anual'].map((period) => (
          <button
            key={period}
            onClick={() => {
              setPeriodo(period);
            }}
            className={`px-4 py-2 rounded-full text-gray-600 border ${periodo === period ? 'bg-gray-300 ring-2 ring-indigo-500' : 'bg-white hover:bg-gray-200'
              }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Selección de métrica (para Diario, Semanal y Mensual) */}
      {periodo !== 'Anual' && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedMetric('Total de comentarios analizados')}
            className={`bg-white shadow-md p-6 rounded-lg cursor-pointer ${selectedMetric === 'Total de comentarios analizados' ? 'ring-2 ring-indigo-500' : ''
              }`}
          >
            <h2 className="text-gray-500 text-sm">Total de comentarios analizados</h2>
            <p className="text-3xl font-bold mt-2">{totalComentarios}</p>
          </div>
          <div
            onClick={() => setSelectedMetric('Tasa de aprobación')}
            className={`bg-white shadow-md p-6 rounded-lg cursor-pointer ${selectedMetric === 'Tasa de aprobación' ? 'ring-2  ring-indigo-500' : ''
              }`}
          >
            <h2 className="text-gray-500 text-sm">Tasa de aprobación</h2>
            <p className="text-3xl font-bold mt-2">{tasaAprobacion}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data && periodo !== 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg col-span-2">
            <h2 className="text-lg font-bold mb-4">{selectedMetric}</h2>
            {periodo === 'Mensual' && (
              <p className="text-sm text-gray-500 mb-4">
                Mes actual: {currentMonth} del {currentYear}
              </p>
            )}
            <div className="h-[300px] w-full">
              <Line data={data} options={opcionesLinea} />
            </div>
          </div>
        )}
      </div>
      {/* Mostrar estadísticas cuando el período es "Anual" */}
      {periodo === 'Anual' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 text-sm">Comentarios pendientes</h2>
              <p className="text-3xl font-bold mt-2">{datosTemporales.comentariosPendientes}</p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 text-sm">Comentarios clasificados</h2>
              <p className="text-3xl font-bold mt-2">{datosTemporales.comentariosClasificados}</p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 text-sm">Comentarios graves</h2>
              <p className="text-3xl font-bold mt-2">{datosTemporales.comentariosGraves}</p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras para "Anual" */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Total de comentarios clasificados</h2>
            <div className="h-64">
              <Bar data={datosBarra} options={opcionesBarra} />
            </div>
          </div>
        )}

        {/* Gráfico circular con leyenda personalizada para "Anual" */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg flex">
            <div className="w-2/3">
              <h2 className="text-lg font-bold mb-4">Comentarios por sitio web</h2>
              <div className="h-64">
                <Pie data={datosCircular} options={opcionesCircular} />
              </div>
            </div>
            <div className="w-1/3 flex flex-col justify-center ml-8 flex-wrap overflow-hidden">
              {leyendaCircular.map((item, index) => (
                <div key={index} className="flex items-center mb-4">
                  <div className="w-4 h-4" style={{ backgroundColor: item.color }}></div>
                  <span className="ml-2 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de últimos comentarios */}
      <div className="mt-8 bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Últimos comentarios clasificados</h2>
        <ul>
          {datosTemporales.ultimosComentarios.map((comentario, index) => (
            <li key={index} className="border-b py-4 flex justify-between">
              <span>{comentario.texto}</span>
              <span
                className={`font-semibold ${comentario.estado === 'Aceptado' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {comentario.estado}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
