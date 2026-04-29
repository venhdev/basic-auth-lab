---
id: PLAN-002-S5
title: Sub-plan 5: Frontend & Lab Scenarios
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [PLAN-002-S4]
---

# Sub-plan 5: Frontend & Lab Scenarios

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hoàn thiện giao diện người dùng và thực hiện các kịch bản tấn công thực tế (Algorithm Confusion, IDOR).

**Architecture:** 
- NextJS Dashboard với điều kiện hiển thị theo Role.
- Python Exploit Scripts để tự động hóa việc tấn công.

**Tech Stack:** NextJS, TailwindCSS, Python (Exploitation).

---

### Task 0: Setup Python Environment (Prerequisite cho Lab 05/06)
**Files:**
- Create dir: `scripts/exploit/`
- Create: `scripts/exploit/requirements.txt`

> **Manual setup — thực hiện trước khi chạy bất kỳ exploit script nào.**

- [ ] **Step 1: Kiểm tra Python3 và pip**
```bash
python3 --version  # Cần >= 3.9
pip3 --version
```

- [ ] **Step 2: Tạo virtual environment (khuyến nghị)**
```bash
cd scripts/exploit
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# hoặc: .venv\Scripts\activate   # Windows
```

- [ ] **Step 3: Tạo requirements.txt và cài đặt**
```
# scripts/exploit/requirements.txt
requests>=2.31.0
PyJWT>=2.8.0
cryptography>=41.0.0
```
```bash
pip install -r requirements.txt
```

- [ ] **Step 4: Verify**
```bash
python3 -c "import requests, jwt; print('OK')"
```

---

### Task 1: Update Auth Store for Multiple Roles
**Files:**
- Modify: `apps/fe/src/lib/auth/auth-store.ts`

- [ ] **Step 1: Update User interface to support roles array**
```typescript
interface User {
  email: string;
  sub: string;
  roles: string[]; // Mảng roles
}
```

---

### Task 2: Create Admin Dashboard UI
**Files:**
- Create: `apps/fe/src/app/(protected)/admin/page.tsx`

- [ ] **Step 1: Implement Admin User List & Role Toggle**
- [ ] **Step 2: Restricted access check in UI**
```tsx
const { user } = useAuthStore();
if (!user?.roles.includes('admin')) {
  return <div>Access Denied</div>;
}
```

---

### Task 3: Create Profile Page UI
**Files:**
- Create: `apps/fe/src/app/(protected)/profile/page.tsx`

- [ ] **Step 1: Implement Edit Profile form**

---

### Task 4: Lab 05 Exploit (Algorithm Confusion)
**Files:**
- Create: `scripts/exploit/lab05_priv_esc.py`

- [ ] **Step 1: Automate the attack**
    - Đăng nhập bằng user thường.
    - Lấy Public Key từ BE.
    - Tạo Token mới với `roles: ["admin"]` dùng HS256.
    - Gọi API `GET /admin/users` để lấy danh sách toàn bộ người dùng.

---

### Task 5: Lab 06 Exploit (IDOR)
**Files:**
- Create: `scripts/exploit/lab06_idor.py`

- [ ] **Step 1: Automate the attack**
    - Đăng nhập User A.
    - Gọi `PATCH /profile/USER_B_ID` với dữ liệu mới.
    - Kiểm tra xem Server có cho phép thay đổi Profile của người khác không.

---

### Task 6: Final Verification
- [ ] **Step 1: Set `RBAC_VERIFICATION_STRATEGY=stateful`**
- [ ] **Step 2: Run exploit scripts again**
Expected: Tất cả các đòn tấn công đều bị chặn (401 hoặc 403).
