# Prompt for Admin App Docker Configuration

Use this prompt in a new session for the admin app (`alifpustaka-next-app-v1`).

---

## Prompt:

I need to create Docker configuration and documentation for the Alif Pustaka admin app (alifpustaka-next-app-v1). This is the backend CMS with full database access, Prisma ORM, file storage, and complete API.

**Context:**
- This is the admin/backend app that serves API to the public site
- Runs on `app.alifpustaka.web.id` (or `http://localhost:3001` in dev)
- Has PostgreSQL database with Prisma ORM
- Has Cloudflare R2 for file storage
- Has Better Auth with full authentication server
- Has email sending via Brevo/SMTP
- Provides public API endpoints at `/api/public/*`

**Required Tasks:**

### 1. Create/Update Dockerfile

Create a production-ready Dockerfile that:
- Uses Node.js 20-alpine base image
- Multi-stage build (deps, builder, runner)
- Runs `npx prisma generate` in builder stage
- Includes Prisma client in final image
- Copies `node_modules/.prisma` and `prisma/` directories
- Runs as non-root user (nextjs:1001)
- Enables standalone output
- Exposes port 3000

**Important:** Include Prisma generate and copy Prisma files (unlike public site).

### 2. Create Docker Compose Configurations

Create **single** docker-compose file:

**docker-compose.yml (Traefik + PostgreSQL)**
- Admin app service with build args for all environment variables
- PostgreSQL service (version 16-alpine)
- Persistent volumes for database
- Traefik labels for `app.alifpustaka.web.id`
- **Two networks:** `alifpustaka-network` and `traefik-network` (both external)
- Health checks for both services
- Environment variables via .env.production
- Container name: `alifpustaka-admin-app`
- No port binding (uses Traefik)

**Important network configuration:**
```yaml
networks:
  alifpustaka-network:
    external: true
  traefik-network:
    external: true
```

Both networks must be created before deployment:
```bash
docker network create alifpustaka-network
docker network create traefik-network
```

### 3. Update/Create Configuration Files

**A. Update .dockerignore**
```
node_modules
.next
.git
.env.local
.env*.local
coverage
.vscode
*.md
!README.md
```

**B. Update next.config.ts**
Ensure `output: "standalone"` is set for Docker.

**C. Create scripts/wait-for-postgres.sh**
Script to wait for PostgreSQL before starting app.

**D. Update .env.production.example**
Add all required variables including:
- BETTER_AUTH_SECRET
- DATABASE_URL (with Docker service name)
- SMTP credentials
- R2 credentials
- Public site URL for CORS

### 4. Create Health Check Endpoint

Create `/api/health/route.ts` that checks:
- Application status
- Database connection (Prisma)
- Returns JSON with status and timestamp

