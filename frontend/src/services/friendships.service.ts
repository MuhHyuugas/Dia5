import { api } from './api';

export interface Friend {
  id: string;
  nome: string;
  email: string | null;
  codigoPerfil: string | null;
}

export const friendshipsService = {
  async getFriends(): Promise<Friend[]> {
    const response = await api.get<Friend[]>('/friends');
    return response.data;
  },

  async addFriend(codigoPerfil: string): Promise<Friend> {
    const response = await api.post<Friend>('/friends/add', { codigoPerfil });
    return response.data;
  },

  async removeFriend(friendId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/friends/${friendId}`);
    return response.data;
  },
};
