# Alif Pustaka Public Site

Public-facing website for Alif Pustaka CMS - Updated 2026-08-03

---

## 📋 Summary of Changes

This project has been restructured from a full-stack CMS to a **public-facing website** that consumes data from the admin app via API.

### Key Changes:
- ✅ Removed direct database access (Prisma deleted)
- ✅ All data fetched via REST API from admin app
- ✅ Shared authentication via Better Auth cookies
- ✅ Removed admin UI and editorial features
- ✅ Cleaned dependencies (no AWS SDK, nodemailer, etc.)
- ✅ Updated Docker configurations
- ✅ Complete new documentation (13 guides)

---

## 🏗️ Architecture

```
Public Site (this project) → API Requests → Admin App → Database
                           ← JSON Response ←
```

- **Public Site:** Frontend only, reads session cookies, displays content
- **Admin App:** Backend API, database, auth, file storage, CMS features
- **Shared Auth:** Better Auth with cross-subdomain cookies (`.domain.com`)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- Admin app running at `http://localhost:3001` (or configured URL)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit with your admin app URL and matching auth secret

# Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📝 Environment Variables

**Required:**
```env
BETTER_AUTH_SECRET="must-match-admin-app"
BETTER_AUTH_URL="http://localhost:3000"
COOKIE_DOMAIN=".alifpustaka.web.id"
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

See [Environment Configuration](./docs/getting-started/environment.md) for details.

---

## 🐳 Docker Deployment

**Configuration:** Single docker-compose.yml for Traefik

### Networks
- **alifpustaka-network:** Internal communication with admin app
- **traefik-network:** Traefik routing and SSL

### Setup
```bash
# 1. Create networks (once)
docker network create alifpustaka-network
docker network create traefik-network

# 2. Configure
cp .env.production.example .env.production
# Edit .env.production

# 3. Deploy
docker-compose build
docker-compose up -d
```

**Container:** `alifpustaka-public-site`  
**Internal Port:** 3000 (no external binding)  
**Access:** Via Traefik at `https://alifpustaka.web.id`

See [DOCKER.md](./DOCKER.md) for detailed instructions.

---

## 📚 Documentation

**Complete documentation:** [docs/INDEX.md](./docs/INDEX.md)

### Quick Links:
- [Quick Start](./docs/getting-started/quick-start.md) - 5-minute setup
- [Architecture Overview](./docs/architecture/overview.md) - System design
- [API Client Usage](./docs/development/api-client.md) - Fetch data from admin
- [Production Deployment](./docs/deployment/production.md) - Deploy to production
- [Troubleshooting](./docs/deployment/troubleshooting.md) - Common issues

**Total:** 13 comprehensive documentation files

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Runtime:** React 19.2.4
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios 1.18.1
- **Auth:** Better Auth 1.6.22 (client-only)

**Removed:** Prisma, AWS SDK, nodemailer, Brevo, PostgreSQL client

---

## 📁 Project Structure

```
alifpustaka-next-v1/
├── src/
│   ├── app/                 # Next.js pages (public only)
│   ├── components/          # React components
│   ├── lib/
│   │   ├── api-client.ts   # ⭐ API integration
│   │   └── auth.client.ts  # Better Auth config
│   ├── context/
│   │   └── AuthContext.tsx # Auth state
│   └── types/              # TypeScript types
├── docs/                    # 📚 Complete documentation (13 files)
├── public/                  # Static assets
├── Dockerfile              # Docker build
├── docker-compose*.yml     # 3 deployment options
├── nginx.conf              # Nginx configuration
└── .env.example            # Environment template
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/lib/api-client.ts` | API integration with admin app |
| `src/context/AuthContext.tsx` | Authentication state management |
| `src/app/signin/page.tsx` | Redirects to admin app login |
| `docs/INDEX.md` | Documentation master index |
| `docker-compose.yml` | Traefik deployment |
| `.env.example` | Environment variables template |

---

## 🔐 Authentication Flow

1. User clicks "Login" on public site
2. Redirects to `app.domain.com/signin?returnUrl=...`
3. User authenticates on admin app
4. Better Auth sets cookie for `.domain.com`
5. Redirects back to public site
6. Public site reads session cookie
7. User is authenticated on public site

**Important:** Both apps must share:
- Same `BETTER_AUTH_SECRET`
- Same `COOKIE_DOMAIN` (with dot prefix)

---

## 🌐 API Integration

All data comes from admin app endpoints:

```typescript
// Public endpoints (no auth required)
GET /api/public/posts          // List published posts
GET /api/public/posts/[slug]   // Single post
GET /api/public/posts/featured // Featured posts
GET /api/public/search         // Search posts

// User endpoints (auth required)
GET /api/user/bookmarks        // User's bookmarks
GET /api/user/profile          // User profile
```

See [API Integration Guide](./docs/architecture/api-integration.md).

---

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

---

## 🚢 Deployment Checklist

- [ ] Admin app deployed and accessible
- [ ] `.env.production` configured
- [ ] `BETTER_AUTH_SECRET` matches admin app
- [ ] `COOKIE_DOMAIN` set correctly (`.domain.com`)
- [ ] `NEXT_PUBLIC_ADMIN_API_URL` points to admin app
- [ ] DNS configured for domain
- [ ] SSL certificates ready
- [ ] Test authentication flow
- [ ] Test API integration

---

## ⚠️ Important Notes

### What This Project Does NOT Have:
- ❌ Direct database access
- ❌ Prisma ORM
- ❌ Email sending (SMTP)
- ❌ File uploads (AWS S3/R2)
- ❌ Admin UI/Dashboard
- ❌ User management
- ❌ Content creation/editing

### All Above Features Are In:
✅ **Admin App** (`alifpustaka-next-app-v1`)

---

## 🐛 Troubleshooting

### Common Issues:

**API connection fails:**
- Verify admin app is running
- Check `NEXT_PUBLIC_ADMIN_API_URL`
- Test: `curl http://localhost:3001/api/public/posts`

**Session not shared:**
- Ensure `COOKIE_DOMAIN` matches in both apps
- Verify `BETTER_AUTH_SECRET` is identical
- Check domain starts with dot (`.domain.com`)

**Build errors:**
- Run `npm install`
- Clear cache: `rm -rf .next`
- Check TypeScript: `npx tsc --noEmit`

See [Troubleshooting Guide](./docs/deployment/troubleshooting.md).

---

## 📞 Support

1. Check [Documentation](./docs/INDEX.md)
2. Review [Troubleshooting Guide](./docs/deployment/troubleshooting.md)
3. Verify admin app is running
4. Check browser console and server logs

---

## 📜 License

Private project - All rights reserved

---

## 📅 Project Info

**Version:** 0.1.0  
**Last Updated:** 2026-08-03  
**Status:** Active Development  
**Type:** Public Website (API Consumer)

---

**Documentation:** [docs/INDEX.md](./docs/INDEX.md) | **Admin App:** `alifpustaka-next-app-v1`
