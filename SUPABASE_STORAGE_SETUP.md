# Supabase Storage Setup Guide

## 1. Create Storage Bucket

Go to your Supabase Dashboard: https://kjcniejjhkjbkksbzefl.supabase.co

### Storage > Create Bucket
1. Click on **Storage** in left sidebar
2. Click **New Bucket**
3. Bucket name: `card-images`
4. **Public bucket**: ✅ YES (so images can be viewed publicly)
5. Click **Create Bucket**

## 2. Set Storage Policies

Go to Storage > card-images > Policies

### Policy 1: Public Read Access
```sql
CREATE POLICY "Public can view card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');
```

### Policy 2: Authenticated Users Can Upload
```sql
CREATE POLICY "Authenticated users can upload card images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-images');
```

### Policy 3: Users Can Update Their Own Images
```sql
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Policy 4: Users Can Delete Their Own Images
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 3. Bucket Structure
Images will be organized by user ID:
```
card-images/
  ├── {user_id}/
  │   ├── {card_id}_background.jpg
  │   ├── {card_id}_export.png
  │   └── ...
```

## 4. Environment Variables
Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://kjcniejjhkjbkksbzefl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_LpEpkBPEoYAZqJUr0_2KVg_ZQm1SUkd
```

## 5. Run Database Setup
Run the SQL in `supabase-setup.sql` in your Supabase SQL Editor:
https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/sql

This will:
- Create `users` and `cards` tables
- Setup Row Level Security (RLS)
- Auto-sync auth users to users table
- Create indexes for performance
