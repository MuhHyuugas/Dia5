import axios from 'axios';

// Define a URL base da API (localmente usa http://localhost:3000/api ou a rota /api em produção Vercel)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar automaticamente o token JWT no cabeçalho Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dia5_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para tratar erro 401 (Token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dia5_token');
      localStorage.removeItem('dia5_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
