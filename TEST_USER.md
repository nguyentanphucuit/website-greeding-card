# Test User Credentials

## 🔐 Login thử nghiệm

**Email:** `testuser@test.com`  
**Password:** `test123456`

## 🚀 Cách sử dụng

### Cách 1: Quick Login Button (Nhanh nhất)
1. Truy cập: http://localhost:3000/auth/signin
2. Click nút **"🚀 Quick Login (Test User)"**
3. Tự động đăng nhập và chuyển đến Dashboard

### Cách 2: Đăng nhập thủ công
1. Truy cập: http://localhost:3000/auth/signin
2. Nhập:
   - Email: `testuser@test.com`
   - Password: `test123456`
3. Click **Sign In**

## ⚠️ Lưu ý

**Test user phải được tạo trước khi sử dụng:**

### Tạo test user qua Supabase Dashboard:

1. Vào: https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Nhập:
   - Email: `testuser@test.com`
   - Password: `test123456`
   - ✅ Auto Confirm User: **YES**
4. Click **"Create user"**

### Hoặc tạo qua Sign Up:

1. Truy cập: http://localhost:3000/auth/signin
2. Click **"Sign Up"**
3. Nhập:
   - Name: Test User
   - Email: `testuser@test.com`
   - Password: `test123456`
4. Click **Sign Up**

## 📝 Test Scenarios

Sau khi đăng nhập, bạn có thể test:

✅ **Dashboard** - Xem cards đã tạo
✅ **Create Card** - Tạo card mới với AI
✅ **Edit Card** - Chỉnh sửa card (text, font, background)
✅ **Delete Card** - Xóa card
✅ **Export Card** - Download card as PNG

## 🔧 Nếu gặp lỗi

**"Invalid login credentials"**
→ Test user chưa được tạo trong Supabase. Tạo user theo hướng dẫn trên.

**"Email not confirmed"**
→ Khi tạo user trong Supabase Dashboard, nhớ tick ✅ "Auto Confirm User"

**"User already registered"**
→ User đã tồn tại, chỉ cần đăng nhập bình thường.

## 🎯 Mục đích

Test user dùng để:
- Demo cho khách hàng
- Test chức năng không cần tạo account mới
- Development và debugging
