# Auth Lab Sub-plan 4: OAuth2 & PKCE (M6 + M9 + M8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai OAuth2/OIDC với Google, thực hiện demo PKCE và hoàn thành báo cáo tổng kết lab.

**Architecture:** Sử dụng `passport-google-oauth20` cho Google Login. PKCE được demo thủ công qua script để hiểu luồng verifier/challenge.

**Tech Stack:** NestJS, Passport, Google OAuth2, NextJS.

---

### Task 1: Google OAuth2 Integration (M6)

**Files:**
- Create: `docs/how-to/setup-google-oauth.md`
- Modify: `apps/be/src/auth/strategies/google.strategy.ts`
- Modify: `apps/be/src/auth/auth.controller.ts`

- [ ] **Step 1: Document Google Console Setup**
Guide user to create Client ID & Secret.

- [ ] **Step 2: Implement Google Strategy in NestJS**
Map Google profile to local User.

- [ ] **Step 3: Add "Login with Google" on FE**
Redirect to `/auth/google`.

- [ ] **Step 4: Commit**
Run: `git add apps/be docs && git commit -m "feat: add google oauth2 integration"`

---

### Task 2: PKCE Implementation Demo (M9)

**Files:**
- Create: `apps/be/src/auth/pkce-demo.util.ts`
- Create: `docs/explanation/pkce.md`

- [ ] **Step 1: Create PKCE Utility**
Functions to generate `code_verifier` and `code_challenge` (S256).

- [ ] **Step 2: Demonstrate PKCE Flow**
Show how the backend validates the verifier against the challenge.

- [ ] **Step 3: Commit**
Run: `git add apps/be docs && git commit -m "feat: implement pkce utility and demo"`

---

### Task 3: Final Retrospective & TIL (M8)

**Files:**
- Create: `docs/retrospective.md`

- [ ] **Step 1: Write Learning Summary**
Compare Stateless vs Stateful, LocalStorage vs Cookies.

- [ ] **Step 2: Document Redirect Behavior**
Note findings on 302 vs 303 vs 307 in OAuth2.

- [ ] **Step 3: Commit**
Run: `git add docs && git commit -m "docs: finalize lab with retrospective"`
