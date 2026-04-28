# Auth Lab Sub-plan 3: Cookie & Security (M4 + M5 + M7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi lưu trữ token sang HttpOnly Cookie, thực hiện lab về XSS và Subdomain CSRF escalation.

**Architecture:** Backend sử dụng `res.cookie` để set HttpOnly Refresh Token. Frontend lưu Access Token in-memory. Implement Content Security Policy (CSP).

**Tech Stack:** NestJS, NextJS, Cookie-parser, Helmet (CSP).

---

### Task 1: Cookie Migration (M4)

**Files:**
- Modify: `apps/be/src/auth/auth.controller.ts`
- Modify: `apps/fe/src/lib/auth/auth-provider.tsx`

- [ ] **Step 1: Update BE to send HttpOnly Cookie**
```typescript
res.cookie('refresh_token', tokens.refresh_token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/auth'
});
```

- [ ] **Step 2: Update FE to handle in-memory Access Token**
Remove refresh token from localStorage.

- [ ] **Step 3: Verify migration with Playwright**
Check that `localStorage.getItem('refresh_token')` is null.

- [ ] **Step 4: Commit**
Run: `git add apps/be apps/fe && git commit -m "feat: migrate refresh token to httpOnly cookie"`

---

### Task 2: XSS Lab & Prevention (M5)

**Files:**
- Create: `apps/fe/src/app/lab/xss/page.tsx`
- Modify: `apps/be/src/main.ts`

- [ ] **Step 1: Create Vulnerable XSS Page**
Demo reflected XSS via query param.

- [ ] **Step 2: Demonstrate Token Theft Prevention**
Show that `document.cookie` cannot read the HttpOnly token.

- [ ] **Step 3: Implement CSP with Helmet**
Add `helmet` and configure basic CSP in NestJS.

- [ ] **Step 4: Commit**
Run: `git add apps/be apps/fe && git commit -m "feat: add xss lab and csp prevention"`

---

### Task 3: Subdomain CSRF Escalation (M7)

**Files:**
- Create: `docs/explanation/subdomain-attack.md`
- Modify: `apps/be/src/auth/auth.controller.ts`

- [ ] **Step 1: Document Attack Vector**
Explain how `evil.lab.local` can set a cookie for `.lab.local`.

- [ ] **Step 2: Implement `__Host-` Cookie Prefix**
Update cookie name and attributes to use `__Host-` prefix for maximum security.

- [ ] **Step 3: Commit**
Run: `git add apps/be docs && git commit -m "feat: fix subdomain escalation with __Host- prefix"`
