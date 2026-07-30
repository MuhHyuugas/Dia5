import { api } from './api';

export interface GlobalBalanceDiscriminacao {
  grupo: string;
  descricao: string;
  tipo: 'A RECEBER' | 'A PAGAR';
  valor: number;
  data: string;
}

export interface GlobalBalanceResponse {
  amigoId: string;
  amigoNome: string;
  saldoLiquido: number;
  situacao: string;
  discriminacao: GlobalBalanceDiscriminacao[];
}

export interface CreatePaymentInput {
  recebedorId: string;
  grupoId?: string;
  valorPago: number;
}

export const paymentsService = {
  async getGlobalBalance(friendId: string): Promise<GlobalBalanceResponse> {
    const response = await api.get<GlobalBalanceResponse>(`/payments/balance/global/${friendId}`);
    return response.data;
  },

  async settleDebt(input: CreatePaymentInput): Promise<{ message: string; payment: any }> {
    const response = await api.post<{ message: string; payment: any }>('/payments', input);
    return response.data;
  },
};
