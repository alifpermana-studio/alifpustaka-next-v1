# Alif Pustaka Public Site - Documentation Index

Complete documentation for the public-facing website.

---

## 📚 Documentation Overview

This documentation covers the public site that consumes data from the admin app via API. The public site is a read-only frontend with shared authentication.

**Total Documentation Files:** 16

---

## 🚀 Getting Started

Perfect for first-time setup and basic configuration.

| Document | Description | Time to Read |
|----------|-------------|--------------|
| [Quick Start Guide](./getting-started/quick-start.md) | Get running in 5 minutes | 3 min |
| [Installation Guide](./getting-started/installation.md) | Detailed installation steps | 8 min |
| [Environment Configuration](./getting-started/environment.md) | Configure environment variables | 10 min |
| [Network Setup](./NETWORK-SETUP.md) | Create Docker networks | 2 min |

**Start here:** [Quick Start Guide](./getting-started/quick-start.md)

---

## 🐳 Docker & Deployment

Docker deployment guides and production setup.

| Document | Description | Time to Read |
|----------|-------------|--------------|
| [Network Setup](./NETWORK-SETUP.md) | Create required Docker networks | 2 min |
| [Docker Guide](./DOCKER.md) | Docker quick reference | 5 min |
| [Docker Deployment](./deployment/docker.md) | Complete Docker guide | 20 min |
| [Production Deployment](./deployment/production.md) | Deploy to production | 20 min |
| [Environment Variables](./deployment/environment-variables.md) | Complete variable reference | 15 min |
| [Troubleshooting](./deployment/troubleshooting.md) | Common issues & solutions | 20 min |

**Essential:** Start with [Network Setup](./NETWORK-SETUP.md) before Docker deployment.

---

## 🏗️ Architecture

Understanding the system design and how components interact.

| Document | Description | Time to Read |
|----------|-------------|--------------|
| [System Overview](./architecture/overview.md) | High-level architecture | 15 min |
| [Authentication Flow](./architecture/authentication.md) | How shared auth works | 12 min |
| [API Integration](./architecture/api-integration.md) | Integrating with admin API | 15 min |

**Recommended:** Read these before making architectural decisions.

---

## 💻 Development

Guides for local development and working with the codebase.

| Document | Description | Time to Read |
|----------|-------------|--------------|
| [Local Development Setup](./development/local-setup.md) | Development environment | 10 min |
| [Project Structure](./development/project-structure.md) | Understanding the codebase | 12 min |
| [API Client Usage](./development/api-client.md) | Using the API client | 15 min |

**Essential:** [Local Development Setup](./development/local-setup.md) for developers.

---

## 🚢 Deployment

Production deployment guides and troubleshooting.

| Document | Description | Time to Read |
|----------|-------------|--------------|
| [Production Deployment](./deployment/production.md) | Deploy to production | 20 min |
| [Environment Variables](./deployment/environment-variables.md) | Complete variable reference | 15 min |
| [Troubleshooting Guide](./deployment/troubleshooting.md) | Common issues & solutions | 20 min |

**Critical:** Review before deploying to production.

---

## 📖 Quick Reference

### Common Tasks

