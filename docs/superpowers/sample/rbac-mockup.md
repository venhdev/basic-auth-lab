# 🎨 RBAC SYSTEM MOCKUP

## 1. Giao diện người dùng (Frontend Mockup)
Sau khi nâng cấp, giao diện sẽ hiển thị rõ quyền hạn của User:

```text
+-----------------------------------------------------------+
|  Products Lab                                  [Sign Out] |
|                                                           |
|  [● lab@test.com] [Role: ADMIN] [ID: c3312f01...]         |
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------+   +-------------------------+  |
|  | Product 1             |   | Product 2               |  |
|  | Price: $100           |   | Price: $200             |  |
|  | [Verified with JWT]   |   | [Verified with JWT]     |  |
|  +-----------------------+   +-------------------------+  |
|                                                           |
+-----------------------------------------------------------+
```

## 2. Kiến trúc Bảo mật (Security Architecture)

### Lớp bảo vệ kép:
1. **Lớp 1 (Identity):** `JwtAuthGuard` - "Bạn là ai?" (Who are you?)
2. **Lớp 2 (Permission):** `RolesGuard` - "Bạn được làm gì?" (What can you do?)

### Code Snippet dự kiến:
```typescript
@Controller('products')
export class ProductsController {
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Bảo vệ kép
  @Roles('admin')                      // <-- Chỉ Admin mới được vào
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
}
```

## 3. Kịch bản Lab 05: Leo thang đặc quyền
1. User đăng nhập với quyền `user` mặc định.
2. User lấy được Public Key của Server.
3. User dùng lỗi **Algorithm Confusion** để tự tạo Token mới với `role: admin`.
4. User dùng Token giả mạo truy cập vào API Admin thành công.
