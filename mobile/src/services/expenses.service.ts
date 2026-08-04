import { api } from './api';

export interface ParticipantInput {
  usuarioId: string;
  valorDevido: number;
}

export interface CreateExpenseInput {
  grupoId: string;
  pagadorId: string;
  descricao: string;
  valorTotal: number;
  dataCompra: string;
  participantes: ParticipantInput[];
}

export interface GroupBalanceMember {
  usuarioId: string;
  nome: string;
  isGuest?: boolean;
  saldoLiquido: number;
  situacao: 'A Receber' | 'Devendo' | 'Quitado';
}

export interface GroupBalanceResponse {
  grupoId: string;
  balancoIndividual: GroupBalanceMember[];
}

export const expensesService = {
  async createExpense(input: CreateExpenseInput): Promise<any> {
    const response = await api.post('/expenses', input);
    return response.data;
  },

  async updateExpense(expenseId: string, input: Partial<CreateExpenseInput>): Promise<any> {
    const response = await api.put(`/expenses/${expenseId}`, input);
    return response.data;
  },

  async deleteExpense(expenseId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/expenses/${expenseId}`);
    return response.data;
  },

  async getGroupBalance(groupId: string): Promise<GroupBalanceResponse> {
    const response = await api.get<GroupBalanceResponse>(`/expenses/group/${groupId}/balance`);
    return response.data;
  },
};
