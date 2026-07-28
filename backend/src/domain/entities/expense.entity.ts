import { Entity, PrimaryColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';
import { ExpenseParticipant } from './expense-participant.entity';

@Entity('despesas')
export class Expense {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'grupo_id' })
  grupoId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Group;

  @Column({ type: 'uuid', name: 'pagador_id' })
  pagadorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pagador_id' })
  pagador: User;

  @Column({ type: 'varchar' })
  descricao: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'valor_total',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  valorTotal: number;

  @Column({ type: 'timestamp', name: 'data_compra' })
  dataCompra: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => ExpenseParticipant, (participant) => participant.expense, { cascade: true })
  participantes: ExpenseParticipant[];

  validar(): void {
    if (!this.participantes || this.participantes.length === 0) {
      throw new Error('A despesa deve possuir participantes.');
    }

    const somaPartes = this.participantes.reduce((sum, p) => sum + Number(p.valorDevido), 0);

    const somaArredondada = Math.round(somaPartes * 100) / 100;
    const totalArredondado = Math.round(Number(this.valorTotal) * 100) / 100;

    if (somaArredondada !== totalArredondado) {
      throw new Error('A soma das partes deve ser igual ao valor total.');
    }
  }
}
