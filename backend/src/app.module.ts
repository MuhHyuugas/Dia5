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
        const dbUrl =
          configService.get<string>('DATABASE_URL') ||
          configService.get<string>('POSTGRES_URL_NON_POOLING') ||
          configService.get<string>('POSTGRES_URL') ||
          configService.get<string>('SUPABASE_DATABASE_URL');

        const host =
          configService.get<string>('DB_HOST') ||
          configService.get<string>('POSTGRES_HOST') ||
          'localhost';
        const port =
          configService.get<number>('DB_PORT') ||
          configService.get<number>('POSTGRES_PORT') ||
          5432;
        const username =
          configService.get<string>('DB_USERNAME') ||
          configService.get<string>('POSTGRES_USER') ||
          'dia5_user';
        const password =
          configService.get<string>('DB_PASSWORD') ||
          configService.get<string>('POSTGRES_PASSWORD') ||
          'dia5_password';
        const database =
          configService.get<string>('DB_DATABASE') ||
          configService.get<string>('POSTGRES_DATABASE') ||
          'dia5_db';

        const dbSsl = configService.get<string>('DB_SSL');
        const isLocalhost = host === 'localhost' || host === '127.0.0.1';
        const isSslEnabled =
          dbSsl === 'true' || (dbSsl !== 'false' && (!isLocalhost || !!dbUrl));

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
            synchronize: false,
            ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
            extra: isSslEnabled
              ? {
                  ssl: {
                    rejectUnauthorized: false,
                  },
                }
              : {},
          };
        }

        return {
          type: 'postgres',
          host,
          port: Number(port),
          username,
          password,
          database,
          entities: [
            User,
            Friendship,
            Group,
            GroupMember,
            Expense,
            ExpenseParticipant,
            Payment,
          ],
          synchronize: false,
          ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
          extra: isSslEnabled
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : {},
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
