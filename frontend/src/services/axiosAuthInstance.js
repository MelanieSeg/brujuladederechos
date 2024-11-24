import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: "http://localhost:4000/auth",
  withCredentials: true, // Para enviar cookies 
});

// Método para enviar correo de recuperación de contraseña
export const resetPasswordRequest = async (email) => {
  try {
    const response = await api.post('/reset-password-request', { email });
    return response.data;
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    throw error;
  }
};

export const verifyResetToken = async (email, verificationCode) => {
  try {
    const response = await api.post('/verify-reset-token', { 
      email, 
      verificationCode 
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar código:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    throw error;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem("accessToken")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/refresh-token");
        const { accessToken: newAccessToken, user: refreshedUser } = response.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

