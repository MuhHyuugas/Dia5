import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseParticipant } from '../../domain/entities/expense-participant.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Group } from '../../domain/entities/group.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseParticipant)
    private readonly participantRepository: Repository<ExpenseParticipant>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async createExpense(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    // 1. Valida se o usuário que está registrando pertence ao grupo
    const isMember = await this.groupMemberRepository.findOne({
      where: { grupoId: dto.grupoId, usuarioId: userId },
    });

    if (!isMember) {
      throw new ForbiddenException('Você não pertence a este grupo para lançar despesas.');
    }

    // 2. Instancia a despesa
    const expense = new Expense();
    expense.id = randomUUID();
    expense.grupoId = dto.grupoId;
    expense.pagadorId = dto.pagadorId;
    expense.descricao = dto.descricao;
    expense.valorTotal = Number(dto.valorTotal);
    expense.dataCompra = new Date(dto.dataCompra);

    // 3. Instancia os participantes
    expense.participantes = dto.participantes.map((p) => {
      const part = new ExpenseParticipant();
      part.despesaId = expense.id;
      part.usuarioId = p.usuarioId;
      part.valorDevido = Number(p.valorDevido);
      return part;
    });

    // 4. Executa a validação de domínio (RN03 / UC01 FE01: Soma das partes == Valor Total)
    expense.validar();

    await this.expenseRepository.save(expense);

    return expense;
  }

  async updateExpense(userId: string, expenseId: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId },
      relations: { grupo: true, participantes: true },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada.');
    }

    // Valida permissão: apenas o pagador/autor da despesa ou o admin do grupo (RN07)
    if (expense.pagadorId !== userId && expense.grupo?.criadoPorId !== userId) {
      throw new ForbiddenException('Apenas o autor da despesa ou o criador do grupo pode editá-la.');
    }

    if (dto.descricao !== undefined) expense.descricao = dto.descricao;
    if (dto.valorTotal !== undefined) expense.valorTotal = Number(dto.valorTotal);
    if (dto.dataCompra !== undefined) expense.dataCompra = new Date(dto.dataCompra);

    if (dto.participantes !== undefined) {
      // Remove participantes antigos e adiciona os novos
      await this.participantRepository.delete({ despesaId: expenseId });
      expense.participantes = dto.participantes.map((p) => {
        const part = new ExpenseParticipant();
        part.despesaId = expense.id;
        part.usuarioId = p.usuarioId;
        part.valorDevido = Number(p.valorDevido);
        return part;
      });
    }

    // Roda validação da soma das partes se o valor ou participantes mudaram
    expense.validar();

    await this.expenseRepository.save(expense);

    return expense;
  }

  async deleteExpense(userId: string, expenseId: string): Promise<{ message: string }> {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId },
      relations: { grupo: true },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada.');
    }

    // Valida permissão (RN07)
    if (expense.pagadorId !== userId && expense.grupo?.criadoPorId !== userId) {
      throw new ForbiddenException('Apenas o autor da despesa ou o criador do grupo pode excluí-la.');
    }

    // Executa Soft Delete (RN08: deletedAt = new Date())
    await this.expenseRepository.softDelete(expenseId);

    return { message: 'Despesa excluída com sucesso (Soft Delete).' };
  }

  async getGroupBalance(userId: string, groupId: string): Promise<any> {
    const isMember = await this.groupMemberRepository.findOne({
      where: { grupoId: groupId, usuarioId: userId },
    });

    if (!isMember) {
      throw new ForbiddenException('Você não pertence a este grupo.');
    }

    // Busca membros do grupo
    const members = await this.groupMemberRepository.find({
      where: { grupoId: groupId },
      relations: { usuario: true },
    });

    // Busca despesas ativas do grupo (deletedAt IS NULL via TypeORM default)
    const expenses = await this.expenseRepository.find({
      where: { grupoId: groupId },
      relations: { participantes: true },
    });

    // Busca liquidações no grupo
    const payments = await this.paymentRepository.find({
      where: { grupoId: groupId },
    });

    // Calcula o balanço financeiro individual de cada membro (RF11)
    const balances = members.map((m) => {
      const uId = m.usuarioId;
      let totalPagoDespesas = 0;
      let totalDevidoDespesas = 0;

      for (const exp of expenses) {
        if (exp.pagadorId === uId) {
          totalPagoDespesas += Number(exp.valorTotal);
        }
        const part = exp.participantes?.find((p) => p.usuarioId === uId);
        if (part) {
          totalDevidoDespesas += Number(part.valorDevido);
        }
      }

      const totalPagamentosEfetuados = payments
        .filter((p) => p.pagadorId === uId)
        .reduce((sum, p) => sum + Number(p.valorPago), 0);

      const totalPagamentosRecebidos = payments
        .filter((p) => p.recebedorId === uId)
        .reduce((sum, p) => sum + Number(p.valorPago), 0);

      const saldoLiquido = (totalPagoDespesas + totalPagamentosEfetuados) - (totalDevidoDespesas + totalPagamentosRecebidos);

      return {
        usuarioId: uId,
        nome: m.usuario?.nome,
        saldoLiquido: Math.round(saldoLiquido * 100) / 100,
        situacao: saldoLiquido > 0 ? 'A Receber' : saldoLiquido < 0 ? 'Devendo' : 'Quitado',
      };
    });

    return {
      grupoId: groupId,
      balancoIndividual: balances,
    };
  }
}
