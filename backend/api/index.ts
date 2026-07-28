import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
