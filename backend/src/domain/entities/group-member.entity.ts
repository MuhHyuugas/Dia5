import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('membros_grupo')
export class GroupMember {
  @PrimaryColumn({ type: 'uuid', name: 'grupo_id' })
  grupoId: string;

  @PrimaryColumn({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn({ type: 'timestamp', name: 'joined_at' })
  joinedAt: Date;
}
