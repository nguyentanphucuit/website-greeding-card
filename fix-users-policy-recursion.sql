-- Fix infinite recursion in users table RLS policies
-- Run this in Supabase SQL Editor

-- The issue: "Admins can view all users" policy queries users table, causing recursion
-- Solution: Remove the problematic admin policy or simplify it

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Option 1: Allow service role (server-side) to bypass RLS
-- This is already handled by using service role in server-side code
-- But we need to make sure anon/authenticated can still query

-- Option 2: Create a simpler policy that doesn't cause recursion
-- For now, we'll remove admin policy and let admins be checked differently

-- Keep only the basic user policies
-- Users can view their own data (already exists)
-- Users can update their own data (already exists)  
-- Users can insert their own data (already exists)

-- Verify policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Note: Admin check should be done via separate query or function
-- that uses service role or different approach
