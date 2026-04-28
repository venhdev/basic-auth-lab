# Scenario 05: Account Linking Hijack (OAuth CSRF)

## 🎯 Mục tiêu
Ép nạn nhân liên kết tài khoản của họ với tài khoản xã hội của Hacker mà họ không hề hay biết.

## 🛠️ Công cụ
- Burp Suite.
- Một trang web Phishing đơn giản.

## 🚀 Các bước thực hiện

1. **Khởi tạo luồng Linking:** Hacker nhấn "Link Google Account" trên trình duyệt của mình nhưng **chặn lại** request ngay trước khi nó gửi đến Google.
2. **Lấy link "độc":** Copy cái URL yêu cầu đó (URL này chứa `state` và các tham số của Hacker).
3. **Gửi bẫy:** Hacker lừa nạn nhân (đang đăng nhập vào app) click vào một link hoặc một ảnh chứa cái URL "độc" trên.
4. **Kết quả:** App sẽ liên kết tài khoản của nạn nhân với danh tính Google của Hacker. Từ đó, Hacker chỉ cần đăng nhập bằng Google của mình là có thể vào tài khoản nạn nhân.

## 💡 Tại sao kịch bản này quan trọng?
Đây là lý do tham số `state` (một mã ngẫu nhiên dùng 1 lần) là bắt buộc trong OAuth2 để chống lại tấn công CSRF (Cross-Site Request Forgery).

---
**Giải pháp:** Luôn kiểm tra `state` ở cả hai đầu gửi và nhận.
