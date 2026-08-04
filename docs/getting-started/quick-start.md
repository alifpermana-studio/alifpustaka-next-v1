# Quick Start Guide

Get the Alif Pustaka public site running in minutes.

---

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Running admin app instance (alifpustaka-next-app-v1)
- Admin app accessible URL

---

## Installation Steps

### 1. Clone and Install

```bash
cd alifpustaka-next-v1
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
BETTER_AUTH_SECRET="your-secret-must-match-admin-app"
BETTER_AUTH_URL="http://localhost:3000"
COOKIE_DOMAIN=".alifpustaka.web.id"

NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"

BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

R2_PUBLIC_BASE_URL=img.alifpustaka.web.id
```

**Important:** `BETTER_AUTH_SECRET` must match the admin app's secret.

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Verify Setup

1. **Check homepage loads** - Navigate to `/`
2. **Test blog page** - Visit `/blog` (should fetch from admin API)
3. **Test authentication** - Click "Login" (should redirect to admin app)
4. **Check API connection** - View browser console for any API errors

---

## Next Steps

- [Installation Guide](./installation.md) - Detailed setup instructions
- [Environment Configuration](./environment.md) - All environment variables explained
- [Architecture Overview](../architecture/overview.md) - Understand the system design

---

## Common Issues

**API connection fails:**
- Verify admin app is running
- Check `NEXT_PUBLIC_ADMIN_API_URL` is correct
- Ensure CORS is configured in admin app

**Login redirect doesn't work:**
- Verify `COOKIE_DOMAIN` matches both apps
- Check `BETTER_AUTH_SECRET` is identical in both apps

**Session not shared:**
- Both apps must use same `COOKIE_DOMAIN`
- Domain must start with dot (`.domain.com`)
- Use HTTPS in production

---

**Last Updated:** 2026-08-03
