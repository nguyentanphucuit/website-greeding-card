# Debug Deployment Issues

## Lỗi "Internal server error" khi deploy

### Checklist Environment Variables trong Vercel:

1. **DATABASE_URL** (REQUIRED)
   ```
   postgresql://postgres.svrofulpfpikfwupzjbt:9S4t45vGF%2ANqvdb@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **DIRECT_URL** (REQUIRED for migrations)
   ```
   postgresql://postgres.svrofulpfpikfwupzjbt:9S4t45vGF%2ANqvdb@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
   ```

3. **AUTH_SECRET** (REQUIRED)
   - Generate mới cho production: `openssl rand -base64 32`
   - KHÔNG dùng secret từ local

4. **AUTH_URL** (REQUIRED)
   - Set thành URL của Vercel deployment: `https://your-app.vercel.app`

5. **GEMINI_API_KEY** (REQUIRED)
   - API key từ Google Gemini

6. **NEXT_PUBLIC_SUPABASE_URL** (REQUIRED)
   ```
   https://svrofulpfpikfwupzjbt.supabase.co
   ```

7. **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY** (REQUIRED)
   ```
   sb_publishable_SVQcm6Q3-a7XpPMO9bnbCg_FwmL-DYo
   ```

### Cách kiểm tra lỗi trong Vercel:

1. **Vào Vercel Dashboard** → Your Project → Deployments
2. **Click vào latest deployment**
3. **Xem "Functions" tab** → Click vào function bị lỗi (ví dụ: `/api/auth/register`)
4. **Xem logs** để biết lỗi cụ thể:
   - "DATABASE_URL is not set" → Thiếu DATABASE_URL
   - "Can't reach database server" → Database connection issue
   - "Table does not exist" → Chưa chạy migration
   - "Prisma Client not generated" → Build issue

### Các bước fix:

#### 1. Kiểm tra Environment Variables
- Vào Vercel → Settings → Environment Variables
- Đảm bảo TẤT CẢ variables đã được set
- Check cả Production, Preview, và Development environments

#### 2. Chạy Migration trong Production
```bash
# Set DATABASE_URL trong terminal
export DATABASE_URL="your-connection-string"

# Chạy migration
npx prisma migrate deploy
```

Hoặc trong Vercel, thêm build command:
```bash
npx prisma migrate deploy && npm run build
```

#### 3. Kiểm tra Database Connection
- Vào Supabase Dashboard → Settings → Database
- Kiểm tra database đang Active
- Test connection string

#### 4. Rebuild và Redeploy
- Sau khi set environment variables
- Trigger redeploy trong Vercel
- Xem build logs để đảm bảo Prisma client được generate

### Common Issues:

1. **"DATABASE_URL is not set"**
   - Solution: Set DATABASE_URL trong Vercel environment variables

2. **"Can't reach database server"**
   - Solution: Check connection string, password, và Supabase project status

3. **"Table does not exist"**
   - Solution: Chạy `npx prisma migrate deploy` hoặc `npx prisma db push`

4. **"Prisma Client not generated"**
   - Solution: Build command đã có `prisma generate` trong package.json

5. **"Internal server error" khi đăng nhập nhanh**
   - Check Vercel logs để xem lỗi cụ thể
   - Có thể do database connection hoặc missing environment variables


