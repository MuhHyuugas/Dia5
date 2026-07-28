import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('grupos')
export class Group {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'varchar', length: 6, unique: true, name: 'codigo_convite' })
  codigoConvite: string;

  @Column({ type: 'uuid', name: 'criado_por' })
  criadoPorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'criado_por' })
  criadoPor: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
