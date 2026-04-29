# Scenario 06: Stopwatch Attack (Timing)

## 🎯 Mục tiêu
Xác định xem một Email có tồn tại trong hệ thống hay không bằng cách đo thời gian phản hồi của server (User Enumeration).

## 🛠️ Công cụ
- **Python 3** với thư viện `requests`.
- Một danh sách email cần kiểm tra.

## 🚀 Các bước thực hiện

1. **Nguyên lý:** Khi bạn đăng nhập, server thường làm hai việc:
   - Nếu Email SAI: Trả về lỗi ngay lập tức (~10ms).
   - Nếu Email ĐÚNG: Tiến hành băm mật khẩu (bcrypt) để so sánh. Quá trình băm này tốn rất nhiều CPU (~100ms - 500ms).
2. **Hành động:** Gửi hàng loạt yêu cầu đăng nhập và đo thời gian.
3. **Phân tích:** Những email nào có thời gian phản hồi lâu hơn hẳn chính là những email **có thật** trong DB.

## 💡 Tại sao kịch bản này quan trọng?
Đây là cách các hacker thu thập danh sách người dùng của một hệ thống mà không cần phá khóa. Sau khi có danh sách, họ sẽ tiến hành Brute-force mật khẩu hoặc Phishing nhắm mục tiêu.

---
**Thực hành:** Chạy script `scripts/exploit/attack-auth-timing.py`.
