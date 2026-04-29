import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';
import { getRequiredBase64Config } from '../common/utils/config.util';

@Module({
  imports: [
    forwardRef(() => UsersModule), // forwardRef to resolve circular: AuthModule <-> UsersModule
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: getRequiredBase64Config(config, 'JWT_PRIVATE_KEY_BASE64'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRES'),
          algorithm: 'RS256',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, RolesGuard, OwnershipGuard],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard, OwnershipGuard],
})
export class AuthModule {}
