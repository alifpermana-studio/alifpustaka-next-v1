# Authentication Flow

Understanding how authentication works across the public site and admin app.

---

## Overview

The public site and admin app share authentication using Better Auth with cross-subdomain cookies. Users authenticate once on the admin app, and their session is automatically available on the public site.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Shared Cookie Domain                       │
│                   (.alifpustaka.web.id)                       │
│                                                               │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   Public Site       │         │    Admin App        │   │
│  │  alifpustaka.web.id │         │ app.alifpustaka...  │   │
│  │                     │         │                     │   │
│  │  Better Auth        │◄───────►│  Better Auth        │   │
│  │  (Client Only)      │  Cookie │  (Full Server)      │   │
│  └─────────────────────┘         └─────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Authentication Flows

### 1. User Login Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│ User │                │  Public  │              │  Admin   │
│      │                │   Site   │              │   App    │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │  1. Visit public site   │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │  2. Click "Login"       │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │  3. Redirect to admin   │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
   │  4. Show login form     │                         │
   ├─────────────────────────┼────────────────────────►│
   │                         │                         │
   │  5. Submit credentials  │                         │
   ├─────────────────────────┼────────────────────────►│
   │                         │                         │
   │                         │  6. Validate & create   │
   │                         │     session             │
   │                         │◄────────────────────────┤
   │                         │                         │
   │                         │  7. Set cookie for      │
   │                         │     .domain.com         │
   │◄────────────────────────┼─────────────────────────┤
   │                         │                         │
   │  8. Redirect back       │                         │
   │    (with returnUrl)     │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │  9. Read session cookie │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
   │  10. Show logged in     │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
```

**Step Details:**

1. User visits public site (not logged in)
2. Clicks "Login" button in navigation
3. Public site redirects to `app.domain.com/signin?returnUrl=domain.com/current-page`
4. Admin app displays login form
5. User enters email/password or uses OAuth
6. Admin app validates credentials
7. Better Auth creates session and sets HTTP-only cookie for `.domain.com`
8. Admin app redirects to `returnUrl` (public site)
9. Public site reads session cookie automatically
10. User is now logged in on public site

### 2. Session Check Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│ User │                │  Public  │              │  Admin   │
│      │                │   Site   │              │   App    │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │  1. Visit page          │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │                         │  2. Check session       │
   │                         │     (via cookie)        │
   │                         ├─────────┐               │
   │                         │         │               │
   │                         │◄────────┘               │
   │                         │                         │
   │  3. Render with auth    │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
```

**Implementation:**

```typescript
// src/context/AuthContext.tsx
const { data: session, isPending } = authClient.useSession();

const user: User | null = session?.user ? {
  userId: session.user.id,
  name: session.user.name,
  email: session.user.email,
  role: session.user.role,
  // ...
} : null;
```

### 3. Authenticated API Request Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│ User │                │  Public  │              │  Admin   │
│      │                │   Site   │              │   App    │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │  1. Click "Bookmarks"   │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │                         │  2. API request with    │
   │                         │     credentials         │
   │                         ├────────────────────────►│
   │                         │                         │
   │                         │  3. Validate session    │
   │                         │◄────────────────────────┤
   │                         │                         │
   │                         │  4. Return user data    │
   │                         │◄────────────────────────┤
   │                         │                         │
   │  5. Display bookmarks   │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
```

**Implementation:**

```typescript
// src/lib/api-client.ts
const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Send cookies
});

// Usage
const bookmarks = await userApi.getBookmarks();
```

### 4. Logout Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│ User │                │  Public  │              │  Admin   │
│      │                │   Site   │              │   App    │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │  1. Click "Logout"      │                         │
   ├────────────────────────►│                         │
   │                         │                         │
   │                         │  2. Call signOut()      │
   │                         ├─────────┐               │
   │                         │         │               │
   │                         │◄────────┘               │
   │                         │                         │
   │  3. Redirect to admin   │                         │
   │◄────────────────────────┤                         │
   │                         │                         │
   │  4. Admin logs out      │                         │
   ├─────────────────────────┼────────────────────────►│
   │                         │                         │
   │                         │  5. Clear session       │
   │◄────────────────────────┼─────────────────────────┤
   │                         │                         │
```

