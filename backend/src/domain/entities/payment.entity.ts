import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('pagamentos')
export class Payment {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'pagador_id' })
  pagadorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pagador_id' })
  pagador: User;

  @Column({ type: 'uuid', name: 'recebedor_id' })
  recebedorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recebedor_id' })
  recebedor: User;

  @Column({ type: 'uuid', nullable: true, name: 'grupo_id' })
  grupoId: string | null;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'grupo_id' })
  grupo: Group | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'valor_pago',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  valorPago: number;

  @Column({ type: 'timestamp', name: 'data_pagamento' })
  dataPagamento: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
