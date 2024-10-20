import axios from "axios";

// Variables para manejar el refresco de token (si las necesitas más adelante)
let isRefreshing = false;
let failedQueue = [];

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true
});

// Función para guardar las configuraciones del usuario
export const saveSettings = async (data) => {
  try {
    // Creamos el FormData solo si se necesita enviar archivos (como una imagen de perfil)
    const formData = new FormData();
    formData.append('webScrapingFrequency', data.webScrapingFrequency);
    formData.append('theme', data.theme);

    // Solo agregar contraseña si el usuario intenta cambiarla
    if (data.password) {
      formData.append('password', data.password);
    }

    // Si hay una imagen de perfil, también la agregamos
    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture);
    }

    // Usamos la instancia de axios configurada (api) para hacer la petición
    const response = await api.post('/api/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Retornamos la respuesta, si el backend devuelve { success: true }
    return response.data;
  } catch (error) {
    // Manejo detallado del error
    console.error('Error guardando configuraciones:', error);

    // Si hay una respuesta del servidor con detalles, la mostramos
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }

    // Retornamos un objeto de error para que el frontend pueda manejarlo
    return { success: false, error: error.message };
  }
};

export default api;
