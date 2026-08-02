# Alif Pustaka Documentation

Welcome to the Alif Pustaka CMS documentation. Find everything you need to get started, learn features, and build with Alif Pustaka.

---

## Quick Links

<table>
<tr>
<td width="50%">

### 🚀 Getting Started
**New to Alif Pustaka?** Start here.

- **[Quickstart Guide](./quickstart.md)**  
  Get up and running in 5 minutes

- **[Installation Guide](./guides/setup/installation.md)**  
  Complete setup instructions

- **[Your First Blog Post](./tutorials/your-first-blog-post.md)**  
  Learn the editorial workflow

</td>
<td width="50%">

### 📚 Learn

- **[Tutorials](./tutorials/)**  
  Step-by-step learning guides

- **[How-to Guides](./guides/)**  
  Accomplish specific tasks

- **[Architecture](./explanation/)**  
  Understand the system

</td>
</tr>
<tr>
<td>

### 📖 Reference
**Technical documentation**

- **[API Reference](./reference/api/)**  
  Complete API documentation

- **[Error Codes](./reference/error-codes.md)**  
  Error code reference

- **[Contributing](./reference/contributing/)**  
  Development guidelines

</td>
<td>

### 🎯 Popular Topics

- [RBAC System](./explanation/features/rbac.md)
- [OAuth Setup](./tutorials/setting-up-oauth.md)
- [User Management](./tutorials/managing-users-tutorial.md)
- [Docker Deployment](./guides/deployment/docker/)
- [VPS Database Setup](./guides/deployment/vps-postgresql-setup.md)

</td>
</tr>
</table>

---

## Documentation Structure

Our documentation follows the **Diátaxis framework** with four content types:

### 📘 [Tutorials](./tutorials/) - Learning-Oriented
Hands-on lessons that teach by doing. Perfect for beginners.

**Available tutorials:**
- [Your First Blog Post](./tutorials/your-first-blog-post.md) - 15 min
- [Managing Users and Roles](./tutorials/managing-users-tutorial.md) - 10 min
- [Setting Up OAuth](./tutorials/setting-up-oauth.md) - 20 min

---

### 📗 [Guides](./guides/) - Goal-Oriented
Step-by-step instructions to accomplish specific tasks.

**Guide categories:**
- **[Setup](./guides/setup/)** - Installation and configuration
- **[Authentication](./guides/authentication/)** - OAuth and auth setup
- **[Deployment](./guides/deployment/)** - Production deployment (Docker/Traefik, VPS, Cloud)
- **[Configuration](./guides/configuration/)** - Feature configuration
- **[Administration](./guides/administration/)** - Managing the system

---

### 📕 [Explanation](./explanation/) - Understanding-Oriented
Conceptual documentation that explains how things work.

**Topics covered:**
- **[Architecture](./explanation/architecture/)** - System design
- **[Features](./explanation/features/)** - Feature deep-dives
- **[RBAC System](./explanation/features/rbac.md)** - Role-based access control
- **[Blog Management](./explanation/features/posts-management.md)** - Editorial workflow

---

### 📙 [Reference](./reference/) - Information-Oriented
Technical specifications and API documentation.

**References available:**
- **[API Documentation](./reference/api/)** - All API endpoints
- **[Error Codes](./reference/error-codes.md)** - Error reference
- **[Contributing](./reference/contributing/)** - Development guidelines

---

## Find What You Need

### I want to...

**Get Started:**
- [Install Alif Pustaka](./quickstart.md)
- [Understand the architecture](./explanation/architecture/system-overview.md)
- [Learn the basics](./tutorials/)

**Setup Features:**
- [Enable OAuth login](./tutorials/setting-up-oauth.md)
- [Configure email service](./guides/configuration/email-service.md)
- [Setup image storage](./guides/configuration/cloudflare-r2.md)
- [Deploy with Docker + Traefik](./guides/deployment/docker/)
- [Deploy to VPS](./guides/deployment/vps-postgresql-setup.md)

