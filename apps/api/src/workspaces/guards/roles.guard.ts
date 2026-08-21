import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '@prisma/client';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import type { WorkspaceContext } from '../workspace-context';

/** Must run after WorkspaceGuard (which stashes req.workspaceContext) in the same @UseGuards list. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest<Request & { workspaceContext?: WorkspaceContext }>();
    if (!req.workspaceContext || !required.includes(req.workspaceContext.role)) {
      throw new ForbiddenException('Insufficient workspace role');
    }
    return true;
  }
}
