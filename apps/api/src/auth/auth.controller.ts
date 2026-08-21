import { Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { clearAuthCookies, setAuthCookies } from './cookie.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('guest')
  @HttpCode(200)
  async guest(@Res({ passthrough: true }) res: Response) {
    const user = await this.auth.createGuest();
    setAuthCookies(res, this.auth.signTokens(user.id));
    return user;
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google() {
    // GoogleAuthGuard redirects to Google, or throws 501 if unconfigured; nothing to do here.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = await this.auth.findOrCreateGoogleUser(req.user as never);
    setAuthCookies(res, this.auth.signTokens(user.id));
    res.redirect(process.env.APP_URL ?? '/');
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  refresh(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    setAuthCookies(res, this.auth.signTokens(user.id));
    return { ok: true };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { ok: true };
  }
}
