---
id: PLAN-002
title: Comprehensive RBAC & Ownership Master Plan
status: approved
lastReviewed: 2026-04-29
kind: [plan]
ssot: true
depends-on: [2026-04-29-comprehensive-rbac-design.md]
---

# Comprehensive RBAC & Ownership Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to manage the execution of sub-plans. This master plan tracks high-level progress.

**Goal:** Triển khai hệ thống phân quyền đa vai trò (Multi-roles) và kiểm soát quyền sở hữu (Ownership) với cơ chế Feature Flag (Stateless/Stateful) cho Auth Lab.

**Architecture:** 
- Backend: NestJS với TypeORM (Many-to-Many roles), Guards chuyên dụng.
- Frontend: NextJS với Zustand store để xử lý nhiều vai trò.
- Security: Chế độ Stateless để thực hành exploit, Stateful để thực hành defense.

---

## 🗺️ Roadmap (Sub-plans)

### [Phase 1: Data Foundation](sub-plan-1-data-foundation.md)
- [ ] Thiết lập bảng `roles`, `users_roles` và `profiles`.
- [ ] Tạo Migration SQL và cập nhật TypeORM Entities.
- [ ] **Gate:** Database schema khớp với thiết kế, Migration chạy thành công.

### [Phase 2: Auth Core Update](sub-plan-2-auth-core.md)
- [ ] Định nghĩa `UserRole` Enum.
- [ ] Cập nhật `AuthService` để nhúng `roles` vào JWT Payload.
- [ ] **Gate:** JWT Token mới chứa mảng roles chính xác (ví dụ: `["user", "admin"]`).

### [Phase 3: Guards & Feature Flag](sub-plan-3-guards-flags.md)
- [ ] Triển khai `RolesGuard` với logic kiểm tra Feature Flag.
- [ ] Triển khai `OwnershipGuard` để chống IDOR.
- [ ] **Gate:** Chuyển đổi flag thành công giữa Stateless (tin JWT) và Stateful (check DB).

### [Phase 4: Admin & Profile APIs](sub-plan-4-features-api.md)
- [ ] Xây dựng Admin Controller (CRUD Products/Users).
- [ ] Xây dựng Profile Controller (Ownership checks).
- [ ] **Gate:** Admin có thể sửa quyền User; User chỉ sửa được Profile của chính mình.

### [Phase 5: Frontend & Lab Scenarios](sub-plan-5-frontend-ui.md)
- [ ] Cập nhật giao diện Dashboard (Admin views, Role badges).
- [ ] Viết script exploit cho Lab 05 (Algorithm Confusion) và Lab 06 (IDOR).
- [ ] **Gate:** Tấn công thành công ở Stateless mode và bị chặn ở Stateful mode.

---

## 🛠️ Tech Stack
- **Backend:** NestJS, TypeORM, PostgreSQL, Redis.
- **Frontend:** NextJS 14+, TailwindCSS, Zustand.
- **Testing:** Jest, Supertest.
