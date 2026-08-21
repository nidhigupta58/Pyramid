import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { WorkspaceContext } from '../workspace-context';

/**
 * Resolves :workspaceSlug and loads the caller's Membership, 404ing (never 403 — don't leak
 * existence) when either is missing. Stashes the result on the request for
 * WorkspaceContextInterceptor to pick up — this guard cannot enter the AsyncLocalStorage
 * context itself (see workspace-context.ts for why).
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { workspaceContext?: WorkspaceContext }>();
    const user = req.user as User;
    const slug = req.params.workspaceSlug as string;

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, workspace: { slug } },
      select: { role: true, workspaceId: true },
    });
    if (!membership) throw new NotFoundException('Workspace not found');

    req.workspaceContext = { workspaceId: membership.workspaceId, role: membership.role, userId: user.id };
    return true;
  }
}
