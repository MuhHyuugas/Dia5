import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Expense } from './expense.entity';
import { User } from './user.entity';

@Entity('participantes_despesa')
export class ExpenseParticipant {
  @PrimaryColumn({ type: 'uuid', name: 'despesa_id' })
  despesaId: string;

  @PrimaryColumn({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Expense, (expense) => expense.participantes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'despesa_id' })
  expense: Expense;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'valor_devido',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  valorDevido: number;
}
