-- Fix infinite recursion and RLS for users table (server-side queries)
-- Since we're not using auth anymore, we can simplify RLS policies

-- Drop problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Since server-side code queries by userId directly (no auth.uid()),
-- we have a few options:

-- Option 1: Disable RLS for users table (simplest for server-side)
-- Only do this if you're comfortable with no RLS on users table
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that allows all SELECT (for server-side queries)
-- This works if you trust your server-side code
-- DROP POLICY IF EXISTS "Allow server-side user queries" ON users;
-- CREATE POLICY "Allow server-side user queries"
--   ON users FOR SELECT
--   TO authenticated, anon
--   USING (true);

-- Option 3: Keep minimal RLS but remove recursive policy
-- Keep only basic policies for user's own data
-- (Policies already exist, just removed the problematic admin one)

-- For now, let's use Option 2 (allow all SELECT) since server-side queries need it
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Allow user queries" 
  ON users FOR SELECT
  TO authenticated, anon
  USING (true);

-- Verify policies after fix
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
