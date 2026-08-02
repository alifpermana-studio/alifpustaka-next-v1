# Installation Guide

Complete installation instructions for Alif Pustaka CMS.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 10.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Database** (local, Supabase, or VPS)

### Check Your Versions

```bash
node --version    # Should be v20.0.0 or higher
npm --version     # Should be 10.0.0 or higher
git --version     # Any recent version
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/alifpustaka-next-v1.git
cd alifpustaka-next-v1
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16.2.9
- React 19.2.4
- Prisma ORM
- Better Auth
- Tailwind CSS v4
- 40+ other dependencies

**Installation time:** 2-3 minutes depending on internet speed.

---

## Step 3: Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with minimum required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
BETTER_AUTH_SECRET="your-random-32-character-secret"
BETTER_AUTH_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"

# Super Admin
SUPERADMIN_PASSWORD="YourSecurePassword123!"
```

**Generate auth secret:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

See [Environment Configuration](./environment-configuration.md) for all options.

---

## Step 4: Setup Database

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma migrate deploy
```

This creates all database tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth provider data
- `verification` - Email verification tokens
- `post` - Blog posts
- `tag` - Post tags
- `post_tag` - Post-tag relationships
- `gallery` - Image metadata
- `audit_log` - Activity logs
- `notification` - User notifications
- `other_discussion` - Comments

**Expected output:**
```
✔ All migrations have been successfully applied.
```

### Verify Database

```bash
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555` to browse database.

---

## Step 5: Create Super Admin

### Method 1: Generate Password Hash

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourSecurePassword123!', 10, (err, hash) => console.log(hash));"
```

Copy the output hash.

### Method 2: Run SQL

Open your database client and run:

```sql
-- Replace <HASH> with the hash from step 1
INSERT INTO "user" (id, name, username, email, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Super Admin',
  'superadmin',
  'superadmin@alifpustaka.web.id',
  NOW(),
  'super_admin',
  'active',
  NOW(),
  NOW()
);

DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM "user" WHERE email = 'superadmin@alifpustaka.web.id';
  
  INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    user_id,
    'superadmin@alifpustaka.web.id',
    'credential',
    '<HASH>',
    NOW(),
    NOW()
  );
END $$;
```

### Verify Super Admin

```sql
SELECT id, name, username, email, role, status, "emailVerified"
FROM "user"
WHERE email = 'superadmin@alifpustaka.web.id';
```

Should show one row with role `super_admin` and status `active`.

---

## Step 6: Start Application

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.9
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

---

## Step 7: Verify Installation

### Login

1. Open [http://localhost:3000/signin](http://localhost:3000/signin)
2. Login with:
   ```
   Email: superadmin@alifpustaka.web.id
   Password: YourSecurePassword123!
   ```
3. Should redirect to profile or dashboard

### Check Access

Verify you can access:
- ✅ `/admin` - Admin dashboard
- ✅ `/admin/users` - User management
- ✅ `/posts` - Post management
- ✅ `/gallery` - Gallery management

---

## Next Steps

### Required
1. **[Create test users](../../tutorials/managing-users-tutorial.md)** - Setup your team
2. **[Create your first post](../../tutorials/your-first-blog-post.md)** - Learn the workflow

### Optional
3. **[Setup OAuth](../../tutorials/setting-up-oauth.md)** - Enable social login
4. **[Configure email](../configuration/email-service.md)** - Enable email notifications
5. **[Setup R2 storage](../configuration/cloudflare-r2.md)** - Enable image uploads

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Cannot Find Module 'next'

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Failed

Check your `DATABASE_URL` format:
```
postgresql://username:password@host:port/database
```

Test connection:
```bash
npx prisma db pull
```

### Login Fails

1. Verify Super Admin exists in database
2. Check password hash is correct
3. Clear browser cookies
4. Try regenerating password hash

See [Troubleshooting Guide](./troubleshooting.md) for more solutions.

---

## Installation Checklist

- [ ] Node.js 20+ installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Database migrations applied
- [ ] Super Admin created
- [ ] Application starts without errors
- [ ] Can login as Super Admin
- [ ] Can access admin pages

---

## Related Documentation

- **[Quickstart Guide](../../quickstart.md)** - 5-minute setup
- **[Environment Configuration](./environment-configuration.md)** - Detailed config
- **[Database Setup](./database-setup.md)** - Database options
- **[Troubleshooting](./troubleshooting.md)** - Common issues

---

**Last Updated:** 2026-08-01
