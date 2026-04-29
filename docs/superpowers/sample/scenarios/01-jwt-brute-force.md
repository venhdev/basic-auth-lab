# Scenario 01: JWT Secret Heist

## 🎯 Mục tiêu
Tìm ra **Secret Key** (Mã bí mật) mà server dùng để ký JWT. Khi có mã này, bạn có thể tự tạo Token cho bất kỳ người dùng nào (bao gồm cả Admin) mà không cần mật khẩu.

## 🛠️ Công cụ
- **Burp Suite** (để lấy Token).
- **Python 3** (để chạy script brute-force).
- **Wordlist** (danh sách các mật khẩu phổ biến).

## 🚀 Các bước thực hiện

### 1. Lấy Token mục tiêu
- Mở trình duyệt, đăng nhập vào ứng dụng (`localhost:3000/login`).
- Mở DevTools -> Application -> Local Storage.
- Copy giá trị của `accessToken`.

### 2. Chạy script Brute-force
Chúng ta sẽ sử dụng script `scripts/exploit/jwt_cracker.py` để dò tìm Secret Key.

```bash
# Cú pháp
python3 scripts/exploit/jwt_cracker.py <YOUR_TOKEN>
```

### 3. Giả mạo Token (Forgery)
Sử dụng Secret Key tìm được để tạo Token giả danh người dùng bất kỳ (ví dụ: Admin):

```bash
# Cú pháp: python3 scripts/exploit/jwt_forger.py <SECRET> <EMAIL_MUON_GIA_MAO>
python3 scripts/exploit/jwt_forger.py supersecretaccess admin@example.com
```

- **Thực hiện tấn công:**
    1. Copy đoạn Token vừa được tạo ra.
    2. Mở trình duyệt, nhấn **F12** -> **Application** -> **Local Storage**.
    3. Tìm key `auth-storage`, thay thế giá trị của `accessToken` bằng Token giả mạo.
    4. **F5 (Reload)** trang web. Bạn sẽ thấy mình đã đăng nhập thành công với email của Admin.

## 💡 Tại sao kịch bản này quan trọng?
Trong thực tế, nhiều lập trình viên sử dụng các mã bí mật quá ngắn hoặc dễ đoán (như `123456`, `secret`, `admin`). Các cao thủ sử dụng `hashcat` có thể dò tìm hàng tỷ mã mỗi giây.

---
**Kết quả mong đợi:** Script sẽ báo tìm thấy mã bí mật trùng khớp với `JWT_ACCESS_SECRET` trong file `.env` của Backend.
