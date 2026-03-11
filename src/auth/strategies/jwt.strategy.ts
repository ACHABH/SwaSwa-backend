import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../config/config.service';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(config.jwtPublicKey, 'base64').toString('utf-8'),
      algorithms: ['RS256' as const],
    });
  }

  validate(payload: JwtPayload & { type?: string }): JwtPayload {
    if (payload.type) {
      throw new UnauthorizedException('Invalid token type');
    }
    return { sub: payload.sub, role: payload.role, jti: payload.jti };
  }
}
