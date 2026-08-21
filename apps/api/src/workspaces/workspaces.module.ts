import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { InvitationsController } from './invitations.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceGuard } from './guards/workspace.guard';
import { RolesGuard } from './guards/roles.guard';
import { WorkspaceContextInterceptor } from './interceptors/workspace-context.interceptor';

@Module({
  controllers: [WorkspacesController, InvitationsController],
  providers: [WorkspacesService, WorkspaceGuard, RolesGuard, WorkspaceContextInterceptor],
  exports: [WorkspaceGuard, WorkspaceContextInterceptor],
})
export class WorkspacesModule {}
