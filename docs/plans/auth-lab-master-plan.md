---
title: "Auth Lab Master Plan: NestJS + NextJS"
type: explanation
kind: [plan]
audience: [developers]
owner: unassigned
created: 2026-04-28
lastReviewed: 2026-04-28
reviewCadence: 90
status: draft
depends-on: []
updates: []
---

# Auth Lab Master Plan: NestJS + NextJS

## Goal

Xây dựng một lab project thực hành đầy đủ luồng authentication — từ login, JWT, OAuth2/OIDC
đến bảo vệ chống XSS/CSRF — dùng **NestJS (BE)** và **NextJS (FE)**, nhằm nắm vững các
trade-off thực tế trong thiết kế hệ thống auth.

## Scope

### In scope

- Luồng login/authen cơ bản (email + password) trả về access token (TTL = 1 phút) + refresh token
- Bảo vệ API `/products` bằng JWT access token (stateless verification)
- Chiến lược refresh token: blacklist / whitelist trên server để tăng bảo mật
- OAuth2 Authorization Code Flow + OIDC qua Google (Google Cloud Console project)
- Phân tích redirect behavior HTTP 301/302/303/307 trong OAuth2 flow
- Cookie: HttpOnly, Secure, SameSite — cách lưu token an toàn
- Bảo vệ chống XSS và CSRF; xử lý subdomain escalation attack
- Phân biệt rõ: **Encode** vs **Hash** vs **Encryption**

### Out of scope

- Multi-tenant / enterprise SSO (SAML, Azure AD)
- Rate limiting nâng cao / DDoS protection
- Mobile app OAuth flow (PKCE không phải mục tiêu chính của lab này)
- Production deployment / CI-CD pipeline

---

## Milestones

| Milestone | Outcome | Status | Target |
|---|---|---|------|
| M0 – Project scaffold | Repo monorepo: `apps/be` (NestJS) + `apps/fe` (NextJS), Docker Compose cho DB | draft | TBD |
| M1 – Encode / Hash / Encryption | Viết doc giải thích + demo code: Base64, bcrypt, AES | draft | TBD |
| M2 – Login + JWT cơ bản | POST `/auth/login` → access token (1 min TTL) + refresh token; GET `/products` trả 401 nếu token hết hạn | draft | TBD |
| M3 – Refresh token strategy | Implement blacklist (hoặc whitelist) refresh token trên Redis; revoke on logout | draft | TBD |
| M4 – Cookie & CSRF | Lưu refresh token vào HttpOnly cookie; implement CSRF double-submit cookie hoặc SameSite=Strict; test CSRF attack | draft | TBD |
| M5 – XSS lab | Demo XSS stored và reflected; patch với CSP header + sanitize; giải thích tại sao HttpOnly chặn được token hijack | draft | TBD |
| M6 – OAuth2 + OIDC (Google) | Implement Authorization Code Flow; đọc `id_token`; map Google user sang local user | draft | TBD |
| M7 – Subdomain CSRF escalation | Demo attack từ `evil.lab.local` → `app.lab.local`; fix bằng `__Host-` cookie prefix + `SameSite=Strict` | draft | TBD |
| M8 – Tổng kết & retrospective | Viết TIL notes; so sánh trade-off stateless JWT vs stateful session | draft | TBD |
| M9 – PKCE (OAuth2 for SPAs) | Implement PKCE flow (code_verifier / code_challenge); so sánh với Authorization Code Flow không có PKCE; lý giải khi nào SPA nên dùng PKCE thay vì backend proxy | draft | TBD |

### Gate conditions

- M3 phải hoàn thành trước M4 (cần refresh token infra để test revoke qua cookie).
- M6 yêu cầu tạo Google Cloud Console project và cấu hình OAuth Consent Screen + redirect URI trước khi code.
- M9 phụ thuộc vào M6 (cần hiểu Authorization Code Flow trước khi extend với PKCE).

---

## Technical Design Notes

### Stack

| Layer | Technology | Ghi chú |
|---|---|---|
| Backend | NestJS (TypeScript) | Passport.js: `passport-local`, `passport-jwt`, `passport-google-oauth20` |
| Frontend | NextJS (App Router) | Server Actions hoặc API Route để relay cookie |
| Database | PostgreSQL (Docker) | Lưu users, hashed passwords |
| Cache / Blacklist | Redis (Docker) | Lưu refresh token blacklist / whitelist |
| Auth lib | `@nestjs/jwt`, `jsonwebtoken` | Access token 1 min, refresh token 7 ngày |

### JWT stateless trade-off

