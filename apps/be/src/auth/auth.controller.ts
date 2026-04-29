import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { getRequiredBase64Config } from '../common/utils/config.util';

interface GoogleUser {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('public-key')
  getPublicKey() {
    const publicKeyBuffer = getRequiredBase64Config(
      this.configService,
      'JWT_PUBLIC_KEY_BASE64',
    );
    return { publicKey: publicKeyBuffer.toString('utf8') };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // req.user contains the google profile validated by strategy
    const reqUser = req.user as GoogleUser;
    let user = await this.usersService.findByEmail(reqUser.email);

    if (!user) {
      // Auto-register google users
      user = await this.usersService.create(
        reqUser.email,
        Math.random().toString(36),
      );
    }

    const tokens = await this.authService.login(user);

    res.cookie('__Host-refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token in query param (temporary for exchange)
    // In a real app, you might use a postMessage or a dedicated exchange endpoint
    return res.redirect(
      `http://localhost:3000/login?token=${tokens.access_token}`,
    );
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.authService.login(user);

    response.cookie('__Host-refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true, // Required for __Host- prefix
      sameSite: 'strict',
      path: '/', // Required for __Host- prefix to be '/'
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokens.access_token };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, string>)[
      '__Host-refresh_token'
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const tokens = await this.authService.refresh(refreshToken);

    response.cookie('__Host-refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokens.access_token };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, string>)[
      '__Host-refresh_token'
    ];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie('__Host-refresh_token', { path: '/' });
    return { message: 'Logged out' };
  }
}
