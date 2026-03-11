import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt, randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import Redis from 'ioredis';
import { AppConfigService } from '../config/config.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Verify2faDto } from './dto/verify-2fa.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly REFRESH_TTL: number;
  private readonly OTP_TTL = 5 * 60; // 5 minutes

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.REFRESH_TTL = this.config.jwtRefreshExpiresIn;
  }

  async register(dto: RegisterDto): Promise<TokenPair> {
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.BUYER,
    });
    return this.issueTokenPair(user.id, user.role);
  }

  async login(
    dto: LoginDto,
  ): Promise<TokenPair | { requires2FA: true; tempToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBanned) {
      throw new UnauthorizedException('Account suspended');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.is2faEnabled) {
      const otp = randomInt(100000, 1000000).toString();
      await this.redis.set(`2fa:${user.id}`, otp, 'EX', this.OTP_TTL);
      // TODO: send OTP via SMS/email in production
      console.log(`[2FA DEV] OTP for ${user.email}: ${otp}`);

      const tempToken = this.jwtService.sign(
        { sub: user.id, type: '2fa_pending', jti: randomUUID() },
        { expiresIn: '2m' },
      );
      return { requires2FA: true, tempToken };
    }

    return this.issueTokenPair(user.id, user.role);
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    let payload: { sub: string; type?: string };
    try {
      payload = this.jwtService.verify<{ sub: string; type?: string }>(
        dto.refreshToken,
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const storedHash = await this.redis.get(`refresh:${payload.sub}`);
    if (!storedHash) {
      throw new UnauthorizedException('Session expired — please log in again');
    }

    const incomingHash = createHash('sha256')
      .update(dto.refreshToken)
      .digest('hex');

    if (incomingHash !== storedHash) {
      // Token reuse detected — nuke session
      await this.redis.del(`refresh:${payload.sub}`);
      throw new UnauthorizedException(
        'Token reuse detected — all sessions invalidated',
      );
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.isBanned) {
      throw new UnauthorizedException('User not found or suspended');
    }

    return this.issueTokenPair(user.id, user.role);
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }

  async verify2fa(dto: Verify2faDto, userId: string): Promise<TokenPair> {
    const storedOtp = await this.redis.get(`2fa:${userId}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.redis.del(`2fa:${userId}`);

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.issueTokenPair(user.id, user.role);
  }

  private async issueTokenPair(
    userId: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: userId,
      role,
      jti: randomUUID(),
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: `${this.config.jwtAccessExpiresIn}s`,
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh', jti: randomUUID() },
      { expiresIn: `${this.config.jwtRefreshExpiresIn}s` },
    );

    const hashedRefresh = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await this.redis.set(
      `refresh:${userId}`,
      hashedRefresh,
      'EX',
      this.REFRESH_TTL,
    );

    return { accessToken, refreshToken };
  }
}
