# Supabase PostgreSQL Setup Guide

## Bước 1: Lấy Database Connection String từ Supabase

Có 2 cách:

### Cách 1: Dùng Connection Pooling (Khuyến nghị - không cần password riêng)
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** → **Database**
4. Tìm phần **Connection string**
5. Chọn tab **Connection pooling** → **Session mode**
6. Copy connection string (đã có password trong string)

### Cách 2: Dùng Direct Connection (cần database password)
1. Vào **Settings** → **Database**
2. Tìm "Database password" hoặc reset password nếu chưa có
3. Copy connection string từ tab **URI**

### Format connection string (Connection Pooling - Khuyến nghị):
```
postgresql://postgres.svrofulpfpikfwupzjbt:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Lưu ý: Password trong connection pooling string là password bạn đã set khi tạo project hoặc reset password.

## Bước 2: Update .env file

### Option A: Dùng Connection Pooling (Khuyến nghị)
Copy connection string từ Supabase Dashboard (Connection pooling tab) và paste vào DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres.svrofulpfpikfwupzjbt:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

### Option B: Dùng Direct Connection
Nếu dùng direct connection, cần database password:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.svrofulpfpikfwupzjbt.supabase.co:5432/postgres"
```

**Lưu ý**: Connection pooling tốt hơn cho production vì có connection pooling và tốt hơn về performance.

## Bước 3: Chạy Migration

Sau khi đã update DATABASE_URL, chạy các lệnh sau:

```bash
# Generate Prisma client với PostgreSQL
npx prisma generate

# Tạo migration và apply vào Supabase database
npx prisma migrate dev --name init_postgresql

# Hoặc nếu database đã có schema, chỉ push schema
npx prisma db push
```

## Bước 4: Verify Connection

Test connection bằng cách:

```bash
npx prisma studio
```

Hoặc chạy app và thử đăng nhập/đăng ký.

## Lưu ý:

- **Password**: Lấy từ Supabase Dashboard → Settings → Database → Database password
- **Connection Pooling**: Nên dùng connection pooling cho production để tối ưu performance
- **SSL**: Supabase yêu cầu SSL connection, Prisma sẽ tự động handle

## Troubleshooting:

Nếu gặp lỗi connection:
1. Kiểm tra password đúng chưa
2. Kiểm tra project URL đúng chưa
3. Kiểm tra firewall/network có block connection không
4. Thử dùng connection pooling thay vì direct connection

