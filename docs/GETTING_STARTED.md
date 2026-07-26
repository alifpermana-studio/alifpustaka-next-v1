# Getting Started with Alif Pustaka

Complete guide to setting up and running Alif Pustaka CMS locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Create Super Admin](#create-super-admin)
6. [OAuth Setup (Optional)](#oauth-setup-optional)
7. [Cloudflare R2 Setup](#cloudflare-r2-setup)
8. [Email Service Setup](#email-service-setup)
9. [Running the Application](#running-the-application)
10. [Verify Installation](#verify-installation)
11. [First Steps](#first-steps)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 10.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Database** (we recommend [Supabase](https://supabase.com/))

### Optional (for full features)
- **Cloudflare Account** (for R2 image storage)
- **Google Cloud Account** (for Google OAuth)
- **GitHub Account** (for GitHub OAuth)
- **Brevo Account** (for email service)

### Check Your Versions

```bash
node --version    # Should be v20.0.0 or higher
npm --version     # Should be 10.0.0 or higher
git --version     # Any recent version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/alifpustaka-next-v1.git
cd alifpustaka-next-v1
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16.2.9
- React 19.2.4
- Prisma ORM
- Better Auth
- Tailwind CSS v4
- And 40+ other dependencies

**Installation time:** Approximately 2-3 minutes depending on your internet speed.

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

If `.env.example` doesn't exist, create `.env.local` manually.

### 2. Configure Environment Variables

Open `.env.local` and configure the following sections:

#### Database Configuration

```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

**For Supabase:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password
5. Use the "Transaction" pooler connection string for better performance

Example:
```bash
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

#### Authentication Configuration

```bash
# Better Auth Secret (generate a random 32+ character string)
BETTER_AUTH_SECRET="your-super-secret-key-min-32-characters-long"

# Application URLs
BETTER_AUTH_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"
```

**Generate a secure secret:**

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

#### Super Admin Configuration

```bash
# Super Admin Initial Password
SUPERADMIN_PASSWORD="YourSecurePassword123!"
```

**Important:** Change this to a strong password. This will be used to create the initial super admin account.

#### OAuth Configuration (Optional)

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**Skip this for now if you want to test locally first.** See [OAuth Setup](#oauth-setup-optional) section below for detailed instructions.

#### Email Service Configuration

```bash
# Brevo API Key (for transactional emails)
BREVO_API_KEY="your-brevo-api-key"

# SMTP Configuration (alternative to Brevo)
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-brevo-email@example.com"
SMTP_PASS="your-smtp-password"

# Sender Information
MAIL_FROM="noreply@alifpustaka.web.id"
MAIL_FROM_NAME="Alif Pustaka"
```

**For development:** You can use a service like [Mailtrap](https://mailtrap.io/) or skip email verification for local testing.

#### Cloudflare R2 Configuration

```bash
# Cloudflare R2 (for image storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="apus-user-private"
R2_PUBLIC_URL="https://your-bucket-url.r2.cloudflarestorage.com"
```

See [Cloudflare R2 Setup](#cloudflare-r2-setup) section for detailed instructions.

---

## Database Setup

### 1. Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma Client based on your schema.

### 2. Run Database Migrations

```bash
npx prisma migrate deploy
```

This will create all necessary tables:
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

**Expected output:**
```
✔ All migrations have been successfully applied.
```

### 3. Verify Database Tables

You can verify the tables were created using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse your database.

---

## Create Super Admin

The Super Admin account has full system access and can create other users.

### Method 1: Using the Setup Script

1. **Generate password hash:**

```bash
npm install -g bcrypt

# Generate hash (replace 'YourPassword123!' with your SUPERADMIN_PASSWORD)
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10, (err, hash) => console.log(hash));"
```

2. **Run SQL script:**

Open your database client (Supabase SQL Editor, pgAdmin, etc.) and run:

```sql
-- Replace <BCRYPT_HASH_HERE> with the hash from step 1
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

-- Get the user ID
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM "user" WHERE email = 'superadmin@alifpustaka.web.id';
  
  -- Insert password
  INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    user_id,
    'superadmin@alifpustaka.web.id',
    'credential',
    '<BCRYPT_HASH_HERE>',  -- Replace with your hash
    NOW(),
    NOW()
  );
END $$;
```

### Method 2: Using the Automated Script

```bash
# The script will prompt for password
node scripts/generate-super-admin-sql.js
```

Then run the generated SQL in your database.

### Verify Super Admin Creation

```sql
SELECT id, name, username, email, role, status, "emailVerified"
FROM "user"
WHERE email = 'superadmin@alifpustaka.web.id';
```

You should see one row with role `super_admin` and status `active`.

---

## OAuth Setup (Optional)

OAuth allows users to sign in with Google or GitHub accounts.

### Google OAuth Setup

1. **Go to Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com/)

2. **Create a new project** or select an existing one

3. **Enable APIs:**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - Fill in:
     - App name: "Alif Pustaka"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

5. **Create OAuth Client ID:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Alif Pustaka Local"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

6. **Copy Credentials:**
   - Copy the **Client ID** to `GOOGLE_CLIENT_ID` in `.env.local`
   - Copy the **Client Secret** to `GOOGLE_CLIENT_SECRET` in `.env.local`

### GitHub OAuth Setup

1. **Go to GitHub Settings:** [github.com/settings/developers](https://github.com/settings/developers)

2. **Register New OAuth App:**
   - Click "OAuth Apps" → "New OAuth App"
   - Fill in:
     - Application name: "Alif Pustaka Local"
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Click "Register application"

3. **Copy Credentials:**
   - Copy the **Client ID** to `GITHUB_CLIENT_ID` in `.env.local`
   - Click "Generate a new client secret"
   - Copy the **Client Secret** to `GITHUB_CLIENT_SECRET` in `.env.local`
   - **Important:** Save the secret immediately; you won't see it again!

### Test OAuth

After configuration, restart your development server and test:
- Navigate to `/signup` or `/signin`
- Click "Sign in with Google" or "Sign in with GitHub"
- Authorize the app
- You should be redirected back and logged in

**For detailed OAuth troubleshooting, see:** [OAuth Setup Guide](./auth/oauth-setup.md)

---

## Cloudflare R2 Setup

Cloudflare R2 is used for scalable image storage (S3-compatible).

### 1. Create Cloudflare Account

Sign up at [cloudflare.com](https://www.cloudflare.com/) if you don't have an account.

### 2. Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Click "Create bucket"
3. Name: `apus-user-private` (or your preferred name)
4. Location: Choose closest to your users
5. Click "Create bucket"

### 3. Generate API Token

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API token"
3. Token name: "Alif Pustaka Local"
4. Permissions: "Object Read & Write"
5. Apply to specific buckets: Select your bucket
6. Click "Create API token"

7. Copy the credentials:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
   - **Account ID** (in URL) → `R2_ACCOUNT_ID`

### 4. Configure Public Access (Optional)

If you want images to be publicly accessible:

1. Go to your bucket settings
2. Click "Public Access"
3. Enable "Public Access"
4. Copy the public URL → `R2_PUBLIC_URL`

**For private images only:** Leave public access disabled. The app uses pre-signed URLs.

### 5. Update Environment Variables

```bash
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="apus-user-private"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"  # If public access enabled
```

---

## Email Service Setup

### Using Brevo (Recommended)

1. **Create Brevo Account:** [brevo.com](https://www.brevo.com/) (free tier: 300 emails/day)

2. **Get API Key:**
   - Go to Brevo Dashboard → SMTP & API → API Keys
   - Click "Generate a new API key"
   - Name: "Alif Pustaka"
   - Copy the key → `BREVO_API_KEY`

3. **Configure SMTP:**
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: Your Brevo login email
   - Password: Your SMTP key (different from API key)

4. **Verify Sender Domain (Important):**
   - Go to Senders → Domains
   - Add your domain
   - Add DNS records as instructed
   - Verify domain

### Alternative: Mailtrap (Development Only)

For local testing, use [Mailtrap](https://mailtrap.io/):

```bash
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
```

Emails will be caught by Mailtrap instead of sent to real addresses.

---

## Running the Application

### 1. Start Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

**Expected output:**
```
  ▲ Next.js 16.2.9
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

### 2. Verify Application Started

Open your browser and navigate to:
- **Homepage:** [http://localhost:3000](http://localhost:3000)
- **Sign In:** [http://localhost:3000/signin](http://localhost:3000/signin)
- **Sign Up:** [http://localhost:3000/signup](http://localhost:3000/signup)

---

## Verify Installation

### Checklist

Go through this checklist to ensure everything is working:

#### ✅ Basic Setup
- [ ] Application starts without errors
- [ ] Homepage loads successfully
- [ ] Sign up page loads
- [ ] Sign in page loads

#### ✅ Database
- [ ] Can open Prisma Studio (`npx prisma studio`)
- [ ] All 10 tables are created
- [ ] Super Admin user exists in database

#### ✅ Authentication
- [ ] Can login with Super Admin credentials
- [ ] Session persists after page refresh
- [ ] Can logout successfully

#### ✅ Super Admin Access
- [ ] Can access `/admin` dashboard
- [ ] Can access `/admin/user-management`
- [ ] Can access `/blog`
- [ ] Can access `/gallery`

#### ✅ OAuth (if configured)
- [ ] "Sign in with Google" button appears
- [ ] "Sign in with GitHub" button appears
- [ ] OAuth flow completes successfully
- [ ] User profile image synced from OAuth

#### ✅ Email (if configured)
- [ ] Test user signup sends verification email
- [ ] Password reset sends reset email
- [ ] Emails appear in inbox or Mailtrap

#### ✅ Gallery (if configured)
- [ ] Can access gallery page
- [ ] Upload button appears
- [ ] Image upload completes (if R2 configured)

---

## First Steps

Now that your installation is complete, here are the recommended first steps:

### 1. Login as Super Admin

```
Email: superadmin@alifpustaka.web.id
Password: [Your SUPERADMIN_PASSWORD]
```

### 2. Explore the Admin Dashboard

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and familiarize yourself with:
- User Management
- Content Management
- Post Review Queue
- Settings

### 3. Create Test Users

Go to **User Management** and create users with different roles:
- 1 Content Admin
- 1 User Admin
- 1 Editor
- 2 Authors
- 1 Regular User

**Tip:** Use temporary email addresses like `editor@test.local` for testing.

### 4. Test Role Permissions

Login with each test user and verify:
- What pages they can access
- What actions they can perform
- What they cannot do (permission denied)

### 5. Create Sample Content

As an **Author:**
1. Go to `/blog/editor`
2. Create a blog post
3. Save as draft
4. Submit for review

As an **Editor:**
1. Go to `/admin/post-management`
2. Review the submitted post
3. Approve or reject it

### 6. Upload Test Images

As a **Content Admin:**
1. Go to `/gallery`
2. Upload a test image
3. Edit image metadata
4. Try changing visibility (public/private)

### 7. Review Audit Logs

As **Super Admin:**
1. All actions are logged
2. Check audit logs for tracked activities
3. Verify IP and user agent are recorded

---

## Troubleshooting

### Application Won't Start

**Error:** `Error: Cannot find module 'next'`
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Port 3000 is already in use`
**Solution:**
```bash
# Find process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

---

### Database Connection Errors

**Error:** `P1001: Can't reach database server`
**Solution:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Test connection:
  ```bash
  npx prisma db pull
  ```

**Error:** `P3009: Failed to create database`
**Solution:**
- Database already exists (this is normal)
- Continue with `npx prisma migrate deploy`

---

### Super Admin Login Fails

**Error:** "Invalid credentials"
**Solution:**
1. Verify Super Admin exists:
   ```sql
   SELECT * FROM "user" WHERE email = 'superadmin@alifpustaka.web.id';
   ```
2. Check password hash in `account` table
3. Regenerate password hash and update
4. Clear browser cookies and try again

---

### OAuth Errors

**Error:** "Redirect URI mismatch"
**Solution:**
- Verify callback URL in OAuth app settings:
  - Google: `http://localhost:3000/api/auth/callback/google`
  - GitHub: `http://localhost:3000/api/auth/callback/github`
- Ensure `BASE_URL` in `.env.local` matches

**Error:** "GOOGLE_CLIENT_ID is not defined"
**Solution:**
- Check variable names are exact (case-sensitive)
- Restart development server after adding env variables
- Clear Next.js cache: `rm -rf .next`

---

### Email Not Sending

**Error:** "Failed to send email"
**Solution:**
- Verify SMTP credentials are correct
- Check sender domain is verified (for production)
- Test with Mailtrap first (development)
- Check Brevo/SMTP service status

---

### Image Upload Fails

**Error:** "Failed to generate presigned URL"
**Solution:**
- Verify R2 credentials are correct
- Check bucket name matches
- Ensure R2 API token has "Object Read & Write" permission
- Test bucket access in Cloudflare Dashboard

---

### TypeScript Errors

**Error:** "Cannot find module '@/...' or its type declarations"
**Solution:**
```bash
npx prisma generate
rm -rf .next
npm run dev
```

---

## Next Steps

Once your installation is verified:

1. **Read Documentation:**
   - [System Architecture](./ARCHITECTURE.md)
   - [RBAC Implementation](./features/rbac-implementation.md)
   - [Blog Management Guide](./features/blog-management.md)

2. **Customize Your Instance:**
   - Update branding in `src/components/layout/`
   - Configure theme colors in `tailwind.config.ts`
   - Add custom email templates

3. **Prepare for Production:**
   - Review [Production Deployment Guide](./deployment/production-deployment.md)
   - Set up monitoring and logging
   - Configure backup strategy

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check [Error Codes Reference](./development/error-codes.md)
2. Review [OAuth Troubleshooting](./auth/oauth-troubleshooting.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

**Last Updated:** July 24, 2026  
**Maintained by:** Alif Pustaka Development Team
