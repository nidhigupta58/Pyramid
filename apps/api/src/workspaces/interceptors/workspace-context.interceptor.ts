import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { runWithWorkspaceContext, type WorkspaceContext } from '../workspace-context';

/** Pairs with WorkspaceGuard: reads the context it resolved and runs the handler inside it. */
@Injectable()
export class WorkspaceContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { workspaceContext?: WorkspaceContext }>();
    if (!req.workspaceContext) return next.handle();

    return new Observable((subscriber) => {
      runWithWorkspaceContext(req.workspaceContext!, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
