# Tutorial: Setting Up OAuth Authentication

Learn how to configure Google and GitHub OAuth for social login in Alif Pustaka.

---

## What You'll Learn

- How to create OAuth applications on Google and GitHub
- How to configure OAuth credentials in your application
- How to test OAuth login flow
- How to troubleshoot common OAuth issues

**Time:** 20 minutes

---

## Prerequisites

- Alif Pustaka installed and running
- Google account (for Google OAuth)
- GitHub account (for GitHub OAuth)
- Access to `.env.local` file

---

## Part 1: Google OAuth Setup

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `Alif Pustaka`
4. Click **Create**
5. Wait for project creation (10-20 seconds)

### Step 1.2: Enable Google+ API

1. In your new project, go to **APIs & Services** → **Library**
2. Search for `Google+ API`
3. Click on **Google+ API**
4. Click **Enable**

### Step 1.3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**

Fill in the form:

**App Information:**
- App name: `Alif Pustaka`
- User support email: `your-email@example.com`
- App logo: (optional, upload your logo)

**App Domain:**
- Application home page: `http://localhost:3000`
- Privacy policy: `http://localhost:3000/privacy` (optional)
- Terms of service: `http://localhost:3000/terms` (optional)

**Developer Contact:**
- Email: `your-email@example.com`

4. Click **Save and Continue**

**Scopes:**
5. Click **Add or Remove Scopes**
6. Select:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
7. Click **Update** → **Save and Continue**

**Test Users:** (for external apps)
8. Click **Add Users**
9. Add your test email addresses
10. Click **Save and Continue**

11. Review and click **Back to Dashboard**

### Step 1.4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Alif Pustaka Local`

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

5. Click **Create**

### Step 1.5: Save Credentials

A popup appears with your credentials:

```
Client ID: xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

**Important:** Copy these immediately. You can view them later, but save them now.

### Step 1.6: Add to Environment

Open `.env.local` and add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

---

## Part 2: GitHub OAuth Setup

### Step 2.1: Register OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**

### Step 2.2: Fill Application Details

**Application name:**
```
Alif Pustaka Local
```

**Homepage URL:**
```
http://localhost:3000
```

**Application description:** (optional)
```
Alif Pustaka CMS - Local Development
```

**Authorization callback URL:**
```
http://localhost:3000/api/auth/callback/github
```

3. Click **Register application**

### Step 2.3: Generate Client Secret

1. On the app page, find **Client ID** (already visible)
2. Click **Generate a new client secret**
3. Confirm your password
4. **Copy the secret immediately** - you won't see it again!

### Step 2.4: Save Credentials

You now have:

```
Client ID: Iv1.xxxxxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2.5: Add to Environment

Open `.env.local` and add:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## Part 3: Restart and Test

### Step 3.1: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

**Why?** Next.js loads environment variables on startup.

### Step 3.2: Verify OAuth Buttons Appear

1. Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)
2. You should see:
   - **Sign in with Google** button
   - **Sign in with GitHub** button

If buttons don't appear:
- Check environment variables are set correctly
- Verify no typos in variable names (case-sensitive)
- Clear Next.js cache: `Remove-Item -Recurse -Force .next`
- Restart dev server

---

## Part 4: Test OAuth Flow

### Test 4.1: Google OAuth

1. Go to `/signin`
2. Click **Sign in with Google**
3. Select your Google account
4. Click **Allow** to authorize

**Expected Result:**
- Redirected back to your app
- Logged in automatically
- Redirected to `/p/[username]` (profile page)
- Username auto-generated from email

**Check Database:**
```sql
SELECT id, email, username, "emailVerified", "createdAt"
FROM "user"
WHERE email = 'your-google-email@gmail.com';
```

Should show:
- `emailVerified` = current timestamp
- `username` = auto-generated (e.g., `your-google-email`)

### Test 4.2: GitHub OAuth

1. Logout (if logged in)
2. Go to `/signin`
3. Click **Sign in with GitHub**
4. Click **Authorize** (first time only)

**Expected Result:**
- Redirected back to your app
- Logged in with GitHub account
- Username = your GitHub username

**Check Database:**
```sql
SELECT id, email, username, "emailVerified", "createdAt"
FROM "user"
WHERE email = 'your-github-email@example.com';
```

### Test 4.3: Duplicate Email Protection

1. Logout
2. Try to signup with **same email** using different provider
3. Should see error: `Email already registered with another provider`

