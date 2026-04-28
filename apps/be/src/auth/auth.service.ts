import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { comparePassword } from '../common/utils/crypto.util';

@Injectable()
export class AuthService implements OnModuleInit {
  private redis: Redis;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.redis = new Redis(this.configService.get('REDIS_URL'));
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePassword(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.generateTokens(payload, user);
  }

  async generateTokens(payload: any, user: any) {
    const jti = uuidv4();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, jti },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);

    const strategy = this.configService.get('REFRESH_TOKEN_STRATEGY');
    if (strategy === 'whitelist') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await this.usersService.saveRefreshToken(user, jti, expiresAt);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const strategy = this.configService.get('REFRESH_TOKEN_STRATEGY');
      if (strategy === 'blacklist') {
        const isBlacklisted = await this.redis.get(`blacklist:${payload.jti}`);
        if (isBlacklisted) {
          throw new UnauthorizedException('Token is blacklisted');
        }
      } else {
        const token = await this.usersService.findRefreshToken(payload.jti);
        if (!token) {
          throw new UnauthorizedException('Token not in whitelist');
        }
      }

      const user = await this.usersService.findById(payload.sub);
      const newPayload = { email: user.email, sub: user.id };
      return this.generateTokens(newPayload, user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const strategy = this.configService.get('REFRESH_TOKEN_STRATEGY');
      if (strategy === 'blacklist') {
        await this.redis.set(
          `blacklist:${payload.jti}`,
          'true',
          'EX',
          7 * 24 * 60 * 60,
        );
      } else {
        await this.usersService.deleteRefreshToken(payload.jti);
      }
    } catch (e) {
      // Ignore if token invalid
    }
  }
}
