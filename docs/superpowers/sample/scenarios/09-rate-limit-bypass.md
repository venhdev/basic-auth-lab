# Scenario 09: Zombie Army (Rate Limit Bypass)

## 🎯 Mục tiêu
Vượt qua cơ chế chặn IP (Rate Limiting) để thực hiện brute-force mật khẩu quy mô lớn.

## 🛠️ Công cụ
- `Burp Intruder`.
- Một danh sách Proxy (hoặc mô phỏng bằng X-Forwarded-For header).

## 🚀 Các bước thực hiện

1. **Thử nghiệm giới hạn:** Thử đăng nhập sai 5-10 lần liên tục. Bạn sẽ bị server chặn IP (Lỗi 429 Too Many Requests).
2. **Kỹ thuật "X-Forwarded-For":** Một số server (hoặc Load Balancer) tin tưởng vào header `X-Forwarded-For` để xác định IP người dùng. Hacker có thể giả mạo header này để đánh lừa server rằng yêu cầu đến từ một IP khác.
   ```http
   POST /auth/login HTTP/1.1
   X-Forwarded-For: 1.2.3.4
   ...
   ```
3. **Xoay vòng Proxy (Rotated Proxies):** Các cao thủ sử dụng hàng ngàn proxy thật để gửi mỗi request từ một IP khác nhau, khiến cơ chế chặn IP trở nên vô dụng.

## 💡 Tại sao kịch bản này quan trọng?
Phòng thủ theo IP là chưa đủ. Các hệ thống hiện đại sử dụng Captcha, hành vi người dùng (Behavioral analysis) và giới hạn theo tài khoản (Account lockout) thay vì chỉ dựa vào IP.

---
**Thực hành:** Sử dụng script `scripts/exploit/brute_force_rotated.py`.
