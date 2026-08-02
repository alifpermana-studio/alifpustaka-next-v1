# Setup Guides

Get Alif Pustaka installed and running.

---

## Overview

This section covers initial installation, environment configuration, database setup, and troubleshooting.

---

## Available Guides

### [Installation Guide](./installation.md)
Complete installation instructions from clone to first run.

**What you'll accomplish:**
- Clone and install dependencies
- Configure environment variables
- Setup database and migrations
- Create Super Admin account
- Start the application

**Use this when:** Setting up Alif Pustaka for the first time.

---

### [Database Setup](./database-setup.md)
PostgreSQL database configuration and migration.

**What you'll accomplish:**
- Setup PostgreSQL (local or Supabase)
- Run Prisma migrations
- Verify database schema
- Create initial data

**Use this when:** Configuring the database.

---

### [Environment Configuration](./environment-configuration.md)
Configure environment variables for all services.

**What you'll accomplish:**
- Setup authentication secrets
- Configure database connection
- Add OAuth credentials (optional)
- Configure email service (optional)
- Setup Cloudflare R2 (optional)

**Use this when:** Configuring `.env.local` file.

---

### [Troubleshooting](./troubleshooting.md)
Solutions to common setup problems.

**What you'll find:**
- Application won't start
- Database connection errors
- Port conflicts
- Environment variable issues
- Migration failures

**Use this when:** Encountering setup errors.

---

## Quick Setup (5 Minutes)

For the fastest setup, see **[Quickstart Guide](../../quickstart.md)**.

---

## Setup Options

### Option 1: Local PostgreSQL
- Full control over database
- No external dependencies
- Requires PostgreSQL installation

### Option 2: Supabase
- Managed PostgreSQL service
- Quick setup
- Free tier available
- Automatic backups

### Option 3: VPS PostgreSQL
- Self-hosted on VPS
- Cost-effective for production
- Requires SSH tunnel for security
- See [VPS PostgreSQL Setup](../deployment/vps-postgresql-setup.md)

---

## Minimum Requirements

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 500MB for application + database space

### Required Services
- PostgreSQL database (local, Supabase, or VPS)

### Optional Services
- Google Cloud account (for Google OAuth)
- GitHub account (for GitHub OAuth)
- Cloudflare account (for R2 image storage)
- Brevo account (for email service)

---

## Installation Steps Overview

1. **Prerequisites** - Install Node.js, PostgreSQL
2. **Clone** - Download the repository
3. **Install** - Run `npm install`
4. **Configure** - Setup `.env.local`
5. **Database** - Run migrations
6. **Super Admin** - Create admin account
7. **Start** - Run `npm run dev`
8. **Verify** - Login and test

See [Installation Guide](./installation.md) for detailed steps.

---

## After Installation

Once installed, proceed to:
- **[Your First Blog Post Tutorial](../../tutorials/your-first-blog-post.md)** - Learn the workflow
- **[Managing Users Tutorial](../../tutorials/managing-users-tutorial.md)** - Manage team members
- **[OAuth Setup Guide](../authentication/oauth-setup.md)** - Enable social login

---

## Related Documentation

- **[Quickstart Guide](../../quickstart.md)** - 5-minute setup
- **[Deployment Guides](../deployment/)** - Production deployment
- **[Configuration Guides](../configuration/)** - Additional configuration

---

**Last Updated:** 2026-08-01
