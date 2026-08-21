import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function validateJwtUser(prisma: PrismaService, payload: { sub: string }) {
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new UnauthorizedException();
  return user;
}
