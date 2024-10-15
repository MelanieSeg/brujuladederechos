// utils/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const ThemeContext = createContext();

// Proveedor del tema para envolver la aplicación
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cargar el estado inicial desde localStorage o defecto
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  // Alternar entre modo oscuro y claro
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode); // Guardar en localStorage
      return newMode;
    });
  };

  // Efecto para aplicar la clase 'dark' a <html> según el estado de `isDarkMode`
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};