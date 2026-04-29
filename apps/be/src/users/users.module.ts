import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersAdminController } from './users.admin.controller';
import { ProfileController } from './profile.controller';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Role, Profile]),
    forwardRef(() => AuthModule), // forwardRef to resolve circular: UsersModule <-> AuthModule
  ],
  providers: [UsersService],
  controllers: [UsersAdminController, ProfileController],
  exports: [UsersService],
})
export class UsersModule {}
