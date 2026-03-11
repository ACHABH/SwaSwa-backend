import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppConfigService } from '../config/config.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFaGuard } from './guards/two-fa.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        privateKey: Buffer.from(config.jwtPrivateKey, 'base64').toString(
          'utf-8',
        ),
        publicKey: Buffer.from(config.jwtPublicKey, 'base64').toString('utf-8'),
        signOptions: { algorithm: 'RS256' },
      }),
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, TwoFaGuard],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
