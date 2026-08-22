import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

// Created once at module scope and reused across warm invocations — bootstrap cost (module
// init, Prisma connect) is paid on cold start only, not on every request. Vercel's Node
// runtime calls the handler as a plain (req, res) pair — same shape Express itself expects —
// so the underlying Express app can serve requests directly with no Lambda-event shim.
let cachedApp: Express | undefined;

async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const app = configureApp(await NestFactory.create(AppModule, new ExpressAdapter(expressApp)), { swagger: false });
  await app.init();
  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cachedApp ??= await bootstrap();
  cachedApp(req, res);
}
