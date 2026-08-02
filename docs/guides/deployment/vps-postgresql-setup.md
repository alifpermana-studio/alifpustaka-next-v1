# VPS PostgreSQL Setup Guide

**Last Updated:** 2026-08-01

This guide covers the complete setup of PostgreSQL on an OVHCloud VPS, including SSH tunnel configuration, database migration from Supabase, and daily development workflow.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [VPS PostgreSQL Installation](#vps-postgresql-installation)
4. [SSH Tunnel Setup](#ssh-tunnel-setup)
5. [Database Migration](#database-migration)
6. [Environment Configuration](#environment-configuration)
7. [Daily Development Workflow](#daily-development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses PostgreSQL hosted on an OVHCloud VPS. Database access is secured via SSH tunnel, ensuring PostgreSQL is never directly exposed to the internet.

### Architecture

```
Local Development Machine
    ↓ (SSH Tunnel)
VPS (psql.alifpustaka.web.id)
    ↓ (localhost:5432)
PostgreSQL Database
```

### Benefits

- **Security:** PostgreSQL only listens on localhost
- **Encryption:** All traffic encrypted via SSH
- **Flexibility:** Access from any location with SSH key
- **Cost-effective:** No managed database service fees

---

## Prerequisites

### Required

- **OVHCloud VPS** with PostgreSQL installed
- **SSH access** to VPS
- **SSH key pair** configured for authentication
- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher

### VPS Details (Example)

- **Domain:** psql.alifpustaka.web.id
- **Username:** alifpermana
- **PostgreSQL Port:** 5432 (localhost only)
- **Database Name:** apus_db_v1

---

## VPS PostgreSQL Installation

### Step 1: Install PostgreSQL on VPS

```bash
# Connect to VPS
ssh alifpermana@psql.alifpustaka.web.id

# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE apus_db_v1;

# Create user with password
CREATE USER alifpermana WITH PASSWORD 'YourSecurePassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE apus_db_v1 TO alifpermana;

# Grant schema privileges
\c apus_db_v1
GRANT ALL ON SCHEMA public TO alifpermana;

# Exit psql
\q
```

### Step 3: Configure PostgreSQL for Localhost Only

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Ensure this line exists:
listen_addresses = 'localhost'

# Edit pg_hba.conf for local authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line:
host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 4: Verify PostgreSQL is Not Exposed

```bash
# Should show only 127.0.0.1:5432, NOT 0.0.0.0:5432
sudo netstat -tlnp | grep 5432
```

Expected output:
```
tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN
```

### Step 5: Configure Firewall

```bash
# Allow SSH only
sudo ufw allow 22/tcp

# Deny PostgreSQL from internet (just to be safe)
sudo ufw deny 5432/tcp

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status
```

---

## SSH Tunnel Setup

### Step 1: Generate SSH Key (Local Machine)

**On Windows (PowerShell):**
```powershell
ssh-keygen -t ed25519 -C "your-email@example.com"
```

**On Linux/Mac:**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Press Enter to use default location (`~/.ssh/id_ed25519`)

### Step 2: Copy Public Key to VPS

**Automatic (Recommended):**
```bash
ssh-copy-id alifpermana@psql.alifpustaka.web.id
```

**Manual (Windows without ssh-copy-id):**
```powershell
# Copy public key to clipboard
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

# Connect to VPS
ssh alifpermana@psql.alifpustaka.web.id

# On VPS, create .ssh directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add public key
nano ~/.ssh/authorized_keys
# Paste the key and save (Ctrl+O, Enter, Ctrl+X)

# Set permissions
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 3: Test SSH Key Authentication

```bash
ssh alifpermana@psql.alifpustaka.web.id
```

Should login without password prompt.

### Step 4: Create SSH Tunnel

**Manual Tunnel (Terminal 1 - Keep Running):**
```bash
ssh -L 5432:localhost:5432 alifpermana@psql.alifpustaka.web.id
```

**Background Tunnel:**
```bash
ssh -f -N -L 5432:localhost:5432 alifpermana@psql.alifpustaka.web.id
```

**Auto-reconnect Script (Recommended for Development):**

**Linux/Mac (`psql-tunnel.sh`):**
```bash
#!/bin/bash
echo "Starting PostgreSQL SSH Tunnel..."
while true; do
    ssh -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -L 5432:localhost:5432 \
        alifpermana@psql.alifpustaka.web.id
    echo "Tunnel disconnected. Reconnecting in 5 seconds..."
    sleep 5
done
```

Make executable:
```bash
chmod +x psql-tunnel.sh
./psql-tunnel.sh
```

**Windows (`psql-tunnel.ps1`):**
```powershell
Write-Host "Starting PostgreSQL SSH Tunnel..."
while ($true) {
    ssh -o ServerAliveInterval=60 `
        -o ServerAliveCountMax=3 `
        -o ExitOnForwardFailure=yes `
        -L 5432:localhost:5432 `
        alifpermana@psql.alifpustaka.web.id
    Write-Host "Tunnel disconnected. Reconnecting in 5 seconds..."
    Start-Sleep -Seconds 5
}
```

Run:
```powershell
.\psql-tunnel.ps1
```

### Step 5: Verify Tunnel is Active

**Windows (PowerShell):**
```powershell
netstat -an | Select-String "127.0.0.1:5432"
```

**Linux/Mac:**
```bash
netstat -an | grep "127.0.0.1:5432"
```

Expected output:
```
TCP    127.0.0.1:5432         0.0.0.0:0              LISTENING
```

---

## Database Migration

### Step 1: Backup Current Database (Supabase)

```bash
# Export Supabase data
npm run export-supabase-data
```

This creates `scripts/supabase-export.json` with all data.

### Step 2: Run Prisma Migrations on VPS

```bash
# With SSH tunnel active, run migrations
DATABASE_URL="postgresql://alifpermana:YourPassword@localhost:5432/apus_db_v1" npx prisma migrate deploy
```

Expected output:
```
✔ All migrations have been successfully applied.
```

### Step 3: Import Data to VPS

```bash
# Import data from backup
DATABASE_URL="postgresql://alifpermana:YourPassword@localhost:5432/apus_db_v1" npm run import-to-vps
```

### Step 4: Verify Data Migration

```bash
# Test connection and count records
npx tsx scripts/test-connection.js
```

Expected output:
```
✅ Connection successful!
✅ Users in database: 8
✅ Posts in database: 6
✅ Super Admin found
```

---

## Environment Configuration

### Update `.env.local`

```bash
# Old - Supabase (Remove or Comment Out)
# NEXT_PUBLIC_SUPABASE_URL="https://dsxpffyeobvcylnoomtt.supabase.co"
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
# DATABASE_URL="postgres://prisma...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# New - VPS PostgreSQL (via SSH tunnel)
# Connection: ssh -L 5432:localhost:5432 alifpermana@psql.alifpustaka.web.id
DATABASE_URL="postgresql://alifpermana:YourPassword@localhost:5432/apus_db_v1"

# Super Admin Credentials
SUPERADMIN_EMAIL=alifpermana.studio@gmail.com
SUPERADMIN_PASSWORD=YourSecurePassword

# Keep all other variables unchanged
BETTER_AUTH_SECRET="..."
BASE_URL="http://localhost:3000"
R2_ACCESS_KEY_ID="..."
# ... etc
```

### Regenerate Prisma Client

```bash
npx prisma generate
```

### Verify Configuration

```bash
# Test connection
npm run build
```

Build should complete successfully with no TypeScript errors.

---

## Daily Development Workflow

### Starting Development Session

**Terminal 1 - SSH Tunnel (Keep Running):**
```bash
ssh -L 5432:localhost:5432 alifpermana@psql.alifpustaka.web.id
```

Leave this terminal open during development.

**Terminal 2 - Development Server:**
```bash
cd D:\alif-pustaka\MyWorkspace\alifpustaka-next-v1
npm run dev
```

**Terminal 3 - Optional (Database Tools):**
```bash
# Prisma Studio
npx prisma studio

# Direct database access
psql "postgresql://alifpermana:YourPassword@localhost:5432/apus_db_v1"
```

### Ending Development Session

1. Stop dev server (Terminal 2): `Ctrl+C`
2. Close Prisma Studio (Terminal 3): `Ctrl+C`
3. Close SSH tunnel (Terminal 1): `Ctrl+C` or `Ctrl+D`

---

## Troubleshooting

### SSH Tunnel Issues

**Problem: "Connection refused" or "Port already in use"**

**Solution:**
```bash
# Find process using port 5432
netstat -ano | findstr "5432"

# Kill the process (Windows - replace <PID> with actual PID)
taskkill /PID <PID> /F

# Or use npx (cross-platform)
npx kill-port 5432

# Then restart tunnel
ssh -L 5432:localhost:5432 alifpermana@psql.alifpustaka.web.id
```

---

### Database Connection Errors

**Problem: "Can't reach database server"**

**Solution:**
1. Verify SSH tunnel is active:
   ```bash
   netstat -an | Select-String "127.0.0.1:5432"
   ```

2. Test PostgreSQL on VPS:
   ```bash
   ssh alifpermana@psql.alifpustaka.web.id
   psql -U alifpermana -d apus_db_v1 -h localhost
   ```

3. Check `DATABASE_URL` in `.env.local`:
   ```bash
   # Should be:
   DATABASE_URL="postgresql://alifpermana:password@localhost:5432/apus_db_v1"
   ```

---

### Prisma Migration Errors

**Problem: "Migration failed" or "Schema drift detected"**

**Solution:**
```bash
# Reset database (DANGER: Deletes all data)
DATABASE_URL="postgresql://alifpermana:password@localhost:5432/apus_db_v1" npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_schema

# Or force deploy
DATABASE_URL="postgresql://alifpermana:password@localhost:5432/apus_db_v1" npx prisma migrate deploy --force
```

---

### SSH Key Authentication Issues

**Problem: Still asking for password**

**Solution:**
1. Check key permissions (Linux/Mac):
   ```bash
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/id_ed25519.pub
   ```

2. Verify public key on VPS:
   ```bash
   ssh alifpermana@psql.alifpustaka.web.id
   cat ~/.ssh/authorized_keys
   ```

3. Check SSH server config on VPS:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Ensure:
   # PubkeyAuthentication yes
   # AuthorizedKeysFile .ssh/authorized_keys
   
   sudo systemctl restart ssh
   ```

---

### Build Errors After Migration

**Problem: TypeScript errors with Prisma models**

**Common issues:**
- `Property 'tags' does not exist` → Use `post_tag`
- `Property 'auditLog' does not exist` → Use `audit_log`
- `Property 'accounts' does not exist` → Use `account`
- `Property 'replies' does not exist` → Use `other_discussion`

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Check schema naming
cat prisma/schema/schema.prisma | grep "model"

# Clean Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

---

## Security Best Practices

### ✅ DO:
- Use SSH key authentication (no passwords)
- Keep PostgreSQL listening on localhost only
- Use strong database passwords (20+ characters)
- Keep `.env.local` in `.gitignore`
- Use firewall rules on VPS (ufw)
- Regularly update VPS packages
- Enable automatic security updates on VPS

### ❌ DON'T:
- Expose PostgreSQL port 5432 to internet
- Commit database credentials to git
- Use weak passwords
- Share SSH private keys
- Disable firewall on VPS
- Allow root SSH login with password

---

## Additional Resources

### Useful Commands

**Check PostgreSQL status on VPS:**
```bash
ssh alifpermana@psql.alifpustaka.web.id
sudo systemctl status postgresql
```

**View PostgreSQL logs:**
```bash
ssh alifpermana@psql.alifpustaka.web.id
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

**Backup database:**
```bash
# Via SSH tunnel
pg_dump "postgresql://alifpermana:password@localhost:5432/apus_db_v1" > backup.sql
```

**Restore database:**
```bash
# Via SSH tunnel
psql "postgresql://alifpermana:password@localhost:5432/apus_db_v1" < backup.sql
```

### OVHCloud VPS Documentation

- **VPS Guide:** https://docs.ovhcloud.com/en/guides/bare-metal-cloud/virtual-private-servers/landing-page-vps
- **SSH Setup:** https://docs.ovhcloud.com/en/guides/bare-metal-cloud/dedicated-servers/ssh-introduction
- **User Management:** https://docs.ovhcloud.com/en/guides/bare-metal-cloud/dedicated-servers/changing-root-password-linux-ds

---

## Migration History

**Date:** 2026-08-01  
**From:** Supabase Cloud PostgreSQL  
**To:** OVHCloud VPS PostgreSQL  
**Data Migrated:**
- 8 Users + 8 Accounts
- 45 Sessions
- 6 Posts + 37 Tags + 52 PostTag relations
- 5 Gallery items
- 18 Notifications
- 76 Audit Logs
- 3 Discussions

**Status:** ✅ Complete and operational

---

**Maintained by:** Alif Pustaka Development Team  
**Last Updated:** 2026-08-01
