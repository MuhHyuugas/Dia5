import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import express from 'express';
import 'pg'; // Força o Vercel a empacotar o driver do Postgres!

// Desabilita verificação de certificado TLS globalmente para conexão com Supabase
// Necessário pois o Supabase usa certificado intermediário não reconhecido pelo Node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const server = express();

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    try {
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
      );

      app.enableCors();
      app.setGlobalPrefix('api');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: false,
          transform: true,
        }),
      );
      app.useGlobalFilters(new AllExceptionsFilter());

      await app.init();
      cachedServer = server;
    } catch (err) {
      console.error('[Vercel NestJS Bootstrap Error]:', err);
      throw err;
    }
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();
    server(req, res);
  } catch (err: any) {
    res.status(500).json({
      statusCode: 500,
      message: 'Erro ao inicializar o servidor backend',
      details: err?.message || String(err),
    });
  }
}
