# Auth Lab Design Spec: NestJS + NextJS

> **Status:** Approved 2026-04-28
> **Brainstormed decisions:** 5 questions, all answered

---

## Goal

Xây dựng lab thực hành toàn bộ authentication flow — từ JWT, refresh token, đến OAuth2/OIDC và bảo vệ chống XSS/CSRF — dùng NestJS (BE) + NextJS (FE), với TDD nghiêm túc cho phần core app.

---

## Approach

**Hybrid:**
- **sub-plan-1 & 2 (M0–M3):** Full working app với TDD end-to-end
- **sub-plan-3 & 4 (M4–M9):** Minimal demo scripts + explanation docs (không TDD full)

---

## Architecture

### Monorepo Structure

```
basic-auth-lab/
├── apps/
│   ├── be/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/                # Login, JWT, refresh token, OAuth2
│   │   │   ├── products/            # Protected resource (GET /products)
│   │   │   ├── users/               # User entity + repo
│   │   │   └── common/              # Guards, decorators, interceptors
│   │   └── test/                    # e2e tests (Supertest)
│   └── fe/                          # NextJS frontend (App Router)
│       ├── app/
│       │   ├── (auth)/login/        # Login page
│       │   ├── (protected)/products/ # Protected route
│       │   └── api/                 # Route handlers relay cookie
│       ├── lib/auth/                # Token storage, silent refresh logic
│       └── e2e/                     # Playwright tests
├── docker-compose.yml               # Full stack: BE + FE + Postgres + Redis
├── Makefile                         # Developer shortcuts
├── docs/
│   ├── plans/                       # Master plan + 4 sub-plans
│   ├── superpowers/specs/           # This file
│   ├── explanation/                 # Concept docs (M1, M5, M7, M8)
│   └── how-to/                      # Setup guides (Google OAuth, etc.)
└── .env.example
```

### Port Map

| Service   | Port |
|-----------|------|
| NestJS BE | 3001 |
| NextJS FE | 3000 |
| Postgres  | 5432 |
| Redis     | 6379 |

### Key Environment Variables

```bash
# JWT
JWT_ACCESS_SECRET=changeme
JWT_ACCESS_EXPIRES=1m          # Override to 15m in dev if needed
JWT_REFRESH_SECRET=changeme
JWT_REFRESH_EXPIRES=7d

# Strategy toggle
REFRESH_TOKEN_STRATEGY=blacklist   # blacklist | whitelist

# Google OAuth (M6)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# DB
DATABASE_URL=postgresql://lab:lab@postgres:5432/auth_lab
REDIS_URL=redis://redis:6379
```

---

## API Design

```
POST /auth/register          # email + password → bcrypt hash → user record
POST /auth/login             # email + password → access_token (1m) + refresh_token (7d)
POST /auth/refresh           # refresh_token → new access_token
POST /auth/logout            # revoke refresh_token

GET  /auth/google            # Redirect → Google OAuth consent
GET  /auth/google/callback   # Exchange code → tokens → return to FE

GET  /products               # Protected: requires valid Bearer access_token
```

---

## Data Flow

### M2 — Login flow (localStorage)

```
FE Login Page
  → POST /auth/login
  ← { access_token, refresh_token, expires_in }
  → Store both in localStorage
  → redirect → /products

FE Products Page
  → GET /products (Authorization: Bearer <access_token>)
  ← 200 { products }

  On 401 (expired):
  → POST /auth/refresh { refresh_token from localStorage }
  ← { access_token }
  → Retry original request  [silent refresh]

  On refresh 401:
  → Clear tokens → redirect /login
```

### M4 — Cookie migration

```
POST /auth/login response changes:
  Body:       { access_token }           ← FE stores in-memory (Zustand)
  Set-Cookie: refresh_token=<val>;       ← HttpOnly; Secure; SameSite=Strict; Path=/auth

POST /auth/refresh:
  Cookie auto-attached (no body needed)
  Response: { access_token }
```

---

## Refresh Token Strategy

| Strategy    | Storage  | Validate                | Revoke                           |
|-------------|----------|-------------------------|----------------------------------|
| `blacklist` | Redis    | jti NOT in Redis        | SET refresh:<jti> TTL=remaining  |
| `whitelist` | Postgres | jti MATCHES DB record   | DELETE from refresh_tokens       |

**Key trade-off:**
- Blacklist + Redis: fast lookup, data lost on Redis restart, no DB write on login
- Whitelist + Postgres: persistent audit trail, DB query on every `/auth/refresh`

---

## Database Schema (Postgres)

```sql
-- Always present
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Active only when REFRESH_TOKEN_STRATEGY=whitelist
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti        TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Docker Setup

### docker-compose.yml

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

  be:
    build: ./apps/be
    ports: ["3001:3001"]
    env_file: .env
    depends_on: [postgres, redis]
    volumes: [./apps/be:/app, /app/node_modules]

  fe:
    build: ./apps/fe
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [be]
    volumes: [./apps/fe:/app, /app/node_modules]

volumes:
  postgres_data:
```

