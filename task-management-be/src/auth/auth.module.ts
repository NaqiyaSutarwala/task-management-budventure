import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants/auth.constants';
import { JwtStrategy } from './jwt/jwt.strategy';

function parseExpiresToSeconds(expiresIn: string): number {
  const match = /^(\d+)([smhd])?$/.exec(expiresIn);
  if (!match) return parseInt(expiresIn, 10) || 3600;
  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  return value * multipliers[unit];
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.accessSecret,
      signOptions: {
        expiresIn: parseExpiresToSeconds(jwtConstants.accessExpiresIn),
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
