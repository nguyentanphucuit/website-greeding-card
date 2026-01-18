# Deployment Guide

## Environment Variables Required for Deployment

Khi deploy lên Vercel hoặc platform khác, bạn **PHẢI** set các environment variables sau:

### Required Variables:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.svrofulpfpikfwupzjbt:[password]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.svrofulpfpikfwupzjbt:[password]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Authentication
AUTH_SECRET="your-secret-key-here"  # REQUIRED - Generate with: openssl rand -base64 32
AUTH_URL="https://your-domain.com"  # Your production URL

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"  # REQUIRED for AI card generation

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://svrofulpfpikfwupzjbt.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_SVQcm6Q3-a7XpPMO9bnbCg_FwmL-DYo"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Access
NEXT_ADMIN_ID="admin@gmail.com"  # Email of admin user who can access /admin page
```

## Vercel Deployment

### Step 1: Push code to GitHub
```bash
git push origin main
```

### Step 2: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository

### Step 3: Configure Environment Variables
1. In Vercel project settings, go to **Environment Variables**
2. Add **ALL** the variables listed above
3. Make sure to:
   - Replace `[password]` with actual Supabase password
   - Set `AUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Generate a new `AUTH_SECRET` for production

### Step 4: Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 5: Deploy
Click "Deploy" and wait for build to complete.

## Common Deployment Errors

### 1. "Internal server error" - Missing AUTH_SECRET
**Solution**: Set `AUTH_SECRET` environment variable in Vercel dashboard.

### 2. "Internal server error" - Database connection failed
**Solution**: 
- Check `DATABASE_URL` and `DIRECT_URL` are set correctly
- Verify Supabase database is active
- Check password is correct (URL encoded if contains special characters)

### 3. "Internal server error" - Prisma client not generated
**Solution**: Vercel should auto-generate Prisma client during build. If not, add build command:
```bash
npx prisma generate && npm run build
```

### 4. "Internal server error" - Missing GEMINI_API_KEY
**Solution**: Set `GEMINI_API_KEY` in environment variables.

## Post-Deployment Checklist

- [ ] All environment variables are set (check all 7 required variables)
- [ ] DATABASE_URL và DIRECT_URL đã được set đúng
- [ ] AUTH_SECRET đã được generate mới (không dùng secret từ local)
- [ ] AUTH_URL đã set thành production URL
- [ ] Database connection is working (check Vercel logs)
- [ ] Database tables exist (run `npx prisma migrate deploy` if needed)
- [ ] Authentication is working (test sign in)
- [ ] Quick login is working (test đăng nhập nhanh)
- [ ] AI card generation is working (test create card)

## Fix "Internal server error" khi deploy

Nếu gặp lỗi "Internal server error" sau khi deploy:

1. **Kiểm tra Vercel Logs**:
   - Vercel Dashboard → Project → Deployments → Latest → Functions
   - Xem error logs để biết lỗi cụ thể

2. **Kiểm tra Environment Variables**:
   - Đảm bảo TẤT CẢ 7 variables đã được set
   - Check cả Production, Preview environments

3. **Chạy Migration**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Xem file DEBUG_DEPLOYMENT.md** để biết chi tiết cách debug

## Troubleshooting

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check "Functions" tab for error logs
4. Check "Build Logs" for build errors

### Test Database Connection
```bash
npx prisma db push
```

### Verify Environment Variables
In Vercel, check that all variables are set and have correct values (no typos, no missing quotes).

## Production Database Setup

Before deploying:
1. Make sure Supabase database is active
2. Run migrations: `npx prisma migrate deploy` (for production)
3. Or push schema: `npx prisma db push` (for development/testing)