### Makefile

```makefile
up:       docker compose up -d
down:     docker compose down
logs:     docker compose logs -f
be-shell: docker compose exec be sh
fe-shell: docker compose exec fe sh
db-reset: docker compose exec postgres psql -U lab auth_lab -c \
          "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
test-be:  docker compose exec be pnpm test
test-e2e: docker compose exec be pnpm test:e2e
test-fe:  docker compose exec fe pnpm playwright test
```

---

## Testing Strategy

### BE — NestJS (TDD, unit + e2e)

**Unit tests (Jest):**
- `auth.service.spec.ts` — login(), refresh(), logout(), validateToken()
- `products.service.spec.ts` — findAll() với mock AuthGuard
- `token-strategy.spec.ts` — blacklist vs whitelist behavior (mocked Redis/Postgres)

**E2E tests (Supertest):**
```
auth.e2e-spec.ts:
  ✓ POST /auth/login → 200 + tokens
  ✓ POST /auth/login wrong password → 401
  ✓ GET /products no token → 401
  ✓ GET /products expired token → 401
  ✓ POST /auth/refresh → new access_token
  ✓ POST /auth/refresh after logout → 401
  ✓ STRATEGY=blacklist: revoked jti rejected
  ✓ STRATEGY=whitelist: unknown jti rejected
```

**Test environment:**
- Unit tests: ioredis-mock + TypeORM in-memory (SQLite)
- E2E tests: real Postgres + Redis (separate test DB `auth_lab_test`)

### FE — NextJS (Playwright)

```
e2e/auth.spec.ts:
  ✓ Login success → redirect /products → products visible
  ✓ Login wrong credentials → error message shown
  ✓ Access /products unauthenticated → redirect /login
  ✓ Access token expired → silent refresh → products load
  ✓ Refresh token expired → redirect /login
  ✓ Logout → tokens cleared → /products redirects /login
  ✓ (M4) After cookie migration: refresh_token absent from localStorage
```

### Concept Milestones (M4–M9)

- No TDD
- Each has: `demo/` (standalone script) + `docs/explanation/` + `docs/til/`
- Exception: M4 has Playwright test for cookie migration verification

---

## Sub-plan Decomposition

```
sub-plan-1: Foundation           (M0 + M1)
  Gate: docker compose up → BE health → FE renders → encode/hash/encrypt tests pass

sub-plan-2: JWT Core             (M2 + M3)  [requires sub-plan-1]
  Gate: all unit + e2e + Playwright tests pass with both STRATEGY modes

sub-plan-3: Cookie & Security    (M4 + M5 + M7)  [requires sub-plan-2]
  Gate: Playwright confirms refresh_token NOT in localStorage;
        XSS payload blocked by CSP; subdomain cookie attack demonstrated + fixed

sub-plan-4: OAuth2 & PKCE        (M6 + M9 + M8)  [requires sub-plan-2]
  Gate: Google OAuth callback returns user profile; PKCE verifier validated;
        retrospective TIL doc written
```

### Dependency Graph

```
sub-plan-1 (Foundation)
    └── sub-plan-2 (JWT Core)
            ├── sub-plan-3 (Cookie & Security)   ← independent from sub-plan-4
            └── sub-plan-4 (OAuth2 & PKCE)       ← independent from sub-plan-3
```

---

## Decisions Log

| Question | Decision | Rationale |
|----------|----------|-----------|
| Approach | Hybrid (full app M0-M3, demo+doc M4-M9) | Maximize learning depth where it matters most |
| FE scope | Full flow (login, silent refresh, protected routes, logout, error states) | Learn FE perspective of auth completely |
| Token storage | localStorage → migrate HttpOnly cookie at M4 | "Make mistake then fix" = best way to internalize why |
| Refresh strategy | Feature flag `REFRESH_TOKEN_STRATEGY=blacklist\|whitelist` | Compare behavior directly in same codebase |
| Testing | TDD: Jest unit + Supertest e2e (BE) + Playwright (FE) | Lab should teach test design for auth too |
| Sub-plans | 4 plans by learning arc | Clear dependency gates, right-sized for 1-2 sessions each |

---

## Recommended Follow-up Docs

- `docs/how-to/setup-google-oauth-console.md` — Google Cloud project setup steps
- `docs/explanation/jwt-vs-session.md` — deep dive stateless vs stateful trade-off
- `docs/explanation/encode-hash-encryption.md` — M1 concept doc
- `docs/til/subdomain-cookie-escalation.md` — TIL note after M7
- `docs/til/xss-csp-fix.md` — TIL note after M5
