import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // No @Roles() decorator → allow through
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const strategy =
      this.configService.get('RBAC_VERIFICATION_STRATEGY') || 'stateless';

    let userRoles: string[] = [];

    if (strategy === 'stateless') {
      // 🚩 LAB VULNERABILITY MODE: Trust JWT payload completely
      // Attacker can forge roles via Algorithm Confusion attack (Lab 05)
      userRoles = user.roles || [];
    } else {
      // ✅ SECURE MODE: Always verify against DB (instant revocation)
      const freshUser = await this.usersService.findByEmail(user.email);
      userRoles = freshUser?.roles.map((r) => r.name) || [];
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
