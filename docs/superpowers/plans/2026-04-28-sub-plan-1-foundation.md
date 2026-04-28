# Auth Lab Sub-plan 1: Foundation (M0 + M1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo cấu trúc monorepo, setup môi trường Docker và thực hiện demo các khái niệm Encode/Hash/Encryption với TDD.

**Architecture:** Monorepo sử dụng folder `apps/be` (NestJS) và `apps/fe` (NextJS). Sử dụng Docker Compose để quản lý Postgres và Redis.

**Tech Stack:** NestJS, NextJS, Docker, bcrypt, crypto (Node.js), Jest.

---

### Task 1: Initialize Monorepo & Backend Scaffold (M0)

**Files:**
- Create: `apps/be/package.json`
- Create: `apps/be/tsconfig.json`
- Create: `apps/be/src/main.ts`

- [ ] **Step 1: Initialize NestJS project in `apps/be`**
Run: `mkdir -p apps/be && npx -y nest new apps/be --package-manager pnpm --skip-git`
Note: Chọn defaults nếu có prompt.

- [ ] **Step 2: Verify backend starts**
Run: `cd apps/be && pnpm run start`
Expected: NestJS started successfully on default port (3000).

- [ ] **Step 3: Commit**
Run: `git add apps/be && git commit -m "feat: scaffold NestJS backend"`

---

### Task 2: Initialize Frontend Scaffold (M0)

**Files:**
- Create: `apps/fe/package.json`

- [ ] **Step 1: Initialize NextJS project in `apps/fe`**
Run: `npx -y create-next-app@latest apps/fe --typescript --tailwind --eslint --app --src-dir --use-pnpm --no-git`

- [ ] **Step 2: Verify frontend starts**
Run: `cd apps/fe && pnpm run dev`
Expected: NextJS started on http://localhost:3000.

- [ ] **Step 3: Commit**
Run: `git add apps/fe && git commit -m "feat: scaffold NextJS frontend"`

---

### Task 3: Docker & Infrastructure Setup (M0)

**Files:**
- Create: `docker-compose.yml`
- Create: `Makefile`
- Create: `.env.example`

- [ ] **Step 1: Create `docker-compose.yml`**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: auth_lab
      POSTGRES_USER: lab
      POSTGRES_PASSWORD: lab
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  postgres_data:
```

- [ ] **Step 2: Create `Makefile`**
```makefile
up:
	docker compose up -d
down:
	docker compose down
db-shell:
	docker compose exec postgres psql -U lab auth_lab
```

- [ ] **Step 3: Start infrastructure**
Run: `make up`
Expected: Postgres and Redis containers are running.

- [ ] **Step 4: Commit**
Run: `git add docker-compose.yml Makefile && git commit -m "chore: setup docker infrastructure"`

---

### Task 4: Encode / Hash / Encryption Utilities (M1)

**Files:**
- Create: `apps/be/src/common/utils/crypto.util.ts`
- Create: `apps/be/src/common/utils/crypto.util.spec.ts`

- [ ] **Step 1: Write failing tests for crypto utilities**
```typescript
import { encodeBase64, hashPassword, comparePassword, encryptAES, decryptAES } from './crypto.util';

describe('CryptoUtil', () => {
  it('should encode string to base64', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('should hash and compare password', async () => {
    const password = 'secret123';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(await comparePassword(password, hashed)).toBe(true);
  });

  it('should encrypt and decrypt AES', () => {
    const text = 'sensitive data';
    const key = '12345678901234567890123456789012'; // 32 chars
    const encrypted = encryptAES(text, key);
    expect(encrypted).not.toBe(text);
    expect(decryptAES(encrypted, key)).toBe(text);
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `cd apps/be && pnpm test src/common/utils/crypto.util.spec.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement utilities**
Install dependencies: `cd apps/be && pnpm add bcrypt && pnpm add -D @types/bcrypt`
```typescript
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export const encodeBase64 = (str: string): string => Buffer.from(str).toString('base64');

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const encryptAES = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decryptAES = (encryptedData: string, key: string): string => {
  const textParts = encryptedData.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
```

- [ ] **Step 4: Run tests to verify success**
Run: `cd apps/be && pnpm test src/common/utils/crypto.util.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**
Run: `git add apps/be && git commit -m "feat: add crypto utilities with M1 demo"`
