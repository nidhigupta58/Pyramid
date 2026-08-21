import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveWorkspaceDto, LeaveWorkspaceDto, UpdatePreferencesDto, UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async getPreferences(userId: string) {
    const preference = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (!preference) throw new NotFoundException('Preferences not found');
    return preference;
  }

  updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreference.update({ where: { userId }, data: dto });
  }

  private async requireMembership(userId: string, workspaceId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!membership) throw new NotFoundException('Not a member of this workspace');
    return membership;
  }

  async setActiveWorkspace(userId: string, dto: ActiveWorkspaceDto) {
    await this.requireMembership(userId, dto.workspaceId);
    return this.prisma.userPreference.update({
      where: { userId },
      data: { activeWorkspaceId: dto.workspaceId },
    });
  }

  async leaveWorkspace(userId: string, dto: LeaveWorkspaceDto) {
    const membership = await this.requireMembership(userId, dto.workspaceId);

    if (membership.role === 'OWNER') {
      const otherOwners = await this.prisma.membership.count({
        where: { workspaceId: dto.workspaceId, role: 'OWNER', userId: { not: userId } },
      });
      if (otherOwners === 0) {
        throw new ForbiddenException('Transfer ownership before leaving — you are the sole owner');
      }
    }

    await this.prisma.membership.delete({ where: { userId_workspaceId: { userId, workspaceId: dto.workspaceId } } });

    const pref = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (pref?.activeWorkspaceId === dto.workspaceId) {
      const nextWorkspace = await this.prisma.membership.findFirst({ where: { userId } });
      await this.prisma.userPreference.update({
        where: { userId },
        data: { activeWorkspaceId: nextWorkspace?.workspaceId ?? null },
      });
    }
  }
}
