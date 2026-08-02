# Authentication Guides

Configure and manage authentication in Alif Pustaka.

---

## Overview

Alif Pustaka supports multiple authentication methods: email/password, Google OAuth, and GitHub OAuth. This section covers setup, implementation, and troubleshooting.

---

## Available Guides

### [OAuth Setup](./oauth-setup.md)
Complete guide to setting up Google and GitHub OAuth.

**What you'll accomplish:**
- Register OAuth applications
- Configure credentials
- Test social login
- Deploy to production

**Use this when:** Setting up OAuth for the first time.

---

### [OAuth Implementation](./oauth-implementation.md)
Technical details of the OAuth implementation.

**What you'll learn:**
- Database hooks architecture
- Username generation logic
- Duplicate email handling
- OAuth flow details

**Use this when:** Understanding or modifying OAuth behavior.

---

### [OAuth Troubleshooting](./oauth-troubleshooting.md)
Solutions to common OAuth issues.

**What you'll find:**
- Redirect URI mismatch solutions
- Client ID errors
- Username generation issues
- Provider-specific problems

**Use this when:** Encountering OAuth errors.

---

## Quick Start

### Enable OAuth in 5 Steps

1. **Create OAuth apps** on Google and GitHub
2. **Copy credentials** (Client ID and Secret)
3. **Add to `.env.local`**:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-secret"
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-secret"
   ```
4. **Restart dev server**: `npm run dev`
5. **Test** at `/signin`

See [OAuth Setup](./oauth-setup.md) for detailed instructions.

---

## Authentication Methods

### Email/Password
- Default authentication method
- Requires email verification
- Password reset functionality
- Bcrypt password hashing

### Google OAuth
- One-click login with Google
- Automatic email verification
- Profile picture sync
- Username auto-generation

### GitHub OAuth
- One-click login with GitHub
- Uses GitHub username
- Public email required
- Profile picture sync

---

## Key Features

### Username Auto-Generation
OAuth users get automatic usernames:
- **Google**: From email (e.g., `john.doe@gmail.com` → `johndoe`)
- **GitHub**: Uses GitHub username directly
- **Collision handling**: Adds 3-digit random number if taken

### Email Verification
- **OAuth users**: Auto-verified (`emailVerified = true`)
- **Credential users**: Must verify via email link
- Required for certain operations

### Session Management
- 30-day session duration
- Automatic renewal on activity
- Secure HttpOnly cookies
- Multi-device support

---

## Related Documentation

- **[OAuth Setup Tutorial](../../tutorials/setting-up-oauth.md)** - Step-by-step tutorial
- **[Authentication Explanation](../../explanation/features/authentication.md)** - How auth works
- **[Auth API Reference](../../reference/api/auth-utility-api-reference.md)** - API endpoints

---

**Last Updated:** 2026-08-01
