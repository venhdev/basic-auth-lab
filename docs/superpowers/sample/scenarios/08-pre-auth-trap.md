# Scenario 08: Pre-Auth Trap (Session Fixation)

## 🎯 Mục tiêu
Ép nạn nhân sử dụng một Session ID mà bạn đã biết trước, từ đó chiếm quyền điều khiển tài khoản của họ ngay khi họ đăng nhập.

## 🛠️ Công cụ
- `curl` hoặc Postman.
- Burp Suite để quan sát Header `Set-Cookie`.

## 🚀 Các bước thực hiện

1. **Lấy Session ID "mồi":** Truy cập trang login của server nhưng **đừng** đăng nhập. Server sẽ cấp cho bạn một Session ID (qua Cookie hoặc URL). Hãy ghi lại ID này.
2. **Gửi link bẫy cho nạn nhân:** Gửi cho nạn nhân một link dẫn đến trang login có kèm theo ID đó (Nếu app chấp nhận ID qua URL) hoặc dùng XSS để set cookie cho nạn nhân.
   - Ví dụ: `http://localhost:3000/login?session_id=HACKER_SESSION_ID`
3. **Chờ nạn nhân đăng nhập:** Khi nạn nhân nhập user/pass và nhấn Login, nếu server không đổi Session ID mới, thì cái ID `HACKER_SESSION_ID` hiện đã trở thành ID có quyền hạn của nạn nhân.
4. **Chiếm quyền:** Bạn chỉ cần dùng ID đó để truy cập vào các trang bảo mật.

## 💡 Tại sao kịch bản này quan trọng?
Lỗi này xảy ra khi lập trình viên quên gọi hàm `session.regenerate()` hoặc tương tự sau khi xác thực thành công. Đây là lý do tại sao mọi ứng dụng bảo mật đều phải cấp một ID hoàn toàn mới sau khi người dùng đăng nhập.

---
**Thực hành:** Sử dụng script `scripts/exploit/session_fixation.sh` để mô phỏng.
