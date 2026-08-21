import { ExecutionContext, Injectable, NotImplementedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGoogleConfigured } from '../auth.constants';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!isGoogleConfigured()) throw new NotImplementedException('Google OAuth is not configured');
    return super.canActivate(context);
  }
}
