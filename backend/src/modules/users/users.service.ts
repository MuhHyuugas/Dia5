import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseParticipant } from '../../domain/entities/expense-participant.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { CreateGuestUserDto } from './dto/create-guest.dto';
import { LinkShadowUserDto } from './dto/link-shadow.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createGuest(criadoPorId: string, dto: CreateGuestUserDto): Promise<Partial<User>> {
    const guest = new User();
    guest.id = randomUUID();
    guest.nome = dto.nome;
    guest.email = null;
    guest.senhaHash = null;
    guest.codigoPerfil = null;
    guest.isGuest = true;
    guest.criadoPorId = criadoPorId;

    // Roda validação da entidade do domínio
    guest.validar();

    await this.userRepository.save(guest);

    return {
      id: guest.id,
      nome: guest.nome,
      isGuest: guest.isGuest,
      criadoPorId: guest.criadoPorId,
    };
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      codigoPerfil: user.codigoPerfil,
      isGuest: user.isGuest,
      createdAt: user.createdAt,
    };
  }

  async linkShadowUser(criadoPorId: string, dto: LinkShadowUserDto): Promise<{ message: string }> {
    // 1. Busca o perfil fantasma e verifica permissão (deve ter sido criado pelo usuário atual)
    const shadowUser = await this.userRepository.findOne({
      where: { id: dto.shadowUserId, isGuest: true, criadoPorId },
    });

    if (!shadowUser) {
      throw new BadRequestException(
        'Perfil convidado não encontrado ou você não tem permissão para vinculá-lo.',
      );
    }

    // 2. Busca o usuário real pelo Código de Perfil
    const codigoFormatado = dto.codigoPerfil.toUpperCase();
    const realUser = await this.userRepository.findOne({
      where: { codigoPerfil: codigoFormatado, isGuest: false },
    });

    if (!realUser) {
      throw new NotFoundException(
        'Código de perfil inválido. Nenhum usuário real foi encontrado com este código.',
      );
    }

    // 3. Executa a migração atômica de dados dentro de uma transação no Banco de Dados (RN05)
    await this.dataSource.transaction(async (manager) => {
      // Reatribui o pagador das despesas antigas do Shadow User para o Usuário Real
      await manager.update(Expense, { pagadorId: shadowUser.id }, { pagadorId: realUser.id });

      // Reatribui os participantes das despesas antigas
      await manager.update(ExpenseParticipant, { usuarioId: shadowUser.id }, { usuarioId: realUser.id });

      // Reatribui membros de grupo
      await manager.update(GroupMember, { usuarioId: shadowUser.id }, { usuarioId: realUser.id });

      // Reatribui pagamentos efetuados ou recebidos
      await manager.update(Payment, { pagadorId: shadowUser.id }, { pagadorId: realUser.id });
      await manager.update(Payment, { recebedorId: shadowUser.id }, { recebedorId: realUser.id });

      // Exclui o perfil fantasma da tabela usuarios
      await manager.delete(User, { id: shadowUser.id });
    });

    return {
      message: `Todo o histórico de ${shadowUser.nome} foi transferido com sucesso para ${realUser.nome}!`,
    };
  }
}
