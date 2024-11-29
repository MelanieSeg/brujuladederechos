import React, { useState, useEffect, useContext } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { ThemeContext } from '../utils/ThemeContext';
import Cargando from './Objects/Cargando';
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
  Filler,
} from 'chart.js';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';
import api from '../services/axios';


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
  const socket = useSocket();
  const [periodo, setPeriodo] = useState('Diario');
  const [selectedMetric, setSelectedMetric] = useState('Total de comentarios analizados');
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [tasaAprobacion, setTasaAprobacion] = useState(0);
  const [barThickness, setBarThickness] = useState(30);
  const { isDarkMode } = useContext(ThemeContext);
  const [diario, setDiario] = useState([]);
  const [Semana, setSemana] = useState([]);
  const [Mes, setMes] = useState([]);
  const [Año, setAño] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        setIsLoading(true);
        const rutas = ["/resumen/get-daily", "/resumen/get-week", "/resumen/get-month", "/resumen/get-anual"]
        const [resdiario, resSemana, resMes, resAño] = await Promise.all(rutas.map(async (ruta) => api.get(ruta)));
        setDiario(resdiario.data.data);
        setSemana(resSemana.data.data);
        setMes(resMes.data.data);
        setAño(resAño.data.data);
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
        console.log(e);
      }


    }
    fetchResumen()
  }, []);
  console.log({
    diario,
    Semana,
    Mes,
    Año
  });

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



  const DatosHora = diario?.comentarios_por_intervalo?.map(m => m.totalCount)
  const PorcenHora = diario?.comentarios_por_intervalo?.map(m => m.acceptedCount)
  const AñoEmol = Año?.total_comentarios_por_sitio_web?.map(m => m.totalComentariosWebsite)
  const BarraMes = Año?.comentarios_por_mes?.map(m => m.totalComments)
  const SemanaCOM = Semana?.comentarios_por_dia?.map(m => m.count)
  const semanaApr = Semana?.comentarios_por_dia?.map(m => m.approvalRate.acceptedCount)
  const MesCOM = Mes?.comentarios_por_semana?.map(m => m.approvalRate.totalCount)
  const MesApr = Mes?.comentarios_por_semana?.map(m => m.approvalRate.acceptedCount)


  // Datos temporales para demostración (serán reemplazados por datos del backend)
  const datosTemporales = {
    datosLineaClasificacionesDia: DatosHora,
    datosLineaTasaAprobacionDia: PorcenHora,
    datosLineaClasificacionesSemana: SemanaCOM,
    datosLineaTasaAprobacionSemana: semanaApr,
    datosLineaClasificacionMes: MesCOM,
    datosLineaTasaAprobacionMes: MesApr,
    datosBarra: BarraMes,
    datosCircular: AñoEmol,
  };

  const datosTemporalesPorPeriodo = {
    Diario: {
      totalComentarios: diario.total_comentarios_analisados,
      tasaAprobacion: diario.tasa_de_aprobacion_hoy,
    },
    Semanal: {
      totalComentarios: Semana?.total_comentarios_analisados_semana,
      tasaAprobacion: Semana?.tasa_de_aprobacion_semana,
    },
    Mensual: {
      totalComentarios: Mes?.total_comentarios_analisados_mes,
      tasaAprobacion: Mes?.tasa_de_aprobacion_mes,
    },
    Anual: {
      ComentariosPendientes: Año?.total_comentarios_pendientes,
      ComentariosGraves: Año?.total_comentarios_graves,
      comentariosClasificados: Año?.total_comentarios_clasificados,
    },
  };

  // Datos para los gráficos
  const labelsHoras = [
    '00:00',
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
    '24:00',
  ];

  const labelsMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
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
        backgroundColor: isDarkMode ? '#818CF8' : '#4F46E5',
        borderColor: isDarkMode ? '#818CF8' : '#4F46E5',
        borderWidth: 1,
        hoverBackgroundColor: isDarkMode ? '#A5B4FC' : '#6366F1',
        hoverBorderColor: isDarkMode ? '#A5B4FC' : '#6366F1',
        data: datosTemporales.datosBarra
      },
    ],
  };

  const datosCircular = {
    labels: ['emol.cl'],
    datasets: [
      {
        label: 'Comentarios por sitio web',
        data: datosTemporales.datosCircular,
        backgroundColor: [
          '#4F46E5', // emol.cl

        ],
        hoverBackgroundColor: [
          '#6366F1', // emol.cl
        ],
        borderWidth: 1,
      },
    ],
  };

  // Leyenda personalizada para el gráfico circular
  const leyendaCircular = [
    { label: 'emol.cl', color: '#4F46E5' }
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
        ticks: { stepSize: 25, color: isDarkMode ? '#E5E7EB' : '#4B5563' },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDarkMode ? '#E5E7EB' : '#4B5563',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
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
    responsive: true, // Asegurar que sea responsivo
    plugins: {
      legend: {
        display: false, // Desactiva la leyenda dentro del gráfico
      },
    },
  };

  useEffect(() => {
    const datos = datosTemporalesPorPeriodo[periodo];
    setTotalComentarios(datos.totalComentarios);
    setTasaAprobacion(datos.tasaAprobacion);
  }, [periodo, diario, Semana, Mes, Año]);

  if (isLoading) {
    return <Cargando />;
  }
  const getChartData = () => {
    const lightLineColor = '#4F46E5';
    const darkLineColor = '#818CF8';
    const lightFillColor = 'rgba(79, 70, 229, 0.2)';
    const darkFillColor = 'rgba(129, 140, 248, 0.2)';
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
                    data: datosTemporales.datosLineaClasificacionesDia,
                    fill: true,
                    borderColor: isDarkMode ? darkLineColor : lightLineColor,
                    backgroundColor: isDarkMode ? darkFillColor : lightFillColor,
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
                    data: datosTemporales.datosLineaClasificacionesSemana,
                    fill: true,
                    borderColor: isDarkMode ? darkLineColor : lightLineColor,
                    backgroundColor: isDarkMode ? darkFillColor : lightFillColor,
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
                    data: datosTemporales.datosLineaClasificacionMes,
                    fill: true,
                    borderColor: isDarkMode ? darkLineColor : lightLineColor,
                    backgroundColor: isDarkMode ? darkFillColor : lightFillColor,
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
                    data: datosTemporales.datosLineaTasaAprobacionDia,
                    fill: true,
                    borderColor: isDarkMode ? '#34D399' : '#10B981',
                    backgroundColor: isDarkMode
                      ? 'rgba(52, 211, 153, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
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
                    data: datosTemporales.datosLineaTasaAprobacionSemana,
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
                    data: datosTemporales.datosLineaTasaAprobacionMes,
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
    <div
      className={`p-2 sm:p-4 lg:p-8 min-h-screen flex flex-col overflow-x-hidden ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
        } flex-1 w-full`}
    >
      {/* Botones de selección de período */}
      <div className="mb-6 flex flex-wrap space-x-2">
        {['Diario', 'Semanal', 'Mensual', 'Anual'].map((period) => (
          <button
            key={period}
            onClick={() => {
              setPeriodo(period);
            }}

            className={`px-4 py-2 rounded-full text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 border ${periodo === period
              ? 'bg-gray-300 dark:bg-gray-700 ring-2 ring-indigo-500'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Selección de métrica (para Diario, Semanal y Mensual) */}
      {periodo !== 'Anual' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedMetric('Total de comentarios analizados')}
            className={`bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg cursor-pointer ${selectedMetric === 'Total de comentarios analizados' ? 'ring-2 ring-indigo-500' : ''
              }`}
          >
            <h2 className="text-gray-500 dark:text-gray-400 text-sm">
              Total de comentarios analizados
            </h2>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
              {totalComentarios}
            </p>
          </div>
          <div
            onClick={() => setSelectedMetric('Tasa de aprobación')}
            className={`bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg cursor-pointer ${selectedMetric === 'Tasa de aprobación' ? 'ring-2 ring-indigo-500' : ''
              }`}
          >
            <h2 className="text-gray-500 dark:text-gray-400 text-sm">Tasa de aprobación</h2>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
              {tasaAprobacion}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data && periodo !== 'Anual' && (
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {selectedMetric}
            </h2>
            {periodo === 'Mensual' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Mes actual: {currentMonth} del {currentYear}
              </p>
            )}
            <div className="h-[300px] w-full">
              <Line
                data={data}
                options={{
                  ...opcionesLinea,
                  scales: {
                    ...opcionesLinea.scales,
                    y: {
                      ...opcionesLinea.scales.y,
                      grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                      },
                    },
                    x: {
                      grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Mostrar estadísticas cuando el período es "Anual" */}
      {periodo === 'Anual' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Comentarios pendientes</h2>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {Año.total_comentarios_pendientes}
              </p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 ml-4 mt-1" />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Comentarios clasificados</h2>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {Año.total_comentarios_clasificados}
              </p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 ml-4 mt-1" />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg flex items-start justify-between">
            <div>
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Comentarios graves</h2>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                {Año.total_comentarios_graves}
              </p>
            </div>
            <InformationCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 ml-4 mt-1" />
          </div>
        </div>
      )}

      {/* Gráfico de barras para "Anual" */}
      {periodo === 'Anual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Total de comentarios clasificados
            </h2>
            <div className="h-64 w-full">
              <Bar
                data={datosBarra}
                options={{
                  ...opcionesBarra,
                  scales: {
                    ...opcionesBarra.scales,
                    y: {
                      ...opcionesBarra.scales.y,
                      grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                      },
                    },
                    x: {
                      grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      ticks: {
                        color: isDarkMode ? '#fff' : '#666',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Gráfico circular */}
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Comentarios por sitio web
            </h2>
            <div className="h-64 w-full">
              <Pie data={datosCircular} options={opcionesCircular} />
            </div>
            <div className="mt-4 flex flex-wrap">
              {leyendaCircular.map((item, index) => (
                <div key={index} className="flex items-center mr-4 mb-2">
                  <div className="w-4 h-4" style={{ backgroundColor: item.color }}></div>
                  <span className="ml-2 text-sm dark:text-gray-200">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
