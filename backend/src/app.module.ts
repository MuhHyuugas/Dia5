import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { Friendship } from './domain/entities/friendship.entity';
import { Group } from './domain/entities/group.entity';
import { GroupMember } from './domain/entities/group-member.entity';
import { Expense } from './domain/entities/expense.entity';
import { ExpenseParticipant } from './domain/entities/expense-participant.entity';
import { Payment } from './domain/entities/payment.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const dbSsl = configService.get<string>('DB_SSL');
        const isSslEnabled = dbSsl === 'true' || (dbSsl !== 'false' && !!dbUrl);

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [
              User,
              Friendship,
              Group,
              GroupMember,
              Expense,
              ExpenseParticipant,
              Payment,
            ],
            synchronize: true,
            ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'dia5_user'),
          password: configService.get<string>('DB_PASSWORD', 'dia5_password'),
          database: configService.get<string>('DB_DATABASE', 'dia5_db'),
          entities: [
            User,
            Friendship,
            Group,
            GroupMember,
            Expense,
            ExpenseParticipant,
            Payment,
          ],
          synchronize: true,
          ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    FriendshipsModule,
    GroupsModule,
    ExpensesModule,
    PaymentsModule,
  ],
})
export class AppModule {}
