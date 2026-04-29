import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';
import { hashPassword } from '../common/utils/crypto.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  // ─── Refresh Token Methods ────────────────────────────────────────────────

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

  // ─── User CRUD ────────────────────────────────────────────────────────────

  async create(email: string, password: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    // Find default 'user' role from DB (seeded in Phase 1)
    const defaultRole = await this.rolesRepository.findOne({
      where: { name: 'user' },
    });

    const user = this.userRepository.create({
      email,
      password_hash: hashedPassword,
      roles: defaultRole ? [defaultRole] : [],
    });

    const savedUser = await this.userRepository.save(user);

    // Create empty profile for the new user
    const profile = this.profileRepository.create({ user_id: savedUser.id });
    await this.profileRepository.save(profile);

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'], // Always load roles for JWT embedding
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  // ─── Admin Methods ────────────────────────────────────────────────────────

  async findAllWithRoles(): Promise<User[]> {
    return this.userRepository.find({ relations: ['roles'] });
  }

  async updateUserRoles(userId: string, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    // findByIds is deprecated in TypeORM 0.3+; use In() operator
    const roles = await this.rolesRepository.findBy(
      roleIds.map((id) => ({ id })),
    );
    user.roles = roles;
    return this.userRepository.save(user);
  }

  // ─── Profile Methods ──────────────────────────────────────────────────────

  async findProfile(userId: string): Promise<Profile | null> {
    return this.profileRepository.findOne({ where: { user_id: userId } });
  }

  async updateProfile(
    userId: string,
    data: Partial<Profile>,
  ): Promise<Profile | null> {
    await this.profileRepository.update({ user_id: userId }, data);
    return this.findProfile(userId);
  }
}
