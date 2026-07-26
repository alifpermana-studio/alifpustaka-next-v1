# Deployment Documentation

Production deployment guides and checklists for the Alif Pustaka application.

---

## Overview

This directory contains deployment procedures, environment setup guides, and production checklists.

---

## Documentation Files

### [production-deployment.md](./production-deployment.md)
Comprehensive production deployment guide.

**Contents:**
- Pre-deployment checklist
- Environment configuration
- Database migration steps
- Deployment procedures
- Post-deployment verification
- Rollback procedures
- Monitoring setup

**Use this for:**
- Initial production deployment
- Update deployments
- Environment configuration
- Troubleshooting deployment issues

---

## Quick Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] OAuth apps configured for production URLs
- [ ] Cloudflare R2 bucket created
- [ ] Email service configured
- [ ] Super admin user created
- [ ] Build passes locally
- [ ] All tests passing
- [ ] Secrets not committed to repository

---

## Environment Variables

Key environment variables for production (see production-deployment.md for complete list):

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://your-domain.com

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Email
BREVO_API_KEY=
```

---

## Deployment Platforms

The application can be deployed to:
- Vercel
- Netlify
- AWS
- Digital Ocean
- Any Node.js hosting platform

See production-deployment.md for platform-specific instructions.

---

## Related Documentation

- [Getting Started](../GETTING_STARTED.md) - Development setup
- [RBAC System](../features/rbac.md) - Role setup for production
- [OAuth Setup](../auth/oauth-setup.md) - Production OAuth configuration

---

**Last Updated:** 2026-07-25
