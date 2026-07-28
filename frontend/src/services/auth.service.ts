import { api } from './api';

export interface RegisterDto {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  nome: string;
  email: string;
  codigoPerfil: string;
}

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', dto);
    if (response.data.token) {
      localStorage.setItem('dia5_token', response.data.token);
      localStorage.setItem('dia5_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', dto);
    if (response.data.token) {
      localStorage.setItem('dia5_token', response.data.token);
      localStorage.setItem('dia5_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('dia5_token');
    localStorage.removeItem('dia5_user');
    window.location.href = '/login';
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('dia5_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('dia5_token');
  },
};
