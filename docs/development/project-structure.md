# Project Structure

Understanding the public site's file organization and architecture.

---

## Directory Overview

```
alifpustaka-next-v1/
├── .next/                    # Build output (generated)
├── docs/                     # Documentation
├── node_modules/             # Dependencies (generated)
├── public/                   # Static assets
├── src/                      # Source code
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   ├── context/              # React contexts
│   ├── hooks/                # Custom hooks
│   ├── icons/                # SVG icons
│   ├── lib/                  # Utilities and helpers
│   └── types/                # TypeScript types
├── .env.local                # Local environment variables
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

---

## Source Directory (`src/`)

### App Router (`src/app/`)

Next.js 16 App Router structure.

```
app/
├── (blog)/                   # Blog layout group
│   ├── blog/
│   │   └── [slug]/          # Dynamic blog post route
│   │       └── page.tsx     # /blog/[slug]
│   ├── home/
│   │   └── page.tsx         # /home
│   └── layout.tsx           # Blog layout
├── (main)/                   # Main layout group
│   ├── page.tsx             # Homepage (/)
│   └── layout.tsx           # Main layout
├── api/
│   └── auth/
│       └── [...all]/        # Better Auth endpoints
│           └── route.ts
├── signin/
│   └── page.tsx             # Redirect to admin signin
├── signup/
│   └── page.tsx             # Redirect to admin signup
├── favicon.ico
├── globals.css              # Global styles
├── layout.tsx               # Root layout
└── not-found.tsx            # 404 page
```

**Route Groups:**
- `(blog)` - Blog-related pages
- `(main)` - Main site pages

Groups don't affect URL structure but share layouts.

### Components (`src/components/`)

Reusable React components.

```
components/
├── blog/                     # Blog-specific components
│   ├── view/
│   │   └── BlogViewer.tsx   # Post display component
│   └── ...
├── discussion/               # Comment/discussion components
├── form/                     # Form components
├── home/                     # Homepage components
│   └── homepage.tsx
├── layout/                   # Layout components
│   ├── Footer.tsx
│   └── Navbar.tsx
├── not-found/                # 404 components
├── reset-password/           # Password reset components
└── ui/                       # UI primitives
    ├── ThemeSwitcher.tsx
    └── ...
```

**Component Naming:**
- PascalCase for components
- Descriptive names (e.g., `BlogViewer`, not `Viewer`)

### Context (`src/context/`)

React Context providers for global state.

```
context/
├── AuthContext.tsx           # Authentication state
├── ThemeContext.tsx          # Theme (dark/light)
├── ToastContext.tsx          # Toast notifications
├── NotificationContext.tsx   # User notifications
├── PostContext.tsx           # Post state (if needed)
└── GalleryContext.tsx        # Gallery state (if needed)
```

**Usage:**
```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, isAuthenticated } = useAuth();
}
```

### Hooks (`src/hooks/`)

Custom React hooks for reusable logic.

```
hooks/
└── (custom hooks here)
```

**Example:**
```typescript
// hooks/usePosts.ts
export function usePosts() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    publicApi.getPosts().then(setPosts);
  }, []);
  
  return { posts };
}
```

### Icons (`src/icons/`)

SVG icon components.

```
icons/
└── web-assets.tsx            # Logo and brand assets
```

### Library (`src/lib/`)

Utilities, helpers, and integrations.

```
lib/
├── api-client.ts             # API client (Axios)
├── auth.client.ts            # Better Auth client
├── auth.ts                   # Auth config
├── utils.ts                  # General utilities
├── FormatDate.ts             # Date formatting
├── truncate-content.ts       # Content truncation
└── utils/                    # Additional utilities
```

**Key Files:**

**`api-client.ts`** - Main API integration
```typescript
export const apiClient = new ApiClient();
export const publicApi = { ... };
export const userApi = { ... };
```

**`auth.client.ts`** - Better Auth client
```typescript
export const authClient = createAuthClient({ ... });
```

### Types (`src/types/`)

TypeScript type definitions.

```
types/
├── api.ts                    # API response types
├── auth.d.ts                 # Auth types
├── roles.ts                  # User roles
├── apus-post.d.ts            # Post types
├── discussion.d.ts           # Discussion types
├── notification.d.ts         # Notification types
└── toast.d.ts                # Toast types
```

**Example:**
```typescript
// types/api.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## Configuration Files

### `next.config.ts`

Next.js configuration.

```typescript
const nextConfig: NextConfig = {
  // Configuration here
};

export default nextConfig;
```

### `tailwind.config.ts`

Tailwind CSS configuration.

```typescript
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
};
```

### `tsconfig.json`

TypeScript configuration.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Path Aliases:**
- `@/` → `src/`
- Example: `import { useAuth } from '@/context/AuthContext'`

### `package.json`

Dependencies and scripts.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest"
  }
}
```

---

## Public Directory

Static assets served directly.

```
public/
├── images/
├── fonts/
└── ...
```

**Access in code:**
```html
<img src="/images/logo.png" alt="Logo" />
```

---

## Documentation

```
docs/
├── README.md                 # Documentation index
├── getting-started/
│   ├── quick-start.md
│   ├── installation.md
│   └── environment.md
├── architecture/
│   ├── overview.md
│   ├── authentication.md
│   └── api-integration.md
├── development/
│   ├── local-setup.md
│   ├── project-structure.md  # This file
│   └── api-client.md
└── deployment/
    ├── production.md
    ├── environment-variables.md
    └── troubleshooting.md
```

---

## File Naming Conventions

### Components
- **PascalCase:** `BlogViewer.tsx`, `PostCard.tsx`
- **Descriptive:** Clearly indicate purpose

### Pages (App Router)
- **lowercase:** `page.tsx`, `layout.tsx`
- **Route segments:** `[slug]`, `(group)`

### Utilities
- **camelCase:** `api-client.ts`, `utils.ts`
- **Kebab-case for multi-word:** `format-date.ts`

### Types
- **camelCase with .d.ts:** `auth.d.ts`
- **Or .ts:** `api.ts`, `roles.ts`

---

## Import Patterns

### Absolute Imports (Preferred)

```typescript
import { useAuth } from '@/context/AuthContext';
import { publicApi } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
```

### Relative Imports (Avoid when possible)

```typescript
import { useAuth } from '../../context/AuthContext';  // ✗ Avoid
import { useAuth } from '@/context/AuthContext';      // ✓ Prefer
```

---

## Build Output

### `.next/` Directory

Generated by `npm run build`.

```
.next/
├── cache/                    # Build cache
├── server/                   # Server bundles
├── static/                   # Static assets
└── ...
```

**Never commit:** This directory is generated and gitignored.

---

## Key Architectural Patterns

### 1. Server Components (Default)

```typescript
// app/blog/page.tsx
export default async function BlogPage() {
  const posts = await publicApi.getPosts();  // Runs on server
  return <PostList posts={posts} />;
}
```

### 2. Client Components

```typescript
'use client';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  // Interactive component
}
```

### 3. API Routes (Better Auth only)

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';

export const { GET, POST } = auth.handler;
```

### 4. Layout Composition

```typescript
// app/layout.tsx (Root)
└── app/(blog)/layout.tsx (Blog layout)
    └── app/(blog)/blog/[slug]/page.tsx (Page)
```

---

## Next Steps

- [Local Development Guide](./local-setup.md)
- [API Client Usage](./api-client.md)
- [Architecture Overview](../architecture/overview.md)

---

**Last Updated:** 2026-08-03
