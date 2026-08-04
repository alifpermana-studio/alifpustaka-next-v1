# Environment Variables Reference

Complete reference for all environment variables used in the public site.

---

## Required Variables

These variables MUST be set for the application to work.

### BETTER_AUTH_SECRET

- **Type:** String (Base64)
- **Required:** Yes
- **Example:** `"Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="`
- **Description:** Secret key for Better Auth session encryption
- **Important:** Must match admin app's `BETTER_AUTH_SECRET` exactly
- **Generate:** `openssl rand -base64 32`

```env
BETTER_AUTH_SECRET="your-secret-here"
```

---

### BETTER_AUTH_URL

- **Type:** URL
- **Required:** Yes
- **Example (Dev):** `"http://localhost:3000"`
- **Example (Prod):** `"https://alifpustaka.web.id"`
- **Description:** Public site URL used by Better Auth for callbacks
- **Format:** Include protocol, no trailing slash

```env
BETTER_AUTH_URL="https://yourdomain.com"
```

---

### COOKIE_DOMAIN

- **Type:** Domain String
- **Required:** Yes
- **Example (Dev):** `".localhost"`
- **Example (Prod):** `".alifpustaka.web.id"`
- **Description:** Shared cookie domain for cross-subdomain authentication
- **Important:** 
  - Must start with a dot (`.domain.com`)
  - Must match admin app's `COOKIE_DOMAIN`
  - Both apps must share the same base domain

```env
COOKIE_DOMAIN=".yourdomain.com"
```

---

### NEXT_PUBLIC_ADMIN_API_URL

- **Type:** URL
- **Required:** Yes
- **Example (Dev):** `"http://localhost:3001"`
- **Example (Prod):** `"https://app.alifpustaka.web.id"`
- **Description:** Admin app base URL for API requests
- **Important:** 
  - Accessible from browser (uses `NEXT_PUBLIC_` prefix)
  - No trailing slash
  - Must use HTTPS in production

```env
NEXT_PUBLIC_ADMIN_API_URL="https://app.yourdomain.com"
```

---

### BASE_URL

- **Type:** URL
- **Required:** Yes
- **Example (Dev):** `"http://localhost:3000"`
- **Example (Prod):** `"https://alifpustaka.web.id"`
- **Description:** Server-side base URL for the public site
- **Used For:** Server-side URL generation, metadata

```env
BASE_URL="https://yourdomain.com"
```

---

### NEXT_PUBLIC_BASE_URL

- **Type:** URL
- **Required:** Yes
- **Example (Dev):** `"http://localhost:3000"`
- **Example (Prod):** `"https://alifpustaka.web.id"`
- **Description:** Client-side base URL for the public site
- **Used For:** Client-side URL generation, sharing links

```env
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

---

## Optional Variables

These variables enhance functionality but are not strictly required.

### R2_PUBLIC_BASE_URL

- **Type:** Domain
- **Required:** No
- **Example:** `"img.alifpustaka.web.id"`
- **Description:** Public CDN URL for images served by admin app
- **Used For:** Image optimization, CDN integration

```env
R2_PUBLIC_BASE_URL="img.yourdomain.com"
```

---

## Environment-Specific Configurations

### Development (.env.local)

```env
# Authentication (shared with admin app)
BETTER_AUTH_SECRET="Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="
BETTER_AUTH_URL="http://localhost:3000"
COOKIE_DOMAIN=".localhost"

# API (admin app running on port 3001)
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"

# Site URLs
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# CDN (optional in development)
R2_PUBLIC_BASE_URL="localhost:3001/images"
```

### Staging (.env.staging)

```env
# Authentication
BETTER_AUTH_SECRET="staging-secret-different-from-prod"
BETTER_AUTH_URL="https://staging.alifpustaka.web.id"
COOKIE_DOMAIN=".alifpustaka.web.id"

# API
NEXT_PUBLIC_ADMIN_API_URL="https://app-staging.alifpustaka.web.id"

# Site URLs
BASE_URL="https://staging.alifpustaka.web.id"
NEXT_PUBLIC_BASE_URL="https://staging.alifpustaka.web.id"

# CDN
R2_PUBLIC_BASE_URL="img-staging.alifpustaka.web.id"
```

### Production (.env.production)

```env
# Authentication
BETTER_AUTH_SECRET="strong-production-secret-here"
BETTER_AUTH_URL="https://alifpustaka.web.id"
COOKIE_DOMAIN=".alifpustaka.web.id"

# API
NEXT_PUBLIC_ADMIN_API_URL="https://app.alifpustaka.web.id"

# Site URLs
BASE_URL="https://alifpustaka.web.id"
NEXT_PUBLIC_BASE_URL="https://alifpustaka.web.id"

