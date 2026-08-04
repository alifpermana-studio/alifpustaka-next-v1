# Troubleshooting Guide

Common issues and solutions for the Alif Pustaka public site.

---

## API Connection Issues

### Issue: API requests fail with network error

**Symptoms:**
- "Network Error" in browser console
- API calls timeout
- No data loads on pages

**Solutions:**

1. **Verify admin app is running**
   ```bash
   curl http://localhost:3001/api/public/posts
   ```

2. **Check NEXT_PUBLIC_ADMIN_API_URL**
   ```bash
   echo $NEXT_PUBLIC_ADMIN_API_URL
   # Should output: http://localhost:3001 (dev) or https://app.domain.com (prod)
   ```

3. **Verify CORS configuration on admin app**
   
   Admin app must allow requests from public site:
   ```typescript
   // Admin app: api/public/*/route.ts
   headers: {
     'Access-Control-Allow-Origin': process.env.PUBLIC_SITE_URL,
     'Access-Control-Allow-Credentials': 'true',
   }
   ```

4. **Check firewall/network**
   ```bash
   # Test connection
   telnet localhost 3001
   ```

### Issue: API returns 404

**Symptoms:**
- Admin app is running
- Requests return 404 Not Found

**Solutions:**

1. **Verify admin app has public endpoints**
   
   Check if `/api/public/posts` exists in admin app.

2. **Ensure admin app is updated**
   
   The admin app needs the public API routes. See the prompt provided earlier.

3. **Check URL formatting**
   ```typescript
   // Correct
   NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
   
   // Incorrect
   NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001/" // Trailing slash
   ```

---

## Authentication Issues

### Issue: Session not shared between apps

**Symptoms:**
- Login on admin app doesn't reflect on public site
- User appears logged out on public site
- Cookie not visible in browser DevTools

**Solutions:**

1. **Verify COOKIE_DOMAIN matches**
   
   Both apps must use identical `COOKIE_DOMAIN`:
   ```env
   # Public site .env.local
   COOKIE_DOMAIN=".alifpustaka.web.id"
   
   # Admin app .env.local
   COOKIE_DOMAIN=".alifpustaka.web.id"
   ```

2. **Check BETTER_AUTH_SECRET matches**
   
   Both apps must use the same secret:
   ```bash
   # Compare secrets
   grep BETTER_AUTH_SECRET .env.local
   grep BETTER_AUTH_SECRET ../alifpustaka-next-app-v1/.env.local
   ```

3. **Verify domain structure**
   ```
   ✓ Correct:
   - Admin: app.alifpustaka.web.id
   - Public: alifpustaka.web.id
   - Cookie: .alifpustaka.web.id (note the dot)
   
   ✗ Incorrect:
   - Cookie: alifpustaka.web.id (missing dot)
   - Different base domains
   ```

4. **Development setup with localhost**
   
   For local development:
   ```env
   COOKIE_DOMAIN=".localhost"
   # Or use custom domains in /etc/hosts
   ```

5. **Check browser settings**
   - Allow third-party cookies
   - Disable privacy extensions temporarily
   - Clear existing cookies
   - Try incognito mode

6. **Production HTTPS requirement**
   
   In production, both apps must use HTTPS:
   ```env
   BETTER_AUTH_URL="https://alifpustaka.web.id"  # Not http://
   ```

### Issue: 401 Unauthorized on API requests

**Symptoms:**
- User appears logged in
- API requests fail with 401
- Automatic redirect to login

**Solutions:**

1. **Verify withCredentials is enabled**
   ```typescript
   // src/lib/api-client.ts
   axios.create({
     withCredentials: true, // Must be true
   });
   ```

2. **Check admin app CORS credentials**
   ```typescript
   // Admin app should set:
   'Access-Control-Allow-Credentials': 'true'
   ```

3. **Session expired**
   - Session may have expired
   - User needs to re-login
   - Check session duration in admin app

4. **Cookie not sent**
   - Check browser Network tab
   - Verify Cookie header in request
   - Check domain/path settings

### Issue: Login redirect loop

**Symptoms:**
- Click login, redirects to admin
- Login on admin, redirects back
- Immediately redirects to login again

**Solutions:**

1. **Check returnUrl parameter**
   ```typescript
   // Should include full URL
   window.location.href = `${adminUrl}/signin?returnUrl=${encodeURIComponent(window.location.href)}`;
   ```

2. **Verify admin app handles returnUrl**
   
   Admin app should redirect to returnUrl after login.

3. **Check for infinite redirect**
   
   Ensure public site doesn't immediately redirect authenticated users.

---

## Build/Deployment Issues

### Issue: Build fails with TypeScript errors

**Symptoms:**
- `npm run build` fails
- Type errors in console

**Solutions:**

1. **Check TypeScript configuration**
   ```bash
   npx tsc --noEmit
   ```

2. **Fix type errors**
   ```typescript
   // Common issue: Missing types
   const posts: PublicPost[] = await publicApi.getPosts().then(r => r.data);
   ```

3. **Update dependencies**
   ```bash
   npm install
   ```

### Issue: Environment variables not available

**Symptoms:**
- `process.env.NEXT_PUBLIC_ADMIN_API_URL` is undefined
- API calls fail in production

**Solutions:**

1. **Verify variable names**
   ```env
   # Client-side variables MUST start with NEXT_PUBLIC_
   NEXT_PUBLIC_ADMIN_API_URL="https://app.domain.com"
   ```

2. **Rebuild after env changes**
   ```bash
   npm run build
   ```

