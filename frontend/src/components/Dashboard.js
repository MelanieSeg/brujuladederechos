import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Filler } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('Anual');

  // Datos para el gráfico de barras (Anual)
  const datosBarra = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        label: 'Comentarios clasificados',
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        borderWidth: 1,
        hoverBackgroundColor: '#6366F1',
        hoverBorderColor: '#6366F1',
        data: [750, 500, 650, 800, 900, 400, 600, 700, 850, 780, 880, 960],
        barThickness: 30,
      },
    ],
  };

  // Datos ficticios para el gráfico de línea (Diario)
  const datosLinea = {
    labels: [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00',
    ],
    datasets: [
      {
        label: 'Clasificaciones realizadas',
        data: [25, 40, 50, 75, 117, 60, 80, 95, 70, 85, 55, 70, 90],
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

  // Opciones del gráfico de barras
  const opcionesBarra = {
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 200,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Opciones para el gráfico de línea (Diario)
  const opcionesLinea = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 25,
        },
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

  // Datos para el gráfico circular
  const datosCircular = {
    labels: ['emol.cl', 'latercera.cl', 'quora.com', 'stackoverflow.com', 'reddit.com'],
    datasets: [
      {
        label: 'Comentarios por sitio web',
        data: [40, 25, 15, 10, 10],
        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'],
        hoverBackgroundColor: ['#6366F1', '#34D399', '#FBBF24', '#F87171', '#818CF8'],
        borderWidth: 1,
      },
    ],
  };

  // Desactivar la leyenda predeterminada del gráfico circular
  const opcionesCircular = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Leyenda personalizada para el gráfico circular
  const leyendaCircular = [
    { label: 'emol.cl', color: '#4F46E5' },
    { label: 'latercera.cl', color: '#10B981' },
    { label: 'quora.com', color: '#F59E0B' },
    { label: 'stackoverflow.com', color: '#EF4444' },
    { label: 'reddit.com', color: '#6366F1' },
  ];

  return (
    <div className="p-8 bg-gray-100 flex-1">
      {/* Botones de selección de período */}
      <div className="mb-6 flex space-x-2">
        {['Diario', 'Semanal', 'Mensual', 'Anual'].map((period) => (
          <button
            key={period}
            onClick={() => setPeriodo(period)}
            className={`px-4 py-2 rounded-full text-gray-600 border ${
              periodo === period ? 'bg-gray-300' : 'bg-white hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
          <div>
            <h2 className="text-gray-500 text-sm">Comentarios pendientes</h2>
            <p className="text-3xl font-bold mt-2">125</p>
          </div>
          <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
          <div>
            <h2 className="text-gray-500 text-sm">Comentarios clasificados</h2>
            <p className="text-3xl font-bold mt-2">100</p>
          </div>
          <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg flex items-start justify-between">
          <div>
            <h2 className="text-gray-500 text-sm">Comentarios graves</h2>
            <p className="text-3xl font-bold mt-2">25</p>
          </div>
          <InformationCircleIcon className="h-6 w-6 text-gray-400 ml-4 mt-1" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mostrar el gráfico de línea si se selecciona "Diario" */}
        {periodo === 'Diario' && (
          <div className="bg-white shadow-md p-6 rounded-lg col-span-2">
            <h2 className="text-lg font-bold mb-4">Clasificaciones realizadas</h2>
            <div className="h-64">
              <Line data={datosLinea} options={opcionesLinea} />
            </div>
          </div>
        )}

        {/* Gráfico de Barras (Anual) */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Total de comentarios clasificados</h2>
            <div className="h-64">
              <Bar data={datosBarra} options={opcionesBarra} />
            </div>
          </div>
        )}

        {/* Gráfico Circular con leyenda personalizada */}
        {periodo === 'Anual' && (
          <div className="bg-white shadow-md p-6 rounded-lg flex">
            <div className="w-2/3">
              <h2 className="text-lg font-bold mb-4">Comentarios por sitio web</h2>
              <div className="h-64">
                <Pie data={datosCircular} options={opcionesCircular} />
              </div>
            </div>

            {/* Leyenda personalizada al lado derecho */}
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
          <li className="border-b py-4 flex justify-between">
            <span>No estoy de acuerdo.</span>
            <span className="text-green-600 font-semibold">Aceptado</span>
          </li>
          <li className="border-b py-4 flex justify-between">
            <span>Me encanta esta publicación.</span>
            <span className="text-green-600 font-semibold">Aceptado</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
