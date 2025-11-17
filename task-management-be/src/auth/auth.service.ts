import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { jwtConstants } from './constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await this.usersService.verifyPassword(user, pass);
    if (ok) {
      const { password, ...rest } = user.toObject();
      return rest;
    }
    return null;
  }

  private async getTokens(user: any) {
    const payload = { sub: user._id, email: user.email, name: user.name };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessSecret,
        expiresIn: this.toSeconds(jwtConstants.accessExpiresIn),
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: this.toSeconds(jwtConstants.refreshExpiresIn),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private toSeconds(expiresIn: string): number {
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

  async login(user: any) {
    const tokens = await this.getTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(
      String(user._id),
      refreshTokenHash,
    );
    return {
      user: { id: String(user._id), email: user.email, name: user.name },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async issueTokensForUserId(userId: string) {
    const user = await this.usersService.getUserWithSensitiveById(userId);
    if (!user) throw new UnauthorizedException();
    const tokens = await this.getTokens(user);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(
      String(user._id),
      refreshTokenHash,
    );
    return {
      user: { id: String(user._id), email: user.email, name: user.name },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.getUserWithSensitiveById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh request');
    }

    // Verify JWT signature & expiration
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      if (decoded.sub !== String(user._id)) {
        throw new UnauthorizedException('Invalid token subject');
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify token against stored hash
    const match = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash as string,
    );
    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate tokens
    const tokens = await this.getTokens(user);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(String(user._id), newHash);
    return {
      user: { id: String(user._id), email: user.email, name: user.name },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
  }
}
