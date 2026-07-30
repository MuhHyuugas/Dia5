import { api } from './api';

export interface Group {
  id: string;
  nome: string;
  codigoConvite: string;
  criadoPorId: string;
  createdAt: string;
}

export interface ActivityItem {
  tipo: 'DESPESA' | 'PAGAMENTO';
  id: string;
  descricao?: string;
  valorTotal?: number;
  valorPago?: number;
  pagador?: string;
  recebedor?: string;
  data: string;
}

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },

  async createGroup(nome: string): Promise<Group> {
    const response = await api.post<Group>('/groups', { nome });
    return response.data;
  },

  async joinGroup(codigoConvite: string): Promise<{ message: string; group: Group }> {
    const response = await api.post<{ message: string; group: Group }>('/groups/join', {
      codigoConvite,
    });
    return response.data;
  },

  async removeMember(groupId: string, memberId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  async getGroupActivity(groupId: string): Promise<ActivityItem[]> {
    const response = await api.get<ActivityItem[]>(`/groups/${groupId}/activity`);
    return response.data;
  },
};
