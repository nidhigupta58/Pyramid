import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

// Created once at module scope and reused across warm invocations — bootstrap cost (module
// init, Prisma connect) is paid on cold start only, not on every request.
let cachedHandler: ReturnType<typeof serverlessExpress> | undefined;

async function bootstrap() {
  const expressApp = express();
  const app = configureApp(await NestFactory.create(AppModule, new ExpressAdapter(expressApp)), { swagger: false });
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cachedHandler ??= await bootstrap();
  return cachedHandler(req, res);
}
