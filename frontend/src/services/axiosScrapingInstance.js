import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000", 
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
});

// Interceptor para manejar el token de acceso
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Obtén el token del localStorage
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Agrega el token a la cabecera
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;