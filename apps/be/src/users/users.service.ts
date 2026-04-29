import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { hashPassword } from '../common/utils/crypto.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async saveRefreshToken(user: User, jti: string, expiresAt: Date) {
    const token = this.refreshTokenRepository.create({
      user,
      jti,
      expires_at: expiresAt,
    });
    return this.refreshTokenRepository.save(token);
  }

  async findRefreshToken(jti: string) {
    return this.refreshTokenRepository.findOne({
      where: { jti },
      relations: ['user'],
    });
  }

  async deleteRefreshToken(jti: string) {
    await this.refreshTokenRepository.delete({ jti });
  }

  async deleteRefreshTokensForUser(userId: string) {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async create(email: string, password: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = this.userRepository.create({
      email,
      password_hash: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