```
Stateless JWT
  ✅ Không cần DB lookup mỗi request
  ✅ Scale ngang dễ
  ❌ Không thể revoke trước hạn → giải pháp: TTL ngắn (1 min) + refresh token có whitelist/blacklist

Whitelist refresh token:
  Chỉ token trong DB mới hợp lệ → revoke = xóa khỏi DB
  Ưu: kiểm soát tuyệt đối
  Nhược: luôn phải query DB khi refresh

Blacklist refresh token:
  Mặc định hợp lệ, revoke = thêm vào blacklist (Redis TTL = thời gian sống còn lại của token)
  Ưu: query DB chỉ khi revoke
  Nhược: nếu Redis sập, blacklist mất tạm thời
```

### HTTP Redirect trong OAuth2

| Code | Tên | Dùng trong OAuth2 |
|---|---|---|
| 301 | Moved Permanently | Không dùng — browser cache và đổi POST → GET |
| 302 | Found (Temporary) | Phổ biến nhất cho Authorization redirect |
| 303 | See Other | Dùng sau POST để redirect về GET (form submit) |
| 307 | Temporary Redirect | Giữ nguyên method (POST vẫn là POST) |

### Cookie security attributes

```
Set-Cookie: refresh_token=<value>;
  HttpOnly       → JS không đọc được → chặn XSS token theft
  Secure         → Chỉ gửi qua HTTPS
  SameSite=Strict → Chặn CSRF cross-site requests
  Path=/auth     → Giới hạn scope, không gửi trên mọi request
  __Host- prefix → Buộc Secure + không có Domain + Path=/ → chặn subdomain set cookie
```

### XSS vs CSRF tóm tắt

```
XSS  – Attacker inject script chạy trong browser của nạn nhân
        → Đọc localStorage, DOM, thực hiện request với creds của nạn nhân
        → Fix: CSP, output encoding, HttpOnly cookie

CSRF – Attacker lừa browser nạn nhân gửi request đến site tin cậy (cookie tự đính kèm)
        → Fix: SameSite cookie, CSRF token (double-submit cookie / synchronizer token)

Subdomain escalation:
  evil.lab.local set cookie Domain=.lab.local
  → Cookie bị gửi lên app.lab.local
  → Fix: dùng __Host- prefix (buộc bỏ Domain attribute)
```

### Encode vs Hash vs Encryption

| | Encode | Hash | Encryption |
|---|---|---|---|
| Mục đích | Biểu diễn dữ liệu (Base64, URL encode) | Fingerprint / kiểm tra toàn vẹn (bcrypt, SHA-256) | Bảo mật dữ liệu (AES, RSA) |
| Reversible | ✅ (không cần key) | ❌ (one-way) | ✅ (cần key) |
| Key required | ❌ | ❌ | ✅ |
| Dùng cho password | ❌ | ✅ (bcrypt + salt) | ❌ |
| Dùng cho token | ✅ Base64url payload | ✅ HMAC signature | ✅ JWE khi cần mã hóa payload |

---

## Dependencies

- Google Cloud Console project với OAuth 2.0 credentials (client_id, client_secret)
- Callback URL: `http://localhost:3000/auth/google/callback` (cần add vào Authorized redirect URIs)
- Docker & Docker Compose để chạy Postgres + Redis
- Node.js ≥ 20, pnpm (hoặc npm)

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Google OAuth consent screen bị giới hạn test users | Không test được OAuth flow | Thêm test account vào OAuth consent screen → External mode |
| Redis không available → blacklist mất | Revoked token có thể dùng lại | Implement fallback: nếu Redis down → reject mọi refresh request |
| Access token TTL 1 phút gây UX friction khi test | Khó debug | Dùng env var `JWT_ACCESS_EXPIRES` để override trong dev |

## Decisions

| Câu hỏi | Quyết định |
|---|---|
| Refresh token strategy | Implement **cả whitelist lẫn blacklist** trong M3 để so sánh hands-on trade-off |
| NextJS access token storage | Demo **cả hai**: memory (Zustand/context) và HttpOnly cookie — phân tích XSS/CSRF trade-off của từng cách |
| PKCE | **Thêm vào lab** dưới dạng M9 — extend từ M6 (Google OAuth flow) |

## Recommended follow-up docs

- `docs/how-to/setup-google-oauth-console.md` — hướng dẫn từng bước tạo Google Cloud project
- `docs/explanation/jwt-vs-session.md` — deep dive trade-off stateless vs stateful
- `docs/til/subdomain-cookie-escalation.md` — TIL note sau M7

---

## Status Log

- 2026-04-28 - draft
