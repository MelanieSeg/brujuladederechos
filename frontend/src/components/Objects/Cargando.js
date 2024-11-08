import React, { useContext } from 'react';
import { ThemeContext } from '../../utils/ThemeContext'; 

export default function Cargando() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        <div 
          className={`
            w-24 h-24 rounded-full animate-spin 
            ${isDarkMode 
              ? 'border-8 border-opacity-30 border-white border-t-white' 
              : 'border-8 border-opacity-30 border-black border-t-black'
            } 
            absolute top-0 left-0
          `}
        ></div>
        <div 
          className={`
            w-24 h-24 rounded-full animate-spin-reverse 
            ${isDarkMode 
              ? 'border-8 border-opacity-30 border-white border-r-white' 
              : 'border-8 border-opacity-30 border-black border-r-black'
            } 
            absolute top-0 left-0
          `}
        ></div>
        <div 
          className={`
            w-24 h-24 rounded-full animate-ping 
            ${isDarkMode 
              ? 'border-4 border-white' 
              : 'border-4 border-black'
            } 
            absolute top-0 left-0
          `}
        ></div>
      </div>
    </div>
  );
}

