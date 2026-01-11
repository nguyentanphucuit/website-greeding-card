# Tắt Email Confirmation trong Supabase

## Vấn đề
Khi đăng ký với Supabase Auth, mặc định user phải xác nhận email trước khi có thể đăng nhập. Điều này có thể gây khó khăn cho development và testing.

## Giải pháp: Tắt Email Confirmation

### Cách 1: Tắt trong Supabase Dashboard (Khuyến nghị)

1. **Vào Supabase Dashboard**:
   - Truy cập https://supabase.com/dashboard
   - Chọn project của bạn

2. **Vào Authentication Settings**:
   - Click vào **Authentication** ở sidebar bên trái
   - Click vào **Providers** tab
   - Tìm **Email** provider

3. **Tắt Email Confirmation**:
   - Scroll xuống phần **Email Auth**
   - Tìm option **"Confirm email"** hoặc **"Enable email confirmations"**
   - **Tắt** (uncheck) option này
   - Click **Save**

### Cách 2: Tắt trong Code (Alternative)

Nếu muốn tắt confirmation cho một số users cụ thể, có thể dùng:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    emailRedirectTo: undefined, // Không redirect sau khi confirm
    // Hoặc disable confirmation cho user này
  }
})
```

**Lưu ý**: Cách này không hoàn toàn tắt confirmation, chỉ thay đổi behavior.

## Sau khi tắt Email Confirmation

- User có thể đăng ký và đăng nhập ngay lập tức
- Không cần check email để xác nhận
- Phù hợp cho development và testing
- **Cảnh báo**: Không nên tắt trong production nếu cần bảo mật cao

## Kiểm tra Settings hiện tại

1. Vào **Authentication** → **Providers** → **Email**
2. Xem trạng thái của **"Confirm email"**
3. Nếu đang **ON** → Tắt đi
4. Nếu đang **OFF** → Đã OK, không cần làm gì

## Troubleshooting

Nếu vẫn gặp lỗi "Email not confirmed":
- Kiểm tra lại settings trong Dashboard
- Đảm bảo đã save changes
- Thử đăng ký lại với email mới
- Clear browser cache và cookies


