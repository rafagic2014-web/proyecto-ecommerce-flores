import axios from 'axios';

/**
 *  CONFIGURACIÓN DE AXIOS
 * Define la URL base del backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

/**
 *  INTERCEPTOR DE TOKEN
 * Envía el token automáticamente en cada request
 */
api.interceptors.request.use((config) => {

  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
