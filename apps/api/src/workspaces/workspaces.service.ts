import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { getWorkspaceContext } from './workspace-context';
import { CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto } from './dto/workspace.dto';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data: { name: dto.name, slug: slugify(dto.name) } });
      await tx.membership.create({ data: { userId, workspaceId: workspace.id, role: 'OWNER' } });
      return workspace;
    });
  }

  // The current request's workspace, resolved by WorkspaceGuard — every method below trusts it
  // rather than re-deriving from :workspaceSlug, since the guard already verified membership.
  private currentWorkspaceId() {
    return getWorkspaceContext()!.workspaceId;
  }

  update(dto: UpdateWorkspaceDto) {
    return this.prisma.workspace.update({ where: { id: this.currentWorkspaceId() }, data: dto });
  }

  members() {
    return this.prisma.membership.findMany({
      where: { workspaceId: this.currentWorkspaceId() },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async invite(dto: InviteMemberDto) {
    const workspaceId = this.currentWorkspaceId();
    const existingMember = await this.prisma.membership.findFirst({
      where: { workspaceId, user: { email: dto.email } },
    });
    if (existingMember) throw new ConflictException('User is already a member of this workspace');

    return this.prisma.invitation.upsert({
      where: { workspaceId_email: { workspaceId, email: dto.email } },
      update: { role: dto.role, token: randomUUID(), expiresAt: new Date(Date.now() + INVITATION_TTL_MS) },
      create: {
        workspaceId,
        email: dto.email,
        role: dto.role,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
    });
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.acceptedAt) throw new ConflictException('Invitation already accepted');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation has expired');
    if (invitation.email !== userEmail) throw new BadRequestException('Invitation was issued to a different email');

    return this.prisma.$transaction(async (tx) => {
      await tx.membership.upsert({
        where: { userId_workspaceId: { userId, workspaceId: invitation.workspaceId } },
        update: {},
        create: { userId, workspaceId: invitation.workspaceId, role: invitation.role },
      });
      return tx.invitation.update({ where: { token }, data: { acceptedAt: new Date() } });
    });
  }

  async removeMember(targetUserId: string) {
    const workspaceId = this.currentWorkspaceId();
    await this.prisma.membership.delete({ where: { userId_workspaceId: { userId: targetUserId, workspaceId } } });
  }
}
