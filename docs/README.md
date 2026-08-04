# Alif Pustaka Public Site - Documentation

Complete documentation for the Alif Pustaka public-facing website.

---

## Table of Contents

### Getting Started
- [Quick Start Guide](./getting-started/quick-start.md) - Get up and running in minutes
- [Installation](./getting-started/installation.md) - Detailed installation instructions
- [Environment Configuration](./getting-started/environment.md) - Configure environment variables

### Docker & Deployment
- [Network Setup](./NETWORK-SETUP.md) - Create Docker networks
- [Network Explained](./NETWORK-EXPLAINED.md) - Why external networks?
- [Docker Guide](./DOCKER.md) - Docker deployment quick reference
- [Docker Deployment](./deployment/docker.md) - Complete Docker guide
- [Production Deployment](./deployment/production.md) - Deploy to production
- [Environment Variables](./deployment/environment-variables.md) - Complete variable reference
- [Troubleshooting](./deployment/troubleshooting.md) - Common issues and solutions

### Architecture
- [System Overview](./architecture/overview.md) - High-level architecture and design
- [Authentication Flow](./architecture/authentication.md) - How shared auth works
- [API Integration](./architecture/api-integration.md) - Integrating with admin API
- [API Request Guide](./API-REQUEST-GUIDE.md) - Server-side vs Client-side requests

### Development
- [Local Development](./development/local-setup.md) - Set up local development environment
- [Project Structure](./development/project-structure.md) - Understanding the codebase
- [API Client Usage](./development/api-client.md) - Using the API client

### Resources
- [Project Summary](./PROJECT-SUMMARY.md) - Complete project overview
- [Admin Docker Prompt](./PROMPT-ADMIN-DOCKER.md) - Setup prompt for admin app
- [Documentation Index](./INDEX.md) - Master index with search

---

## Overview

This is the public-facing website for Alif Pustaka CMS. It displays published content fetched from the admin application via REST API.

**Key Characteristics:**
- Read-only content display
- No direct database access
- Shared authentication with admin app
- API-driven architecture
- Built with Next.js 16 App Router

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

See [Quick Start Guide](./getting-started/quick-start.md) for details.

---

## Architecture Summary

```
Public Site (this project)
    ↓ API Requests
Admin App (alifpustaka-next-app-v1)
    ↓ Database Queries
PostgreSQL Database
```

- **Public Site:** Next.js frontend, reads session cookies, makes API calls
- **Admin App:** Full CMS backend with APIs, database, auth, file storage
- **Shared Auth:** Better Auth with cross-subdomain cookies

See [Architecture Overview](./architecture/overview.md) for details.

---

## Technology Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Runtime:** React 19.2.4
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios 1.18.1
- **Auth:** Better Auth 1.6.22 (client-only)

---

## Project Status

**Current Version:** 0.1.0  
**Last Updated:** 2026-08-03  
**Status:** Active Development

---

## Prerequisites

- Node.js 20.x or higher
- Running admin app instance
- Admin app with public API endpoints

---

## Documentation Structure

```
docs/
├── README.md (this file)
├── getting-started/
│   ├── quick-start.md
│   ├── installation.md
│   └── environment.md
├── architecture/
│   ├── overview.md
│   ├── authentication.md
│   └── api-integration.md
├── development/
│   ├── local-setup.md
│   ├── project-structure.md
│   └── api-client.md
└── deployment/
    ├── production.md
    ├── environment-variables.md
    └── troubleshooting.md
```

---

## Key Files

- **API Client:** `src/lib/api-client.ts` - Main API integration
- **Auth Context:** `src/context/AuthContext.tsx` - Authentication state
- **Auth Client:** `src/lib/auth.client.ts` - Better Auth configuration
- **Environment:** `.env.local` - Development configuration

---

## Related Projects

- **Admin App:** `alifpustaka-next-app-v1` - CMS backend with full API
- **Prompt for Admin:** See conversation history for admin app implementation prompt

---

## Support

For issues and questions:

1. Check [Troubleshooting Guide](./deployment/troubleshooting.md)
2. Review [Common Issues](#common-issues)
3. Check browser console and server logs
4. Verify admin app is running and accessible

---

## Common Issues

### API Connection Fails
- Verify admin app is running
- Check `NEXT_PUBLIC_ADMIN_API_URL` in `.env.local`
- Test with: `curl http://localhost:3001/api/public/posts`

### Session Not Shared
- Ensure `COOKIE_DOMAIN` matches in both apps
- Verify `BETTER_AUTH_SECRET` is identical
- Check domain structure (`.domain.com` with dot)

### Build Errors
- Run `npm install` to update dependencies
- Check TypeScript errors: `npx tsc --noEmit`
- Clear build cache: `rm -rf .next`

See full [Troubleshooting Guide](./deployment/troubleshooting.md).

---

## Contributing

This is a private project. For development guidelines:

1. Follow existing code style
2. Use TypeScript strict mode
3. Test authentication flow changes
4. Update documentation for significant changes

---

## License

Private project - All rights reserved

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2026-08-03
