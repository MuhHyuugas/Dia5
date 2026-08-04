import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../../domain/entities/group.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto): Promise<Group> {
    const codigoConvite = await this.generateUniqueInviteCode();

    const group = new Group();
    group.id = randomUUID();
    group.nome = dto.nome;
    group.codigoConvite = codigoConvite;
    group.criadoPorId = userId;

    await this.groupRepository.save(group);

    // Vincula o criador como membro do grupo
    const member = new GroupMember();
    member.grupoId = group.id;
    member.usuarioId = userId;
    await this.groupMemberRepository.save(member);

    return group;
  }

  async joinGroup(userId: string, dto: JoinGroupDto): Promise<{ message: string; group: Group }> {
    const codigoFormatado = dto.codigoConvite.toUpperCase();
    const group = await this.groupRepository.findOne({
      where: { codigoConvite: codigoFormatado },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado. Verifique o código digitado.');
    }

    // Verifica se já é membro (UC05 FE02)
    const existingMember = await this.groupMemberRepository.findOne({
      where: { grupoId: group.id, usuarioId: userId },
    });

    if (existingMember) {
      return {
        message: 'Você já pertence a este grupo.',
        group,
      };
    }

    const newMember = new GroupMember();
    newMember.grupoId = group.id;
    newMember.usuarioId = userId;
    await this.groupMemberRepository.save(newMember);

    return {
      message: 'Você entrou no grupo com sucesso!',
      group,
    };
  }

  async listUserGroups(userId: string): Promise<Group[]> {
    const memberships = await this.groupMemberRepository.find({
      where: { usuarioId: userId },
      relations: { grupo: true },
    });

    return memberships.map((m) => m.grupo);
  }

  async removeMember(requestingUserId: string, groupId: string, memberId: string): Promise<{ message: string }> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    // Apenas o criador pode remover outros participantes (ou o próprio usuário se quiser sair)
    if (group.criadoPorId !== requestingUserId && requestingUserId !== memberId) {
      throw new ForbiddenException('Apenas o criador do grupo possui permissão para remover participantes.');
    }

    const membership = await this.groupMemberRepository.findOne({
      where: { grupoId: groupId, usuarioId: memberId },
    });

    if (!membership) {
      throw new NotFoundException('Participante não encontrado neste grupo.');
    }

    // Validação de Saldo ZERADO (RN06)
    const groupBalance = await this.calculateMemberGroupBalance(groupId, memberId);
    if (Math.abs(groupBalance) > 0.01) {
      throw new BadRequestException(
        `O participante possui um saldo pendente neste grupo (Saldo: R$ ${groupBalance.toFixed(
          2,
        )}). Não é possível removê-lo até que todas as dívidas sejam liquidadas.`,
      );
    }

    await this.groupMemberRepository.remove(membership);

    return { message: 'Participante removido do grupo com sucesso.' };
  }

  async getGroupActivity(userId: string, groupId: string): Promise<any[]> {
    // Valida se o usuário pertence ao grupo
    const isMember = await this.groupMemberRepository.findOne({
      where: { grupoId: groupId, usuarioId: userId },
    });

    if (!isMember) {
      throw new ForbiddenException('Você não tem acesso a este grupo.');
    }

    // Busca despesas do grupo
    const expenses = await this.expenseRepository.find({
      where: { grupoId: groupId },
      relations: { pagador: true, participantes: true },
      order: { createdAt: 'DESC' },
    });

    // Busca pagamentos/liquidações do grupo (filtrando autopagamentos inválidos)
    const payments = await this.paymentRepository.find({
      where: { grupoId: groupId },
      relations: { pagador: true, recebedor: true },
      order: { createdAt: 'DESC' },
    });

    const validPayments = payments.filter((p) => p.pagadorId && p.recebedorId && p.pagadorId !== p.recebedorId);

    // Consolida timeline cronológica (RF08)
    const activities = [
      ...expenses.map((e) => ({
        tipo: 'DESPESA',
        id: e.id,
        descricao: e.descricao,
        valorTotal: e.valorTotal,
        pagador: e.pagador?.nome,
        data: e.createdAt,
      })),
      ...validPayments.map((p) => ({
        tipo: 'PAGAMENTO',
        id: p.id,
        valorPago: p.valorPago,
        pagador: p.pagador?.nome,
        recebedor: p.recebedor?.nome,
        data: p.createdAt,
      })),
    ];

    return activities.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  private async calculateMemberGroupBalance(groupId: string, memberId: string): Promise<number> {
    const expenses = await this.expenseRepository.find({
      where: { grupoId: groupId },
      relations: { participantes: true },
    });

    let totalPago = 0;
    let totalDevido = 0;

    for (const exp of expenses) {
      if (exp.pagadorId === memberId) {
        totalPago += Number(exp.valorTotal);
      }
      const part = exp.participantes?.find((p) => p.usuarioId === memberId);
      if (part) {
        totalDevido += Number(part.valorDevido);
      }
    }

    const paymentsPaid = await this.paymentRepository.find({
      where: { grupoId: groupId, pagadorId: memberId },
    });
    const totalPagamentosEfetuados = paymentsPaid.reduce((sum, p) => sum + Number(p.valorPago), 0);

    const paymentsReceived = await this.paymentRepository.find({
      where: { grupoId: groupId, recebedorId: memberId },
    });
    const totalPagamentosRecebidos = paymentsReceived.reduce((sum, p) => sum + Number(p.valorPago), 0);

    return (totalPago + totalPagamentosEfetuados) - (totalDevido + totalPagamentosRecebidos);
  }

  private async generateUniqueInviteCode(): Promise<string> {
    let codigo: string;
    let exists = true;
    while (exists) {
      codigo = randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
      const existing = await this.groupRepository.findOne({ where: { codigoConvite: codigo } });
      if (!existing) {
        exists = false;
      }
    }
    return codigo!;
  }
}
