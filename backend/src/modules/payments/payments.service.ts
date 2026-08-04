import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { User } from '../../domain/entities/user.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
  ) {}

  async getGlobalBalance(userId: string, friendId: string): Promise<any> {
    const friend = await this.userRepository.findOne({ where: { id: friendId } });
    if (!friend) {
      throw new NotFoundException('Usuário amigo não encontrado.');
    }

    // 1. Busca todas as despesas pagas pelo userId que o friendId participou
    const expensesPaidByMe = await this.expenseRepository.find({
      where: { pagadorId: userId },
      relations: { participantes: true, grupo: true },
    });

    let friendOwesMe = 0;
    const discriminacao: any[] = [];

    for (const exp of expensesPaidByMe) {
      const part = exp.participantes?.find((p) => p.usuarioId === friendId);
      if (part) {
        const valor = Number(part.valorDevido);
        friendOwesMe += valor;
        discriminacao.push({
          grupo: exp.grupo?.nome || 'Sem grupo',
          descricao: exp.descricao,
          tipo: 'A RECEBER',
          valor,
          data: exp.createdAt,
        });
      }
    }

    // 2. Busca todas as despesas pagas pelo friendId que o userId participou
    const expensesPaidByFriend = await this.expenseRepository.find({
      where: { pagadorId: friendId },
      relations: { participantes: true, grupo: true },
    });

    let iOweFriend = 0;

    for (const exp of expensesPaidByFriend) {
      const part = exp.participantes?.find((p) => p.usuarioId === userId);
      if (part) {
        const valor = Number(part.valorDevido);
        iOweFriend += valor;
        discriminacao.push({
          grupo: exp.grupo?.nome || 'Sem grupo',
          descricao: exp.descricao,
          tipo: 'A PAGAR',
          valor,
          data: exp.createdAt,
        });
      }
    }

    // 3. Pagamentos efetuados de userId para friendId
    const myPayments = await this.paymentRepository.find({
      where: { pagadorId: userId, recebedorId: friendId },
    });
    const totalMyPayments = myPayments.reduce((sum, p) => sum + Number(p.valorPago), 0);

    // 4. Pagamentos efetuados de friendId para userId
    const friendPayments = await this.paymentRepository.find({
      where: { pagadorId: friendId, recebedorId: userId },
    });
    const totalFriendPayments = friendPayments.reduce((sum, p) => sum + Number(p.valorPago), 0);

    // Saldo líquido final (RF12 / UC08)
    const saldoLiquido = (friendOwesMe - totalFriendPayments) - (iOweFriend - totalMyPayments);

    return {
      amigoId: friend.id,
      amigoNome: friend.nome,
      saldoLiquido: Math.round(saldoLiquido * 100) / 100,
      situacao: saldoLiquido > 0 ? `Você tem a receber R$ ${saldoLiquido.toFixed(2)}` : saldoLiquido < 0 ? `Você deve R$ ${Math.abs(saldoLiquido).toFixed(2)}` : 'Quitado',
      discriminacao,
    };
  }

  async settleDebt(userId: string, dto: CreatePaymentDto): Promise<{ message: string; payment: Payment }> {
    const pagadorId = dto.pagadorId || userId;

    if (pagadorId === dto.recebedorId) {
      throw new BadRequestException('Não é possível registrar uma quitação de uma pessoa para ela mesma.');
    }

    const recebedor = await this.userRepository.findOne({ where: { id: dto.recebedorId } });
    if (!recebedor) {
      throw new NotFoundException('Usuário recebedor não encontrado.');
    }

    const pagador = await this.userRepository.findOne({ where: { id: pagadorId } });
    if (!pagador) {
      throw new NotFoundException('Usuário pagador não encontrado.');
    }

    let targetGroupId = dto.grupoId || null;
    if (!targetGroupId) {
      // Se grupoId não foi passado, procura se ambos pertencem a um grupo em comum
      const myMemberships = await this.groupMemberRepository.find({ where: { usuarioId: pagadorId } });
      for (const m of myMemberships) {
        const otherMember = await this.groupMemberRepository.findOne({
          where: { grupoId: m.grupoId, usuarioId: dto.recebedorId },
        });
        if (otherMember) {
          targetGroupId = m.grupoId;
          break;
        }
      }
    }

    const payment = new Payment();
    payment.id = randomUUID();
    payment.pagadorId = pagadorId;
    payment.recebedorId = dto.recebedorId;
    payment.grupoId = targetGroupId;
    payment.valorPago = Number(dto.valorPago);
    payment.dataPagamento = new Date();

    await this.paymentRepository.save(payment);

    return {
      message: 'Pagamento de liquidação registrado com sucesso!',
      payment,
    };
  }
}
