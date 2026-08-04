import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'senha_hash' })
  senhaHash: string | null;

  @Column({ type: 'varchar', length: 6, unique: true, nullable: true, name: 'codigo_perfil' })
  codigoPerfil: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'foto_url' })
  fotoUrl: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_guest' })
  isGuest: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'criado_por' })
  criadoPorId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'criado_por' })
  criadoPor: User | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  validar(): void {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('O nome do usuário é obrigatório.');
    }

    if (this.isGuest) {
      if (!this.criadoPorId) {
        throw new Error('Um usuário convidado deve obrigatoriamente ter um usuário criador.');
      }
      if (this.email || this.senhaHash) {
        throw new Error('Usuários convidados não podem possuir e-mail ou senha.');
      }
    } else {
      if (!this.email || !this.senhaHash) {
        throw new Error('Usuários reais devem obrigatoriamente possuir e-mail e senha.');
      }
    }
  }
}
