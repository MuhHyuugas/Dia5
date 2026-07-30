import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Resolve dinamicamente o IP do computador local para funcionar no celular via Expo Go sem fios
const host = Constants.expoConfig?.hostUri?.split(':').shift() || 'localhost';
const API_URL = `http://${host}:3000/api`;

console.log(`[Mobile API] Conectando ao backend em: ${API_URL}`);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar o JWT token salvo no AsyncStorage nativo
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('dia5_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de erros 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('dia5_token');
      await AsyncStorage.removeItem('dia5_user');
    }
    return Promise.reject(error);
  },
);
