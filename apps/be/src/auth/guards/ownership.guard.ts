import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { sub, email, roles } — set by JwtStrategy
    const targetUserId = request.params.userId || request.body.userId;

    // Allow if JWT user ID (user.sub) matches the target resource ID
    // OR if the user has admin role (bypass ownership check)
    return user.sub === targetUserId || (user.roles || []).includes('admin');
  }
}
