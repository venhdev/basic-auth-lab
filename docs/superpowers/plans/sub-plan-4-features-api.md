---
id: PLAN-002-S4
title: Sub-plan 4: Admin & Profile APIs
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [PLAN-002-S3]
---

# Sub-plan 4: Admin & Profile APIs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Triển khai các Endpoint Quản trị (Admin) và Hồ sơ cá nhân (Profile) để áp dụng các Guards đã viết.

**Architecture:** 
- `UsersAdminController`: Dành cho Admin quản lý User/Role. → **Đăng ký trong `UsersModule`** (Feature Module Pattern).
- `ProductsController`: Cập nhật để chỉ Admin mới được CRUD.
- `ProfileController`: Dành cho User quản lý thông tin cá nhân. → **Đăng ký trong `UsersModule`** (Profile thuộc users domain).

> **Real-world long-term design — Tại sao `UsersModule`?**
> Trong NestJS, Feature Module Pattern = mọi thư liên quan đến "users" domain (entities, services, controllers) sống trong `UsersModule`. Điều này giữ `AppModule` gnọi gàng, tách biệt concerns, và dễ extract thành microservice sau này.

**Tech Stack:** NestJS, TypeORM.

---

### Task 1: Admin User Management
**Files:**
- Create: `apps/be/src/users/users.admin.controller.ts`

> **Naming:** Dùng file riêng `users.admin.controller.ts` để tách biệt admin logic. Class đặt là `UsersAdminController`.

- [ ] **Step 1: Implement Admin APIs**
```typescript
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllWithRoles();
  }

  @Patch(':id/roles')
  updateRoles(@Param('id') id: string, @Body('roleIds') roleIds: number[]) {
    return this.usersService.updateUserRoles(id, roleIds);
  }
}
```

---

### Task 2: Admin Product Management
**Files:**
- Modify: `apps/be/src/products/products.controller.ts`

- [ ] **Step 1: Protect write operations with Admin role**
```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  @Get() // Giữ nguyên: Mọi user đều xem được
  findAll() { ... }

  @Post()
  @Roles(UserRole.ADMIN) // Chỉ Admin mới được tạo
  create(@Body() createProductDto: any) {
    return { message: 'Product created by admin' };
  }
}
```

---

### Task 3: Profile Management (Ownership)
**Files:**
- Create: `apps/be/src/users/profile.controller.ts`

> **Module:** `ProfileController` nằm trong `UsersModule` vì Profile thuộc users domain.

- [ ] **Step 1: Implement Profile APIs with OwnershipGuard**
```typescript
import { Controller, Get, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { UsersService } from './users.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findProfile(req.user.sub); // user.sub (không phải userId)
  }

  @Patch(':userId')
  @UseGuards(OwnershipGuard) // Kiểm tra quyền sở hữu
  updateProfile(@Param('userId') userId: string, @Body() updateData: any) {
    return this.usersService.updateProfile(userId, updateData);
  }
}
```

---

### Task 4: Service Logic for Roles & Profile
**Files:**
- Modify: `apps/be/src/users/users.service.ts`

> **Real-world wiring — rolesRepository:** `UsersService` cần inject `Repository<Role>` và `Repository<Profile>`. `Role` và `Profile` đã được thêm vào `TypeOrmModule.forFeature()` ở Phase 1, Task 5 → nên có thể inject trực tiếp.

- [ ] **Step 1: Inject RolesRepository và ProfileRepository**
```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Role)  // ← Inject thêm
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Profile)  // ← Inject thêm
    private readonly profileRepository: Repository<Profile>,
  ) {}
  // ...
}
```

- [ ] **Step 2: Implement findAllWithRoles**
```typescript
async findAllWithRoles(): Promise<User[]> {
  return this.userRepository.find({ relations: ['roles'] });
}
```

- [ ] **Step 3: Implement updateUserRoles**
```typescript
async updateUserRoles(userId: string, roleIds: number[]): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
  const roles = await this.rolesRepository.findByIds(roleIds);
  user.roles = roles;
  return this.userRepository.save(user);
}
```

- [ ] **Step 4: Implement findProfile và updateProfile**
```typescript
async findProfile(userId: string): Promise<Profile | null> {
  return this.profileRepository.findOne({ where: { user_id: userId } });
}

async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  await this.profileRepository.update({ user_id: userId }, data);
  return this.findProfile(userId);
}
```

---

### Task 5: Register Controllers in UsersModule ← **Thiếu trong Plan cũ**
**Files:**
- Modify: `apps/be/src/users/users.module.ts`

> **Real-world long-term design:** `UsersModule` import `AuthModule` để dùng `RolesGuard`/`OwnershipGuard`. `AuthModule` đã export chúng ở Phase 3.

- [ ] **Step 1: Final users.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersAdminController } from './users.admin.controller';
import { ProfileController } from './profile.controller';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module'; // import để dùng guards

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Role, Profile]),
    AuthModule, // ← để có RolesGuard, OwnershipGuard
  ],
  providers: [UsersService],
  controllers: [UsersAdminController, ProfileController],
  exports: [UsersService],
})
export class UsersModule {}
```

> **⚠️ Circular Dependency Risk:** `AuthModule` imports `UsersModule` và `UsersModule` imports `AuthModule` → circular!
> **Fix:** Dùng `forwardRef()` cho cả 2 phía:
> ```typescript
> // auth.module.ts
> imports: [forwardRef(() => UsersModule), ...]
> // users.module.ts  
> imports: [forwardRef(() => AuthModule), ...]
> ```

---

### Task 5: Integration Test
- [ ] **Step 1: Test Admin access**
- [ ] **Step 2: Test IDOR vulnerability** (Thử gọi PATCH profile người khác mà không có Token Admin).
Expected: Trả về `403 Forbidden` nếu Guard hoạt động.
