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

  const generarNumerosDePaginaResponsivo = () => {
    const numeros = [];
    const bloquesTotales = 7; // Aumentado para incluir correctamente los números en pantallas pequeñas
    const bloquesLados = 1; // Bloques fijos en los extremos
    const bloquesIntermedios = bloquesTotales - (bloquesLados * 2 + 2); // Restamos los extremos y los puntos suspensivos

    if (totalPaginas <= bloquesTotales) {
      // Si el total de páginas es menor o igual al número de bloques, muestra todas las páginas
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      const mitad = Math.floor(bloquesIntermedios / 2);
      let inicio = paginaActual - mitad;
      let fin = paginaActual + mitad;

      // Ajusta el inicio y el fin si están cerca de los extremos
      if (inicio <= bloquesLados + 2) {
        inicio = 2;
        fin = inicio + bloquesIntermedios - 1;
      } else if (fin >= totalPaginas - bloquesLados - 1) {
        fin = totalPaginas - bloquesLados - 1;
        inicio = fin - bloquesIntermedios + 1;
      }

      // Agrega las primeras páginas fijas
      for (let i = 1; i <= bloquesLados; i++) {
        numeros.push(i);
      }

      // Agrega puntos suspensivos si hay espacio entre los bloques laterales y el inicio
      if (inicio > bloquesLados + 1) {
        numeros.push('...');
      }

      // Agrega las páginas intermedias
      for (let i = inicio; i <= fin; i++) {
        numeros.push(i);
      }

      // Agrega puntos suspensivos si hay espacio entre el fin y los bloques laterales
      if (fin < totalPaginas - bloquesLados - 1) {
        numeros.push('...');
      }

      // Agrega las últimas páginas fijas
      for (let i = totalPaginas - bloquesLados + 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    }

    return numeros;
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 sm:px-6 
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex-wrap`}>
      
      {/* Botón "Anterior" para pantallas grandes */}
      <div className="hidden sm:flex sm:w-1/3 justify-start">
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

      {/* Botón "Anterior" para pantallas pequeñas */}
      <div className="flex sm:hidden w-full justify-between items-center">
        <button
          onClick={() => handlePageClick(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-1 py-1 rounded-md flex items-center justify-center transition-colors duration-200
            ${isDarkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          aria-label="Anterior"
        >
          <ChevronLeftIcon className={`h-4 w-4 
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} aria-hidden="true" />
        </button>

        {/* Números de páginas para pantallas pequeñas */}
        <nav 
          className="isolate inline-flex -space-x-px rounded-md shadow-sm" 
          aria-label="Pagination"
        >
          {generarNumerosDePaginaResponsivo().map((num, index) => {
            let sizeClasses = 'w-6 h-6';

            return (
              <button
                key={index}
                onClick={() => typeof num === 'number' && handlePageClick(num)}
                disabled={num === '...'}
                className={`relative inline-flex items-center justify-center ${sizeClasses} text-xs font-semibold transition-colors duration-200
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
            );
          })}
        </nav>

        {/* Botón "Siguiente" para pantallas pequeñas */}
        <button
          onClick={() => handlePageClick(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-1 py-1 rounded-md flex items-center justify-center transition-colors duration-200
            ${isDarkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          aria-label="Siguiente"
        >
          <ChevronRightIcon className={`h-4 w-4 
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} aria-hidden="true" />
        </button>
      </div>

      {/* Números de páginas para pantallas grandes */}
      <div className="hidden sm:flex sm:w-1/3 justify-center">
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

      {/* Botón "Siguiente" para pantallas grandes */}
      <div className="hidden sm:flex sm:w-1/3 justify-end">
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
            <span className="mr-2">Siguientes</span>
            <ChevronRightIcon className= {`h-5 w-5 
                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}  aria-hidden="true" />
          </div>
        </button>
      </div>
    </div>
  );
}
