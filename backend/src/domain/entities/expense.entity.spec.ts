import { Expense } from './expense.entity';
import { ExpenseParticipant } from './expense-participant.entity';

describe('Expense Domain Entity', () => {
  it('should throw an error when sum of participant values does not equal total value', () => {
    const expense = new Expense();
    expense.descricao = 'Ingressos Marina Sena';
    expense.valorTotal = 300.00;

    const p1 = new ExpenseParticipant();
    p1.valorDevido = 100.00;

    const p2 = new ExpenseParticipant();
    p2.valorDevido = 100.00;

    const p3 = new ExpenseParticipant();
    p3.valorDevido = 99.99; // Total sum = 299.99 (diverges from 300.00)

    expense.participantes = [p1, p2, p3];

    expect(() => expense.validar()).toThrow('A soma das partes deve ser igual ao valor total.');
  });

  it('should pass validation when sum of participant values equals total value', () => {
    const expense = new Expense();
    expense.descricao = 'Ingressos Marina Sena - Divisao Exata';
    expense.valorTotal = 300.00;

    const p1 = new ExpenseParticipant();
    p1.valorDevido = 100.00;

    const p2 = new ExpenseParticipant();
    p2.valorDevido = 100.00;

    const p3 = new ExpenseParticipant();
    p3.valorDevido = 100.00; // Total sum = 300.00

    expense.participantes = [p1, p2, p3];

    expect(() => expense.validar()).not.toThrow();
  });
});
