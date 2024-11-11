import React, { useContext } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../../utils/ThemeContext';

export default function Paginacion({ paginaActual, totalPaginas, onPageChange }) {
  const { isDarkMode } = useContext(ThemeContext);
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
    <div className={`flex items-center justify-between px-4 py-3 sm:px-6 
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-1/3 flex justify-start">
        <button
          onClick={() => handlePageClick(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200
            ${isDarkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          <div className="flex items-center space-x-2">
          <ChevronLeftIcon className={`h-5 w-5 
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} aria-hidden="true" />
          <span className="ml-2">Anterior</span>
          </div>
        </button>
      </div>

      {/* Números de páginas centrados */}
      <div className="w-1/3 flex justify-center">
        <nav 
          className="isolate inline-flex -space-x-px rounded-md shadow-sm" 
          aria-label="Pagination"
        >
          {generarNumerosDePagina().map((num, index) => (
            <button
              key={index}
              onClick={() => typeof num === 'number' && handlePageClick(num)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200
                ${num === '...' 
                  ? 'cursor-default text-gray-500' 
                  : 'cursor-pointer'
                }
                ${num === paginaActual 
                  ? (isDarkMode 
                      ? 'bg-black text-white' 
                      : 'bg-indigo-100 text-indigo-700'
                    )
                  : (isDarkMode 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                      : 'text-gray-700 bg-white hover:bg-gray-100 ring-1 ring-gray-300')
                }
                ${num === paginaActual 
                  ? 'z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2' 
                  : ''
                }`
              }
            >
              {num}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-1/3 flex justify-end">
        <button
          onClick={() => handlePageClick(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200
            ${isDarkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          <div className="flex items-center space-x-2">
          <span className="mr-2">Siguiente</span>
          <ChevronRightIcon className= {`h-5 w-5 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}  aria-hidden="true" />
          </div>
        </button>
      </div>
    </div>
  );
}