# CDN
R2_PUBLIC_BASE_URL="img.alifpustaka.web.id"
```

---

## Variable Access

### Server-Side (Server Components, API Routes)

All variables are accessible:

```typescript
// Works server-side
const secret = process.env.BETTER_AUTH_SECRET;
const baseUrl = process.env.BASE_URL;
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
```

### Client-Side (Client Components, Browser)

Only `NEXT_PUBLIC_*` variables are accessible:

```typescript
'use client';

// ✓ Works client-side
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// ✗ Returns undefined client-side
const secret = process.env.BETTER_AUTH_SECRET; // undefined
const baseUrl = process.env.BASE_URL; // undefined
```

---

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore should include:
.env.local
.env*.local
.env.production
.env.staging
```

### 2. Use Strong Secrets

```bash
# Generate strong secret
openssl rand -base64 32

# Or use a password generator
# Minimum 32 characters
```

### 3. Different Secrets Per Environment

```
✓ Good:
- Development: secret-dev-123
- Staging: secret-stg-456
- Production: secret-prod-789

✗ Bad:
- All environments: same-secret-123
```

### 4. Rotate Secrets Regularly

- Production: Every 90 days
- After security incident: Immediately
- When team member leaves: As needed

### 5. Restrict Access

- Use secret management tools (Vercel Secrets, AWS Secrets Manager)
- Limit who can view production secrets
- Audit secret access logs

---

## Validation

### Check Required Variables

Create `scripts/check-env.js`:

```javascript
#!/usr/bin/env node

const required = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'COOKIE_DOMAIN',
  'NEXT_PUBLIC_ADMIN_API_URL',
  'BASE_URL',
  'NEXT_PUBLIC_BASE_URL',
];

const missing = required.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Validate formats
const urlVars = ['BETTER_AUTH_URL', 'NEXT_PUBLIC_ADMIN_API_URL', 'BASE_URL', 'NEXT_PUBLIC_BASE_URL'];
urlVars.forEach(v => {
  const url = process.env[v];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(`❌ ${v} must start with http:// or https://`);
    process.exit(1);
  }
  if (url.endsWith('/')) {
    console.error(`❌ ${v} should not have trailing slash`);
    process.exit(1);
  }
});

// Validate COOKIE_DOMAIN
const cookieDomain = process.env.COOKIE_DOMAIN;
if (!cookieDomain.startsWith('.')) {
  console.warn(`⚠️  COOKIE_DOMAIN should start with a dot for cross-subdomain cookies`);
}

console.log('✅ Environment configuration is valid');
```

Run before build:

```json
{
  "scripts": {
    "prebuild": "node scripts/check-env.js",
    "build": "next build"
  }
}
```

---

## Platform-Specific Configuration

### Vercel

Set in Project Settings → Environment Variables:

1. Add each variable
2. Select environments (Production, Preview, Development)
3. Click "Save"
4. Redeploy for changes to take effect

### Docker Compose

```yaml
services:
  public-site:
    build: .
    environment:
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - COOKIE_DOMAIN=${COOKIE_DOMAIN}
      - NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL}
      - BASE_URL=${BASE_URL}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
    env_file:
      - .env.production
```

### PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'public-site',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'your-secret',
      BETTER_AUTH_URL: 'https://yourdomain.com',
      COOKIE_DOMAIN: '.yourdomain.com',
      NEXT_PUBLIC_ADMIN_API_URL: 'https://app.yourdomain.com',
      BASE_URL: 'https://yourdomain.com',
      NEXT_PUBLIC_BASE_URL: 'https://yourdomain.com',
    }
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

---

## Troubleshooting

### Issue: "NEXT_PUBLIC_ADMIN_API_URL is undefined"

**Cause:** Variable not accessible in browser

**Solution:** Variable name must start with `NEXT_PUBLIC_`

### Issue: Secrets visible in browser

**Cause:** Secret stored in `NEXT_PUBLIC_*` variable

**Solution:** Remove `NEXT_PUBLIC_` prefix for secrets

### Issue: Variables work locally but not in production

**Cause:** Variables not set in hosting platform

**Solution:** 
1. Set variables in hosting platform
2. Rebuild/redeploy
3. Verify with `console.log(process.env.NEXT_PUBLIC_ADMIN_API_URL)`

### Issue: "COOKIE_DOMAIN doesn't work"

**Cause:** Missing dot prefix or domain mismatch

**Solution:**
1. Add dot: `.domain.com`
2. Ensure admin app uses same domain
3. Check both apps share base domain

---

## Next Steps

- [Quick Start Guide](../getting-started/quick-start.md)
- [Production Deployment](./production.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

**Last Updated:** 2026-08-03
