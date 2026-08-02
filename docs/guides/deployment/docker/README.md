# Docker Deployment with Traefik

Complete guide for deploying Alif Pustaka using Docker and Traefik reverse proxy.

---

## What You'll Deploy

- **Traefik**: Automatic reverse proxy with SSL
- **Next.js App**: Your application in Docker
- **PostgreSQL**: Existing container (reused)

**Benefits:**
- Automatic SSL certificates from Let's Encrypt
- Zero-downtime deployments
- Easy scaling to multiple projects
- Built-in monitoring dashboard

---

## Prerequisites

- Ubuntu VPS (20.04+) with 2GB+ RAM
- Docker & Docker Compose installed
- Domain name pointed to VPS IP
- Existing PostgreSQL Docker container

---

## Architecture

```
Internet (HTTPS)
    ↓
Traefik (Port 80/443)
    ↓ (Auto SSL + Routing)
    ├─→ App 1 (alifpustaka.web.id)
    ├─→ App 2 (api.yourdomain.com)
    └─→ PostgreSQL (existing container)
```

**Key Features:**
- One Traefik instance handles all domains
- Automatic SSL certificate generation
- Service discovery via Docker labels
- No manual nginx configuration needed

---

## Files Required

All files are included in your project:

1. **`Dockerfile`** - Multi-stage Next.js build
2. **`docker-compose.yml`** - App configuration with Traefik labels
3. **`docker/traefik-docker-compose.yml`** - Traefik setup
4. **`.dockerignore`** - Build optimization
5. **`.env.production.example`** - Environment template

---

## Quick Start

### 1. Install Docker on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create shared network
docker network create traefik-network

# Log out and back in for group changes
exit
```

### 2. Verify PostgreSQL is Running

```bash
# Check existing PostgreSQL container
docker ps | grep postgres

# If not running, start it
docker start <your-postgres-container-name>
```

### 3. Setup Traefik (One-time)

```bash
cd ~
mkdir traefik
cd traefik

# Copy traefik-docker-compose.yml from docs/guides/deployment/docker/
# or create docker-compose.yml with content from the file

# Update email for Let's Encrypt
nano docker-compose.yml
# Change: your-email@example.com

# Generate dashboard password (optional)
sudo apt install apache2-utils -y
htpasswd -nb admin YourSecurePassword
# Copy output and replace basicauth.users line in docker-compose.yml

# Start Traefik
docker-compose up -d

# Verify running
docker ps | grep traefik
docker logs traefik
```

### 4. Deploy Your Application

```bash
cd ~
git clone <your-repo-url> your-project-name
cd your-project-name

# Create production environment file
cp .env.production.example .env.production
nano .env.production
# Fill in all values with your actual credentials

# Update docker-compose.yml labels with your domain
nano docker-compose.yml
# Change: your-domain.com → alifpustaka.web.id

# Build and deploy
docker-compose up -d --build

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Check logs
docker-compose logs -f app
```

### 5. Verify SSL & Access

```bash
# Check Traefik obtained SSL certificate
docker logs traefik | grep your-domain

# Test your site
curl -I https://your-domain.com

# Access Traefik dashboard (optional)
# Visit: https://traefik.your-domain.com
# Login with credentials you set
```

---

## Full Deployment Guide

See **[traefik-deployment.md](./traefik-deployment.md)** for:
- Complete step-by-step instructions
- OAuth configuration
- Maintenance commands
- Adding more projects
- Troubleshooting

---

## Adding More Projects

Once Traefik is set up, adding new projects is simple:

```bash
cd ~
git clone <project2-repo> project2
cd project2

# Add Traefik labels to docker-compose.yml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.project2.rule=Host(`project2.com`)"
  - "traefik.http.routers.project2.entrypoints=websecure"
  - "traefik.http.routers.project2.tls.certresolver=letsencrypt"
  - "traefik.http.services.project2.loadbalancer.server.port=3000"

# Deploy
docker-compose up -d --build

# Traefik automatically detects and routes!
```

---

## Maintenance

### Update Application

```bash
cd ~/your-project-name
git pull
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
docker-compose restart app
```

### View Logs

```bash
# App logs
docker-compose logs -f app

# Traefik logs
cd ~/traefik
docker-compose logs -f
```

### Backup Database

```bash
docker exec <postgres-container> pg_dump -U username dbname > backup.sql
```

---

## Why Docker + Traefik?

### vs PM2 + Nginx

| Feature | Docker + Traefik | PM2 + Nginx |
|---------|------------------|-------------|
| SSL Setup | Automatic | Manual certbot |
| Add Project | docker-compose up | Edit nginx.conf |
| Scaling | Easy (replicas) | Manual |
| Isolation | Full container | Process level |
| Rollback | Image tags | Git checkout |

### When to Use This Setup

✅ **Use Docker + Traefik when:**
- Hosting 2+ projects on same VPS
- Want automatic SSL management
- Need easy rollbacks and versioning
- Plan to scale applications

❌ **Use PM2 + Nginx when:**
- Single project only
- Need specific Nginx features
- Prefer manual control
- Minimal resource usage critical

---

## Related Documentation

- **[traefik-deployment.md](./traefik-deployment.md)** - Complete deployment steps
- **[VPS PostgreSQL Setup](../vps-postgresql-setup.md)** - Database setup
- **[Production Deployment](../production-deployment.md)** - General deployment checklist

---

**Last Updated:** 2026-08-02
