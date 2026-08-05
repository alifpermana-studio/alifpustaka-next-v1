# Docker Deployment Guide

Deploy the Alif Pustaka public site using Docker with Traefik and shared networks.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    traefik-network                           │
│                                                              │
│  ┌──────────┐         ┌──────────────┐      ┌──────────────┐ │
│  │ Traefik  │────────►│ Alif Pustaka |      | Alif Pustaka | |
|  │          │         |    Main      |      |     App      │ │
│  │  (SSL)   │         │   (this)     │      │              │ │
│  └──────────┘         └──────┬───────┘      └───────┬──────┘ │
│                              │                      │        │
└──────────────────────────────┼──────────────────────┼────────┘
                               │                      │
              ┌────────────────┴──────────────────────┴────────┐
              │            alifpustaka-network                 │
              │   (Internal communication between apps)        │
              └────────────────────────────────────────────────┘
```

---

## Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher
- Traefik already running
- Admin app deployed

---

## Network Setup

### Why External Networks?

Both networks are marked as `external: true` because:

1. **Multi-Project Setup**
   - Public site, admin app, and other subdomain projects share the same network
   - Each project has its own docker-compose file
   - Networks persist across project restarts

2. **Bridge Driver (Default)**
   - Both networks use Docker's bridge driver
   - Created manually once: `docker network create alifpustaka-network`
   - Provides automatic DNS resolution between containers

3. **Benefits**
   - **Persistent:** Networks survive `docker-compose down`
   - **Shared:** Multiple projects can join same network
   - **Organized:** Clear separation of concerns

### Network Roles

**alifpustaka-network:**

- Internal communication between Alif Pustaka projects
- Bridge driver, manually created, external
- Containers: public-site, admin-app, postgres, other subdomains
- Example: `http://alifpustaka-admin-app:3000/api/health`

**traefik-network:**

- External routing and SSL termination
- Bridge driver, manually created, external
- Containers: traefik, public-site, admin-app, other web services
- Traefik routes to containers based on labels

### Create External Networks

**Run these commands once before deployment:**

```bash
# Create shared internal network
docker network create alifpustaka-network

# Create Traefik routing network
docker network create traefik-network

# Verify (both use bridge driver by default)
docker network ls
docker network inspect alifpustaka-network
docker network inspect traefik-network
```

See [NETWORK-SETUP.md](../NETWORK-SETUP.md) for detailed explanation.

---

## Configuration

### 1. Environment Variables

Create `.env.production`:

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:

```env
# Authentication (must match admin app)
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://alifpustaka.web.id"
COOKIE_DOMAIN=".alifpustaka.web.id"

# Admin API URL
# Option 1: Use public URL (recommended)
NEXT_PUBLIC_ADMIN_API_URL="https://app.alifpustaka.web.id"

# Option 2: Use container name (must be on alifpustaka-network)
# NEXT_PUBLIC_ADMIN_API_URL="http://alifpustaka-admin-app:3000"

# Public site URLs
BASE_URL="https://alifpustaka.web.id"
NEXT_PUBLIC_BASE_URL="https://alifpustaka.web.id"

# CDN
R2_PUBLIC_BASE_URL="img.alifpustaka.web.id"
```

### 2. Docker Compose

The `docker-compose.yml` is configured for:

- **Networks:** Both `alifpustaka-network` and `traefik-network`
- **Container Name:** `alifpustaka-public-site`
- **Internal Port:** 3000 (no external binding)
- **Traefik Routing:** `alifpustaka.web.id`
- **Health Check:** Enabled
- **Restart Policy:** `unless-stopped`

---

## Deployment Steps

### Step 1: Verify Prerequisites

```bash
# Check Traefik is running
docker ps | grep traefik

# Check admin app is running
docker ps | grep admin-app

# Check networks exist
docker network ls | grep -E 'alifpustaka|traefik'
```

### Step 2: Build Image

```bash
docker-compose build
```

**Build arguments are automatically passed:**

- All environment variables from `.env.production`
- Build optimized for production

### Step 3: Deploy

```bash
docker-compose up -d
```

### Step 4: Verify Deployment

```bash
# Check container is running
docker ps | grep public-site

# Check logs
docker-compose logs -f public-site

# Check health
docker exec alifpustaka-public-site wget -qO- http://localhost:3000/api/health
```

Expected health response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-04T...",
  "service": "alifpustaka-public-site"
}
```

### Step 5: Test Access

```bash
# Via Traefik (should work)
curl https://alifpustaka.web.id/api/health

# Test blog page
curl https://alifpustaka.web.id/
```

---

## Network Communication

### Internal Communication (alifpustaka-network)

Public site can reach admin app via container name:

```bash
# From public site container
docker exec -it alifpustaka-public-site sh
wget -qO- http://alifpustaka-admin-app:3000/api/health
```

**Note:** Admin app container must be named `alifpustaka-admin-app` and on `alifpustaka-network`.

### External Communication (traefik-network)

Traefik routes external requests:

- `alifpustaka.web.id` → Public Site
- `app.alifpustaka.web.id` → Admin App

---

## Management Commands

### View Logs

```bash
docker-compose logs -f public-site

