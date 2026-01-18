-- Fix Storage RLS policies for server-side uploads (no auth.uid())
-- Run this in Supabase SQL Editor

-- Go to: Storage > card-images > Policies

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create policies that allow server-side operations
-- Since server-side code validates userId before upload, we can allow all operations

-- Policy 1: Public Read (keep this)
-- Already exists: "Public can view card images"

-- Policy 2: Allow all INSERT (server-side validates userId)
CREATE POLICY "Allow server-side uploads"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'card-images');

-- Policy 3: Allow all UPDATE (server-side validates ownership)
CREATE POLICY "Allow server-side updates"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'card-images');

-- Policy 4: Allow all DELETE (server-side validates ownership)
CREATE POLICY "Allow server-side deletion"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'card-images');

-- Verify policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%card%'
ORDER BY policyname;
