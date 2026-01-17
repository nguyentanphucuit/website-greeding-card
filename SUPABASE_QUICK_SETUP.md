# Quick Setup Guide - Supabase Integration

## ✅ What's Done

All code has been updated to use Supabase for:
- 🔐 **Authentication** (already working)
- 💾 **Database** (users + cards tables)
- 🖼️ **Storage** (card images)

## 🚀 Next Steps (Required)

### 1. Setup Supabase Database

Go to: https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/sql

Click **New Query** and paste the entire contents of `supabase-setup.sql`, then click **Run**.

This will create:
- `users` table
- `cards` table  
- RLS policies
- Auto-sync trigger for new users
- Performance indexes

### 2. Setup Supabase Storage

Go to: https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/storage/buckets

**Create Bucket:**
1. Click **New Bucket**
2. Name: `card-images`
3. Public: ✅ **YES**
4. Click **Create**

**Set Policies:**

Go to Storage > card-images > Policies, then add these 4 policies:

```sql
-- 1. Public Read
CREATE POLICY "Public can view card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');

-- 2. Authenticated Upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-images');

-- 3. Update Own Images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Delete Own Images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Test It

```bash
npm run dev
```

Then test:
1. ✅ Sign up at `/auth/signin`
2. ✅ Create a card at `/create`
3. ✅ View cards at `/dashboard`
4. ✅ Edit and delete cards

### 4. Deploy

```bash
git add .
git commit -m "Setup Supabase Database and Storage"
git push
```

Make sure these environment variables are set on Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://kjcniejjhkjbkksbzefl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_LpEpkBPEoYAZqJUr0_2KVg_ZQm1SUkd
```

## 📚 Documentation

- `SUPABASE_MIGRATION_GUIDE.md` - Full migration guide
- `SUPABASE_STORAGE_SETUP.md` - Storage setup details
- `supabase-setup.sql` - Database schema

## 🔧 New Files Created

**Helpers:**
- `lib/supabase-client.ts` - Client with TypeScript types
- `lib/supabase-db.ts` - Database CRUD operations
- `lib/supabase-storage.ts` - Image upload/download

**Updated:**
- `app/api/cards/route.ts` - Now uses Supabase DB
- `app/api/cards/[id]/route.ts` - Now uses Supabase DB
- `app/api/admin/cards/route.ts` - Now uses Supabase DB
- `app/api/auth/sync-user/route.ts` - Now uses Supabase DB
- `app/dashboard/page.tsx` - Updated field names
- `app/admin/page.tsx` - Updated field names

## ⚠️ Important Notes

1. **Field names changed** from camelCase to snake_case:
   - `userId` → `user_id`
   - `fontSize` → `font_size`
   - `backgroundColor` → `background_color`
   - etc. (see SUPABASE_MIGRATION_GUIDE.md for full list)

2. **Data not migrated** - If you have existing cards in the old database, follow the data migration steps in `SUPABASE_MIGRATION_GUIDE.md`

3. **Prisma can be removed** once you verify everything works with Supabase

## ❓ Troubleshooting

**"relation 'users' does not exist"**
→ Run `supabase-setup.sql` in Supabase SQL Editor

**"storage bucket not found"**
→ Create `card-images` bucket in Supabase Storage

**"RLS policy violation"**
→ Make sure you set all 4 storage policies

## 🎉 What You Get

- ✅ No more Prisma client generation
- ✅ Real-time capabilities ready
- ✅ Built-in CDN for images
- ✅ Row Level Security
- ✅ Auto-scaling database
- ✅ Unified Auth + DB + Storage
