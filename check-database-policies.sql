-- Check Database Schema and RLS Policies
-- Run this in Supabase SQL Editor to verify setup

-- 1. Check if tables exist
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'cards')
ORDER BY table_name;

-- 2. Check cards table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cards'
ORDER BY ordinal_position;

-- 3. Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'cards');

-- 4. Check existing RLS policies for cards table
SELECT 
  policyname,
  cmd as "Command",
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'cards'
ORDER BY policyname;

-- 5. Check existing RLS policies for users table
SELECT 
  policyname,
  cmd as "Command",
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- 6. Verify required policies exist (should return 4 rows for cards)
SELECT 
  COUNT(*) as "Cards Policies Count"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'cards'
  AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');

-- Expected: 4 policies
-- 1. Users can view their own cards (SELECT)
-- 2. Users can create their own cards (INSERT)
-- 3. Users can update their own cards (UPDATE)
-- 4. Users can delete their own cards (DELETE)
-- 5. Admins can view all cards (SELECT) - optional
