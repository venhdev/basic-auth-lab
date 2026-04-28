# 📖 Auth Lab Runbook: The Security Engineer's Path

Chào mừng bạn đến với lộ trình chinh phục bảo mật Authentication. Tài liệu này hướng dẫn bạn cách vận hành phòng Lab và thực hiện các bài tập thực hành từ cơ bản đến nâng cao.

---

## 🏕️ Level 0: The Basecamp (Cài đặt)

Trước khi bắt đầu "leo núi", chúng ta cần đảm bảo mọi công cụ đều sẵn sàng.

### 1. Đồng bộ môi trường (.env)
Copy file mẫu và cấu hình các mã bí mật cho JWT:
```bash
cp apps/be/.env.example apps/be/.env
# Mở apps/be/.env và kiểm tra các biến JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

### 2. Khởi động Hạ tầng (Infrastructure)
Dùng Docker để chạy Database và Caching:
```bash
make up   # Hoặc: docker compose up -d
```
**Kiểm tra:** Chạy `docker ps` để đảm bảo container `postgres` (port 5432) và `redis` (port 6379) đang chạy.

### 3. Chạy ứng dụng (Application)
Mở 2 cửa sổ terminal riêng biệt:
- **Terminal 1 (Backend):** `cd apps/be && pnpm install && pnpm run dev` (Chạy tại port 3001)
- **Terminal 2 (Frontend):** `cd apps/fe && pnpm install && pnpm run dev` (Chạy tại port 3000)

**Dấu hiệu thành công:** Truy cập `http://localhost:3000` và thấy trang chủ "Secure Auth Lab".

---

## 💎 Level 1: The Core (JWT & Stateless Auth)
*Hiểu về cấu trúc Token và rủi ro từ việc sử dụng Secret yếu.*

- **Mục tiêu:** Hiểu cách server xác thực bạn mà không cần lưu Session trong DB.
- **Thực hành Tấn công:**
    1. Đăng nhập và copy `accessToken` từ LocalStorage.
    2. Chạy script: `python3 scripts/exploit/jwt_cracker.py <token>`
    3. **Thách thức:** Bạn có thể bẻ khóa được Secret trong bao lâu?
- **Thực hành Phòng thủ:** Xem file `apps/be/src/auth/auth.service.ts` để biết cách server ký Token.
- **Tài liệu:** [Scenario 01: JWT Secret Heist](docs/superpowers/sample/scenarios/01-jwt-brute-force.md)

---

## 🏰 Level 2: The Fortress (Cookies & Sessions)
*Bảo vệ phiên làm việc khỏi các cuộc tấn công trình duyệt.*

- **Mục tiêu:** Học cách dùng HttpOnly Cookie để chống trộm Token qua XSS.
- **Thực hành Tấn công:**
    1. Truy cập bài Lab XSS: `http://localhost:3000/lab/xss`.
    2. Chèn payload từ `scripts/exploit/payloads/xss.js` vào ô "Name".
    3. **Thách thức:** Tại sao bạn thấy nội dung sản phẩm nhưng không thấy Cookie?
- **Thực hành Phòng thủ:** Kiểm tra `apps/be/src/main.ts` để thấy cách cấu hình `cookie-parser` và `helmet` (CSP).
- **Tài liệu:** [Scenario 02: Silent Cookie Miner](docs/superpowers/sample/scenarios/02-xss-token-theft.md)

---

## 🚪 Level 3: The Gateway (OAuth2 & PKCE)
*Quản lý danh tính qua bên thứ ba và cơ chế PKCE.*

- **Mục tiêu:** Hiểu luồng ủy quyền (Authorization Code Flow) và cách chống lại việc đánh chặn Code.
- **Thực hành Tấn công:**
    1. Truy cập `http://localhost:3000/lab/pkce`.
    2. Sử dụng công cụ để tạo `Code Verifier` và `Challenge`.
    3. **Thách thức:** Nếu hacker chặn được `Authorization Code` nhưng không có `Verifier`, họ có đổi được Token không?
- **Thực hành Phòng thủ:** Xem `apps/be/src/auth/auth.controller.ts` để thấy cách server xử lý Google Callback.
- **Tài liệu:** [Scenario 03: OAuth Shadow](docs/superpowers/sample/scenarios/03-oauth-shadow.md)

---

## 🌀 Level 4: The Advanced Lab (Kỹ thuật nâng cao)
*Vượt qua các lớp bảo vệ IP và tấn công dựa trên thời gian.*

- **Thực hành Tấn công 1:** Chạy `python3 scripts/exploit/timing_analyzer.py` để thực hiện Timing Attack.
- **Thực hành Tấn công 2:** Chạy `python3 scripts/exploit/brute_force_rotated.py` để thử bypass Rate Limit.
- **Tài liệu:** Xem chi tiết tại [Attack Dashboard](docs/superpowers/sample/attack-dashboard.md).

---

## 🛠️ Maintenance & Troubleshooting
*Các lỗi thường gặp và cách xử lý.*

- **Lỗi DB Connection:** Chạy `docker ps` để xem Postgres có đang chạy không. Nếu cần reset hoàn toàn DB: `make down && make up`.
- **Lỗi Redis Connection:** Đảm bảo không có service nào khác đang chiếm dụng port 6379.
- **CORS Error:** Đảm bảo FE gọi đúng port 3001 và Backend đã `enableCors` cho `localhost:3000`.

---

## 🔗 Tài liệu tham khảo nhanh (Quick Links)
- **Dashboard Tấn công:** [Attack Dashboard](docs/superpowers/sample/attack-dashboard.md)
- **Thiết kế Hệ thống:** [System Spec](docs/superpowers/specs/2026-04-28-auth-attack-lab-design.md)
- **Hướng dẫn README:** [README.md](README.md)

---
*Chúc bạn có những trải nghiệm học tập thú vị và trở thành một Security Engineer thực thụ!*
