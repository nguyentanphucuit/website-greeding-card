-- Add admin policy to view all users
-- Run this in your Supabase SQL Editor

-- Option 1: Drop and recreate (safe if you want to update existing policy)
DROP POLICY IF EXISTS "Admins can view all users" ON users;

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