**Implementation:**

```typescript
// src/context/AuthContext.tsx
const signOut = async () => {
  await authClient.signOut();
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  window.location.href = `${adminUrl}/signin`;
};
```

---

## Session Management

### Cookie Configuration

Both apps must use identical cookie settings:

```typescript
// Admin app: src/lib/auth.ts
export const auth = betterAuth({
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN, // ".domain.com"
    },
  },
});
```

### Cookie Properties

- **Name:** `better-auth.session_token`
- **Domain:** `.alifpustaka.web.id`
- **Path:** `/`
- **HttpOnly:** `true`
- **Secure:** `true` (production only)
- **SameSite:** `lax`

### Session Validation

Public site does NOT validate sessions. It only reads the cookie and passes it to the admin app for validation.

```typescript
// Public site DOES NOT do this:
// ✗ const isValid = await validateSession(sessionToken);

// Instead:
// ✓ Includes cookie in API requests
// ✓ Admin app validates on each request
```

---

## Security Considerations

### 1. Cookie Security

**Production Requirements:**
- Use HTTPS for both domains
- Set `Secure` flag on cookies
- Use strong `BETTER_AUTH_SECRET`

**Development:**
- HTTP allowed with `Secure: false`
- Use `.localhost` as `COOKIE_DOMAIN`

### 2. Session Validation

**Admin App Responsibility:**
- Validate session on every protected endpoint
- Check session expiry
- Verify user permissions

**Public Site Responsibility:**
- Read session cookie
- Pass cookie to API requests
- Handle 401 responses (redirect to login)

### 3. XSS Protection

- Cookies are `HttpOnly` (not accessible via JavaScript)
- No session tokens in localStorage
- No inline scripts

### 4. CSRF Protection

Better Auth includes CSRF protection:
- CSRF tokens in forms
- Origin header validation
- SameSite cookie attribute

---

## Troubleshooting

### Issue: Session not shared

**Symptoms:**
- Login on admin app doesn't reflect on public site
- Cookie not visible in public site

**Solutions:**

1. **Check COOKIE_DOMAIN**
   ```bash
   # Both apps must have:
   COOKIE_DOMAIN=".alifpustaka.web.id"
   ```

2. **Verify Domain Structure**
   - Admin: `app.alifpustaka.web.id`
   - Public: `alifpustaka.web.id`
   - Cookie: `.alifpustaka.web.id` (note the dot)

3. **Development Setup**
   ```bash
   # Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
   127.0.0.1 alifpustaka.local
   127.0.0.1 app.alifpustaka.local
   
   # Use these URLs in development
   # Update COOKIE_DOMAIN=".alifpustaka.local"
   ```

4. **Check Browser Settings**
   - Allow third-party cookies
   - Clear existing cookies
   - Disable privacy extensions

### Issue: 401 Unauthorized on API requests

**Symptoms:**
- API calls fail with 401
- User appears logged in but can't access data

**Solutions:**

1. **Verify withCredentials**
   ```typescript
   // src/lib/api-client.ts
   const client = axios.create({
     withCredentials: true, // Must be true
   });
   ```

2. **Check CORS on Admin App**
   ```typescript
   // Admin app should allow credentials
   headers: {
     'Access-Control-Allow-Credentials': 'true',
     'Access-Control-Allow-Origin': 'https://alifpustaka.web.id',
   }
   ```

3. **Session Expiry**
   - Session may have expired
   - User needs to re-login

---

## Next Steps

- [API Integration](./api-integration.md)
- [Development Guide](../development/local-setup.md)
- [Troubleshooting](../deployment/troubleshooting.md)

---

**Last Updated:** 2026-08-03
