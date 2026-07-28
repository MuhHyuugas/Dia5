import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseParticipant } from '../../domain/entities/expense-participant.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Group } from '../../domain/entities/group.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseParticipant, GroupMember, Group, Payment]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
