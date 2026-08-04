# Docker Deployment

Docker configuration for Alif Pustaka public site.

---

## Network Setup

This project uses two external networks:
- **alifpustaka-network** - Shared with admin app and other subdomain projects for internal communication
- **traefik-network** - For Traefik reverse proxy and SSL

**Why external?** Networks are created manually once and shared across multiple docker-compose projects. This allows:
- Multiple subdomain projects to communicate internally
- Networks persist when individual projects restart
- Clean separation between projects while maintaining connectivity

**Network driver:** Both use Docker's default **bridge** driver

### Create Networks (if not exist)

```bash
# Create networks before first deployment
docker network create alifpustaka-network
docker network create traefik-network

# Verify
docker network ls
# Both should show "bridge" as driver
```

See [NETWORK-SETUP.md](./NETWORK-SETUP.md) for complete explanation.

---

## Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher
- Networks created (`alifpustaka-network`, `traefik-network`)
- Traefik running on `traefik-network`
- Admin app running on `alifpustaka-network`

---

## Quick Start

### 1. Configure Environment

```bash
cp .env.production.example .env.production
# Edit .env.production with your settings
```

### 2. Build and Deploy

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f public-site
```

---

## Configuration

### docker-compose.yml

- **Container Name:** `alifpustaka-public-site`
- **Networks:** 
  - `alifpustaka-network` (internal communication with admin app)
  - `traefik-network` (Traefik routing)
- **Traefik Labels:** Configured for `alifpustaka.web.id`
- **Health Check:** `/api/health` endpoint
- **Restart Policy:** `unless-stopped`

### Important Notes

1. **Port Binding:** No direct port exposure - uses Traefik
2. **Admin App Communication:** Via `alifpustaka-network` using container names
3. **SSL:** Handled by Traefik with Let's Encrypt
4. **No Port Conflict:** Internal port 3000, no external binding

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

### Check Health
```bash
docker exec alifpustaka-public-site wget -qO- http://localhost:3000/api/health
```

### Enter Container Shell
```bash
docker exec -it alifpustaka-public-site sh
```

---

## Network Communication

### Admin App Connection

The public site connects to admin app using service name:

```env
# In .env.production
NEXT_PUBLIC_ADMIN_API_URL="http://alifpustaka-admin-app:3000"
# Or use public URL
NEXT_PUBLIC_ADMIN_API_URL="https://app.alifpustaka.web.id"
```

**Note:** If using container name, admin app must be on same `alifpustaka-network`.

---

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs public-site
```

### Can't reach admin app

1. Verify networks:
```bash
docker network inspect alifpustaka-network
docker network inspect traefik-network
```

2. Check admin app is running:
```bash
docker ps | grep admin-app
```

3. Test connection from container:
```bash
docker exec -it alifpustaka-public-site sh
wget -qO- http://alifpustaka-admin-app:3000/api/health
```

### Traefik not routing

1. Check Traefik logs:
```bash
docker logs traefik
```

2. Verify labels:
```bash
docker inspect alifpustaka-public-site | grep traefik
```

3. Ensure DNS points to Traefik host

---

## Complete Deployment Example

```bash
# 1. Create networks (if not exist)
docker network create alifpustaka-network
docker network create traefik-network

# 2. Deploy admin app first (in admin app directory)
cd /path/to/alifpustaka-next-app-v1
docker-compose up -d

# 3. Deploy public site (in this directory)
cd /path/to/alifpustaka-next-v1
cp .env.production.example .env.production
# Edit .env.production
docker-compose build
docker-compose up -d

# 4. Verify both running
docker ps | grep alifpustaka

# 5. Check health
curl https://alifpustaka.web.id/api/health
curl https://app.alifpustaka.web.id/api/health
```

---

## Documentation

For detailed guide, see [Docker Deployment Guide](./docs/deployment/docker.md)

---

**Last Updated:** 2026-08-04