3. **Check hosting platform**
   
   Set environment variables in:
   - Vercel: Project Settings → Environment Variables
   - Docker: docker-compose.yml or .env file
   - VPS: Export before starting app

### Issue: Build succeeds but site doesn't work in production

**Symptoms:**
- Build completes without errors
- Site loads but features don't work

**Solutions:**

1. **Check browser console**
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Verify API URL is correct**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_ADMIN_API_URL);
   ```

3. **Check HTTPS/HTTP mismatch**
   ```
   ✗ Mixed content error:
   - Public site: https://domain.com
   - Admin API: http://app.domain.com (insecure)
   
   ✓ Both HTTPS:
   - Public site: https://domain.com
   - Admin API: https://app.domain.com
   ```

---

## Performance Issues

### Issue: Slow page loads

**Symptoms:**
- Pages take long to load
- API requests are slow

**Solutions:**

1. **Enable caching**
   ```typescript
   // ISR for blog posts
   export const revalidate = 3600; // 1 hour
   ```

2. **Use SSG where possible**
   ```typescript
   export const dynamic = 'force-static';
   ```

3. **Optimize images**
   ```typescript
   import Image from 'next/image';
   
   <Image
     src={post.coverImage}
     width={800}
     height={600}
     alt={post.title}
   />
   ```

4. **Check admin app performance**
   - Optimize database queries
   - Add indexes
   - Enable query caching

### Issue: High memory usage

**Symptoms:**
- Server runs out of memory
- Application crashes

**Solutions:**

1. **Increase memory limit**
   ```json
   // package.json
   {
     "scripts": {
       "start": "NODE_OPTIONS='--max-old-space-size=4096' next start"
     }
   }
   ```

2. **Check for memory leaks**
   ```bash
   node --inspect npm run start
   ```

3. **Optimize components**
   - Use React.memo for expensive components
   - Clean up useEffect subscriptions
   - Avoid unnecessary re-renders

---

## Data Issues

### Issue: Posts don't appear

**Symptoms:**
- Blog page is empty
- No posts returned from API

**Solutions:**

1. **Check admin app has published posts**
   ```bash
   curl https://app.domain.com/api/public/posts
   ```

2. **Verify post status filter**
   
   Admin API should only return `status='published'` posts.

3. **Check database**
   
   Ensure posts exist and are published in admin app database.

### Issue: Old data showing (caching)

**Symptoms:**
- Updated posts don't reflect changes
- Stale data displayed

**Solutions:**

1. **Clear Next.js cache**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Trigger revalidation**
   ```typescript
   // On-demand revalidation
   import { revalidatePath } from 'next/cache';
   
   revalidatePath('/blog');
   ```

3. **Reduce revalidation time**
   ```typescript
   export const revalidate = 60; // 1 minute instead of 1 hour
   ```

4. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear site data in DevTools

---

## Development Issues

### Issue: Hot reload not working

**Symptoms:**
- Changes don't reflect in browser
- Need to manually refresh

**Solutions:**

1. **Restart dev server**
   ```bash
   # Ctrl+C then
   npm run dev
   ```

2. **Check file watcher limits (Linux)**
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Clear .next directory**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Issue: Port already in use

**Symptoms:**
- "EADDRINUSE: address already in use :::3000"

**Solutions:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Issue: Module not found

**Symptoms:**
- "Cannot find module '@/lib/api-client'"

**Solutions:**

1. **Check import path**
   ```typescript
   // Correct
   import { publicApi } from '@/lib/api-client';
   
   // Incorrect
   import { publicApi } from 'lib/api-client';
   ```

2. **Verify tsconfig.json paths**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Restart TypeScript server**
   
   In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

---

## Browser-Specific Issues

### Issue: Works in Chrome, not in Safari

**Symptoms:**
- Site works in Chrome/Firefox
- Issues in Safari

**Solutions:**

1. **Check cookie settings**
   
   Safari has strict third-party cookie policies.

2. **Test with "Prevent Cross-Site Tracking" disabled**

3. **Ensure HTTPS in production**

### Issue: Works locally, not in production

**Symptoms:**
- Everything works in development
- Production deployment has issues

**Solutions:**

1. **Check environment variables**
   ```bash
   # Verify all required vars are set
   echo $BETTER_AUTH_SECRET
   echo $NEXT_PUBLIC_ADMIN_API_URL
   ```

2. **Check HTTPS URLs**
   ```env
   # Production should use https://
   NEXT_PUBLIC_ADMIN_API_URL="https://app.domain.com"
   ```

3. **Review browser console**
   
   Check for errors in production site.

---

## Getting Help

If issues persist:

1. **Check browser console** - Most errors appear here
2. **Check server logs** - `npm run dev` output or PM2 logs
3. **Review admin app logs** - API errors may be server-side
4. **Test with curl** - Verify API endpoints work directly
5. **Compare with working deployment** - Check differences

### Useful Debug Commands

```bash
# Test API endpoint
curl -v http://localhost:3001/api/public/posts

# Check environment
node -e "console.log(process.env)"

# View running processes
ps aux | grep node

# Check ports
netstat -tulpn | grep :3000

# Test DNS
nslookup yourdomain.com

# Test SSL
openssl s_client -connect yourdomain.com:443
```

---

## Next Steps

- [Local Development Setup](../development/local-setup.md)
- [Production Deployment](./production.md)
- [Architecture Overview](../architecture/overview.md)

---

**Last Updated:** 2026-08-03
