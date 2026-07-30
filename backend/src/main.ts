import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir que o frontend e o mobile façam requisições sem bloqueio
  app.enableCors();

  // Define prefixo global para as rotas
  app.setGlobalPrefix('api');

  // Habilita validação global de DTOs via class-validator de forma resiliente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Registra o filtro global de tratamento de erros com log detalhado
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
