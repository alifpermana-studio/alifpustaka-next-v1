# Installation Guide

Complete installation instructions for the Alif Pustaka public site.

---

## System Requirements

### Software Requirements
- **Node.js:** 20.x or higher
- **Package Manager:** npm 10.x or yarn 1.22+
- **Operating System:** Windows, macOS, or Linux

### External Dependencies
- **Admin App:** Running instance of `alifpustaka-next-app-v1`
- **Network Access:** Ability to reach admin app API

---

## Installation Methods

### Method 1: Standard Installation

#### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16.2.9
- React 19.2.4
- Better Auth 1.6.22
- Axios 1.18.1
- Tailwind CSS v4
- TypeScript 5

#### 2. Environment Setup

Create `.env.local` from template:

```bash
cp .env.example .env.local
```

Configure required variables (see [Environment Configuration](./environment.md)).

#### 3. Verify Installation

```bash
npm run dev
```

Server starts at [http://localhost:3000](http://localhost:3000)

---

## Post-Installation

### 1. Test API Connection

Create a test file `test-api.js`:

```javascript
const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';

axios.get(`${API_URL}/api/public/posts`)
  .then(res => console.log('✓ API connected:', res.data))
  .catch(err => console.error('✗ API connection failed:', err.message));
```

Run: `node test-api.js`

### 2. Test Authentication

1. Start both apps (public and admin)
2. Navigate to public site
3. Click "Login" button
4. Should redirect to admin app signin
5. After login, should redirect back to public site

### 3. Verify Build

```bash
npm run build
```

Successful build confirms:
- No TypeScript errors
- All dependencies resolved
- Environment variables accessible

---

## Troubleshooting Installation

### Issue: npm install fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
PORT=3002 npm run dev
```

Or kill existing process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Issue: TypeScript errors after install

**Solution:**
```bash
# Regenerate TypeScript config
npm run build
```

---

## Next Steps

- [Environment Configuration](./environment.md)
- [Local Development Setup](../development/local-setup.md)
- [Architecture Overview](../architecture/overview.md)

---

**Last Updated:** 2026-08-03
