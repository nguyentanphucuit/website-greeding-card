-- ============================================================================
-- FIX ALL RLS — chạy 1 lần trong Supabase SQL Editor
-- ============================================================================
-- Lý do: code server dùng anon key và KHÔNG có auth.uid() (truyền userId trực
-- tiếp trong request). Các policy mặc định từ supabase-setup.sql đòi
-- auth.uid() nên chặn hết → API báo 404 "User not found" / không lưu được thẻ.
-- File này mở quyền cho server (authenticated + anon) đọc/ghi đúng các bảng.
-- ============================================================================

-- ---------- USERS: SELECT ----------
DROP POLICY IF EXISTS "Admins can view all users" ON users;        -- bỏ policy gây đệ quy
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Allow user queries" ON users;
CREATE POLICY "Allow user queries"
  ON users FOR SELECT
  TO authenticated, anon
  USING (true);

-- ---------- USERS: INSERT / UPDATE ----------
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow server-side user INSERT" ON users;
DROP POLICY IF EXISTS "Allow server-side user UPDATE" ON users;
CREATE POLICY "Allow server-side user INSERT"
  ON users FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
CREATE POLICY "Allow server-side user UPDATE"
  ON users FOR UPDATE
  TO authenticated, anon
  USING (true);

-- ---------- CARDS: SELECT / INSERT / UPDATE / DELETE ----------
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
DROP POLICY IF EXISTS "Users can create their own cards" ON cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON cards;
DROP POLICY IF EXISTS "Admins can view all cards" ON cards;
DROP POLICY IF EXISTS "Allow card queries" ON cards;
DROP POLICY IF EXISTS "Allow card creation" ON cards;
DROP POLICY IF EXISTS "Allow card updates" ON cards;
DROP POLICY IF EXISTS "Allow card deletion" ON cards;
CREATE POLICY "Allow card queries"
  ON cards FOR SELECT  TO authenticated, anon USING (true);
CREATE POLICY "Allow card creation"
  ON cards FOR INSERT  TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Allow card updates"
  ON cards FOR UPDATE  TO authenticated, anon USING (true);
CREATE POLICY "Allow card deletion"
  ON cards FOR DELETE  TO authenticated, anon USING (true);

-- ---------- STORAGE: bucket card-images (INSERT / UPDATE / DELETE) ----------
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow server-side uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow server-side updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow server-side deletion" ON storage.objects;
CREATE POLICY "Allow server-side uploads"
  ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK (bucket_id = 'card-images');
CREATE POLICY "Allow server-side updates"
  ON storage.objects FOR UPDATE TO authenticated, anon USING (bucket_id = 'card-images');
CREATE POLICY "Allow server-side deletion"
  ON storage.objects FOR DELETE TO authenticated, anon USING (bucket_id = 'card-images');

-- ---------- Kiểm tra kết quả ----------
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'cards')
   OR (schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%server-side%')
ORDER BY tablename, policyname;
