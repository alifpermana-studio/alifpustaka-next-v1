# Authentication Documentation

Complete OAuth authentication setup and implementation guide for Google and GitHub sign-in.

---

## Overview

This project uses [Better Auth](https://www.better-auth.com/) for authentication with support for:
- Email/Password authentication
- Google OAuth
- GitHub OAuth
- Automatic username generation for OAuth users
- Email verification
- Session management

---

## Quick Start

**New to the project?** Start here:

1. **[OAuth Setup Guide](./oauth-setup.md)** - Register OAuth apps and configure credentials
2. Test the implementation
3. Refer to troubleshooting if needed

---

## Documentation Files

### 1. **[oauth-setup.md](./oauth-setup.md)** - Main Setup Guide
**Use this for:** Setting up OAuth for the first time

**Contents:**
- What was implemented (code overview)
- Step-by-step OAuth app registration (Google & GitHub)
- Environment variable configuration
- Testing scenarios
- Troubleshooting common issues
- Security considerations
- Production deployment checklist

**Start here if you need to:**
- Set up OAuth from scratch
- Configure OAuth credentials
- Understand the OAuth flow
- Troubleshoot redirect URI issues

---

### 2. **[oauth-implementation.md](./oauth-implementation.md)** - Technical Implementation
**Use this for:** Understanding how OAuth works under the hood

**Contents:**
- Database hooks implementation
- Username generation logic
- Duplicate email detection
- How the OAuth flow works step-by-step
- Code structure and benefits
- Testing checklist

**Start here if you need to:**
- Understand the technical implementation
- Debug username generation issues
- Learn about database hooks
- Modify OAuth behavior

---

### 3. **[oauth-troubleshooting.md](./oauth-troubleshooting.md)** - Legacy Documentation
**Use this for:** Historical reference only

**Contents:**
- Previous implementation approach (route handler wrapper)
- Error fixes from earlier implementation
- Alternative approaches that were considered

**Note:** This documents an older implementation approach. Current implementation uses database hooks (see oauth-implementation.md).

---

## Implementation Summary

### Current Approach: Database Hooks ✅

The OAuth implementation uses Better Auth's `databaseHooks` API:

```typescript
databaseHooks: {
  user: {
    create: {
      before: async (user, ctx) => {
        // Generate username for OAuth users
        // Check for duplicate emails
        // Set emailVerified = true
        return { data: modifiedUser };
      }
    }
  }
}
```

**Benefits:**
- Atomic operation (username generated before database insert)
- No race conditions
- Clean code using official API
- Username always required in database

### OAuth Flow

```
User clicks OAuth button
         ↓
Better Auth redirects to provider
         ↓
User authorizes
         ↓
Provider redirects to callback
         ↓
Database hook fires (before user creation)
         ↓
Username generated automatically
         ↓
User created with username
         ↓
Redirect to profile page
```

### Username Generation

- **GitHub:** Uses GitHub username directly
- **Google:** Extracts from email (before @)
- **Collision handling:** Appends 3-digit random number
- **Validation:** Ensures uniqueness in database

---

## Quick Reference

### Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Callback URLs

- **Development:** `http://localhost:3000/api/auth/callback/{provider}`
- **Production:** `https://alifpustaka.web.id/api/auth/callback/{provider}`

### Key Files

- `src/lib/auth.ts` - Better Auth configuration with database hooks
- `src/lib/utils/generate-username.ts` - Username generation utility
- `src/app/api/auth/[...all]/route.ts` - Auth API routes
- `src/components/pages/signup-form.tsx` - Sign-up form with OAuth buttons
- `src/components/pages/signin-form.tsx` - Sign-in form with OAuth buttons

---

## Common Tasks

### Testing OAuth Locally

1. Ensure OAuth credentials are in `.env.local`
2. Restart dev server: `npm run dev`
3. Navigate to `/signup`
4. Click Google or GitHub button
5. Authorize with provider
6. Should redirect to profile page

### Checking Database

```sql
-- View recent OAuth users
SELECT id, email, username, "emailVerified", "createdAt" 
FROM "user" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Check for users without usernames (should be none)
SELECT COUNT(*) FROM "user" WHERE username IS NULL OR username = '';
```

### Debugging

1. Check console logs for `[OAuth]` prefixed messages
2. Verify environment variables are loaded
3. Check OAuth app callback URLs match exactly
4. Ensure database connection is working
5. Clear Next.js cache: `Remove-Item -Recurse -Force .next`

---

## Security Notes

- OAuth credentials should never be committed to version control
- Use different OAuth apps for development and production
- Session duration: 30 days (configurable in `src/lib/auth.ts`)
- OAuth users automatically have `emailVerified = true`
- Duplicate email with different provider is blocked

---

## Support

**Issues?** Check the documentation in this order:
1. [oauth-setup.md](./oauth-setup.md) - Troubleshooting section
2. [oauth-implementation.md](./oauth-implementation.md) - Testing checklist
3. Better Auth documentation: https://www.better-auth.com/

**Common Errors:**
- "Redirect URI mismatch" → Check callback URLs in OAuth app settings
- "username_is_required" → Database hooks not firing (check implementation)
- "Email already registered" → Duplicate email prevention working correctly
- OAuth popup blocked → Allow popups or check if using redirects

---

**Last Updated:** 2026-07-25
