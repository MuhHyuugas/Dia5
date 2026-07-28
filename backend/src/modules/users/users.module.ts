import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseParticipant } from '../../domain/entities/expense-participant.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expense, ExpenseParticipant, GroupMember, Payment]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