**Manage Content:**
- [Create blog posts](./tutorials/your-first-blog-post.md)
- [Manage users](./tutorials/managing-users-tutorial.md)
- [Moderate comments](./guides/administration/moderation.md)
- [Configure roles](./explanation/features/rbac.md)

**Develop & Integrate:**
- [API Reference](./reference/api/)
- [Error Codes](./reference/error-codes.md)
- [Contributing Guide](./reference/contributing/)
- [Database Schema](./explanation/architecture/data-flow.md)

---

## What is Alif Pustaka?

Alif Pustaka is an enterprise-grade Content Management System built with Next.js, featuring:

- **8-Tier Role System** - Sophisticated role-based access control
- **Editorial Workflow** - Draft → Submit → Review → Publish
- **OAuth Integration** - Google and GitHub social login
- **Audit Logging** - Complete activity tracking
- **Discussion System** - Comment moderation and management
- **Gallery Management** - Cloudflare R2 image storage

**Technology Stack:**
- Next.js 16.2.9 (App Router)
- React 19.2.4
- TypeScript 5
- PostgreSQL + Prisma ORM
- Tailwind CSS v4
- Better Auth

---

## Key Features by Role

### For Content Creators (Authors)
- Create and edit blog posts with markdown
- Upload and manage images
- Submit posts for review
- Track post status

### For Editors
- Review submitted posts
- Approve or reject with feedback
- Publish approved content
- Manage tags and categories

### For Administrators
- **Super Admin**: Full system access
- **Content Admin**: Manage all content
- **User Admin**: Manage users and roles
- Comprehensive audit logging

---

## Documentation Navigation

### By Experience Level

**Beginner:**
1. [Quickstart Guide](./quickstart.md)
2. [Your First Blog Post Tutorial](./tutorials/your-first-blog-post.md)
3. [Managing Users Tutorial](./tutorials/managing-users-tutorial.md)

**Intermediate:**
1. [OAuth Setup Tutorial](./tutorials/setting-up-oauth.md)
2. [Setup Guides](./guides/setup/)
3. [RBAC System Explanation](./explanation/features/rbac.md)

**Advanced:**
1. [API Reference](./reference/api/)
2. [Architecture Documentation](./explanation/architecture/)
3. [Docker Deployment Guide](./guides/deployment/docker/)
4. [VPS Database Setup](./guides/deployment/vps-postgresql-setup.md)

### By Role

**For System Administrators:**
- [Installation Guide](./guides/setup/installation.md)
- [User Management](./tutorials/managing-users-tutorial.md)
- [Docker Deployment](./guides/deployment/docker/)
- [VPS PostgreSQL Setup](./guides/deployment/vps-postgresql-setup.md)
- [RBAC System](./explanation/features/rbac.md)

**For Content Managers:**
- [Your First Blog Post](./tutorials/your-first-blog-post.md)
- [Blog Management](./explanation/features/posts-management.md)
- [Moderation Guide](./guides/administration/moderation.md)

**For Developers:**
- [API Reference](./reference/api/)
- [Contributing Guidelines](./reference/contributing/)
- [Architecture Overview](./explanation/architecture/)
- [Error Codes](./reference/error-codes.md)

---

## Additional Resources

### Community & Support
- GitHub Repository: [alifpustaka-next-v1](https://github.com/yourusername/alifpustaka-next-v1)
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/alifpustaka-next-v1/issues)

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

### Archived Documentation
- **[Archive](./archive/)** - Historical documentation and deprecated approaches
- **[Sprint History](./sprints/)** - Development sprint reports

---

## Contributing to Documentation

Found an error or want to improve the docs?

1. Check [Contributing Guidelines](./reference/contributing/)
2. Follow [Commit Guidelines](./reference/contributing/commit-guidelines.md)
3. Submit a pull request

---

## Documentation Metadata

- **Total Documentation Files:** 50+
- **API Endpoints Documented:** 26+
- **Tutorials Available:** 3
- **Last Updated:** 2026-08-02
- **Documentation Version:** 2.0

---

**Need help?** Start with the [Quickstart Guide](./quickstart.md) or explore [Tutorials](./tutorials/).
