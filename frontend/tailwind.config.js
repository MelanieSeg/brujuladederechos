/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Incluye todos los archivos de tu proyecto donde Tailwind será utilizado
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a202c',  // Fondo oscuro personalizado
        'dark-text': '#edf2f7', // Texto claro para modo oscuro
        'light-bg': '#f7fafc',  // Fondo claro personalizado
        'light-text': '#2d3748', // Texto oscuro para modo claro
        'sidebar-light': '#ffffff', // Fondo de barra lateral en modo claro
        'sidebar-dark': '#2d3748', // Fondo de barra lateral en modo oscuro
      },
      spacing: {
        '128': '32rem', // Agregar más opciones de espacio si las necesitas
      },
    },
  },
  darkMode: 'class', // Activar modo oscuro por clase
  plugins: [],
};