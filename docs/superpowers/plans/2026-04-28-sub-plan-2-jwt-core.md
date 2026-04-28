# Auth Lab Sub-plan 2: JWT Core (M2 + M3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai luồng login hoàn chỉnh với JWT, lưu token vào localStorage và silent refresh. Tích hợp chiến lược quản lý Refresh Token (Blacklist/Whitelist) qua Feature Flag.

**Architecture:** Sử dụng Passport JWT cho xác thực. Refresh Token được kiểm tra qua `AuthService` tùy theo cấu biến môi trường.

**Tech Stack:** NestJS, Passport, JWT, TypeORM (Postgres), Redis, NextJS.

---

### Task 1: Database Entities & User Registration (M2)

**Files:**
- Create: `apps/be/src/users/entities/user.entity.ts`
- Create: `apps/be/src/users/users.service.ts`
- Create: `apps/be/src/auth/auth.controller.ts`

- [ ] **Step 1: Define User Entity**
Install dependencies: `cd apps/be && pnpm add @nestjs/typeorm typeorm pg @nestjs/jwt passport-jwt @nestjs/passport passport passport-local && pnpm add -D @types/passport-local @types/passport-jwt`
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;
}
```

- [ ] **Step 2: Implement Registration**
Implement `UsersService.create()` using `hashPassword`.

- [ ] **Step 3: Commit**
Run: `git add apps/be && git commit -m "feat: add user entity and registration"`

---

### Task 2: Login & JWT Issuance (M2)

**Files:**
- Modify: `apps/be/src/auth/auth.service.ts`
- Modify: `apps/be/src/auth/auth.controller.ts`

- [ ] **Step 1: Write TDD for Login**
Create `auth.service.spec.ts` to test `login()` returns access and refresh tokens.

- [ ] **Step 2: Implement Login logic**
Access token TTL = 1m. Refresh token TTL = 7d.

- [ ] **Step 3: Run tests**
Expected: PASS.

- [ ] **Step 4: Commit**
Run: `git add apps/be && git commit -m "feat: implement jwt login issuance"`

---

### Task 3: Protected Resources & Silent Refresh (M2)

**Files:**
- Create: `apps/be/src/products/products.controller.ts`
- Create: `apps/fe/src/lib/auth/auth-provider.tsx`

- [ ] **Step 1: Create Protected /products endpoint**
Use `JwtAuthGuard`.

- [ ] **Step 2: Implement Silent Refresh logic on FE**
Intercept 401 errors in Axios/Fetch, call `/auth/refresh` and retry.

- [ ] **Step 3: Commit**
Run: `git add apps/be apps/fe && git commit -m "feat: add protected products and silent refresh"`

---

### Task 4: Refresh Token Strategy - Blacklist & Whitelist (M3)

**Files:**
- Modify: `apps/be/src/auth/auth.service.ts`
- Create: `apps/be/src/auth/strategies/token-storage.strategy.ts`
- Create: `apps/be/src/users/entities/refresh-token.entity.ts`

- [ ] **Step 1: Define RefreshToken Entity (for whitelist)**
```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ unique: true })
  jti: string;

  @Column()
  expires_at: Date;
}
```

- [ ] **Step 2: Implement Blacklist (Redis) & Whitelist (Postgres) strategies**
Use `process.env.REFRESH_TOKEN_STRATEGY` to switch.

- [ ] **Step 3: Write e2e test to verify revocation**
Verify that after `POST /auth/logout`, the refresh token is no longer valid.

- [ ] **Step 4: Commit**
Run: `git add apps/be && git commit -m "feat: implement refresh token blacklist/whitelist strategies"`