- **Add a new page:** See [Project Structure](./development/project-structure.md#adding-a-new-page)
- **Fetch data from API:** See [API Client Usage](./development/api-client.md#basic-usage)
- **Fix auth issues:** See [Troubleshooting](./deployment/troubleshooting.md#authentication-issues)
- **Deploy to production:** See [Production Deployment](./deployment/production.md)

### Key Concepts

- **Shared Authentication:** Both apps share session cookies via `COOKIE_DOMAIN`
- **API-Driven:** All data comes from admin app APIs
- **Read-Only:** No database access, no write operations
- **Type-Safe:** Full TypeScript support with strict types

### Important Files

```
src/
├── lib/
│   ├── api-client.ts        # API integration (primary)
│   └── auth.client.ts       # Better Auth config
├── context/
│   └── AuthContext.tsx      # Auth state management
├── app/
│   ├── (blog)/             # Blog pages
│   └── api/auth/           # Better Auth endpoints
└── components/
    └── layout/Navbar.tsx    # Navigation with login
```

---

## 🎯 Learning Paths

### New Developer
1. [Quick Start Guide](./getting-started/quick-start.md)
2. [Project Structure](./development/project-structure.md)
3. [Local Development Setup](./development/local-setup.md)
4. [API Client Usage](./development/api-client.md)

### DevOps/Deployment
1. [System Overview](./architecture/overview.md)
2. [Environment Variables](./deployment/environment-variables.md)
3. [Production Deployment](./deployment/production.md)
4. [Troubleshooting Guide](./deployment/troubleshooting.md)

### Architect/Designer
1. [System Overview](./architecture/overview.md)
2. [Authentication Flow](./architecture/authentication.md)
3. [API Integration](./architecture/api-integration.md)
4. [Project Structure](./development/project-structure.md)

---

## 🔍 Search by Topic

### Authentication
- [Authentication Flow](./architecture/authentication.md)
- [Environment Configuration](./getting-started/environment.md#authentication)
- [Troubleshooting Auth](./deployment/troubleshooting.md#authentication-issues)

### API Integration
- [API Integration Architecture](./architecture/api-integration.md)
- [API Client Usage](./development/api-client.md)
- [Troubleshooting API](./deployment/troubleshooting.md#api-connection-issues)

### Deployment
- [Production Deployment](./deployment/production.md)
- [Environment Variables](./deployment/environment-variables.md)
- [Troubleshooting](./deployment/troubleshooting.md)

### Development
- [Local Setup](./development/local-setup.md)
- [Project Structure](./development/project-structure.md)
- [API Client](./development/api-client.md)

---

## 🛠️ Tech Stack Reference

| Technology | Version | Documentation |
|------------|---------|---------------|
| Next.js | 16.2.9 | [Official Docs](https://nextjs.org/docs) |
| React | 19.2.4 | [Official Docs](https://react.dev) |
| TypeScript | 5.x | [Official Docs](https://www.typescriptlang.org/docs/) |
| Tailwind CSS | 4.x | [Official Docs](https://tailwindcss.com/docs) |
| Better Auth | 1.6.22 | [Official Docs](https://www.better-auth.com/docs) |
| Axios | 1.18.1 | [Official Docs](https://axios-http.com/docs/intro) |

---

## 📊 Project Status

**Version:** 0.1.0  
**Status:** Active Development  
**Last Updated:** 2026-08-03  
**Documentation Coverage:** Complete

---

## 🤝 Related Resources

- **Admin App:** `alifpustaka-next-app-v1` (separate project)
- **Admin Docker Setup:** See [PROMPT-ADMIN-DOCKER.md](./PROMPT-ADMIN-DOCKER.md)
- **Project Summary:** See [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)
- **Repository:** (Your git repository URL)

---

## 💡 Support

### Getting Help

1. **Check Documentation:**
   - Start with [Quick Start](./getting-started/quick-start.md)
   - Review [Troubleshooting](./deployment/troubleshooting.md)

2. **Docker Setup:**
   - [Network Setup](./NETWORK-SETUP.md) - Create networks first
   - [Docker Guide](./DOCKER.md) - Quick reference
   - [Docker Deployment](./deployment/docker.md) - Complete guide

3. **Debug Issues:**
   - Check browser console
   - Review server logs
   - Verify admin app is running

4. **Common Issues:**
   - [API Connection](./deployment/troubleshooting.md#api-connection-issues)
   - [Authentication](./deployment/troubleshooting.md#authentication-issues)
   - [Build/Deploy](./deployment/troubleshooting.md#builddeployment-issues)

### Quick Diagnostics

```bash
# Test API connection
curl http://localhost:3001/api/public/posts

# Check environment variables
echo $NEXT_PUBLIC_ADMIN_API_URL

# Verify build
npm run build

# Check TypeScript
npx tsc --noEmit

# Check Docker networks
docker network ls | grep -E 'alifpustaka|traefik'
```

---

## 📝 Documentation Maintenance

### Last Review: 2026-08-03

All documentation has been created fresh for the restructured public site architecture. No legacy content from the previous CMS structure.

### What's Documented
- ✅ Complete setup and installation
- ✅ Architecture and design patterns
- ✅ Development workflows
- ✅ Deployment procedures
- ✅ Troubleshooting guides
- ✅ API integration

### What's Not Needed
- ❌ Database setup (handled by admin app)
- ❌ Migration guides (fresh documentation)
- ❌ Prisma configuration (not used in public site)
- ❌ Email/SMTP setup (handled by admin app)

---

## 🎓 Best Practices

When working with this project:

1. **Always read docs first** - Most questions are answered here
2. **Test locally** - Before deploying to production
3. **Match admin app config** - Especially `BETTER_AUTH_SECRET` and `COOKIE_DOMAIN`
4. **Use TypeScript** - Leverage type safety
5. **Check admin app** - Many issues originate from admin side

---

**Documentation maintained by:** Development Team  
**Last updated:** 2026-08-03T17:24:52Z  
**Documentation version:** 1.0.0

---

[Back to Top](#alif-pustaka-public-site---documentation-index)
