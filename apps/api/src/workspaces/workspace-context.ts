import { AsyncLocalStorage } from 'node:async_hooks';
import type { Role } from '@prisma/client';

export interface WorkspaceContext {
  workspaceId: string;
  role: Role;
  userId: string;
}

const storage = new AsyncLocalStorage<WorkspaceContext>();

/**
 * Wraps `run` so that, for its entire duration (including every awaited call inside it), the
 * workspace-scoping Prisma extension can read `context` via getWorkspaceContext(). Must wrap
 * the actual handler execution — Nest's guard pipeline combines multiple guards' promises via
 * Promise.all, whose `.then()` continuation does not reliably inherit AsyncLocalStorage from
 * an individual guard's `enterWith`, so this is done in WorkspaceContextInterceptor rather than
 * in WorkspaceGuard itself.
 */
export function runWithWorkspaceContext<T>(context: WorkspaceContext, run: () => T): T {
  return storage.run(context, run);
}

export function getWorkspaceContext(): WorkspaceContext | undefined {
  return storage.getStore();
}
