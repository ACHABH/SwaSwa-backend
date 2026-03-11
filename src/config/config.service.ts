import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get databaseUrl(): string {
    return this.config.getOrThrow<string>('DATABASE_URL');
  }

  get redisUrl(): string {
    return this.config.getOrThrow<string>('REDIS_URL');
  }

  get jwtPrivateKey(): string {
    return this.config.getOrThrow<string>('JWT_PRIVATE_KEY');
  }

  get jwtPublicKey(): string {
    return this.config.getOrThrow<string>('JWT_PUBLIC_KEY');
  }

  get jwtAccessExpiresIn(): number {
    return this.config.get<number>('JWT_ACCESS_EXPIRES_IN', 900);
  }

  get jwtRefreshExpiresIn(): number {
    return this.config.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
