import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import { validateJwtUser } from './validate-jwt-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null,
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  validate(payload: { sub: string }) {
    return validateJwtUser(this.prisma, payload);
  }
}
