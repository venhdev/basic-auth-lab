---
id: PLAN-002-S3
title: Sub-plan 3: Guards & Feature Flag
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [PLAN-002-S2]
---

# Sub-plan 3: Guards & Feature Flag

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Triển khai cơ chế kiểm tra quyền dựa trên Roles và Ownership, có hỗ trợ Feature Flag để thay đổi chiến lược xác thực.

**Architecture:** 
- `@Roles()` decorator.
- `RolesGuard`: Hỗ trợ `RBAC_VERIFICATION_STRATEGY` (stateless/stateful).
- `OwnershipGuard`: Kiểm tra quyền sở hữu tài nguyên.

**Tech Stack:** NestJS, ConfigService.

---

### Task 1: Create Roles Decorator
**Files:**
- Create: `apps/be/src/auth/decorators/roles.decorator.ts`

- [ ] **Step 1: Define Roles Decorator**
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

---

### Task 2: Implement RolesGuard (with Feature Flag)
**Files:**
- Create: `apps/be/src/auth/guards/roles.guard.ts`

- [ ] **Step 1: Implement Guard Logic**
```typescript
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
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const strategy = this.configService.get('RBAC_VERIFICATION_STRATEGY') || 'stateless';

    let userRoles: string[] = [];

    if (strategy === 'stateless') {
      // Chế độ Vulnerable: Tin hoàn toàn vào JWT
      userRoles = user.roles || [];
    } else {
      // Chế độ Secure: Kiểm tra thực tế trong DB
      const freshUser = await this.usersService.findByEmail(user.email);
      userRoles = freshUser?.roles.map(r => r.name) || [];
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
```

---

### Task 3: Implement OwnershipGuard
**Files:**
- Create: `apps/be/src/auth/guards/ownership.guard.ts`

- [ ] **Step 1: Implement ID matching logic**

> **Field naming:** Dùng `user.sub` (sau khi `JwtStrategy.validate()` đã được fix ở Phase 2, Task 6 để trả về `sub` thay vì `userId`).

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { sub, email, roles } — set bởi JwtStrategy
    const targetUserId = request.params.userId || request.body.userId;

    // Chỉ cho phép nếu ID trong JWT (user.sub) khớp với ID tài nguyên yêu cầu
    // Hoặc là admin (có full access)
    return user.sub === targetUserId || (user.roles || []).includes('admin');
  }
}
```

---

### Task 4: Configure Feature Flag
**Files:**
- Modify: `.env`

- [ ] **Step 1: Add strategy flag**
```bash
RBAC_VERIFICATION_STRATEGY=stateless
```

---

### Task 5: Unit Test for RolesGuard
**Files:**
- Create: `apps/be/src/auth/guards/roles.guard.spec.ts`

- [ ] **Step 1: Verify stateless behavior**
- [ ] **Step 2: Verify stateful behavior**

---

### Task 6: Register Guards in AuthModule ← **CRITICAL — Plan cũ bỏ sót**
**Files:**
- Modify: `apps/be/src/auth/auth.module.ts`

> **Tại sao cần thiết:** Guards trong NestJS cần được khai báo là `provider` trong module. Nếu không, khi controller dùng `@UseGuards(RolesGuard)`, NestJS sẽ không biết resolve `RolesGuard` → runtime error.

- [ ] **Step 1: Add guards to providers and exports**
```typescript
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ /* ... giữ nguyên ... */ }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, RolesGuard, OwnershipGuard], // ← Thêm Guards
  controllers: [AuthController],
  exports: [AuthService, RolesGuard, OwnershipGuard], // ← Export để UsersModule dùng được
})
export class AuthModule {}
```

**Gate (Phase 3):** Restart BE không có `UnknownDependenciesException`. Gọi `GET /admin/users` với token user thường → nhận `403`.
