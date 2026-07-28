import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../../domain/entities/group.entity';
import { GroupMember } from '../../domain/entities/group-member.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, Expense, Payment]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