**This is correct behavior** - prevents duplicate accounts.

---

## Part 5: Production Setup

### Step 5.1: Create Production OAuth Apps

Repeat the setup for production with different URLs:

**Google:**
- Authorized JavaScript origins: `https://yourdomain.com`
- Redirect URI: `https://yourdomain.com/api/auth/callback/google`

**GitHub:**
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/api/auth/callback/github`

### Step 5.2: Production Environment Variables

In production `.env` (or hosting platform):

```bash
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-secret"
GITHUB_CLIENT_ID="production-client-id"
GITHUB_CLIENT_SECRET="production-secret"

BETTER_AUTH_URL="https://yourdomain.com"
BASE_URL="https://yourdomain.com"
```

### Step 5.3: Google OAuth Verification

For production, Google requires app verification:

1. Go to OAuth consent screen
2. Click **Publish App**
3. Submit for verification (if needed)
4. Add privacy policy and terms of service URLs

**Note:** Unverified apps show warning but still work for testing.

---

## What You've Learned

✅ Created Google OAuth application  
✅ Created GitHub OAuth application  
✅ Configured environment variables  
✅ Tested social login flow  
✅ Verified username auto-generation  
✅ Understood duplicate email protection  
✅ Prepared for production deployment  

---

## OAuth Flow Diagram

```
User clicks "Sign in with Google"
          ↓
Redirect to Google Authorization
          ↓
User authorizes app
          ↓
Google redirects to callback URL
          ↓
Better Auth receives authorization code
          ↓
Database hook fires (before user creation)
          ↓
Username auto-generated
          ↓
User created in database
          ↓
Session created
          ↓
Redirect to profile page
```

---

## Username Generation Logic

### Google Users
```
Email: john.doe@gmail.com
Username: johndoe (or johndoe123 if taken)
```

### GitHub Users
```
GitHub Username: johndoe
Username: johndoe (or johndoe456 if taken)
```

### Collision Handling
If username exists, appends 3-digit random number:
```
johndoe → johndoe847
```

---

## Troubleshooting

### Error: "Redirect URI mismatch"

**Cause:** Callback URL doesn't match OAuth app settings

**Solution:**
1. Check OAuth app callback URL exactly matches:
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`
2. No trailing slashes
3. Correct protocol (http vs https)
4. Correct port number

### Error: "Access blocked: Authorization Error"

**Cause:** OAuth consent screen not configured

**Solution:**
1. Complete OAuth consent screen setup
2. Add your email as test user
3. Publish app (or keep in testing mode)

### Error: "Client ID not found"

**Cause:** Environment variables not loaded

**Solution:**
```bash
# Check .env.local exists
# Check variable names are exact (GOOGLE_CLIENT_ID not Google_Client_Id)
# Restart dev server
npm run dev
```

### OAuth buttons don't appear

**Cause:** Environment variables missing or incorrect

**Solution:**
```bash
# Verify variables are set
node -e "console.log(process.env.GOOGLE_CLIENT_ID)"

# Should output your client ID, not undefined

# If undefined, check .env.local file location
# Must be in project root
```

### Username not generated

**Cause:** Database hooks not firing

**Solution:**
1. Check `src/lib/auth.ts` has `databaseHooks` configured
2. Verify Prisma schema has `username` as required field
3. Check console for errors
4. See [OAuth Implementation Guide](../guides/authentication/oauth-implementation.md)

---

## Security Best Practices

### Client Secrets
- ✅ Never commit to version control
- ✅ Use different credentials for dev/production
- ✅ Rotate secrets quarterly
- ❌ Don't share secrets in chat/email

### OAuth Apps
- ✅ Use most restrictive scopes possible
- ✅ Review authorized users regularly
- ✅ Enable 2FA on Google/GitHub accounts
- ❌ Don't use personal accounts for production

### Redirect URIs
- ✅ Whitelist exact URLs only
- ✅ Use HTTPS in production
- ❌ Don't use wildcards
- ❌ Don't allow http:// in production

---

## Next Steps

- **[OAuth Implementation Details](../guides/authentication/oauth-implementation.md)** - Technical deep dive
- **[Authentication Guide](../guides/authentication/overview.md)** - Complete auth system
- **[Your First Blog Post Tutorial](./your-first-blog-post.md)** - Create content
- **[Production Deployment](../guides/deployment/production-checklist.md)** - Deploy your app

---

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Guide](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Last Updated:** 2026-08-01
