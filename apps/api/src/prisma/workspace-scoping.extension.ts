import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getWorkspaceContext } from '../workspaces/workspace-context';

const WRITE_MANY_OPS = new Set(['createMany', 'createManyAndReturn']);
const READ_OR_MUTATE_ONE_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'findMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

function requireWorkspaceId(): string {
  const ctx = getWorkspaceContext();
  if (!ctx) {
    // A tenant-scoped model was queried outside a WorkspaceGuard-protected route — refuse rather than leak.
    throw new ForbiddenException('Workspace context is required for this operation');
  }
  return ctx.workspaceId;
}

async function scoped({ operation, args, query }: { operation: string; args: unknown; query: (a: unknown) => Promise<unknown> }) {
  const workspaceId = requireWorkspaceId();
  const a = args as Record<string, any>;

  if (operation === 'create') {
    a.data = { ...a.data, workspaceId };
  } else if (WRITE_MANY_OPS.has(operation)) {
    a.data = (a.data as Record<string, unknown>[]).map((row) => ({ ...row, workspaceId }));
  } else if (operation === 'upsert') {
    a.where = { ...a.where, workspaceId };
    a.create = { ...a.create, workspaceId };
    a.update = { ...a.update, workspaceId };
  } else if (READ_OR_MUTATE_ONE_OPS.has(operation)) {
    a.where = { ...a.where, workspaceId };
  }

  return query(a);
}

/**
 * Injects the current request's workspaceId into every query and mutation on tenant-owned
 * models, so a service that forgets a `where: { workspaceId }` still cannot read or write
 * another tenant's rows. This is the load-bearing tenant-isolation control (plan §4.3) —
 * WorkspaceGuard alone is one forgotten filter away from a cross-tenant leak. Scoped to the
 * three tenant-owned models (not $allModels) so User/Workspace/Membership queries, which have
 * no workspaceId column, are untouched.
 */
export const workspaceScopingExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'workspace-scoping',
    query: {
      task: { $allOperations: scoped },
      project: { $allOperations: scoped },
      label: { $allOperations: scoped },
    },
  }),
);
