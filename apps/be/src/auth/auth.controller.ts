import { Controller, Post, Body, UnauthorizedException, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto.email, registerDto.password);
    const { password_hash, ...result } = user;
    return result;
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
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
    const refreshToken = request.cookies['__Host-refresh_token'];
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
    const refreshToken = request.cookies['__Host-refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie('__Host-refresh_token', { path: '/' });
    return { message: 'Logged out' };
  }
}
