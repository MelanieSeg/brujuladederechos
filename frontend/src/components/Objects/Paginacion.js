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
    const bloquesTotales = 7; // Número fijo de bloques en la paginación
    const bloquesLados = 1; // Número de páginas fijas en los extremos
    const bloquesIntermedios = bloquesTotales - (bloquesLados * 2 + 2); // Bloques intermedios

    if (totalPaginas <= bloquesTotales) {
      // Muestra todas las páginas si el total es menor o igual al número de bloques
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      const mitad = Math.floor(bloquesIntermedios / 2);
      let inicio = paginaActual - mitad;
      let fin = paginaActual + mitad;

      // Ajusta inicio y fin si están cerca de los extremos
      if (inicio <= bloquesLados + 2) {
        inicio = 2;
        fin = inicio + bloquesIntermedios - 1;
      } else if (fin >= totalPaginas - bloquesLados - 1) {
        fin = totalPaginas - bloquesLados - 1;
        inicio = fin - bloquesIntermedios + 1;
      }

      // Asegura que fin no sea menor que paginaActual
      if (fin < paginaActual) {
        fin = paginaActual;
        inicio = fin - bloquesIntermedios + 1;
      }

      // Asegura que inicio no sea mayor que paginaActual
      if (inicio > paginaActual) {
        inicio = paginaActual;
        fin = inicio + bloquesIntermedios - 1;
      }

      // Asegura que inicio y fin están dentro de los límites
      if (inicio < 2) inicio = 2;
      if (fin > totalPaginas - bloquesLados) fin = totalPaginas - bloquesLados;

      // Agrega las primeras páginas fijas
      for (let i = 1; i <= bloquesLados; i++) {
        numeros.push(i);
      }

      // Agrega puntos suspensivos si es necesario
      if (inicio > bloquesLados + 1) {
        numeros.push('...');
      }

      // Agrega las páginas intermedias
      for (let i = inicio; i <= fin; i++) {
        numeros.push(i);
      }

      // Agrega puntos suspensivos si es necesario
      if (fin < totalPaginas - bloquesLados) {
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
    <div
      className={`flex items-center justify-between w-full px-4 py-3 lg:px-6 
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
        flex-wrap
      `}
    >
      {/* Botón "Anterior" para pantallas grandes */}
      <div className="hidden lg:flex lg:w-1/3 justify-start">
        <button
          onClick={() => handlePageClick(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded-md flex items-center space-x-4 transition-colors duration-200
            ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }
            // Aumentar tamaño en pantallas sm
            sm:px-5 sm:py-3
          `}
        >
          <ChevronLeftIcon
            className={`h-5 w-5 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              // Aumentar tamaño en pantallas sm
              sm:h-6 sm:w-6
            `}
            aria-hidden="true"
          />
          <span className="ml-2">Anterior</span>
        </button>
      </div>

      {/* Botones y números de página para pantallas pequeñas y grandes */}
      <div className="flex w-full lg:w-1/3 justify-center space-x-2">
        {/* Botón "Anterior" para pantallas pequeñas y sm */}
        <button
          onClick={() => handlePageClick(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`lg:hidden px-1 py-2 rounded-md flex items-center justify-center transition-colors duration-200
            ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }
            // Aumentar tamaño en pantallas sm
            sm:px-2 sm:py-3
          `}
          aria-label="Anterior"
        >
          <ChevronLeftIcon
            className={`h-4 w-4 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              // Aumentar tamaño en pantallas sm
              sm:h-5 sm:w-5
            `}
            aria-hidden="true"
          />
        </button>

        {/* Números de páginas */}
        <nav
          className="isolate inline-flex -space-x-px rounded-md shadow-lg"
          aria-label="Pagination"
        >
          {generarNumerosDePagina().map((num, index) => {
            // Asignar clases de tamaño
            const sizeClasses = 'w-[30px] h-[30px]';

            return (
              <button
                key={index}
                onClick={() => typeof num === 'number' && handlePageClick(num)}
                disabled={num === '...'}
                className={`relative inline-flex items-center justify-center ${sizeClasses} text-xs lg:text-lg font-semibold transition-colors duration-200
                  ${
                    num === '...'
                      ? 'cursor-default text-gray-500'
                      : 'cursor-pointer'
                  }
                  ${
                    num === paginaActual
                      ? isDarkMode
                        ? 'bg-black text-white'
                        : 'bg-indigo-100 text-indigo-700'
                      : isDarkMode
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-700 bg-white hover:bg-gray-100 ring-1 ring-gray-300'
                  }
                  ${
                    num === paginaActual
                      ? 'z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                      : ''
                  }
                  // Aumentar tamaño en pantallas sm
                  sm:w-10 sm:h-10 sm:text-sm
                `}
              >
                {num}
              </button>
            );
          })}
        </nav>

        {/* Botón "Siguiente" para pantallas pequeñas y sm */}
        <button
          onClick={() => handlePageClick(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`lg:hidden px-1 py-2 rounded-md flex items-center justify-center transition-colors duration-200
            ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }
            // Aumentar tamaño en pantallas sm
            sm:px-2 sm:py-3
          `}
          aria-label="Siguiente"
        >
          <ChevronRightIcon
            className={`h-4 w-4 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              // Aumentar tamaño en pantallas sm
              sm:h-5 sm:w-5
            `}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Botón "Siguiente" para pantallas grandes */}
      <div className="hidden lg:flex lg:w-1/3 justify-end">
        <button
          onClick={() => handlePageClick(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200
            ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }
            // Aumentar tamaño en pantallas sm
            sm:px-5 sm:py-3
          `}
        >
          <span className="mr-2">Siguiente</span>
          <ChevronRightIcon
            className={`h-5 w-5 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              // Aumentar tamaño en pantallas sm
              sm:h-6 sm:w-6
            `}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
////