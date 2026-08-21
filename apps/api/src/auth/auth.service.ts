import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from './auth.constants';
import type { GoogleProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  signTokens(userId: string) {
    const payload = { sub: userId };
    return {
      accessToken: this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: ACCESS_TOKEN_TTL }),
      refreshToken: this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: REFRESH_TOKEN_TTL }),
    };
  }

  async createGuest() {
    const suffix = randomUUID().slice(0, 8);
    return this.createUserWithWorkspace(
      { email: `guest-${suffix}@pyramid.local`, fullName: 'Guest', isGuest: true },
      `Guest Workspace ${suffix.slice(0, 6)}`,
    );
  }

  async findOrCreateGoogleUser(profile: GoogleProfile) {
    const existing = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } });
    if (existing) return existing;

    return this.createUserWithWorkspace(
      { email: profile.email, fullName: profile.fullName, avatarUrl: profile.avatarUrl, googleId: profile.googleId },
      `${profile.fullName}'s Workspace`,
    );
  }

  /** Every new account lands in its own workspace so the app has somewhere to open into. */
  private async createUserWithWorkspace(
    userData: { email: string; fullName: string; isGuest?: boolean; googleId?: string; avatarUrl?: string },
    workspaceName: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      const workspace = await tx.workspace.create({
        data: { name: workspaceName, slug: slugify(workspaceName) },
      });
      await tx.membership.create({ data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' } });
      await tx.userPreference.create({
        data: {
          userId: user.id,
          listFields: {},
          boardFields: {},
          activeWorkspaceId: workspace.id,
        },
      });
      return user;
    });
  }
}
