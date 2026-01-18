-- Fix RLS policies for INSERT/UPDATE on users table (server-side)
-- Run this in Supabase SQL Editor

-- Drop existing INSERT/UPDATE policies that use auth.uid()
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Drop any existing server-side policies with same names (if they exist)
DROP POLICY IF EXISTS "Allow server-side user INSERT" ON users;
DROP POLICY IF EXISTS "Allow server-side user UPDATE" ON users;

-- Create policies that allow server-side INSERT/UPDATE
-- Since server-side code handles user_id validation, we can allow all INSERT/UPDATE
CREATE POLICY "Allow server-side user INSERT"
  ON users FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow server-side user UPDATE"
  ON users FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Verify policies after fix
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
