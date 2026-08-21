import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ProblemDetailsFilter } from './common/problem-details.filter';

/** Shared by main.ts and e2e tests so both exercise the exact same request pipeline. */
export function configureApp(app: INestApplication, { swagger = true } = {}) {
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: process.env.APP_URL, credentials: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ProblemDetailsFilter());

  if (swagger) {
    const swaggerConfig = new DocumentBuilder().setTitle('Pyramid API').setVersion('0.1.0').build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  return app;
}
