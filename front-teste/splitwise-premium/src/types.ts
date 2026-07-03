/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser?: boolean;
}

export type ExpenseCategory = 'Entretenimento' | 'Alimentação' | 'Transporte' | 'Geral';

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidById: string; // Member who paid
  splitWithIds: string[]; // Members sharing the expense
  category: ExpenseCategory;
  date: string; // ISO date string or relative display
  isLiquidated?: boolean;
}

export interface Group {
  id: string;
  name: string;
  avatar: string;
  memberIds: string[];
}

export interface Activity {
  id: string;
  title: string;
  timeDescription: string;
  groupName?: string;
  type: 'payment' | 'expense' | 'join' | 'invite';
  amount?: number;
  date: Date;
}

export interface PixKey {
  id: string;
  type: 'CPF' | 'E-mail' | 'Telefone' | 'Chave Aleatória';
  key: string;
}
