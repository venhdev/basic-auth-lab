# Scenario 03: OAuth Shadow (Code Interception)

## 🎯 Mục tiêu
Đánh chặn mã xác thực (**Authorization Code**) của người dùng để đăng nhập trái phép vào tài khoản của họ.

## 🛠️ Công cụ
- Burp Suite Interceptor.
- Python Mock Callback Server.

## 🚀 Các bước thực hiện

1. **Can thiệp Redirect:** Khi người dùng nhấn "Login with Google", hacker dùng Burp Suite để sửa đổi tham số `redirect_uri` thành một domain do hacker kiểm soát (ví dụ: `http://hacker-server.com/callback`).
2. **Chờ đợi:** Google sẽ gửi Authorization Code của nạn nhân về server của hacker thay vì server thật.
3. **Trao đổi Token:** Hacker dùng Code đó (kết hợp với `client_id` và `client_secret` nếu thu thập được) để đổi lấy Access Token của nạn nhân.
4. **Tại sao PKCE giúp ích?** Nếu có PKCE, hacker dù có `Code` cũng không thể đổi được Token vì không có `code_verifier` tương ứng với `code_challenge` ban đầu.

## 💡 Tại sao kịch bản này quan trọng?
Nó cho thấy tại sao các OAuth Provider (như Google, Facebook) luôn bắt buộc bạn phải đăng ký danh sách các Redirect URIs hợp lệ (Whitelist).

---
**Thực hành:** Sử dụng `scripts/exploit/oauth_mock_server.py`.
