# Migration Guide: From Prisma + PostgreSQL to Supabase

This guide will help you migrate your greeting card application from Prisma to Supabase completely.

## Overview

The application now uses:
- **Supabase Auth** for authentication (already migrated)
- **Supabase Database** for storing users and cards
- **Supabase Storage** for storing card images
- **Supabase RLS** for row-level security

## Prerequisites

1. Supabase project created: `https://kjcniejjhkjbkksbzefl.supabase.co`
2. Environment variables set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://kjcniejjhkjbkksbzefl.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_LpEpkBPEoYAZqJUr0_2KVg_ZQm1SUkd
   ```

## Step 1: Setup Supabase Database

### 1.1 Run Database Schema

Go to Supabase SQL Editor: https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/sql

Copy and run the SQL from `supabase-setup.sql`:

```sql
-- This will create:
-- ✅ users table (extends auth.users)
-- ✅ cards table
-- ✅ RLS policies for security
-- ✅ Auto-sync trigger for new users
-- ✅ Indexes for performance
```

### 1.2 Verify Tables Created

Go to Database > Tables and confirm you see:
- `users` table
- `cards` table

## Step 2: Setup Supabase Storage

### 2.1 Create Storage Bucket

1. Go to Storage: https://kjcniejjhkjbkksbzefl.supabase.co/project/kjcniejjhkjbkksbzefl/storage/buckets
2. Click **New Bucket**
3. Name: `card-images`
4. **Public bucket**: ✅ YES
5. Click **Create**

### 2.2 Set Storage Policies

Go to Storage > card-images > Policies

**Policy 1: Public Read**
```sql
CREATE POLICY "Public can view card images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload card images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-images');
```

**Policy 3: Users Update Own Images**
```sql
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 4: Users Delete Own Images**
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Migrate Data from Prisma

### 3.1 Export Existing Data (Optional)

If you have existing data in Prisma/PostgreSQL:

```typescript
// export-data.ts
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"

const prisma = new PrismaClient()

async function exportData() {
  const users = await prisma.user.findMany()
  const cards = await prisma.card.findMany()

  fs.writeFileSync("users-export.json", JSON.stringify(users, null, 2))
  fs.writeFileSync("cards-export.json", JSON.stringify(cards, null, 2))

  console.log(`Exported ${users.length} users and ${cards.length} cards`)
}

exportData()
```

### 3.2 Import Data to Supabase

```typescript
// import-data.ts
import { supabase } from "./lib/supabase-client"
import * as usersData from "./users-export.json"
import * as cardsData from "./cards-export.json"

async function importData() {
  // Import users
  for (const user of usersData) {
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan || "free",
      role: "user",
    })
  }

  // Import cards
  for (const card of cardsData) {
    await supabase.from("cards").insert({
      id: card.id,
      user_id: card.userId,
      title: card.title,
      text: card.text,
      font_size: card.fontSize || 24,
      font_family: card.fontFamily || "Arial",
      font_style: card.fontStyle || "normal",
      background_color: card.backgroundColor || "#ffffff",
      background_image: card.backgroundImage || null,
      text_color: "#000000",
      text_container_background: "rgba(255, 255, 255, 0.8)",
      text_container_opacity: 0.8,
      initial_request: null,
    })
  }

  console.log("Import completed!")
}

importData()
```

## Step 4: Update Application Code

All code has been updated:

### 4.1 New Helper Files
- ✅ `lib/supabase-client.ts` - Client-side Supabase client with types
- ✅ `lib/supabase-db.ts` - Database helpers (CRUD operations)
- ✅ `lib/supabase-storage.ts` - Storage helpers (upload/download images)

### 4.2 Updated API Routes
- ✅ `app/api/cards/route.ts` - Uses Supabase DB
- ✅ `app/api/cards/[id]/route.ts` - Uses Supabase DB
- ✅ `app/api/admin/cards/route.ts` - Uses Supabase DB with admin check
- ✅ `app/api/auth/sync-user/route.ts` - Uses Supabase DB

### 4.3 Updated Pages
- ✅ `app/dashboard/page.tsx` - Updated field names (snake_case)
- ✅ `app/admin/page.tsx` - Updated field names (snake_case)

## Step 5: Remove Prisma (Optional)

Once you've verified everything works with Supabase:

### 5.1 Remove Prisma Files
```bash
rm -rf prisma/
rm prisma/schema.prisma
rm prisma/seed.ts
```

### 5.2 Uninstall Prisma
```bash
npm uninstall prisma @prisma/client
```

### 5.3 Remove Prisma Scripts
Edit `package.json` and remove:
```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

### 5.4 Delete Prisma Files
```bash
rm lib/prisma.ts
```

## Step 6: Test the Migration

### 6.1 Test Authentication
1. Go to `/auth/signin`
2. Sign up with a new account
3. Verify user appears in Supabase Dashboard > Authentication

### 6.2 Test Card Creation
1. Go to `/create`
2. Create a new card
3. Verify card appears in Supabase Dashboard > Database > cards table

### 6.3 Test Card Editing
1. Go to `/dashboard`
2. Edit an existing card
3. Verify changes saved in Supabase

### 6.4 Test Image Upload (when implemented)
1. Upload a custom background image
2. Verify image appears in Supabase Storage > card-images bucket

### 6.5 Test Admin Panel
1. Manually set a user's role to "admin" in Supabase Dashboard
2. Go to `/admin`
3. Verify you can see all cards

## Step 7: Deploy

### 7.1 Update Environment Variables on Vercel

Add these to your Vercel project:
```
NEXT_PUBLIC_SUPABASE_URL=https://kjcniejjhkjbkksbzefl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_LpEpkBPEoYAZqJUr0_2KVg_ZQm1SUkd
```

### 7.2 Remove Old Database URL

You can remove the old Prisma DATABASE_URL if you're no longer using it.

### 7.3 Deploy

```bash
git add .
git commit -m "Migrate to Supabase Database and Storage"
git push
```

## Benefits of Supabase

✅ **No more Prisma client generation** - Simpler build process
✅ **Real-time subscriptions** - Can add live updates in the future
✅ **Built-in storage** - No need for separate S3/Cloudinary
✅ **Row Level Security** - Better security with RLS policies
✅ **Auto-scaling** - Supabase handles scaling automatically
✅ **Better performance** - Optimized PostgreSQL with connection pooling
✅ **Unified platform** - Auth + Database + Storage in one place

## Field Name Changes

Old (Prisma camelCase) → New (Supabase snake_case):

| Old Field Name | New Field Name |
|---------------|----------------|
| `userId` | `user_id` |
| `fontSize` | `font_size` |
| `fontFamily` | `font_family` |
| `fontStyle` | `font_style` |
| `backgroundColor` | `background_color` |
| `backgroundImage` | `background_image` |
| `textColor` | `text_color` |
| `textContainerBackground` | `text_container_background` |
| `textContainerOpacity` | `text_container_opacity` |
| `initialRequest` | `initial_request` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

## Troubleshooting

### Issue: "relation 'users' does not exist"
**Solution**: Make sure you ran the SQL from `supabase-setup.sql` in Supabase SQL Editor.

### Issue: "storage bucket not found"
**Solution**: Create the `card-images` bucket in Supabase Storage.

### Issue: "RLS policy violation"
**Solution**: Check that RLS policies are set correctly. Users must be authenticated to access their data.

### Issue: "Cannot read properties of null"
**Solution**: Make sure environment variables are set correctly in `.env.local`.

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Dashboard: https://kjcniejjhkjbkksbzefl.supabase.co
