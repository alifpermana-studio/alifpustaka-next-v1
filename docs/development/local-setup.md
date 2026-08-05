# Local Development Setup

Guide for setting up and running the public site in development mode.

---

## Prerequisites

Before starting, ensure you have:

1. **Admin App Running**
   - `alifpustaka-next-app-v1` must be running
   - Accessible at `http://localhost:3001` (or your configured URL)
   - Database migrated and seeded

2. **Development Tools**
   - Node.js 20.x or higher
   - npm 10.x or yarn
   - Git (optional)

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`.

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:

```env
# Must match admin app secret
BETTER_AUTH_SECRET="Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="
BETTER_AUTH_URL="http://localhost:3000"

# For local development
COOKIE_DOMAIN=".localhost"

# Admin app URL
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"

# Public site URL
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Image CDN
R2_PUBLIC_BASE_URL="localhost:3001/images"
```

### 3. Verify Admin App Connection

Test the API connection:

```bash
curl http://localhost:3001/api/public/posts
```

Should return JSON response with posts (or empty array).

---

## Running Development Server

### Start the Server

```bash
npm run dev
```

Server starts at [http://localhost:3000](http://localhost:3000)

### Development Features

- **Hot Reload:** Changes auto-refresh in browser
- **Fast Refresh:** Preserves component state
- **Error Overlay:** Shows compile errors in browser
- **Source Maps:** Debug original TypeScript code

---

## Development Workflow

### Typical Development Session

1. **Start Admin App**
   ```bash
   cd ../alifpustaka-next-app-v1
   npm run dev
   ```

2. **Start Public Site**
   ```bash
   cd ../alifpustaka-next-v1
   npm run dev
   ```

3. **Open Browser**
   - Public site: http://localhost:3000
   - Admin app: http://localhost:3001

4. **Make Changes**
   - Edit files in `src/`
   - Browser auto-refreshes

5. **Test Features**
   - Browse blog posts
   - Test login flow
   - Check API integration

### Directory Structure

```
alifpustaka-next-v1/
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── (blog)/          # Blog routes
│   │   │   ├── blog/
│   │   │   │   └── [slug]/  # Single post page
│   │   │   └── home/        # Blog home
│   │   ├── (main)/          # Main layout routes
│   │   │   └── page.tsx     # Homepage
│   │   ├── api/
│   │   │   └── auth/        # Better Auth endpoints
│   │   ├── signin/          # Redirect to admin
│   │   └── signup/          # Redirect to admin
│   ├── components/          # React components
│   │   ├── blog/            # Blog components
│   │   ├── home/            # Homepage components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI primitives
│   ├── context/             # React contexts
│   │   ├── AuthContext.tsx  # Authentication
│   │   └── ThemeContext.tsx # Dark/light theme
│   ├── lib/                 # Utilities
│   │   ├── api-client.ts    # API integration
│   │   ├── auth.client.ts   # Better Auth client
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
│       ├── auth.d.ts
│       └── api.ts
├── public/                  # Static assets
├── docs/                    # Documentation
├── .env.local              # Environment variables
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind config
└── tsconfig.json           # TypeScript config
```

---

## Common Development Tasks

### Adding a New Page

1. **Create page file**
   ```bash
   # Example: About page
   mkdir -p src/app/about
   touch src/app/about/page.tsx
   ```

2. **Implement page**
   ```typescript
   export default function AboutPage() {
     return <div>About Us</div>;
   }
   ```

3. **Add navigation link**
   ```typescript
   // src/components/layout/Navbar.tsx
   const navLinks = [
     { label: "Home", href: "/" },
     { label: "Blog", href: "/blog" },
     { label: "About", href: "/about" }, // New link
   ];
   ```

### Fetching Data from API

1. **Server Component (SSR)**
   ```typescript
   import { publicApi } from '@/lib/api-client';
   
   export default async function Page() {
     const posts = await publicApi.getPosts();
     return <PostList posts={posts} />;
   }
   ```

2. **Client Component**
   ```typescript
   'use client';
   import { useEffect, useState } from 'react';
   import { publicApi } from '@/lib/api-client';
   
   export default function Page() {
     const [posts, setPosts] = useState([]);
     
     useEffect(() => {
       publicApi.getPosts().then(setPosts);
     }, []);
     
     return <PostList posts={posts} />;
   }
   ```

### Adding a Component

1. **Create component file**
   ```bash
   touch src/components/blog/PostCard.tsx
   ```

2. **Implement component**
   ```typescript
   interface PostCardProps {
     post: PublicPost;
   }
   
   export function PostCard({ post }: PostCardProps) {
     return (
       <article>
         <h2>{post.title}</h2>
         <p>{post.excerpt}</p>
       </article>
     );
   }
   ```

3. **Use component**
   ```typescript
   import { PostCard } from '@/components/blog/PostCard';
   
   export default function Page() {
     return <PostCard post={post} />;
   }
   ```

---

## Debugging

### Browser DevTools

1. **Console Logs**
   ```typescript
   console.log('API Response:', posts);
   ```

2. **Network Tab**
   - View API requests
   - Check response status
   - Inspect headers/cookies

3. **React DevTools**
   - Install React DevTools extension
   - Inspect component tree
   - View props/state

### VS Code Debugging

1. **Create `.vscode/launch.json`**
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Next.js: debug server-side",
         "type": "node-terminal",
         "request": "launch",
         "command": "npm run dev"
       }
     ]
   }
   ```