# Last 100 lines
docker-compose logs --tail=100 public-site
```

### Restart Container

```bash
docker-compose restart public-site
```

### Stop Container

```bash
docker-compose down
```

### Rebuild

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Shell Access

```bash
docker exec -it alifpustaka-public-site sh
```

### Check Health

```bash
docker exec alifpustaka-public-site wget -qO- http://localhost:3000/api/health
```

---

## Traefik Configuration

### Labels Explained

```yaml
labels:
  # Enable Traefik for this container
  - "traefik.enable=true"

  # Router configuration
  - "traefik.http.routers.public-site.rule=Host(`alifpustaka.web.id`)"
  - "traefik.http.routers.public-site.entrypoints=websecure"
  - "traefik.http.routers.public-site.tls.certresolver=letsencrypt"

  # Service configuration
  - "traefik.http.services.public-site.loadbalancer.server.port=3000"

  # Network (tells Traefik which network to use)
  - "traefik.docker.network=traefik-network"
```

### SSL Certificates

Traefik automatically:

1. Requests SSL certificate from Let's Encrypt
2. Stores in Traefik's acme.json
3. Auto-renews before expiry
4. Handles HTTP → HTTPS redirect

**No manual SSL configuration needed!**

---

## Complete Deployment Example

### Full Stack Setup

```bash
# 1. Create networks (once)
docker network create alifpustaka-network
docker network create traefik-network

# 2. Deploy Traefik (if not already running)
# ... (Traefik deployment)

# 3. Deploy admin app
cd /path/to/alifpustaka-next-app-v1
docker-compose up -d

# 4. Deploy public site
cd /path/to/alifpustaka-next-v1
cp .env.production.example .env.production
# Edit .env.production
docker-compose build
docker-compose up -d

# 5. Verify all containers
docker ps

# 6. Test health checks
curl https://alifpustaka.web.id/api/health
curl https://app.alifpustaka.web.id/api/health

# 7. Test authentication flow
# Visit https://alifpustaka.web.id
# Click "Login"
# Should redirect to admin, then back
```

---

## Troubleshooting

### Container won't start

**Check logs:**

```bash
docker-compose logs public-site
```

**Common issues:**

- Missing environment variables
- Build failed
- Port conflicts (shouldn't happen with Traefik)

### Can't reach admin app

**Test from container:**

```bash
docker exec -it alifpustaka-public-site sh
wget -qO- http://alifpustaka-admin-app:3000/api/health
# Or try public URL
wget -qO- https://app.alifpustaka.web.id/api/health
```

**Check:**

1. Admin app is running: `docker ps | grep admin`
2. Both on `alifpustaka-network`: `docker network inspect alifpustaka-network`
3. Container name matches in `NEXT_PUBLIC_ADMIN_API_URL`

### Traefik not routing

**Check Traefik sees the service:**

```bash
docker logs traefik | grep public-site
```

**Verify container is on traefik-network:**

```bash
docker network inspect traefik-network
```

**Check DNS:**

```bash
nslookup alifpustaka.web.id
# Should point to your server IP
```

**Verify Traefik labels:**

```bash
docker inspect alifpustaka-public-site | grep traefik
```

### SSL certificate issues

**Check Traefik logs:**

```bash
docker logs traefik | grep letsencrypt
```

**Common issues:**

- DNS not pointing to server
- Port 80/443 not open
- Rate limit reached (Let's Encrypt)

**Solution:** Wait or use staging endpoint first.

### Session not shared

**Verify:**

1. Both apps use same `BETTER_AUTH_SECRET`
2. Both use same `COOKIE_DOMAIN=".alifpustaka.web.id"`
3. Both apps accessible via HTTPS
4. Cookie domain includes subdomain

### Network issues

**Inspect networks:**

```bash
# Check alifpustaka-network
docker network inspect alifpustaka-network

# Check traefik-network
docker network inspect traefik-network
```

**Reconnect container to network:**

```bash
docker network connect alifpustaka-network alifpustaka-public-site
docker network connect traefik-network alifpustaka-public-site
```

---

## Production Checklist

- [ ] Networks created (`alifpustaka-network`, `traefik-network`)
- [ ] Traefik running and configured
- [ ] Admin app deployed and accessible
- [ ] `.env.production` configured correctly
- [ ] `BETTER_AUTH_SECRET` matches admin app
- [ ] `COOKIE_DOMAIN` set to `.alifpustaka.web.id`
- [ ] DNS records point to server
- [ ] Build completes without errors
- [ ] Container starts successfully
- [ ] Health check returns OK
- [ ] Traefik routes traffic correctly
- [ ] SSL certificate issued
- [ ] Can access via HTTPS
- [ ] Authentication flow works
- [ ] Session shared between apps

---

## Monitoring

### Container Stats

```bash
docker stats alifpustaka-public-site
```

### Logs in Real-time

```bash
docker-compose logs -f --tail=50 public-site
```

### Health Monitoring

```bash
# Add to cron
*/5 * * * * curl -sf https://alifpustaka.web.id/api/health || alert
```

---

## Backup

### Container doesn't store data

No backup needed - container is stateless.

**What to backup:**

- `.env.production` (encrypted)
- `docker-compose.yml`
- Source code (git repository)

---

## Updates

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose down
docker-compose build
docker-compose up -d

# Verify
curl https://alifpustaka.web.id/api/health
```

