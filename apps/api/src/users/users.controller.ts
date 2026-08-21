import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { ActiveWorkspaceDto, LeaveWorkspaceDto, UpdatePreferencesDto, UpdateProfileDto } from './dto/user.dto';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Get('me/preferences')
  preferences(@CurrentUser() user: User) {
    return this.users.getPreferences(user.id);
  }

  @Patch('me/preferences')
  updatePreferences(@CurrentUser() user: User, @Body() dto: UpdatePreferencesDto) {
    return this.users.updatePreferences(user.id, dto);
  }

  @Post('me/active-workspace')
  @HttpCode(200)
  setActiveWorkspace(@CurrentUser() user: User, @Body() dto: ActiveWorkspaceDto) {
    return this.users.setActiveWorkspace(user.id, dto);
  }

  @Post('me/leave-workspace')
  @HttpCode(200)
  leaveWorkspace(@CurrentUser() user: User, @Body() dto: LeaveWorkspaceDto) {
    return this.users.leaveWorkspace(user.id, dto);
  }
}
