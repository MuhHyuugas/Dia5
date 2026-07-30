import { api } from './api';

export interface UserProfile {
  id: string;
  nome: string;
  email: string | null;
  codigoPerfil: string | null;
  isGuest: boolean;
  createdAt: string;
}

export const usersService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  },

  async createGuest(nome: string): Promise<UserProfile> {
    const response = await api.post<UserProfile>('/users/guests', { nome });
    return response.data;
  },

  async linkShadowUser(shadowUserId: string, codigoPerfil: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/link-shadow', {
      shadowUserId,
      codigoPerfil,
    });
    return response.data;
  },
};
