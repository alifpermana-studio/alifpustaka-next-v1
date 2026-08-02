# Quickstart Guide

Get Alif Pustaka CMS up and running in 5 minutes.

---

## Prerequisites

- Node.js 20+
- PostgreSQL database (or [Supabase account](https://supabase.com/))
- 5 minutes

---

## Setup Steps

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/alifpustaka-next-v1.git
cd alifpustaka-next-v1
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
# Database (use your PostgreSQL or Supabase connection string)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-random-32-character-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"

# Super Admin Password
SUPERADMIN_PASSWORD="YourSecurePassword123!"
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Create Super Admin

Generate password hash:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourSecurePassword123!', 10, (err, hash) => console.log(hash));"
```

Run in your database (replace `<HASH>` with output above):

```sql
INSERT INTO "user" (id, name, username, email, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Super Admin', 'superadmin', 'superadmin@alifpustaka.web.id', NOW(), 'super_admin', 'active', NOW(), NOW());

DO $$
DECLARE user_id uuid;
BEGIN
  SELECT id INTO user_id FROM "user" WHERE email = 'superadmin@alifpustaka.web.id';
  INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), user_id, 'superadmin@alifpustaka.web.id', 'credential', '<HASH>', NOW(), NOW());
END $$;
```

### 5. Start Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Login

```
Email: superadmin@alifpustaka.web.id
Password: YourSecurePassword123!
```

---

## Next Steps

- **[Complete Setup Guide](./guides/setup/installation.md)** - Detailed installation with OAuth, email, and R2 storage
- **[Your First Blog Post Tutorial](./tutorials/your-first-blog-post.md)** - Learn the editorial workflow
- **[Architecture Overview](./explanation/architecture/system-overview.md)** - Understand the system design

---

## Need Help?

- **Can't connect to database?** Check your `DATABASE_URL` format
- **Login fails?** Verify the password hash was inserted correctly
- **Port 3000 in use?** Run `npx kill-port 3000` or use `PORT=3001 npm run dev`

See [Troubleshooting Guide](./guides/setup/troubleshooting.md) for more solutions.

---

**Last Updated:** 2026-08-01
