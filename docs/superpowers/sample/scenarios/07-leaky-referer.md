# Scenario 07: Leaky Referer (Token Theft via Header)

## 🎯 Mục tiêu
Đánh cắp Token của người dùng khi họ click vào một liên kết dẫn đến trang web do bạn kiểm soát.

## 🛠️ Công cụ
- Browser DevTools.
- Một server hứng (Listener) đơn giản bằng Python.

## 🚀 Các bước thực hiện

1. **Chuẩn bị bẫy:** Hacker tạo một trang web (ví dụ: `hacker.com`) và đặt link trang này vào một nơi nào đó trên ứng dụng mục tiêu (ví dụ: trong phần comment hoặc profile).
2. **Kích hoạt lỗi:** Giả sử ứng dụng mục tiêu có cơ chế truyền Token qua URL (điều này rất tệ nhưng vẫn xảy ra trong các hệ thống cũ).
   - URL: `http://localhost:3000/dashboard?token=SECRET_JWT_TOKEN`
3. **Nạn nhân sập bẫy:** Nạn nhân đang ở trang dashboard và click vào link dẫn đến `hacker.com`.
4. **Thu hoạch:** Trình duyệt của nạn nhân sẽ gửi một Header gọi là `Referer` đến `hacker.com`. Header này chứa **toàn bộ URL** của trang trước đó, bao gồm cả Token.
   - Referer: `http://localhost:3000/dashboard?token=SECRET_JWT_TOKEN`

## 💡 Tại sao kịch bản này quan trọng?
Đây là lý do tại sao **không bao giờ** được để Token hoặc dữ liệu nhạy cảm trên URL. Ngoài ra, lập trình viên nên sử dụng chính sách `Referrer-Policy: no-referrer` hoặc `strict-origin-when-cross-origin` để bảo vệ người dùng.

---
**Thực hành:** Chạy `scripts/exploit/leak_listener.py` để làm server hứng.
