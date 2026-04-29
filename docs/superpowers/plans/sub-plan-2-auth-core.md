---
id: PLAN-002-S2
title: Sub-plan 2: Auth Core Update
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [PLAN-002-S1]
---

# Sub-plan 2: Auth Core Update

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cập nhật Payload của JWT để chứa thông tin Roles và đảm bảo khi Login/Register hệ thống nạp đủ Roles.

**Architecture:** 
- Mở rộng interface `JwtPayload`.
- Cập nhật `AuthService` để trích xuất `user.roles` khi tạo Token.
- Đảm bảo `UsersService` nạp quan hệ `roles` khi tìm kiếm User.

**Tech Stack:** NestJS, JWT.

---

### Task 1: Define UserRole Enum
**Files:**
- Create: `apps/be/src/common/enums/role.enum.ts`

- [ ] **Step 1: Create Role Enum**
```typescript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
```

---

### Task 2: Update JwtPayload Interface
**Files:**
- Modify: `apps/be/src/auth/auth.service.ts`

- [ ] **Step 1: Add roles to JwtPayload**
```typescript
import { UserRole } from '../common/enums/role.enum';

interface JwtPayload {
  email: string;
  sub: string;
  roles: string[]; // Thêm mảng roles
  jti?: string;
}
```

---

### Task 3: Update login & generateTokens
**Files:**
- Modify: `apps/be/src/auth/auth.service.ts`

- [ ] **Step 1: Extract roles from user object**
```typescript
  async login(user: User) {
    const roles = user.roles?.map(r => r.name) || [];
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id,
      roles: roles // Nhúng roles vào payload
    };
    return this.generateTokens(payload, user);
  }
```

---

### Task 4: Ensure Roles are loaded in UsersService
**Files:**
- Modify: `apps/be/src/users/users.service.ts`

- [ ] **Step 1: Update findByEmail to include relations**
```typescript
  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'], // Bắt buộc nạp roles
    });
  }
```

- [ ] **Step 2: Update register to assign default 'user' role**
```typescript
  async create(createUserDto: any): Promise<User> {
    // 1. Tìm role 'user' trong DB
    const defaultRole = await this.rolesRepository.findOne({ where: { name: 'user' } });
    
    // 2. Tạo user mới với role mặc định
    const user = this.usersRepository.create({
      ...createUserDto,
      roles: defaultRole ? [defaultRole] : [],
    });
    
    // 3. Tạo profile trống cho user
    const savedUser = await this.usersRepository.save(user);
    const profile = this.profileRepository.create({ user_id: savedUser.id });
    await this.profileRepository.save(profile);
    
    return savedUser;
  }
```

---

### Task 5: Verify Token Payload
- [ ] **Step 1: Login via API and inspect JWT**
Command: `curl -X POST http://localhost:3001/auth/login -d '{"email":"...","password":"..."}'`
Expected: Giải mã JWT tại jwt.io thấy trường `roles: ["user"]`.

---

### Task 6: Update JwtStrategy.validate() ← **CRITICAL — Plan cũ bỏ sót**
**Files:**
- Modify: `apps/be/src/auth/strategies/jwt.strategy.ts`

> **Tại sao cần thiết:** `JwtStrategy.validate()` là nơi set `request.user`. Dù JWT payload chứa `roles`, nếu `validate()` không map `roles` ra thì `RolesGuard` sẽ đọc `user.roles = undefined` mãi mãi.

> **Field naming fix:** Unify sang `sub` (chuẩn JWT RFC 7519) thay vì `userId` để `OwnershipGuard` dùng được `user.sub`.

- [ ] **Step 1: Update validate() to pass roles and use sub**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const publicKey = getRequiredBase64Config(
      configService,
      'JWT_PUBLIC_KEY_BASE64',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      // 🚩 LAB VULNERABILITY: Missing 'algorithms: ["RS256"]'
      // This allows the attacker to use HS256 with the Public Key as the secret.
    });
  }

  validate(payload: { sub: string; email: string; roles?: string[] }) {
    // Trả về object này sẽ được gán vào request.user bởi Passport
    return {
      sub: payload.sub,       // ← Dùng 'sub' nhất quán (không dùng userId)
      email: payload.email,
      roles: payload.roles || [],  // ← Map roles từ JWT payload
    };
  }
}
```

**Gate (Phase 2):** `curl` login → JWT chứa `roles` → gọi endpoint có `@Roles(UserRole.ADMIN)` với token user thường → nhận `403`.
