import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // exclamacion de Heroicons v2

export default function Dashboard() {
  return (
    <div className="p-8 bg-gray-100 flex-1">
      
      {/* Botones de selección de período */}
      <div className="mb-6 flex space-x-2">
        <button className="px-4 py-2 rounded-full text-gray-600 bg-white border border-gray-300">Diario</button>
        <button className="px-4 py-2 rounded-full text-gray-600 bg-gray-200 hover:bg-gray-300">Semanal</button>
        <button className="px-4 py-2 rounded-full text-gray-600 bg-gray-200 hover:bg-gray-300">Mensual</button>
        <button className="px-4 py-2 rounded-full text-gray-600 bg-gray-200 hover:bg-gray-300">Anual</button>
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
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Total de comentarios clasificados</h2>
          <div className="h-64 bg-blue-100 rounded-lg">
            {/* Aquí puedes insertar el gráfico de barras */}
          </div>
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Comentarios por sitio web</h2>
          <div className="h-64 bg-purple-100 rounded-lg">
            {/* Aquí puedes insertar el gráfico de pie */}
          </div>
        </div>
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
