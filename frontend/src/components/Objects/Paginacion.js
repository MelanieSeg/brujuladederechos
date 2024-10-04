import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Paginacion({ paginaActual, totalPaginas, onPageChange }) {
  const handlePageClick = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPaginas) {
      onPageChange(pageNum);
    }
  };

  const generarNumerosDePagina = () => {
    const numeros = [];
    const totalNumerosMostrados = 5;
    const maxNumerosLaterales = 2;

    if (totalPaginas <= totalNumerosMostrados) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      const startPage = Math.max(1, paginaActual - maxNumerosLaterales);
      const endPage = Math.min(totalPaginas, paginaActual + maxNumerosLaterales);

      if (startPage > 1) {
        numeros.push(1);
        if (startPage > 2) {
          numeros.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        numeros.push(i);
      }

      if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
          numeros.push('...');
        }
        numeros.push(totalPaginas);
      }
    }

    return numeros;
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
      {/* Botón "Anterior" alineado a la izquierda */}
      <div className="w-1/3 flex justify-start">
        <button
          onClick={() => handlePageClick(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          <span className="ml-2">Anterior</span>
        </button>
      </div>

      {/* Números de páginas centrados */}
      <div className="w-1/3 flex justify-center">
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          {generarNumerosDePagina().map((num, index) => (
            <button
              key={index}
              onClick={() => typeof num === 'number' && handlePageClick(num)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                num === paginaActual
                  ? 'z-10 bg-gray-200 text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600'
                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
              } ${num === '...' ? 'cursor-default' : ''}`}
            >
              {num}
            </button>
          ))}
        </nav>
      </div>

      {/* Botón "Siguiente" alineado a la derecha */}
      <div className="w-1/3 flex justify-end">
        <button
          onClick={() => handlePageClick(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <span className="mr-2">Siguiente</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
