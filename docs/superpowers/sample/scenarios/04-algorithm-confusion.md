# Scenario 04: JWT Algorithm Confusion

## 🎯 Mục tiêu
Đánh lừa server chấp nhận một Token được ký bằng thuật toán **HS256** (đối xứng) thay vì **RS256** (bất đối xứng).

## 🛠️ Công cụ
- **Python 3** với thư viện `PyJWT`.
- **Public Key** của server (thường có thể lấy được công khai).

## 🚀 Các bước thực hiện

1. **Thu thập Public Key:** Nếu server dùng RS256, họ sẽ công khai Public Key (thường qua endpoint `.well-known/jwks.json`).
2. **Thay đổi Header:** Sửa `alg: RS256` thành `alg: HS256`.
3. **Ký lại Token:** Sử dụng chính **Public Key** đó làm **Secret Key** để ký Token bằng thuật toán HS256.
4. **Gửi Token:** Nhiều server lỗi sẽ lấy Public Key (mà họ nghĩ là mã bí mật HS256) để xác thực chữ ký và cho phép bạn truy cập.

## 💡 Tại sao kịch bản này quan trọng?
Đây là một lỗ hổng logic kinh điển trong các thư viện JWT cũ. Nó cho phép hacker chiếm quyền bất kỳ tài khoản nào nếu biết được Public Key của hệ thống.

---
---
**Thực hành:** Sử dụng script `scripts/exploit/attack-jwt-algorithm-confusion.py`.
