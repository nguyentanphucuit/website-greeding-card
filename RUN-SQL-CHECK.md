# Hướng Dẫn Chạy SQL Kiểm Tra Database

## 🎯 Mục đích
Kiểm tra và sửa database policies nếu cần để fix lỗi 401 Unauthorized khi save card.

## 📋 Các bước thực hiện:

### Bước 1: Mở Supabase SQL Editor

Truy cập: **https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/sql**

Hoặc:
1. Vào https://app.supabase.com
2. Chọn project của bạn
3. Click **SQL Editor** ở menu bên trái
4. Click **New Query**

---

### Bước 2: Kiểm Tra Policies (Check)

**Copy toàn bộ nội dung file `check-database-policies.sql`** và paste vào SQL Editor, sau đó click **RUN** (hoặc nhấn Ctrl+Enter).

**Kết quả mong đợi:**

1. **Tables check**: Phải thấy 2 tables: `cards` và `users`
2. **Cards table structure**: Phải có các columns: `id`, `user_id`, `title`, `text`, `background_image`, `initial_request`, etc.
3. **RLS Enabled**: Phải là `true` cho cả `cards` và `users`
4. **Cards policies**: Phải có **ít nhất 4 policies**:
   - "Users can view their own cards" (SELECT)
   - "Users can create their own cards" (INSERT) ⭐ **QUAN TRỌNG**
   - "Users can update their own cards" (UPDATE)
   - "Users can delete their own cards" (DELETE)
5. **Cards Policies Count**: Phải >= 4

---

### Bước 3: Nếu thiếu policies → Chạy Fix

**Nếu kết quả Bước 2 cho thấy:**
- ❌ Cards Policies Count < 4
- ❌ Không thấy policy "Users can create their own cards"
- ❌ RLS Enabled = false

**→ Chạy file `fix-database-policies.sql`:**

1. **Copy toàn bộ nội dung file `fix-database-policies.sql`**
2. Paste vào SQL Editor (tạo query mới)
3. Click **RUN**
4. Bạn sẽ thấy các thông báo success như: `CREATE POLICY`, `ALTER TABLE`, etc.

---

### Bước 4: Verify lại

Chạy lại `check-database-policies.sql` để verify:
- ✅ Cards Policies Count = 4 hoặc 5 (nếu có admin policy)
- ✅ Tất cả policies đã được tạo

---

## 🔍 Troubleshooting

### Lỗi: "permission denied"
→ Bạn cần quyền admin trong Supabase. Đảm bảo bạn đang đăng nhập với account có quyền owner/admin của project.

### Lỗi: "relation already exists"
→ Policies đã tồn tại, không cần lo lắng. File `fix-database-policies.sql` dùng `DROP POLICY IF EXISTS` nên sẽ không bị lỗi.

### Sau khi fix vẫn lỗi 401
→ Lỗi 401 thường là do **authentication**, không phải database policies. Kiểm tra:
1. User đã đăng nhập chưa?
2. Session/cookies có được pass đúng không?
3. Kiểm tra console browser để xem có error gì về auth không?

---

## 📝 Quick Copy Commands

### Check (Copy toàn bộ):

Mở file `check-database-policies.sql` và copy toàn bộ nội dung vào SQL Editor.

### Fix (Copy toàn bộ nếu cần):

Mở file `fix-database-policies.sql` và copy toàn bộ nội dung vào SQL Editor.

---

## ✅ Checklist

- [ ] Đã mở Supabase SQL Editor
- [ ] Đã chạy `check-database-policies.sql`
- [ ] Đã kiểm tra kết quả (Cards Policies Count >= 4)
- [ ] Nếu thiếu, đã chạy `fix-database-policies.sql`
- [ ] Đã verify lại bằng cách chạy check lần nữa
- [ ] Đã test lại app (tạo card và save)

---

## 🚀 Sau khi hoàn tất

1. Test lại app: Tạo một card mới và save
2. Nếu vẫn lỗi 401, kiểm tra authentication flow (cookies, session)
3. Xem console browser và server logs để debug thêm
