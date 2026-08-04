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

### Development

```env
NEXT_PUBLIC_ADMIN_API_URL="http://localhost:3001"
BASE_URL="http://localhost:3000"
```

### Using Custom Domains (Local)

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

**Last Updated:** 2026-08-03
