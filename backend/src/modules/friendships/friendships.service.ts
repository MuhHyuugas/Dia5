import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../../domain/entities/friendship.entity';
import { User } from '../../domain/entities/user.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseParticipant } from '../../domain/entities/expense-participant.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { AddFriendDto } from './dto/add-friend.dto';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseParticipant)
    private readonly participantRepository: Repository<ExpenseParticipant>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async addFriend(userId: string, dto: AddFriendDto): Promise<Partial<User>> {
    const codigoFormatado = dto.codigoPerfil.toUpperCase();
    const targetUser = await this.userRepository.findOne({
      where: { codigoPerfil: codigoFormatado, isGuest: false },
    });

    if (!targetUser) {
      throw new NotFoundException('Nenhum usuário foi encontrado com este Código de Perfil.');
    }

    if (targetUser.id === userId) {
      throw new BadRequestException('Você não pode adicionar a si mesmo como amigo.');
    }

    // Verifica se já existe amizade (em qualquer uma das duas direções)
    const existing = await this.friendshipRepository.findOne({
      where: [
        { usuarioId1: userId, usuarioId2: targetUser.id },
        { usuarioId1: targetUser.id, usuarioId2: userId },
      ],
    });

    if (existing) {
      throw new BadRequestException('Vocês já possuem um vínculo de amizade.');
    }

    const friendship = new Friendship();
    friendship.usuarioId1 = userId;
    friendship.usuarioId2 = targetUser.id;

    await this.friendshipRepository.save(friendship);

    return {
      id: targetUser.id,
      nome: targetUser.nome,
      email: targetUser.email,
      codigoPerfil: targetUser.codigoPerfil,
    };
  }

  async listFriends(userId: string): Promise<Partial<User>[]> {
    const friendships = await this.friendshipRepository.find({
      where: [{ usuarioId1: userId }, { usuarioId2: userId }],
      relations: { usuario1: true, usuario2: true },
    });

    return friendships.map((f) => {
      const friend = f.usuarioId1 === userId ? f.usuario2 : f.usuario1;
      return {
        id: friend.id,
        nome: friend.nome,
        email: friend.email,
        codigoPerfil: friend.codigoPerfil,
      };
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<{ message: string }> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { usuarioId1: userId, usuarioId2: friendId },
        { usuarioId1: friendId, usuarioId2: userId },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Vínculo de amizade não encontrado.');
    }

    // Validação de Saldo ZERADO (RN06 / FE01 UC06)
    const netBalance = await this.calculateNetBalance(userId, friendId);
    if (Math.abs(netBalance) > 0.01) {
      throw new BadRequestException(
        `Não é possível desfazer a amizade enquanto houver saldo pendente entre vocês (Saldo atual: R$ ${netBalance.toFixed(
          2,
        )}). Quitem as dívidas primeiro.`,
      );
    }

    await this.friendshipRepository.remove(friendship);

    return { message: 'Amizade desfeita com sucesso.' };
  }

  private async calculateNetBalance(userAId: string, userBId: string): Promise<number> {
    // 1. Despesas pagas por userA onde userB participou
    const expensesPaidByA = await this.expenseRepository.find({
      where: { pagadorId: userAId },
      relations: { participantes: true },
    });

    let amountBOwesA = 0;
    for (const exp of expensesPaidByA) {
      const partB = exp.participantes?.find((p) => p.usuarioId === userBId);
      if (partB) {
        amountBOwesA += Number(partB.valorDevido);
      }
    }

    // 2. Despesas pagas por userB onde userA participou
    const expensesPaidByB = await this.expenseRepository.find({
      where: { pagadorId: userBId },
      relations: { participantes: true },
    });

    let amountAOwesB = 0;
    for (const exp of expensesPaidByB) {
      const partA = exp.participantes?.find((p) => p.usuarioId === userAId);
      if (partA) {
        amountAOwesB += Number(partA.valorDevido);
      }
    }

    // 3. Pagamentos feitos de userA para userB
    const paymentsAtoB = await this.paymentRepository.find({
      where: { pagadorId: userAId, recebedorId: userBId },
    });
    const totalApaidB = paymentsAtoB.reduce((sum, p) => sum + Number(p.valorPago), 0);

    // 4. Pagamentos feitos de userB para userA
    const paymentsBtoA = await this.paymentRepository.find({
      where: { pagadorId: userBId, recebedorId: userAId },
    });
    const totalBpaidA = paymentsBtoA.reduce((sum, p) => sum + Number(p.valorPago), 0);

    // Saldo líquido na perspectiva do userA (+ significa que B deve a A, - significa que A deve a B)
    const netBalance = (amountBOwesA - totalBpaidA) - (amountAOwesB - totalApaidB);
    return netBalance;
  }
}
