import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { User } from '../../domain/entities/user.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User, Expense, GroupMember]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
