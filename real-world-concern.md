# 🛡️ PRODUCTION SECURITY AUDIT CHECKLIST
> [!NOTE]
> **Hướng dẫn sử dụng:** 
> - File này là danh sách các vấn đề bảo mật CẦN KIỂM TRA (Audit) khi triển khai hệ thống lên Production.
> - Cập nhật file này sau mỗi bài Lab khi phát hiện ra một rủi ro mới hoặc một cấu hình sai phổ biến.
> - Mỗi mục nên bao gồm: **Vấn đề**, **Cách kiểm tra** và **Giải pháp tối ưu dài hạn**.

---

## 🔑 1. JWT & AUTHENTICATION (BE)
- [ ] **Thuật toán ký:** Đảm bảo dùng **RS256** hoặc **Ed25519** cho hệ thống phân tán. Tránh dùng HS256 nếu phải chia sẻ Secret cho nhiều bên.
- [ ] **Algorithm Confusion:** Kiểm tra code validation có ép kiểu thuật toán (`algorithms: ['RS256']`) hay không? Không được tin vào header `alg` từ client.
- [ ] **Chiến thuật Mix-Algorithm (RS256 + HS256):** Cân nhắc dùng RS256 cho Access Token (để các dịch vụ khác tự verify) và HS256 cho Refresh Token (để tối ưu hiệu suất vì chỉ Auth Server cần verify).
- [ ] **Cấu hình thuật toán tường minh:** Luôn chỉ định rõ thuật toán trong hàm `sign()` hoặc `verify()` (ví dụ: `algorithm: 'HS256'`). Tránh việc để Refresh Token "thừa kế" thuật toán RS256 từ cấu hình mặc định của Access Token, dẫn đến lỗi Logic hoặc rủi ro bảo mật.
- [ ] **Độ mạnh của Key:** Nếu dùng HS256, Secret phải > 32 ký tự ngẫu nhiên. Nếu dùng RS256, khóa phải >= 2048 bit.
- [ ] **Stateless Validation:** Luôn kiểm tra User còn tồn tại hoặc có bị khóa (`is_active`) trong DB/Cache tại mỗi request không?

## 🏗️ 2. INFRASTRUCTURE & DB (BE)
- [ ] **Database Schema:** Tắt `synchronize: true`. Bắt buộc dùng **Migrations** để kiểm soát thay đổi schema.
- [ ] **Secret Management:** Không lưu password DB, API Key, JWT Secret trong file `.env` trên server. Sử dụng **AWS Secrets Manager**, **Vault**, hoặc **Environment Variables** cấp bởi platform (Vercel, Docker Swarm).
    *   *Tip:* Nếu bắt buộc dùng Environment Variables cho các khóa nhiều dòng (như RSA Keys), hãy sử dụng **Base64 Encoding** để tránh lỗi ký tự đặc biệt và xuống dòng.
- [ ] **Rate Limiting:** Cấu hình giới hạn request cho các endpoint nhạy cảm (Login, Register, Forgot Password).

## 🔄 3. TOKEN LIFECYCLE (BE)
- [ ] **Thời hạn Token:** Access Token nên ngắn hạn (< 15 phút). Refresh Token cần có cơ chế thu hồi.
- [ ] **Revocation:** Có triển khai **Blacklist** (Redis) để vô hiệu hóa Token ngay lập tức khi User logout hoặc đổi pass không?
- [ ] **Rotation:** Có cơ chế **Refresh Token Rotation** (cấp mới Refresh Token mỗi khi refresh) để phát hiện tấn công chiếm quyền không?

## 🌐 4. BROWSER & TRANSPORT (FE/BE)
- [ ] **Cookie Security:** Access Token lưu trong Cookie phải có flags: `HttpOnly`, `Secure`, `SameSite=Lax/Strict`.
- [ ] **XSS Protection:** Sử dụng `helmet` (BE) và thực hiện Sanitization (FE) để tránh bị lộ Token qua script.
- [ ] **CORS Policy:** Không dùng `origin: '*'`. Chỉ whitelist các domain tin cậy của frontend.
- [ ] **Transport:** Luôn chạy trên **HTTPS** và có cấu hình **HSTS**.

## 🚀 5. FUTURE TRENDS: Ed25519 (EdDSA)
> [!CAUTION]
> **Cần phân tích kỹ trước khi áp dụng:** Mặc dù là xu hướng, nhưng cần kiểm tra sự hỗ trợ của các thư viện JWT và trình duyệt cũ trong hệ thống của bạn.

- [ ] **Ed25519 (EdDSA):** Cân nhắc chuyển dịch từ RS256 sang Ed25519 để tối ưu hiệu suất (nhanh hơn), độ dài khóa (ngắn hơn) và bảo mật cao hơn trên cùng một kích thước khóa.

---
*Cập nhật lần cuối: 2026-04-29*
