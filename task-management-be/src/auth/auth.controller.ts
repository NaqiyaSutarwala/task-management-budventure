import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Res,
  Req,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { Response, Request as ExpressRequest } from 'express';
import { jwtConstants } from './constants/auth.constants';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(jwtConstants.refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:
        typeof jwtConstants.refreshExpiresIn === 'string'
          ? this.parseMaxAge(jwtConstants.refreshExpiresIn)
          : Number(jwtConstants.refreshExpiresIn) * 1000,
      path: '/',
    });
  }

  // accepts '7d', '15m', '3600' and converts to ms
  private parseMaxAge(expiresIn: string): number {
    const match = /^(\d+)([smhd])?$/.exec(expiresIn);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('hit');
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing)
      throw new HttpException(
        { statusCode: 400, message: 'Email already exists' },
        400,
      );
    const user = await this.usersService.create(
      dto.email,
      dto.password,
      dto.name,
    );

    const result = await this.authService.login(user);
    this.setRefreshCookie(res, result.refresh_token);
    return {
      message: 'User created',
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new HttpException(
        { statusCode: 401, message: 'Invalid credentials' },
        401,
      );
    const valid = await this.usersService.verifyPassword(user, dto.password);
    if (!valid)
      throw new HttpException(
        { statusCode: 401, message: 'Invalid credentials' },
        401,
      );
    const result = await this.authService.login(user);
    this.setRefreshCookie(res, result.refresh_token);
    return { user: result.user, access_token: result.access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return { user: req.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = req.cookies?.[jwtConstants.refreshCookieName];
    if (!rt) throw { statusCode: 401, message: 'Missing refresh token' };

    const decoded: any = this.jwtService.decode(rt);
    if (!decoded?.sub)
      throw { statusCode: 401, message: 'Invalid refresh token' };

    const result = await this.authService.refreshTokens(decoded.sub, rt);
    this.setRefreshCookie(res, result.refresh_token);
    return { user: result.user, access_token: result.access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.userId);
    res.clearCookie(jwtConstants.refreshCookieName, { path: '/' });
    return { message: 'Logged out' };
  }
}
