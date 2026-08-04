# Alif Pustaka - Public Website

Public-facing website for Alif Pustaka CMS. Consumes data from the admin app via API.

---

## Architecture

- **Public Site** (this project) - `mydomain.com`
  - Read-only content display
  - Fetches data from admin API
  - Shared authentication via Better Auth
  
- **Admin App** - `app.mydomain.com` (separate project)
  - Full CMS with editorial workflow
  - All APIs and database operations
  - User/role management

---

## Features

- **Shared Authentication** - Session cookies shared across subdomains
- **API-Driven Content** - All data fetched from admin app
- **Public Blog** - Display published posts only
- **Responsive Design** - Tailwind CSS v4
- **SSR/ISR Support** - Next.js App Router

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Important:** Admin app must be running at `NEXT_PUBLIC_ADMIN_API_URL`

---

## Environment Variables

```env
# Better Auth (shared session with admin app)
BETTER_AUTH_SECRET="must-match-admin-app-secret"
BETTER_AUTH_URL="http://localhost:3000"
COOKIE_DOMAIN=".yourdomain.com"

# Admin API URL
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"

# Public site URL
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# CDN for images
R2_PUBLIC_BASE_URL="img.yourdomain.com"
```

---

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript 5
- **Auth:** Better Auth (session reading only)
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios

---

## Project Structure

```
alifpustaka-next-v1/
├── src/
│   ├── app/           # Next.js app router (public pages only)
│   ├── components/    # React components
│   ├── lib/           # API client and utilities
│   ├── context/       # Auth and theme context
│   └── types/         # TypeScript types
├── public/            # Static assets
└── .env.local         # Environment variables
```

---

## Authentication Flow

1. User clicks "Login" on public site
2. Redirects to `app.mydomain.com/signin?returnUrl=...`
3. User logs in on admin app
4. Better Auth sets cookie for `.mydomain.com`
5. User redirected back to public site
6. Public site reads session cookie automatically

---

## API Integration

All data comes from admin app:

- `GET /api/public/posts` - Published posts list
- `GET /api/public/posts/[slug]` - Single post
- `GET /api/public/posts/featured` - Featured posts
- `GET /api/public/search` - Search posts
- `GET /api/user/bookmarks` - User bookmarks (authenticated)
- `GET /api/user/profile` - User profile (authenticated)

See `src/lib/api-client.ts` for implementation.

---

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

---

## Deployment

This project requires the admin app to be deployed and accessible. Configure `NEXT_PUBLIC_ADMIN_API_URL` to point to your admin app.

### Docker Deployment

**Prerequisites:**
- Create external networks first (if not exist):
  ```bash
  docker network create alifpustaka-network  # Internal communication
  docker network create traefik-network      # Traefik routing
  ```
  These networks are shared across all Alif Pustaka subdomain projects.
  
- Admin app running on `alifpustaka-network`
- Traefik running on `traefik-network`

**Deploy:**
```bash
# Configure environment
cp .env.production.example .env.production
# Edit .env.production

# Build and deploy
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f public-site
```

See [docs/DOCKER.md](./docs/DOCKER.md) and [docs/NETWORK-SETUP.md](./docs/NETWORK-SETUP.md) for detailed instructions.

**Why external networks?** Both networks use bridge driver but are created manually to share across multiple subdomain projects (admin, public, others).

### Traditional Deployment

See [Production Deployment Guide](./docs/deployment/production.md).

---

## Notes

- This project does NOT have direct database access
- All authentication happens via admin app
- Email/uploads handled by admin app
- Only displays public-safe content

---

**Last Updated:** 2026-08-03
