# Traefik Deployment Guide - Complete Steps

Complete step-by-step guide for deploying Alif Pustaka with Docker and Traefik.

---

## Overview

This guide walks you through deploying your Next.js application using:
- **Docker** for containerization
- **Traefik** for automatic reverse proxy and SSL
- **Existing PostgreSQL** container (no migration needed)

**Time Required:** 30-45 minutes

---

### 1. VPS Prerequisites
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create Traefik network (shared by all projects)
docker network create traefik-network

# Log out and log back in for group changes to take effect
```

### 2. Verify PostgreSQL is Running
```bash
# Check your existing PostgreSQL container
docker ps | grep postgres

# If not running, start it
docker start <your-postgres-container-name>
```

### 3. Setup Traefik (One-time, shared by all projects)
```bash
cd ~
mkdir traefik
cd traefik

# Download traefik docker-compose file
# (Copy content from traefik-docker-compose.yml to docker-compose.yml)

# Update email in docker-compose.yml
nano docker-compose.yml
# Change: your-email@example.com to your actual email

# Generate dashboard password (optional, for Traefik UI)
sudo apt install apache2-utils
htpasswd -nb admin your-password
# Copy the output and replace the basicauth.users value in docker-compose.yml

# Start Traefik
docker-compose up -d

# Check Traefik is running
docker ps | grep traefik
docker logs traefik
```

### 4. Clone & Setup Your Project
```bash
cd ~
git clone <your-repo-url> your-project-name
cd your-project-name

# Create production env file
cp .env.production.example .env.production
nano .env.production  # Fill in real values with your actual credentials
```

### 5. Build & Deploy Your App
```bash
# Build and start app
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Check logs
docker-compose logs -f app

# Check Traefik dashboard (optional)
# Visit: https://traefik.your-domain.com (username: admin, password: what you set)
```

### 6. Verify SSL & Routing
```bash
# Check if SSL certificate is obtained
docker logs traefik | grep your-domain

# Test your site
curl -I https://your-domain.com
```

### 7. Update OAuth Redirect URIs
Update in Google & GitHub OAuth apps:
- Callback URL: `https://your-domain.com/api/auth/callback/google`
- Callback URL: `https://your-domain.com/api/auth/callback/github`

### 8. Maintenance Commands

**App maintenance:**
```bash
cd ~/your-project-name

# View logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Deploy updates
git pull
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
docker-compose restart app
```

**Traefik maintenance:**
```bash
cd ~/traefik

# View Traefik logs
docker-compose logs -f

# Restart Traefik
docker-compose restart

# Check all routes
docker logs traefik
```

**Database backup:**
```bash
# Backup (from your existing PostgreSQL container)
docker exec <your-postgres-container-name> pg_dump -U <username> <database_name> > backup.sql

# Restore
docker exec -i <your-postgres-container-name> psql -U <username> <database_name> < backup.sql
```

### 9. Adding More Projects
```bash
# For each new project:
cd ~
git clone <new-project-repo> project2
cd project2

# Add same Traefik labels to docker-compose.yml:
# labels:
#   - "traefik.enable=true"
#   - "traefik.http.routers.project2.rule=Host(`project2.com`)"
#   - "traefik.http.routers.project2.entrypoints=websecure"
#   - "traefik.http.routers.project2.tls.certresolver=letsencrypt"
#   - "traefik.http.services.project2.loadbalancer.server.port=3000"

docker-compose up -d --build
# Traefik automatically detects and routes the new project!
```

### 10. Security Checklist
- [ ] Setup firewall: `sudo ufw allow 22,80,443,8080/tcp && sudo ufw enable`
- [ ] Disable root SSH login in `/etc/ssh/sshd_config`
- [ ] Use SSH keys instead of passwords
- [ ] Never commit `.env.production`
- [ ] Setup automated database backups (cron job)
- [ ] Secure Traefik dashboard with strong password
- [ ] Monitor logs: `docker-compose logs -f`

## Why Traefik?

### Benefits:
✅ **Automatic SSL** - No manual certbot commands, auto-renewal
✅ **Auto-discovery** - Add new projects by just running docker-compose up
✅ **No config files** - Everything defined in Docker labels
✅ **Dashboard** - Web UI to monitor all routes and services
✅ **Multiple projects** - One Traefik instance handles all domains
✅ **Zero-downtime** - Hot reload when containers change

### Comparison with Nginx:

| Feature | Nginx (Manual) | Traefik (Auto) |
|---------|----------------|----------------|
| Add new project | Edit nginx.conf, reload | docker-compose up (auto-detected) |
| SSL certificates | Manual certbot | Automatic from Let's Encrypt |
| Configuration | Separate nginx.conf file | Docker labels in each project |
| Monitoring | None (manual logs) | Built-in dashboard |
| Best for | 1-2 projects, manual control | 3+ projects, automation |

### When to Use Traefik:
- You plan to host multiple projects (2+ domains)
- You want automatic SSL management
- You deploy frequently and want automation
- You want a dashboard to monitor services

### Stick with Nginx if:
- You only have 1 static project
- You need advanced Nginx-specific features
- You prefer complete manual control