Example:
```typescript
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

### 6. Create Docker Documentation

Create `docs/deployment/docker.md` with:

**Content to include:**
- Prerequisites (Docker 20+, Docker Compose 2+, networks)
- Network setup (alifpustaka-network, traefik-network)
- Quick start guide
- Traefik deployment with PostgreSQL
- Build instructions with proper build args
- Database migration steps
- Environment variable configuration
- Volume management (database persistence)
- Backup and restore procedures
- Health check usage
- Troubleshooting common issues
- Security best practices
- Resource limits and optimization
- Logging and monitoring
- SSL certificate setup (Traefik automatic)

**Sections:**
1. Overview
2. Prerequisites
3. Network Setup
4. Quick Start
5. Database Setup
6. Environment Variables
7. Build Process
8. Running Migrations
9. Health Checks
10. Backup & Restore
11. Scaling
12. Troubleshooting
13. Security
14. Performance Tuning

### 7. Create NETWORK-SETUP.md (Quick Reference)

Create root-level `NETWORK-SETUP.md` with:
- Instructions to create required networks
- Verification commands
- Network usage explanation
- Links to documentation

### 8. Create DOCKER.md (Quick Reference)

Create root-level `DOCKER.md` with:
- Overview of Docker configuration
- Network requirements
- Quick command reference
- Common tasks (build, start, stop, logs, migrations)
- Links to full documentation

### 9. Update README.md

Add Docker deployment section with:
- Network setup instructions
- Quick start for Docker
- Link to docker-compose.yml
- Link to full Docker documentation

### 10. Create Migration Script

Create `scripts/docker-migrate.sh`:
```bash
#!/bin/bash
# Wait for database, then run migrations
./scripts/wait-for-postgres.sh
npx prisma migrate deploy
npx prisma generate
```

### 11. Database Configuration

Ensure DATABASE_URL in docker-compose uses Docker service name:
```
DATABASE_URL="postgresql://postgres:password@postgres:5432/alifpustaka_db"
```

Not `localhost` - use service name `postgres`.

### 10. Important Differences from Public Site

The admin app Dockerfile MUST:
- ✅ Include `npx prisma generate` in build
- ✅ Copy Prisma files to final image
- ✅ Include database connection
- ✅ Run migrations on startup (optional script)
- ✅ Include all backend dependencies
- ✅ Have health check that tests database
- ✅ PostgreSQL service in docker-compose
- ✅ Volume for database persistence
- ✅ Proper backup strategy documented

The public site does NOT have these (already done).

---

## Expected Output:

After completion, I should have:

### Files Created/Updated:
1. `Dockerfile` (with Prisma support)
2. `docker-compose.yml` (Traefik + PostgreSQL)
3. `docker-compose.standalone.yml` (Direct ports)
4. `docker-compose.full.yml` (Complete stack)
5. `.dockerignore` (updated)
6. `next.config.ts` (with standalone output)
7. `scripts/wait-for-postgres.sh` (DB wait script)
8. `scripts/docker-migrate.sh` (Migration script)
9. `src/app/api/health/route.ts` (Health endpoint)
10. `docs/deployment/docker.md` (Complete guide)
11. `DOCKER.md` (Quick reference)
12. `README.md` (updated with Docker section)
13. `.env.production.example` (updated for Docker)

### Documentation:
- Complete Docker deployment guide
- All three deployment methods documented
- Database setup and migration procedures
- Backup and restore procedures
- Troubleshooting guide
- Security best practices

---

## Validation:

After implementation, verify:

```bash
# Build should succeed
docker-compose build

# Should start without errors
docker-compose up -d

# Health check should return OK with database connected
curl http://localhost:3001/api/health

# Database should be accessible
docker-compose exec postgres psql -U postgres -d alifpustaka_db -c "SELECT 1"

# Migrations should run
docker-compose exec admin-app npx prisma migrate deploy

# Logs should show no errors
docker-compose logs -f admin-app
```

---

## Additional Notes:

1. **Database Persistence:** Use named volumes for PostgreSQL data
2. **Secrets Management:** Use Docker secrets or .env.production
3. **CORS:** Configure to allow public site domain
4. **Network:** Create shared network for admin and public site if both in Docker
5. **Backup:** Document automated backup strategy using pg_dump
6. **SSL:** Support both Traefik (auto) and manual certificate methods
7. **Monitoring:** Include logging and monitoring recommendations

---

## Example DATABASE_URL for Docker:

```env
# ✓ Correct (Docker service name)
DATABASE_URL="postgresql://postgres:securepassword@postgres:5432/alifpustaka_db"

# ✗ Incorrect (localhost won't work in container)
DATABASE_URL="postgresql://postgres:password@localhost:5432/alifpustaka_db"

# ✗ Incorrect (host.docker.internal is for special cases)
DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/alifpustaka_db"
```

---

Please implement all of the above, ensuring the admin app Docker setup is production-ready with database support, migrations, health checks, and complete documentation. Follow the same documentation quality and organization as the public site.

**Start with Dockerfile, then docker-compose files, then documentation.**
