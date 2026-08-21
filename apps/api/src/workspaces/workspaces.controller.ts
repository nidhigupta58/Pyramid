import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { WorkspaceGuard } from './guards/workspace.guard';
import { RolesGuard } from './guards/roles.guard';
import { WorkspaceContextInterceptor } from './interceptors/workspace-context.interceptor';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@ApiTags('workspaces')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.workspaces.listForUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(user.id, dto);
  }

  @UseGuards(WorkspaceGuard, RolesGuard)
  @UseInterceptors(WorkspaceContextInterceptor)
  @Roles('OWNER', 'ADMIN')
  @Patch(':workspaceSlug')
  update(@Body() dto: UpdateWorkspaceDto) {
    return this.workspaces.update(dto);
  }

  @UseGuards(WorkspaceGuard)
  @UseInterceptors(WorkspaceContextInterceptor)
  @Get(':workspaceSlug/members')
  members() {
    return this.workspaces.members();
  }

  @UseGuards(WorkspaceGuard, RolesGuard)
  @UseInterceptors(WorkspaceContextInterceptor)
  @Roles('OWNER', 'ADMIN')
  @Post(':workspaceSlug/invitations')
  invite(@Body() dto: InviteMemberDto) {
    return this.workspaces.invite(dto);
  }

  @UseGuards(WorkspaceGuard, RolesGuard)
  @UseInterceptors(WorkspaceContextInterceptor)
  @Roles('OWNER', 'ADMIN')
  @Delete(':workspaceSlug/members/:userId')
  removeMember(@Param('userId') userId: string) {
    return this.workspaces.removeMember(userId);
  }
}