2. **Set breakpoints** in VS Code

3. **Press F5** to start debugging

### Server Logs

View logs in terminal:
```bash
npm run dev
# Logs appear here
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

Example test file:

```typescript
// __tests__/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/blog/PostCard';

describe('PostCard', () => {
  it('renders post title', () => {
    const post = {
      id: '1',
      title: 'Test Post',
      // ...other required fields
    };
    
    render(<PostCard post={post} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
```

---

## Linting and Formatting

### Run Linter

```bash
npm run lint
```

### Auto-fix Issues

```bash
npm run lint -- --fix
```

### Format Code (Prettier)

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## Environment-Specific Configuration

### Development (Default)

By default, use localhost without cross-subdomain cookies:

```env
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
BASE_URL="http://localhost:3000"
COOKIE_DOMAIN=
```

**Note:** Cookies won't be shared between `localhost:3000` and `localhost:3001` with this setup. This is fine for most development work.

---

## Sharing Cookies Locally (Advanced)

If you need to test shared authentication cookies between the public site and admin app locally, use custom local domains.

### Why Share Cookies?

- Test cross-subdomain authentication flow
- Match production behavior more closely
- Debug session sharing issues

### Setup Steps

#### 1. Edit Hosts File

**Windows:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines:
   ```
   127.0.0.1 alifpustaka.local
   127.0.0.1 app.alifpustaka.local
   ```
4. Save the file

**Mac/Linux:**
1. Open terminal
2. Edit with sudo: `sudo nano /etc/hosts`
3. Add these lines:
   ```
   127.0.0.1 alifpustaka.local
   127.0.0.1 app.alifpustaka.local
   ```
4. Save: `Ctrl+O`, `Enter`, then `Ctrl+X`

#### 2. Update Environment Variables

Edit `.env.local`:

```env
# Better Auth
BETTER_AUTH_SECRET="Pywb/xX8ePMRnzaRez0BZAWzxS4SRzQnJQAdEFVqLdw="
BETTER_AUTH_URL="http://alifpustaka.local:3000"

# Enable cross-subdomain cookies
COOKIE_DOMAIN=".alifpustaka.local"

# Admin API URL
NEXT_PUBLIC_ADMIN_API_URL="http://app.alifpustaka.local:3001"

# Public site base URL
BASE_URL="http://alifpustaka.local:3000"
NEXT_PUBLIC_BASE_URL="http://alifpustaka.local:3000"

# Image CDN
R2_PUBLIC_BASE_URL=img.alifpustaka.web.id

# OAuth Providers (same as before)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
```

#### 3. Update Next.js Config

Edit `next.config.ts` to allow custom local domains:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  reactCompiler: true,
  allowedDevOrigins: [
    "alifpustaka.local",
    "app.alifpustaka.local"
  ],
  images: {
    // ... existing image config
  },
};

export default nextConfig;
```

**Note:** `allowedDevOrigins` is required for Next.js to accept requests from custom local domains in development mode.

#### 4. Update Admin App Environment

Also update the admin app's `.env.local`:

```env
BETTER_AUTH_URL="http://app.alifpustaka.local:3001"
COOKIE_DOMAIN=".alifpustaka.local"
BASE_URL="http://app.alifpustaka.local:3001"
NEXT_PUBLIC_BASE_URL="http://app.alifpustaka.local:3001"
```

And update admin app's `next.config.ts`:

```typescript
allowedDevOrigins: [
  "alifpustaka.local",
  "app.alifpustaka.local"
],
```

#### 5. Restart Development Servers

Restart both applications:

```bash
# Stop both servers (Ctrl+C)

# Restart public site
npm run dev

# Restart admin app (in admin directory)
cd ../alifpustaka-next-app-v1
npm run dev
```

#### 6. Access via Custom Domains

Open your browser:

- **Public site:** http://alifpustaka.local:3000
- **Admin app:** http://app.alifpustaka.local:3001

### Verify Shared Cookies

1. Login on admin app: http://app.alifpustaka.local:3001
2. Open browser DevTools → Application → Cookies
3. Check for cookies with domain `.alifpustaka.local`
4. Navigate to public site: http://alifpustaka.local:3000
5. You should be logged in automatically

### Troubleshooting Shared Cookies

**Cookies not appearing:**
- Clear browser cookies for `.alifpustaka.local`
- Verify `COOKIE_DOMAIN=".alifpustaka.local"` in both apps
- Check browser DevTools → Console for errors

**DNS not resolving:**
- Flush DNS cache:
  - Windows: `ipconfig /flushdns`
  - Mac: `sudo dscacheutil -flushcache`
  - Linux: `sudo systemd-resolve --flush-caches`

**Still using localhost:**
- Clear browser cache
- Try incognito/private window
- Verify hosts file saved correctly

### Switching Back to Localhost

To return to simple localhost setup:

1. **Update `.env.local`:**
   ```env
   BETTER_AUTH_URL="http://localhost:3000"
   COOKIE_DOMAIN=
   NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
   BASE_URL="http://localhost:3000"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

2. **Restart dev server**

3. **Optional:** Remove hosts file entries (or leave them, they won't interfere)

---

## Using Custom Domains (Local) - Legacy

This section is kept for reference. Use the "Sharing Cookies Locally" section above for detailed instructions.

Edit your hosts file:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux:** `/etc/hosts`

Add:
```
127.0.0.1 alifpustaka.local
127.0.0.1 app.alifpustaka.local
```

Update `.env.local`:
```env
BETTER_AUTH_URL="http://alifpustaka.local:3000"
NEXT_PUBLIC_ADMIN_API_URL="http://app.alifpustaka.local:3001"
COOKIE_DOMAIN=".alifpustaka.local"
```

---

## SSH Tunneling for Remote Services

If you need to access remote services (database, API) during local development, use SSH tunneling.

### Overview

SSH tunneling allows you to securely forward ports from a remote server to your local machine. Useful when:

- Remote database needs to be accessed locally
- Admin API is on a remote server
- Services are behind a firewall
- Testing with production-like data

### Basic Concepts

**Local Port Forwarding:**
```
Local Machine:local_port → SSH Server → Remote Service:remote_port
```

### Common Use Cases

#### 1. Access Remote Database

Forward PostgreSQL from remote server:

```bash
ssh -L 5432:localhost:5432 user@remote-server.com
```

Update `.env.local`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

Your application connects to the remote database via `localhost:5432`.

#### 2. Access Remote Admin API

Forward admin API:

```bash
ssh -L 3001:localhost:3001 user@remote-server.com
```

Update `.env.local`:
```env
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
```

#### 3. Multiple Services

Forward multiple ports:

```bash
ssh -L 5432:localhost:5432 \
    -L 3001:localhost:3001 \
    -L 6379:localhost:6379 \
    user@remote-server.com
```

Forwards PostgreSQL (5432), Admin API (3001), Redis (6379).

#### 4. Service on Different Host

```bash
ssh -L 3001:admin-server:3000 user@bastion-server.com
```

Connects to `admin-server:3000` through `bastion-server.com`.

### Tunnel Options

**Keep Tunnel Alive:**
```bash
ssh -L 5432:localhost:5432 \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    user@remote-server.com
```

**Run in Background:**
```bash
ssh -fN -L 5432:localhost:5432 user@remote-server.com
```

Options:
- `-f`: Fork to background
- `-N`: Don't execute remote commands

**Use SSH Config:**

Create/edit `~/.ssh/config` (Windows: `C:\Users\YourName\.ssh\config`):

```
Host alifpustaka-tunnel
    HostName remote-server.com
    User your-username
    LocalForward 5432 localhost:5432
    LocalForward 3001 localhost:3001
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then run:
```bash
ssh alifpustaka-tunnel
```

### Development Workflow with Tunnel

#### Create Tunnel Script

**Windows (`scripts/tunnel.ps1`):**
```powershell
Write-Host "Creating SSH tunnel to production..."
ssh -N -L 5432:localhost:5432 `
       -L 3001:localhost:3001 `
       -o ServerAliveInterval=60 `
       user@remote-server.com
```

**Mac/Linux (`scripts/tunnel.sh`):**
```bash
#!/bin/bash

echo "Creating SSH tunnel to production..."
ssh -N -L 5432:localhost:5432 \
       -L 3001:localhost:3001 \
       -o ServerAliveInterval=60 \
       user@remote-server.com
```

Make executable:
```bash
chmod +x scripts/tunnel.sh
```

#### Development Session

1. **Start tunnel** (separate terminal):
   
   **Windows:**
   ```powershell
   .\scripts\tunnel.ps1
   ```
   
   **Mac/Linux:**
   ```bash
   ./scripts/tunnel.sh
   ```

2. **Verify connection**:
   
   **Windows:**
   ```powershell
   # Test API
   curl http://localhost:3001/api/health
   
   # Test database port
   Test-NetConnection localhost -Port 5432
   ```
   
   **Mac/Linux:**
   ```bash
   # Test API
   curl http://localhost:3001/api/health
   
   # Test database port
   nc -zv localhost 5432
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Stop tunnel**:
   
   **Windows:**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "ssh"}
   Stop-Process -Id <PID>
   ```
   
   **Mac/Linux:**
   ```bash
   ps aux | grep ssh
   kill <PID>
   ```

### Managing Tunnels

**List Active Tunnels:**

Windows:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "ssh"}
```

Mac/Linux:
```bash
ps aux | grep "ssh -"
```

**Kill Specific Tunnel:**

Windows:
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 5432 | Select-Object OwningProcess
netstat -ano | findstr :5432

# Kill by PID
Stop-Process -Id <PID> -Force
```

Mac/Linux:
```bash
# Find PID
lsof -ti:5432

# Kill process
kill <PID>
```

**Check Port Usage:**

Windows:
```powershell
Test-NetConnection localhost -Port 5432
netstat -ano | findstr :5432
```

Mac/Linux:
```bash
lsof -i :5432
nc -zv localhost 5432
```

### Troubleshooting SSH Tunnels

**Connection Refused:**

1. Verify service is running:
   ```bash
   ssh user@remote-server "netstat -tuln | grep 5432"
   ```

2. Check firewall:
   ```bash
   ssh user@remote-server "sudo ufw status"
   ```

**Port Already in Use:**

Windows:
```powershell
$port = 5432
$proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

Mac/Linux:
```bash
lsof -ti:5432 | xargs kill
```

Or use different port:
```bash
ssh -L 5433:localhost:5432 user@remote-server.com
```

**Tunnel Keeps Dropping:**

Add keep-alive options or configure `~/.ssh/config`:
```
ServerAliveInterval 60
ServerAliveCountMax 3
TCPKeepAlive yes
```

**Permission Denied:**

Windows:
```powershell
ssh-add ~\.ssh\id_ed25519
# Or specify key
ssh -i ~\.ssh\id_ed25519 -L 5432:localhost:5432 user@remote-server.com
```

Mac/Linux:
```bash
ssh-add ~/.ssh/id_ed25519
# Or specify key
ssh -i ~/.ssh/id_ed25519 -L 5432:localhost:5432 user@remote-server.com
```

### Security Best Practices

1. **Use SSH Keys:**
   ```bash
   ssh-keygen -t ed25519 -C "dev@alifpustaka"
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote-server.com
   ```

2. **Use Bastion/Jump Host:**
   ```bash
   ssh -J bastion-host user@internal-server -L 5432:localhost:5432
   ```

3. **Limit Forwarded Ports:** Only forward what you need

4. **Consider VPN Alternative:** WireGuard, OpenVPN, or Tailscale for regular use

### Production Environment Example

Access production via bastion server:

**SSH Config (`~/.ssh/config`):**
```
Host alifpustaka-bastion
    HostName bastion.alifpustaka.web.id
    User deploy
    IdentityFile ~/.ssh/alifpustaka_ed25519
    ServerAliveInterval 60

Host alifpustaka-prod-tunnel
    HostName db.internal
    User deploy
    ProxyJump alifpustaka-bastion
    LocalForward 5432 db.internal:5432
    LocalForward 3001 admin.internal:3000
    IdentityFile ~/.ssh/alifpustaka_ed25519
    ServerAliveInterval 60
```

**Connect:**
```bash
ssh -N alifpustaka-prod-tunnel
```

**Environment (`.env.local`):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/alifpustaka"
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
```

**Develop:**
```bash
npm run dev
```

---

## Troubleshooting

### Port Already in Use

```bash
# Change port
PORT=3002 npm run dev
```

Or kill existing process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Fails

1. Verify admin app is running
2. Check `NEXT_PUBLIC_ADMIN_API_URL`
3. Test with curl: `curl http://localhost:3001/api/public/posts`

### Hot Reload Not Working

```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

---

## Next Steps

- [Project Structure Guide](./project-structure.md)
- [API Client Usage](./api-client.md)
- [Deployment Guide](../deployment/production.md)

---

**Last Updated:** 2026-08-05
