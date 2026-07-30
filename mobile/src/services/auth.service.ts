import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      await AsyncStorage.setItem('dia5_token', response.data.token);
      await AsyncStorage.setItem('dia5_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', dto);
    if (response.data.token) {
      await AsyncStorage.setItem('dia5_token', response.data.token);
      await AsyncStorage.setItem('dia5_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('dia5_token');
    await AsyncStorage.removeItem('dia5_user');
  },

  async getCurrentUser(): Promise<AuthResponse | null> {
    const userStr = await AsyncStorage.getItem('dia5_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('dia5_token');
    return !!token;
  },
};
