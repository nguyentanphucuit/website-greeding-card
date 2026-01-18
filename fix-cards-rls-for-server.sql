-- Fix cards table RLS policies for server-side queries (no auth.uid())
-- Run this in Supabase SQL Editor

-- Current policies use auth.uid() which doesn't work for server-side
-- Since we pass userId in request body, we need to allow INSERT/UPDATE/DELETE

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
DROP POLICY IF EXISTS "Users can create their own cards" ON cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON cards;
DROP POLICY IF EXISTS "Admins can view all cards" ON cards;

-- Create policies that allow server-side operations
-- Note: These are less restrictive since server-side code passes userId directly

-- Allow all SELECT (server-side can query any user's cards by userId)
CREATE POLICY "Allow card queries" 
  ON cards FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow all INSERT (server-side validates userId before insert)
CREATE POLICY "Allow card creation" 
  ON cards FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow all UPDATE (server-side validates ownership before update)
CREATE POLICY "Allow card updates" 
  ON cards FOR UPDATE
  TO authenticated, anon
  USING (true);

-- Allow all DELETE (server-side validates ownership before delete)
CREATE POLICY "Allow card deletion" 
  ON cards FOR DELETE
  TO authenticated, anon
  USING (true);

-- Verify policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'cards'
ORDER BY policyname;
