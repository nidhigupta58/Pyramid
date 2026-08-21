import { Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspacesService } from './workspaces.service';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post(':token/accept')
  accept(@Param('token') token: string, @CurrentUser() user: User) {
    return this.workspaces.acceptInvitation(token, user.id, user.email);
  }
}
