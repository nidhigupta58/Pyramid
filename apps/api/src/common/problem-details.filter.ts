import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

// RFC 7807 problem+json — every error response, expected or not, takes this shape.
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttpException ? exception.getResponse() : undefined;

    const detail =
      typeof body === 'string'
        ? body
        : ((body as { message?: string | string[] })?.message ?? 'An unexpected error occurred');

    response.status(status).contentType('application/problem+json').send({
      type: 'about:blank',
      title: isHttpException ? exception.name : 'Internal Server Error',
      status,
      detail: Array.isArray(detail) ? detail.join(', ') : detail,
    });
  }
}
