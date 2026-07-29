# Proxy Middleware Documentation

## Overview

The `proxy.ts` middleware handles authentication, authorization, and route protection for the application. It runs on every request (except static files and API routes) to enforce access control policies.

**Location:** `src/proxy.ts`

## Route Types

### 1. Public Routes

Routes accessible to all users without authentication.

```typescript
const PUBLIC_ROUTES = ["/about", "/contact", "/terms", "/privacy", "/blog"];
```

- No authentication required
- Always accessible
- Checked first before any other route logic

### 2. Protected Routes

Routes requiring authenticated users.

```typescript
const PROTECTED_ROUTES = [
  "/dashboard",
  "/p",
  "/settings",
  "/posts",
  "/galleries",
  "/admin",
];
```

- Requires valid session
- Redirects to `/signin` if unauthenticated

### 3. Auth Routes

Authentication pages (signin, signup, etc.).

```typescript
const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password", "/verify-email"];
```

- Accessible only to unauthenticated users
- Redirects to `/dashboard` if already authenticated

## Authentication Flow

### Request Processing Order

1. **Get Session**
   - Retrieves current user session from auth provider

2. **Check Public Routes**
   - If route matches `PUBLIC_ROUTES`, allow access immediately
   - Matches exact path and sub-paths (e.g., `/blog` and `/blog/post-1`)

3. **Check Protected Routes**
   - If route matches `PROTECTED_ROUTES` and no session exists, redirect to `/signin`

4. **Check Auth Routes**
   - If route matches `AUTH_ROUTES` and session exists, redirect to `/dashboard`

5. **Handle Special Routes**
   - `/p` and `/profile`: Redirect to user's profile page
   - `/admin/*`: Apply role-based access control

6. **Allow Access**
   - If no restrictions apply, proceed with the request

## Role-Based Access Control

### Admin Routes

Admin routes (`/admin/*`) require specific roles:

```typescript
const isAdminRole = (role: UserRole): boolean => {
  return ADMIN_ROLES.includes(role) || role === "super_admin";
};
```

- Only users with admin roles can access
- Non-admin users are redirected to their profile

### Permission-Based Access

Some admin routes require specific permissions:

```typescript
const hasUserPermission = (role: UserRole, permission: string): boolean => {
  if (permission === "view_all_users") {
    return role === "super_admin" || role === "user_admin";
  }
  return false;
};
```

**Example:** `/admin/users`

- Requires `view_all_users` permission
- Only accessible to `super_admin` and `user_admin` roles
- Other admins are redirected to `/admin`

## Middleware Configuration

```typescript
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Excluded from middleware:**

- `/api/*` - API routes
- `/_next/static/*` - Static files
- `/_next/image/*` - Image optimization
- `/favicon.ico` - Favicon

## Usage Examples

### Adding a New Public Route

```typescript
const PUBLIC_ROUTES = [
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/blog",
  "/faq", // New public route
];
```

### Adding a New Protected Route

```typescript
const PROTECTED_ROUTES = [
  "/dashboard",
  "/p",
  "/settings",
  "/posts",
  "/galleries",
  "/admin",
  "/messages", // New protected route
];
```

### Adding Custom Permission

```typescript
const hasUserPermission = (role: UserRole, permission: string): boolean => {
  if (permission === "view_all_users") {
    return role === "super_admin" || role === "user_admin";
  }
  if (permission === "manage_content") {
    return role === "super_admin" || role === "content_admin";
  }
  return false;
};
```

## Common Scenarios

### Scenario 1: Unauthenticated User Visits Protected Route

```
User visits: /dashboard
Session: null
Result: Redirect to /signin
```

### Scenario 2: Authenticated User Visits Auth Route

```
User visits: /signin
Session: { user: {...} }
Result: Redirect to /dashboard
```

### Scenario 3: Non-Admin User Visits Admin Route

```
User visits: /admin
Session: { user: { role: "user" } }
Result: Redirect to /p/{username}
```

### Scenario 4: Admin Without Permission Visits User Management

```
User visits: /admin/admin-posts
Session: { user: { role: "content_admin" } }
Result: Redirect to /admin
```

### Scenario 5: Anyone Visits Public Route

```
User visits: /about
Session: any (null or valid)
Result: Allow access
```

## Best Practices

1. **Route Matching**
   - Routes match exact paths and all sub-paths
   - Example: `/blog` matches `/blog`, `/blog/post-1`, `/blog/category/tech`

2. **Order of Checks**
   - Public routes are checked first for performance
   - More specific checks come before general ones

3. **Security**
   - Always verify session exists before accessing user data
   - Use type-safe role checks with `UserRole` enum

4. **Performance**
   - Middleware runs on every request - keep logic efficient
   - Consider caching session data if needed

## Related Files

- `src/lib/auth.ts` - Authentication configuration
- `src/types/roles.ts` - Role definitions and constants
- `src/middleware.ts` - Next.js middleware entry point (if exists)

## Troubleshooting

### Issue: Redirect Loop

**Cause:** Protected route redirecting to auth route, which redirects back

**Solution:** Ensure auth routes are in `AUTH_ROUTES` array

### Issue: Admin Can't Access Route

**Cause:** Missing role or permission check

**Solution:** Verify role is in `ADMIN_ROLES` and has required permission

### Issue: Public Route Requires Auth

**Cause:** Route not in `PUBLIC_ROUTES` array

**Solution:** Add route to `PUBLIC_ROUTES` constant
