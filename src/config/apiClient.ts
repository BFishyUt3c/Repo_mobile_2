import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
  baseURL: 'http://192.168.0.11:8081', // Cambia la IP si es necesario
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