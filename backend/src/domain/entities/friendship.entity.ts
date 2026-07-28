import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('amizades')
export class Friendship {
  @PrimaryColumn({ type: 'uuid', name: 'usuario_id_1' })
  usuarioId1: string;

  @PrimaryColumn({ type: 'uuid', name: 'usuario_id_2' })
  usuarioId2: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id_1' })
  usuario1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id_2' })
  usuario2: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
