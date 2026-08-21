import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';
import { validateJwtUser } from './validate-jwt-user';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.[REFRESH_TOKEN_COOKIE] ?? null,
      secretOrKey: process.env.JWT_REFRESH_SECRET ?? '',
    });
  }

  validate(payload: { sub: string }) {
    return validateJwtUser(this.prisma, payload);
  }
}
