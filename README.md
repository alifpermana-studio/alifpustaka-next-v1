# Alif Pustaka - Next.js CMS

Enterprise-grade Content Management System with role-based access control, editorial workflow, and OAuth integration.

---

## Features

- **8-Tier Role System** - Sophisticated RBAC from Guest to Super Admin
- **Editorial Workflow** - Draft → Submit → Review → Publish
- **OAuth Integration** - Google and GitHub social login
- **Audit Logging** - Complete activity tracking
- **Discussion System** - Comment moderation and management
- **Gallery Management** - Cloudflare R2 image storage

---

## Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd alifpustaka-next-v1
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma migrate deploy

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Documentation

**Complete documentation:** [docs/README.md](./docs/README.md)

**Quick Links:**
- [Quickstart Guide](./docs/quickstart.md)
- [Installation Guide](./docs/guides/setup/installation.md)
- [Docker Deployment](./docs/guides/deployment/docker/)
- [API Reference](./docs/reference/api/)

---

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth
- **Styling:** Tailwind CSS v4
- **Storage:** Cloudflare R2

---

## Deployment

### Docker + Traefik (Recommended)
Automated deployment with SSL and multi-project support.

See [Docker Deployment Guide](./docs/guides/deployment/docker/)

### Traditional VPS
Manual setup with PM2 and Nginx.

See [VPS Deployment Guide](./docs/guides/deployment/vps-postgresql-setup.md)

---

## Project Structure

```
alifpustaka-next-v1/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/           # Utilities and helpers
│   └── generated/     # Prisma client
├── prisma/
│   └── schema/        # Database schema
├── docs/              # Documentation
├── public/            # Static assets
└── docker-compose.yml # Docker configuration
```

---

## Contributing

See [Contributing Guidelines](./docs/reference/contributing/)

---

## License

[Your License Here]

---

## Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/alifpustaka-next-v1/issues)

---

**Last Updated:** 2026-08-02