### Update Dependencies

```bash
# Update package.json
npm update

# Rebuild Docker image
docker-compose build --no-cache
docker-compose up -d
```

---

## Security Best Practices

1. **Environment Variables:** Never commit `.env.production`
2. **Networks:** Use separate networks for isolation
3. **User:** Container runs as non-root (nextjs:1001)
4. **HTTPS Only:** Traefik enforces HTTPS
5. **Health Checks:** Monitor application status
6. **Restart Policy:** Auto-restart on failure
7. **Secrets:** Use Docker secrets for sensitive data (optional)

---

## Performance

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  public-site:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

### Image Size

Current image: ~100-150MB (optimized multi-stage build)

---

## Next Steps

- [Environment Variables Reference](./environment-variables.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Production Deployment](./production.md)

---

**Last Updated:** 2026-08-04

---

## Dockerfile Overview

The Dockerfile uses multi-stage builds for optimization:

### Stage 1: Dependencies

```dockerfile
FROM node:20-alpine AS deps
COPY package*.json ./
RUN npm ci
```

### Stage 2: Builder

```dockerfile
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

### Stage 3: Runner

```dockerfile
FROM base AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

---

## Docker Compose Configuration

### Standalone Deployment

If admin app is deployed separately:

```yaml
version: "3.8"

services:
  public-site:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
        - NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL}
    container_name: alifpustaka-public-site
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: ${BETTER_AUTH_URL}
      COOKIE_DOMAIN: ${COOKIE_DOMAIN}
      NEXT_PUBLIC_ADMIN_API_URL: ${NEXT_PUBLIC_ADMIN_API_URL}
      BASE_URL: ${BASE_URL}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
    env_file:
      - .env.production
```

### With Traefik

For automatic SSL with Traefik:

```yaml
services:
  public-site:
    # ... build config ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.public-site.rule=Host(`alifpustaka.web.id`)"
      - "traefik.http.routers.public-site.entrypoints=websecure"
      - "traefik.http.routers.public-site.tls.certresolver=letsencrypt"
      - "traefik.http.services.public-site.loadbalancer.server.port=3000"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

---

## Build Arguments

Pass environment variables at build time:

```bash
docker build \
  --build-arg BETTER_AUTH_SECRET="your-secret" \
  --build-arg NEXT_PUBLIC_ADMIN_API_URL="https://app.domain.com" \
  -t alifpustaka-public-site .
```

---

## Management Commands

### View Logs

```bash
docker-compose logs -f public-site
```

### Restart Container

```bash
docker-compose restart public-site
```

### Stop Container

```bash
docker-compose down
```

### Rebuild and Restart

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Enter Container Shell

```bash
docker exec -it alifpustaka-public-site sh
```

---

## Production Checklist

- [ ] `.env.production` configured with production values
- [ ] `BETTER_AUTH_SECRET` matches admin app
- [ ] `COOKIE_DOMAIN` set correctly (`.domain.com`)
- [ ] Admin app accessible at `NEXT_PUBLIC_ADMIN_API_URL`
- [ ] Domain DNS configured
- [ ] SSL certificates configured (via Traefik or reverse proxy)
- [ ] Firewall rules configured
- [ ] Container health checks enabled

---

## Troubleshooting

### Container fails to start

Check logs:

```bash
docker-compose logs public-site
```

### API connection fails

1. Verify admin app is accessible from container:

```bash
docker exec -it alifpustaka-public-site sh
wget https://app.domain.com/api/public/posts
```

2. Check network configuration

3. Verify environment variables:

```bash
docker exec -it alifpustaka-public-site env | grep NEXT_PUBLIC
```

### Build fails

Clear Docker cache and rebuild:

```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## Health Checks

Add health check to docker-compose.yml:

```yaml
services:
  public-site:
    # ... other config ...
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--quiet",
          "--tries=1",
          "--spider",
          "http://localhost:3000/api/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Create health endpoint in `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: "ok" });
}
```

---

## Performance Optimization

### Multi-stage Build Benefits

- Smaller final image (~100MB vs 1GB+)
- No build tools in production
- Faster deployments

### Resource Limits

```yaml
services:
  public-site:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

---

## Security

### Non-root User

Container runs as `nextjs` user (UID 1001), not root.

### Read-only Filesystem

```yaml
services:
  public-site:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
```

### Network Isolation

Use Docker networks to isolate services.

---

## Next Steps

- [Production Deployment](../deployment/production.md)
- [Environment Variables](../deployment/environment-variables.md)
- [Troubleshooting](../deployment/troubleshooting.md)

---

**Last Updated:** 2026-08-03
