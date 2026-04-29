import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { comparePassword } from '../common/utils/crypto.util';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  email: string;
  sub: string;
  jti?: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private redis: Redis;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.redis = new Redis(
      this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
    );
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePassword(pass, user.password_hash))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return this.generateTokens(payload, user);
  }

  async generateTokens(
    payload: JwtPayload,
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const jti = uuidv4();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, jti },
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') || 'secret',
          expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES') ||
            '7d') as JwtSignOptions['expiresIn'],
          algorithm: 'HS256',
        },
      ),
    ]);

    const strategy = this.configService.get<string>('REFRESH_TOKEN_STRATEGY');
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

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') || 'secret',
        },
      );

      if (!payload.jti) {
        throw new UnauthorizedException('Token ID missing');
      }

      const strategy = this.configService.get<string>('REFRESH_TOKEN_STRATEGY');
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
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const newPayload = { email: user.email, sub: user.id };
      return this.generateTokens(newPayload, user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') || 'secret',
        },
      );

      if (!payload.jti) {
        console.error('Token ID missing');
        return; // Or throw, but for logout, ignoring is fine
      }

      const strategy = this.configService.get<string>('REFRESH_TOKEN_STRATEGY');
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
    } catch {
      // Ignore if token invalid
    }
  }
}
