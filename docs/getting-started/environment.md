# Environment Configuration

Complete guide to environment variables for the public site.

---

## Environment Files

### `.env.local` (Development)
Used for local development. Not committed to git.

### `.env.production` (Production)
Used for production builds. Should be set via hosting provider.

### `.env.example`
Template file with all required variables.

---

## Required Variables

### Authentication

#### `BETTER_AUTH_SECRET`
- **Required:** Yes
- **Type:** String (base64)
- **Example:** `"Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="`
- **Description:** Secret key for Better Auth. **Must match admin app exactly.**
- **Generate:** `openssl rand -base64 32`

#### `BETTER_AUTH_URL`
- **Required:** Yes
- **Type:** URL
- **Example:** `"http://localhost:3000"` (dev) or `"https://alifpustaka.web.id"` (prod)
- **Description:** Public site URL for Better Auth callbacks

#### `COOKIE_DOMAIN`
- **Required:** Yes
- **Type:** Domain string
- **Example:** `".alifpustaka.web.id"`
- **Description:** Shared cookie domain for cross-subdomain auth. Must start with dot.
- **Note:** Must match admin app's `COOKIE_DOMAIN`

---

### API Configuration

#### `NEXT_PUBLIC_ADMIN_API_URL`
- **Required:** Yes
- **Type:** URL
- **Example:** `"http://localhost:3001"` (dev) or `"https://app.alifpustaka.web.id"` (prod)
- **Description:** Admin app base URL for API requests
- **Note:** Must be accessible from browser (uses `NEXT_PUBLIC_` prefix)

---

### Site URLs

#### `BASE_URL`
- **Required:** Yes
- **Type:** URL
- **Example:** `"http://localhost:3000"` (dev) or `"https://alifpustaka.web.id"` (prod)
- **Description:** Server-side base URL for the public site

#### `NEXT_PUBLIC_BASE_URL`
- **Required:** Yes
- **Type:** URL
- **Example:** `"http://localhost:3000"` (dev) or `"https://alifpustaka.web.id"` (prod)
- **Description:** Client-side base URL for the public site

---

### CDN Configuration

#### `R2_PUBLIC_BASE_URL`
- **Required:** No (Optional)
- **Type:** Domain
- **Example:** `"img.alifpustaka.web.id"`
- **Description:** Public CDN URL for images served by admin app

---

## Environment Examples

### Development (.env.local)

```env
# Authentication
BETTER_AUTH_SECRET="Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="
BETTER_AUTH_URL="http://localhost:3000"
COOKIE_DOMAIN=".localhost"

# API
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"

# Site URLs
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# CDN
R2_PUBLIC_BASE_URL="localhost:3001/images"
```

### Production (.env.production)

```env
# Authentication
BETTER_AUTH_SECRET="your-production-secret-here"
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

## Security Best Practices

### 1. Never Commit Secrets
```bash
# .gitignore should include:
.env.local
.env*.local
.env.production
```

### 2. Use Strong Secrets
```bash
# Generate strong secret
openssl rand -base64 32
```

### 3. Different Secrets Per Environment
- Development: Different secret
- Staging: Different secret
- Production: Strong, unique secret

### 4. Rotate Secrets Regularly
Change `BETTER_AUTH_SECRET` every 90 days in production.

---

## Next Steps

- [Quick Start Guide](./quick-start.md)
- [Local Development](../development/local-setup.md)
- [Deployment Guide](../deployment/production.md)

---

**Last Updated:** 2026-08-03
