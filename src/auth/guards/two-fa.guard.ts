import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

type TwoFaTokenPayload = JwtPayload & { type: '2fa_pending' };

@Injectable()
export class TwoFaGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing 2FA token');
    }

    const token = authHeader.slice(7);
    let payload: TwoFaTokenPayload;
    try {
      payload = this.jwtService.verify<TwoFaTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA token');
    }

    if (payload.type !== '2fa_pending') {
      throw new UnauthorizedException(
        'Invalid token type for 2FA verification',
      );
    }

    req.user = payload;
    return true;
  }
}
