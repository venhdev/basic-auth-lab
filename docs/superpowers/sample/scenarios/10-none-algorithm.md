# Scenario 10: JWT None Algorithm (Signature Bypass)

## 🎯 Mục tiêu
Đăng nhập với quyền bất kỳ bằng cách ép server chấp nhận một Token không có chữ ký (unsigned).

## 🛠️ Công cụ
- Editor JWT (Ví dụ: `jwt.io` hoặc script Python).
- Burp Suite để sửa request.

## 🚀 Các bước thực hiện

1. **Lấy Token hợp lệ:** Đăng nhập và lấy JWT.
2. **Thao túng Header:** Thay đổi phần Header của JWT thành:
   ```json
   {
     "alg": "none",
     "typ": "JWT"
   }
   ```
3. **Thao túng Payload:** Đổi `sub` thành ID của admin hoặc người dùng khác.
4. **Loại bỏ Chữ ký:** Ghép Header và Payload (đã encode base64url), nối bằng dấu chấm `.`, nhưng **bỏ trống** phần thứ 3 (Signature). Đừng quên dấu chấm cuối cùng!
   `Header.Payload.`
5. **Gửi Token:** Sử dụng Token này trong request. Nếu server cấu hình lỗi, nó sẽ bỏ qua bước xác thực và tin tưởng Payload của bạn.

## 💡 Tại sao kịch bản này quan trọng?
Đây từng là một trong những lỗ hổng nghiêm trọng nhất của JWT. Mặc dù các thư viện hiện đại đã mặc định chặn `alg: none`, nhưng trong các hệ thống cũ hoặc tự triển khai, lỗ hổng này vẫn thỉnh thoảng xuất hiện.

---
**Thực hành:** Sử dụng script `scripts/exploit/attack-jwt-none-alg.py` để sinh token nhanh chóng.
