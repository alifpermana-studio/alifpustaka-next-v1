# OAuth Authentication Setup - Google & GitHub

## ✅ Implementation Complete

All code changes have been implemented. Follow the steps below to complete the OAuth setup.

---

## 🔧 What Was Implemented

### 1. **Username Generation Utility**
- Created `src/lib/utils/generate-username.ts`
- Automatically generates unique usernames for OAuth users
- Strategy:
  - **GitHub**: Uses provider username directly
  - **Google**: Extracts from email (before @)
  - **Collision handling**: Appends random 3-digit number

### 2. **Better Auth Configuration**
- Updated `src/lib/auth.ts` with:
  - Google OAuth provider configuration
  - GitHub OAuth provider configuration
  - 30-day session expiration (remember me enabled by default)
  - Username generation hook during OAuth signup
  - Duplicate email detection (prevents linking accounts with different providers)
  - Automatic `emailVerified = true` for OAuth users

### 3. **Auth Client Updates**
- Updated `src/lib/auth.client.ts`
- Added social providers configuration for Google and GitHub

### 4. **Sign-Up Form**
- Updated `src/components/pages/signup-form.tsx`
- Added OAuth button handlers for Google and GitHub
- Added loading states with spinner animations
- Added error handling and display

### 5. **Sign-In Form**
- Updated `src/components/pages/signin-form.tsx`
- Added OAuth button handlers for Google and GitHub
- Added loading states with spinner animations
- Added error handling and display

### 6. **Route Rename**
- Renamed `/p/[user]` to `/p/[username]` for clarity

---

## 📋 Setup Instructions

### **Step 1: Register OAuth Applications**

#### **Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if not already done)
6. Select "Web application" as application type
7. Add Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://alifpustaka.web.id/api/auth/callback/google`
8. Click "Create"
9. Copy the **Client ID** and **Client Secret**

#### **GitHub OAuth Setup:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Alif Pustaka
   - **Homepage URL**: `http://localhost:3000` (dev) or `https://alifpustaka.web.id` (prod)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret"
7. Copy the **Client Secret** (it will only be shown once!)

**For Production:** Create a second OAuth app for production with the production callback URL, or add multiple callback URLs if the provider supports it.

---

### **Step 2: Update Environment Variables**

Add the following to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

**⚠️ Important:**
- Replace the placeholder values with your actual credentials
- **Never commit these credentials to version control**
- Keep `.env.local` in your `.gitignore`

---

### **Step 3: Restart Development Server**

After adding environment variables, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

---

## 🧪 Testing Your OAuth Setup

### **Test Scenarios:**

1. **Google Sign-Up (New User)**
   - Navigate to `/signup`
   - Click "Google" button
   - Authorize with Google account
   - Should redirect to `/p/[auto-generated-username]`
   - Check database: user should have username, emailVerified=true

2. **GitHub Sign-Up (New User)**
   - Navigate to `/signup`
   - Click "GitHub" button
   - Authorize with GitHub account
   - Should redirect to `/p/[github-username]`
   - Check database: username should match GitHub username

3. **Duplicate Email Prevention**
   - Sign up with email/password using `test@example.com`
   - Try signing up with Google using the same email
   - Should show error: "This email is already registered with a different sign-in method"

4. **OAuth Sign-In (Existing OAuth User)**
   - Sign up with Google
   - Sign out
   - Go to `/signin`
   - Click "Google" button
   - Should immediately sign in and redirect to `/p/[username]`

5. **Profile Image**
   - Sign up with Google or GitHub
   - Check that profile picture from OAuth provider is displayed

---

## 🔍 Troubleshooting

### **Error: "Redirect URI mismatch"**
**Cause:** OAuth app callback URL doesn't match the URL in your Better Auth configuration

**Solution:**
- Verify callback URLs in Google/GitHub OAuth app settings
- Check `BASE_URL` in `.env.local` matches your development URL
- Ensure callback URL is exactly: `{BASE_URL}/api/auth/callback/{provider}`

---

### **Error: "GOOGLE_CLIENT_ID is not defined"**
**Cause:** Environment variables not loaded

**Solution:**
- Verify `.env.local` exists in project root
- Check variable names are exactly as specified
- Restart development server after adding env variables
- Clear Next.js cache: `rm -rf .next`

---

### **Error: "Failed to create user"**
**Cause:** Database connection issue or username constraint violation

**Solution:**
- Check `DATABASE_URL` in `.env.local`
- Verify Prisma schema is up to date: `npx prisma generate`
- Check database logs for constraint errors

---

### **OAuth popup blocked**
**Cause:** Browser blocking popup windows

**Solution:**
- Allow popups for your development domain
- Better Auth typically uses redirects, not popups, so this should be rare

---

### **Username generation fails**
**Cause:** Database connection issue in username generator

**Solution:**
- Check database connection pool configuration
- Verify user table exists and is accessible
- Check console logs for detailed error messages

---

## 🔐 Security Considerations

1. **Never expose Client Secrets:**
   - Keep secrets in `.env.local` only
   - Don't commit to version control
   - Use different credentials for dev/production

2. **Validate Redirect URIs:**
   - Only whitelist your actual domains
   - Don't use wildcards in production

3. **Session Security:**
   - OAuth sessions expire after 30 days
   - Sessions are stored server-side in database
   - Better Auth handles CSRF protection

4. **Email Verification:**
   - OAuth users skip manual email verification (trusted providers)
   - Email/password users still require verification

---

## 📊 Database Schema

Your existing Prisma schema already supports OAuth:

- **User table**: Stores user profile (name, email, username, image)
- **Account table**: Stores OAuth provider data (providerId, accountId, tokens)
- **Session table**: Stores active sessions with expiration

No schema changes needed! ✅

---

## 🚀 Production Deployment

Before deploying to production:

1. **Create production OAuth apps** with production callback URLs
2. **Update environment variables** on your hosting platform:
   - Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - Ensure `BASE_URL=https://alifpustaka.web.id`
3. **Update OAuth app settings** to include production redirect URIs
4. **Test OAuth flow** in production environment

---

## 📝 Next Steps (Optional Enhancements)

Consider implementing these features in the future:

1. **Account Linking UI**: Allow users to link multiple OAuth providers to one account
2. **OAuth Profile Sync**: Periodically update profile image from OAuth provider
3. **Provider Display**: Show which provider user signed up with on profile page
4. **Two-Factor Authentication**: Add 2FA for email/password users
5. **More OAuth Providers**: Add Microsoft, Apple, Twitter, etc.

---

## 🎉 You're All Set!

Once you've completed Steps 1-3 above, your OAuth authentication will be fully functional.

**Questions or issues?** Check the troubleshooting section or review the implementation files.
