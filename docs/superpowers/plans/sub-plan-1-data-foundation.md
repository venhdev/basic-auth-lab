---
id: PLAN-002-S1
title: Sub-plan 1: Data Foundation
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [PLAN-002]
---

# Sub-plan 1: Data Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Thiết lập cấu trúc Database cho Roles (Many-to-Many) và Profiles (One-to-One).

**Architecture:** 
- Sử dụng TypeORM Decorators (`@ManyToMany`, `@JoinTable`, `@OneToOne`).
- Tạo thực thể `Role` và `Profile` mới.

**Tech Stack:** NestJS, TypeORM, PostgreSQL.

---

### Task 1: Create Role Entity
**Files:**
- Create: `apps/be/src/users/entities/role.entity.ts`

- [ ] **Step 1: Define Role Entity**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 'admin', 'user'

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
```

---

### Task 2: Create Profile Entity
**Files:**
- Create: `apps/be/src/users/entities/profile.entity.ts`

- [ ] **Step 1: Define Profile Entity**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
```

---

### Task 3: Update User Entity for Relationships
**Files:**
- Modify: `apps/be/src/users/entities/user.entity.ts`

- [ ] **Step 1: Add roles and profile relations**
```typescript
// ... imports
import { Role } from './role.entity';
import { Profile } from './profile.entity';
import { ManyToMany, JoinTable, OneToOne } from 'typeorm';

@Entity('users')
export class User {
  // ... existing columns
  
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
```

---

### Task 4: Database Migration & Seeding
**Files:**
- Reference: `apps/be/src/app.module.ts` (synchronize:true handles DDL automatically)

> **Strategy (Dev environment):** `synchronize: true` đang bật → TypeORM tự động tạo/cập nhật bảng khi `app.module.ts` được đăng ký đầy đủ entities. **Không cần chạy SQL DDL thủ công.** Chỉ cần Seed data cho bảng `roles`.

- [ ] **Step 1: Seed roles data (bắt buộc — TypeORM không tự seed)**
```sql
-- Option A: docker exec trực tiếp
docker exec -it auth-lab-db psql -U lab -d auth_lab -c "
  INSERT INTO \"roles\" (\"name\") VALUES ('user'), ('admin') ON CONFLICT DO NOTHING;
"

-- Option B: nếu dùng migration file (npm run migration:run)
-- Tạo file migration seed riêng với câu INSERT ở trên
```

- [ ] **Step 2 (Optional — dùng nếu cần reproduce hoặc ci/cd): Migration file tham khảo**
```sql
-- Chỉ để tài liệu hoá; synchronize:true đã xử lý DDL:
CREATE TABLE "roles" ("id" SERIAL PRIMARY KEY, "name" VARCHAR UNIQUE NOT NULL);
CREATE TABLE "users_roles" ("user_id" uuid REFERENCES users(id), "role_id" int REFERENCES roles(id), PRIMARY KEY(user_id, role_id));
CREATE TABLE "profiles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "bio" TEXT, "user_id" uuid UNIQUE REFERENCES users(id));
```

---

### Task 5: Verify Module Configuration
**Files:**
- Modify: `apps/be/src/users/users.module.ts`

- [ ] **Step 1: Register new entities**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, Role, Profile])],
  providers: [UsersService],
  controllers: [], // Controllers sẽ được thêm ở Phase 4
  exports: [UsersService],
})
export class UsersModule {}
```

---

### Task 6: Register Entities in AppModule ← **CRITICAL — Plan cũ bỏ sót**
**Files:**
- Modify: `apps/be/src/app.module.ts`

- [ ] **Step 1: Thêm Role và Profile vào entities[] của TypeOrmModule.forRoot**
```typescript
import { Role } from './users/entities/role.entity';
import { Profile } from './users/entities/profile.entity';

TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, RefreshToken, Role, Profile], // ← Thêm Role, Profile
  synchronize: true, // Giữ nguyên cho dev
}),
```

- [ ] **Step 2: Verify — restart BE và kiểm tra bảng được tạo**
```bash
docker exec -it auth-lab-db psql -U lab -d auth_lab -c "\dt"
# Expected: thấy bảng roles, users_roles, profiles xuất hiện
```

**Gate (Phase 1):** `\dt` liệt kê đủ 5 bảng: `users`, `refresh_tokens`, `roles`, `users_roles`, `profiles`.
