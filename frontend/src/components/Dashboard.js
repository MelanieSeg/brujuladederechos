import React, { useState } from 'react';
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
} from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Estado inicial con datos temporales
  const [periodo, setPeriodo] = useState('Diario');
  const [selectedMetric, setSelectedMetric] = useState('Total de comentarios analizados');

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

  // Datos para los gráficos
  const labelsHoras = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00',
  ];

  const labelsMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const datosLineaTotalComentarios = {
    labels: labelsHoras,
    datasets: [
      {
        label: 'Total de comentarios analizados',
        data: datosTemporales.datosLineaClasificaciones,
        fill: true,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4F46E5',
      },
    ],
  };

  const datosLineaTasaAprobacion = {
    labels: labelsHoras,
    datasets: [
      {
        label: 'Tasa de aprobación',
        data: datosTemporales.datosLineaTasaAprobacion,
        fill: true,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4F46E5',
      },
    ],
  };

  const datosBarra = {
    labels: labelsMeses,
    datasets: [
      {
        label: 'Comentarios clasificados',
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        borderWidth: 1,
        hoverBackgroundColor: '#6366F1',
        hoverBorderColor: '#6366F1',
        data: datosTemporales.datosBarra,
        barThickness: 30,
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
  };

  const opcionesLinea = {
    maintainAspectRatio: false,
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
    plugins: {
      legend: { display: false },
    },
  };

  // Función para obtener los datos y opciones según la métrica seleccionada
  const getLineChartData = () => {
    switch (selectedMetric) {
      case 'Total de comentarios analizados':
        return { data: datosLineaTotalComentarios, options: opcionesLinea };
      case 'Tasa de aprobación':
        return { data: datosLineaTasaAprobacion, options: opcionesLinea };
      default:
        return { data: datosLineaTotalComentarios, options: opcionesLinea };
    }
  };

  const { data: datosLineaActual, options: opcionesLineaActual } = getLineChartData();

  return (
    <div className="p-8 bg-gray-100 flex-1">
      {/* Botones de selección de período */}
      <div className="mb-6 flex space-x-2">
        {['Diario', 'Semanal', 'Mensual', 'Anual'].map((period) => (
          <button
            key={period}
            onClick={() => {
              setPeriodo(period);
              if (period === 'Diario') {
                setSelectedMetric('Total de comentarios analizados');
              } else {
                setSelectedMetric(null);
              }
            }}
            className={`px-4 py-2 rounded-full text-gray-600 border ${
              periodo === period ? 'bg-gray-300' : 'bg-white hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Mostrar métricas cuando el período es "Diario" */}
      {periodo === 'Diario' && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedMetric('Total de comentarios analizados')}
            className={`bg-white shadow-md p-6 rounded-lg cursor-pointer ${
              selectedMetric === 'Total de comentarios analizados' ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            <h2 className="text-gray-500 text-sm">Total de comentarios analizados</h2>
            <p className="text-3xl font-bold mt-2">{datosTemporales.totalComentarios}</p>
          </div>
          <div
            onClick={() => setSelectedMetric('Tasa de aprobación')}
            className={`bg-white shadow-md p-6 rounded-lg cursor-pointer ${
              selectedMetric === 'Tasa de aprobación' ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            <h2 className="text-gray-500 text-sm">Tasa de aprobación</h2>
            <p className="text-3xl font-bold mt-2">{datosTemporales.tasaAprobacion}%</p>
          </div>
        </div>
      )}

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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de línea para "Diario" */}
        {periodo === 'Diario' && selectedMetric && (
          <div className="bg-white shadow-md p-6 rounded-lg col-span-2">
            <h2 className="text-lg font-bold mb-4">{selectedMetric}</h2>
            <div className="h-64">
              <Line data={datosLineaActual} options={opcionesLineaActual} />
            </div>
          </div>
        )}

        {/* Gráfico de barras para "Anual" */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Total de comentarios clasificados</h2>
            <div className="h-64">
              <Bar data={datosBarra} options={opcionesBarra} />
            </div>
          </div>
        )}

        {/* Gráfico circular con leyenda personalizada */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg flex">
            <div className="w-2/3">
              <h2 className="text-lg font-bold mb-4">Comentarios por sitio web</h2>
              <div className="h-64">
                <Pie data={datosCircular} options={opcionesCircular} />
              </div>
            </div>
            <div className="w-1/3 flex flex-col justify-center ml-8">
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
                className={`font-semibold ${
                  comentario.estado === 'Aceptado' ? 'text-green-600' : 'text-red-600'
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
