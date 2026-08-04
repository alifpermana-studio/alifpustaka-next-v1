# Production Deployment Guide

Deploy the Alif Pustaka public site to production.

---

## Prerequisites

Before deploying, ensure:

1. **Admin app is deployed and accessible**
   - Running at `app.yourdomain.com`
   - Public API endpoints implemented
   - CORS configured for public site

2. **Domain configured**
   - DNS records set up
   - SSL certificates ready (Let's Encrypt recommended)

3. **Environment variables prepared**
   - Production secrets generated
   - Admin API URL confirmed

---

## Deployment Options

### Option 1: Vercel (Recommended)

Easiest deployment for Next.js apps.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
vercel --prod
```

#### 4. Configure Environment Variables

In Vercel dashboard:

```env
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://yourdomain.com"
COOKIE_DOMAIN=".yourdomain.com"
NEXT_PUBLIC_ADMIN_API_URL="https://app.yourdomain.com"
BASE_URL="https://yourdomain.com"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
R2_PUBLIC_BASE_URL="img.yourdomain.com"
```

#### 5. Configure Domain

1. Add custom domain in Vercel
2. Update DNS records
3. SSL automatically provisioned

### Option 2: VPS with Docker

Deploy to your own VPS using Docker.

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  public-site:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - COOKIE_DOMAIN=${COOKIE_DOMAIN}
      - NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL}
      - BASE_URL=${BASE_URL}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    external: true
```

#### 3. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Traditional VPS

Deploy directly on a VPS without Docker.

#### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Install PM2

```bash
npm install -g pm2
```

#### 3. Clone and Build

```bash
git clone <your-repo-url>
cd alifpustaka-next-v1
npm install
npm run build
```

#### 4. Start with PM2

```bash
pm2 start npm --name "public-site" -- start
pm2 save
pm2 startup
```

#### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/yourdomain.com
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Setup SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check site is accessible
curl https://yourdomain.com

# Check API connection
curl https://yourdomain.com/api/auth/session
```

### 2. Test Authentication Flow

1. Visit public site
2. Click "Login"
3. Should redirect to admin app
4. Login and verify redirect back works

### 3. Test API Integration

1. Visit blog page
2. Verify posts load from admin API
3. Check browser console for errors

### 4. Monitor Performance

Use tools like:
- Google Lighthouse
- WebPageTest
- Vercel Analytics

---

## Environment Variables

### Production .env

```env
# Authentication (must match admin app)
BETTER_AUTH_SECRET="strong-random-secret-here"
BETTER_AUTH_URL="https://yourdomain.com"
COOKIE_DOMAIN=".yourdomain.com"

# API
NEXT_PUBLIC_ADMIN_API_URL="https://app.yourdomain.com"

# Site URLs
BASE_URL="https://yourdomain.com"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# CDN
R2_PUBLIC_BASE_URL="img.yourdomain.com"
```

### Security Checklist

- [ ] Use strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS on both domains
- [ ] Set `Secure` flag on cookies
- [ ] Configure CORS properly on admin app
- [ ] Never commit `.env.production` to git
- [ ] Restrict environment variable access

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: ${{ secrets.BETTER_AUTH_URL }}
          COOKIE_DOMAIN: ${{ secrets.COOKIE_DOMAIN }}
          NEXT_PUBLIC_ADMIN_API_URL: ${{ secrets.NEXT_PUBLIC_ADMIN_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Monitoring

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

### Error Tracking

Integrate error tracking (optional):

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Use Vercel Analytics or Google Analytics:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Rollback Strategy

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Docker

```bash
# Keep previous image
docker tag public-site:latest public-site:previous

# Rollback
docker-compose down
docker tag public-site:previous public-site:latest
docker-compose up -d
```

### PM2

```bash
# Save current version
git tag -a v1.0.0 -m "Release 1.0.0"

# Rollback
git checkout <previous-commit>
npm install
npm run build
pm2 restart public-site
```

---

## Scaling

### Horizontal Scaling

Deploy multiple instances behind load balancer:

```yaml
# docker-compose.yml
services:
  public-site-1:
    build: .
    ports:
      - "3001:3000"
  
  public-site-2:
    build: .
    ports:
      - "3002:3000"
  
  nginx:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - public-site-1
      - public-site-2
```

### CDN Integration

Use Cloudflare or similar CDN:

1. Point DNS to CDN
2. CDN proxies to origin server
3. Static assets cached at edge

---

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting.md)

---

## Next Steps

- [Environment Variables](./environment-variables.md)
- [Troubleshooting](./troubleshooting.md)

---

**Last Updated:** 2026-08-03
