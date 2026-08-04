# API Request Configuration Guide

Where to send API requests: Server-side vs Client-side in Docker.

---

## Question

> If we request API endpoint in server-side, do we use `app.mydomain.com/api/*` or `localhost:3000/api`?

---

## Answer

### Server-Side (Next.js Server Components, API Routes)

**In Docker containers:**

```typescript
// ✅ OPTION 1: Use container name (internal networking - FASTEST)
const API_URL = "http://alifpustaka-admin-app:3000";

// ✅ OPTION 2: Use public URL (through Traefik)
const API_URL = "https://app.mydomain.com";

// ❌ WRONG: localhost refers to the container itself
const API_URL = "http://localhost:3001";
```

**Why localhost doesn't work in Docker:**
- Server code runs **inside the public-site container**
- `localhost` in that container = the container itself
- Admin app is in a **different container**
- Must use container name or public URL

### Client-Side (Browser, React Components)

**Client-side MUST use public URL:**

```typescript
// ✅ CORRECT: Browser can access public URL
const API_URL = "https://app.mydomain.com";

// ❌ WRONG: Browser cannot resolve Docker container names
const API_URL = "http://alifpustaka-admin-app:3000";
```

---

## Configuration Options

### Option 1: Single URL (Current - Simplest)

**Environment:**
```env
NEXT_PUBLIC_ADMIN_API_URL="https://app.mydomain.com"
```

**Code:**
```typescript
// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

// Works for:
// - Client-side ✅ (browser → https://app.mydomain.com)
// - Server-side ✅ (container → https://app.mydomain.com via Traefik)
```

**Pros:**
- Simple configuration
- Works everywhere
- Easy to understand

**Cons:**
- Server-side requests go through Traefik (extra network hop)
- Slightly slower than internal networking

---

### Option 2: Separate URLs (Optimal Performance)

**Environment:**
```env
# For client-side (browser)
NEXT_PUBLIC_ADMIN_API_URL="https://app.mydomain.com"

# For server-side only (internal Docker network)
ADMIN_API_INTERNAL_URL="http://alifpustaka-admin-app:3000"
```

**Code:**
```typescript
// src/lib/api-client.ts
const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.ADMIN_API_INTERNAL_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL)
  : process.env.NEXT_PUBLIC_ADMIN_API_URL;

// Client-side: uses https://app.mydomain.com
// Server-side: uses http://alifpustaka-admin-app:3000 (internal)
```

**Pros:**
- Server-side uses fast internal networking
- No Traefik overhead for server requests
- Optimal performance

**Cons:**
- Requires code changes
- Slightly more complex

---

## Detailed Explanation

### Where Code Runs

**Server-Side Code (runs in container):**
- Server Components
- `getServerSideProps`
- `getStaticProps`
- API Routes
- Middleware

**Client-Side Code (runs in browser):**
- Client Components (`'use client'`)
- `useEffect`
- Event handlers
- Browser JavaScript

### Network Access

**Server-Side in Docker:**
```
┌──────────────────────────────────────┐
│   alifpustaka-network                │
│                                      │
│  ┌────────────┐    ┌──────────────┐ │
│  │ Public     │───►│  Admin       │ │
│  │ Site       │    │  App         │ │
│  │ Container  │    │  Container   │ │
│  └────────────┘    └──────────────┘ │
│                                      │
└──────────────────────────────────────┘

Public site can reach admin via:
- Container name: alifpustaka-admin-app:3000
- Public URL: app.mydomain.com (through Traefik)
```

**Client-Side (Browser):**
```
┌──────────┐         ┌─────────┐        ┌──────────┐
│ Browser  │────────►│ Traefik │───────►│  Admin   │
│          │         │  (SSL)  │        │   App    │
└──────────┘         └─────────┘        └──────────┘
     Internet            Server             Container

Browser must use: https://app.mydomain.com
Cannot access: alifpustaka-admin-app:3000
```

---

## Examples

### Server Component (Server-Side)

```typescript
// app/blog/page.tsx
import { publicApi } from '@/lib/api-client';

export default async function BlogPage() {
  // Runs on server (in container)
  // Uses API_BASE_URL from api-client.ts
  const { data: posts } = await publicApi.getPosts();
  
  // If using Option 1: goes to https://app.mydomain.com
  // If using Option 2: goes to http://alifpustaka-admin-app:3000
  
  return <PostList posts={posts} />;
}
```

### Client Component (Client-Side)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api-client';

export default function SearchBar() {
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    // Runs in browser
    // MUST use public URL: https://app.mydomain.com
    const { posts } = await publicApi.searchPosts(query);
    setResults(posts);
  };

  return <input onKeyDown={handleSearch} />;
}
```

---

## Recommendation

### For Your Setup

**Use Option 1 (Current Configuration):**

```env
NEXT_PUBLIC_ADMIN_API_URL="https://app.mydomain.com"
```

**Reasons:**
- ✅ Simple and works everywhere
- ✅ No code changes needed
- ✅ Already configured correctly
- ✅ Easier to debug (same URL everywhere)
- ✅ SSL/TLS handled by Traefik

**When to use Option 2:**
- High traffic (server-side requests are frequent)
- Need maximum performance
- Want to avoid Traefik overhead
- Have monitoring to debug internal requests

---

## Testing

### Test Server-Side Request

Create test page:

```typescript
// app/api/test-internal/route.ts
export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    return Response.json({
      success: true,
      api_url: API_URL,
      admin_response: data,
    });
  } catch (error) {
    return Response.json({
      success: false,
      api_url: API_URL,
      error: error.message,
    }, { status: 500 });
  }
}
```

Test:
```bash
curl https://alifpustaka.web.id/api/test-internal
```

### Test Client-Side Request

Create test component:

```typescript
'use client';

export default function TestClient() {
  const test = async () => {
    const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    const res = await fetch(`${API_URL}/api/health`);
    const data = await res.json();
    console.log('Client test:', data);
  };

  return <button onClick={test}>Test API</button>;
}
```

---

## Summary

### Question: Use public URL or localhost?

**Answer:**

| Context | Use | Example |
|---------|-----|---------|
| Server-side in Docker | Container name OR public URL | `http://alifpustaka-admin-app:3000` OR `https://app.mydomain.com` |
| Client-side (browser) | Public URL only | `https://app.mydomain.com` |
| ❌ Never use | localhost in Docker | `http://localhost:3001` |

### Your Current Config (Correct ✅)

```env
NEXT_PUBLIC_ADMIN_API_URL="https://app.mydomain.com"
```

**Works for:**
- ✅ Server-side (container → Traefik → admin app)
- ✅ Client-side (browser → Traefik → admin app)

**This is the recommended setup for simplicity and reliability.**

---

**Last Updated:** 2026-08-04T09:30:00Z
