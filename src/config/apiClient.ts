import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const apiClient = axios.create({
  baseURL: API_URL, // Ahora usa la variable de entorno
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de red y status HTTP
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.message = 'Error de conexión. Verifica tu conexión a internet.';
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED') {
      error.message = 'La solicitud tardó demasiado tiempo. Inténtalo de nuevo.';
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        await AsyncStorage.removeItem('token');
        error.message = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        break;
      case 403:
        error.message = data?.message || 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        error.message = data?.message || 'El recurso solicitado no fue encontrado.';
        break;
      case 422:
        error.message = data?.message || 'Los datos enviados no son válidos.';
        break;
      case 500:
        error.message = data?.message || 'Error interno del servidor. Inténtalo más tarde.';
        break;
      default:
        error.message = data?.message || `Error ${status}: ${error.message}`;
    }

    return Promise.reject(error);
  }
); 