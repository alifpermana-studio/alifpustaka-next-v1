# Deployment Guides

Deploy Alif Pustaka to production environments.

---

## Overview

This section covers production deployment, VPS setup, environment configuration, and migration strategies.

---

## Available Guides

### [Production Deployment](./production-deployment.md)
Comprehensive production deployment checklist.

**What you'll accomplish:**
- Pre-deployment verification
- Environment configuration
- Database migration
- Application deployment
- Post-deployment testing
- Rollback procedures

**Use this when:** Deploying to production for the first time or updating production.

---

### [VPS PostgreSQL Setup](./vps-postgresql-setup.md)
Complete guide for self-hosted PostgreSQL on VPS.

**What you'll accomplish:**
- Configure OVHCloud VPS
- Install and secure PostgreSQL
- Setup SSH tunnel access
- Migrate from Supabase
- Configure daily workflow
- Implement backup strategy

**Use this when:** Setting up self-hosted database or migrating from managed services.

---

### [VPS Migration Summary](./VPS-MIGRATION-SUMMARY.md)
Summary of migration from Supabase to VPS PostgreSQL.

**What you'll find:**
- Migration timeline
- Key decisions
- Lessons learned
- Performance comparison

**Use this when:** Planning a database migration.

---

## Deployment Options

### Option 1: Vercel + Supabase (Easiest)
- Deploy Next.js app to Vercel
- Use Supabase for PostgreSQL
- Automatic deployments from Git
- Free tier available

**Best for:** Quick deployments, small projects, testing

### Option 2: VPS + Self-hosted PostgreSQL (Cost-effective)
- Full control over infrastructure
- Lower long-term costs
- SSH tunnel for security
- Requires server management

**Best for:** Production applications, cost optimization

### Option 3: Cloud Provider (AWS/GCP/Azure)
- Scalable infrastructure
- Managed services available
- Higher costs
- Enterprise features

**Best for:** Large-scale applications, enterprise requirements

---

## Pre-Deployment Checklist

### Code & Tests
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] Environment variables documented

### Database
- [ ] Migrations tested
- [ ] Backup strategy in place
- [ ] Connection string secured
- [ ] Indexes optimized

### Security
- [ ] Secrets not committed to Git
- [ ] Production OAuth apps configured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented (if needed)

### External Services
- [ ] Cloudflare R2 configured
- [ ] Email service (Brevo) configured
- [ ] OAuth credentials for production
- [ ] Domain and DNS configured

---

## Environment Variables for Production

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
BETTER_AUTH_SECRET="production-secret-min-32-chars"
BETTER_AUTH_URL="https://yourdomain.com"
BASE_URL="https://yourdomain.com"

# OAuth
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-secret"
GITHUB_CLIENT_ID="production-github-client-id"
GITHUB_CLIENT_SECRET="production-github-secret"

# Email
BREVO_API_KEY="production-api-key"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-email@yourdomain.com"
SMTP_PASS="production-smtp-password"

# Cloudflare R2
R2_ACCOUNT_ID="production-account-id"
R2_ACCESS_KEY_ID="production-access-key"
R2_SECRET_ACCESS_KEY="production-secret-key"
R2_BUCKET_NAME="production-bucket"
R2_PUBLIC_URL="https://your-r2-domain.com"

# Super Admin
SUPERADMIN_PASSWORD="strong-production-password"
```

---

## Quick Deployment Steps

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Configure environment variables
   - Deploy

3. **Configure Domain**
   - Add custom domain in Vercel
   - Update DNS records
   - Wait for SSL certificate

4. **Update OAuth Callbacks**
   - Update Google OAuth redirect URI
   - Update GitHub OAuth callback URL

### VPS Deployment

1. **Setup VPS**
   - Follow [VPS PostgreSQL Setup](./vps-postgresql-setup.md)
   - Install Node.js and dependencies

2. **Deploy Application**
   ```bash
   git clone https://github.com/yourusername/alifpustaka-next-v1.git
   cd alifpustaka-next-v1
   npm install
   npm run build
   ```

3. **Configure PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "alifpustaka" -- start
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx (Reverse Proxy)**
   ```nginx
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

5. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Verification

### Functional Tests
- [ ] Homepage loads
- [ ] User can login
- [ ] OAuth login works (Google & GitHub)
- [ ] Blog posts display correctly
- [ ] Image uploads work
- [ ] Email notifications send
- [ ] Admin functions accessible

### Performance Tests
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Image loading optimized
- [ ] Database queries performant

### Security Tests
- [ ] HTTPS working
- [ ] Session cookies secure
- [ ] No secrets exposed in client
- [ ] CORS configured correctly

---

## Rollback Procedures

### Application Rollback

**Vercel:**
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**VPS:**
```bash
cd alifpustaka-next-v1
git checkout [previous-commit-hash]
npm install
npm run build
pm2 restart alifpustaka
```

### Database Rollback

```bash
# Restore from backup
psql "postgresql://user:password@host:5432/database" < backup.sql

# Or revert specific migration
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## Monitoring & Maintenance

### Daily
- Check application logs
- Monitor error rates
- Verify backups completed

### Weekly
- Review performance metrics
- Check disk space
- Review security logs

### Monthly
- Update dependencies
- Rotate credentials
- Database optimization (VACUUM)
- Review and archive logs

---

## Common Issues

### Build Fails on Deployment
- Check Node.js version matches
- Verify all environment variables set
- Check for TypeScript errors locally

### Database Connection Timeout
- Verify DATABASE_URL is correct
- Check firewall rules
- Ensure database is running
- Test connection string locally

### OAuth Not Working in Production
- Verify callback URLs match exactly
- Check BETTER_AUTH_URL and BASE_URL
- Ensure HTTPS is enabled
- Clear browser cache

---

## Related Documentation

- **[VPS PostgreSQL Setup](./vps-postgresql-setup.md)** - Self-hosted database
- **[Production Deployment Checklist](./production-deployment.md)** - Complete checklist
- **[Environment Configuration](../setup/environment-configuration.md)** - Environment variables
- **[Troubleshooting](../setup/troubleshooting.md)** - Common issues

---

**Last Updated:** 2026-08-01
