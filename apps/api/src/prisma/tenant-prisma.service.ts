import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { workspaceScopingExtension } from './workspace-scoping.extension';

/** Task/Project/Label access, scoped to the request's workspace by workspaceScopingExtension. */
@Injectable()
export class TenantPrismaService {
  readonly client;

  constructor(prisma: PrismaService) {
    this.client = prisma.$extends(workspaceScopingExtension);
  }
}
