# 🧪 RBAC & Ownership Manual Test Guide

Tài liệu này hướng dẫn cách kiểm tra thủ công các tính năng phân quyền và bảo mật sau khi triển khai hệ thống RBAC cho Auth Lab.

---

## 1. Chuẩn bị (Preparation)
Trước khi test, đảm bảo bạn đã:
1. Chạy Database: `docker compose up -d`
2. Khởi tạo dữ liệu: `make seed`
3. Chạy Backend & Frontend.

---

## 2. Kiểm tra Phân quyền (RBAC Testing)

### 2.1. Kiểm tra JWT Payload
*   **Hành động**: Đăng nhập bằng `admin@test.com` / `test123`.
*   **Kiểm tra**: Copy `access_token` dán vào [jwt.io](https://jwt.io).
*   **Kết quả mong đợi**: Payload phải có trường `roles: ["user", "admin"]` và `sub` (UUID).

### 2.2. Truy cập trang Admin (Admin-Only)
*   **Hành động**: 
    1. Đăng nhập bằng `user@test.com`. Thử truy cập `http://localhost:3000/admin`.
    2. Đăng nhập bằng `admin@test.com`. Thử truy cập `http://localhost:3000/admin`.
*   **Kết quả mong đợi**: 
    1. User thường bị chặn (hiển thị "Access Denied" hoặc 403).
    2. Admin truy cập bình thường và thấy danh sách User.

### 2.3. Tạo sản phẩm mới (Write Protection)
*   **Hành động**: Dùng Postman hoặc UI (nếu có) để gọi `POST /products` với token của User thường.
*   **Kết quả mong đợi**: Trả về `403 Forbidden`. Chỉ Admin mới được phép tạo Product.

---

## 3. Kiểm tra Quyền sở hữu (Ownership/IDOR Testing)

### 3.1. Sửa Profile chính mình
*   **Hành động**: Truy cập trang `/profile`. Sửa Bio và nhấn "Save Profile".
*   **Kết quả mong đợi**: Thành công (200 OK). Dữ liệu trong DB được cập nhật.

### 3.2. Tấn công IDOR (Sửa Profile người khác)
*   **Hành động**: 
    1. Đăng nhập bằng User A. Lấy ID của User B (có thể thấy trong trang Admin).
    2. Dùng Postman gọi `PATCH /profile/<ID_USER_B>` bằng token của User A.
*   **Kết quả mong đợi**: Trả về `403 Forbidden` (do `OwnershipGuard` chặn).

---

## 4. Kiểm tra Lab Scenarios (Stateless vs Stateful)

### 4.1. Chế độ Stateless (Vulnerable)
*   **Thiết lập**: `make mode-stateless` và restart BE.
*   **Kịch bản**: Chạy script exploit `make exploit-05`.
*   **Kết quả mong đợi**: Tấn công thành công. Bạn có thể leo quyền lên Admin bằng cách giả mạo JWT (Algorithm Confusion) vì Server tin hoàn toàn vào Payload của Token.

### 4.2. Chế độ Stateful (Secure)
*   **Thiết lập**: `make mode-stateful` và restart BE.
*   **Kịch bản**: Chạy lại script exploit `make exploit-05`.
*   **Kết quả mong đợi**: Tấn công thất bại (403). Server đã check lại quyền trong Database và thấy User thực tế không có quyền Admin, dù JWT giả mạo nói có.

---

## 5. Bảng kiểm soát (Checklist)

| STT | Tính năng | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | Đăng ký User mới có role mặc định | [ ] | |
| 2 | JWT chứa đầy đủ sub, email, roles | [ ] | |
| 3 | RolesGuard chặn User thường vào Admin | [ ] | |
| 4 | OwnershipGuard chặn IDOR trên Profile | [ ] | |
| 5 | Chuyển đổi Feature Flag hoạt động | [ ] | |
| 6 | Exploit Lab 05 hoạt động (Stateless) | [ ] | |
