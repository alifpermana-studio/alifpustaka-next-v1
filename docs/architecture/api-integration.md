# API Integration Guide

How the public site integrates with the admin app API.

---

## Overview

The public site consumes REST API endpoints from the admin app. All data operations (create, read, update, delete) happen on the admin side. The public site only makes GET requests to fetch published content.

---

## API Client Architecture

### API Client Class

Located at `src/lib/api-client.ts`:

```typescript
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      withCredentials: true, // Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const apiClient = new ApiClient();
```

### Key Features

1. **Credentials Included:** Sends session cookies with every request
2. **Base URL:** Configured via `NEXT_PUBLIC_ADMIN_API_URL`
3. **Auto-Redirect:** 401 responses redirect to login
4. **Type-Safe:** Full TypeScript support

---

## Available Endpoints

### Public Content Endpoints

#### 1. Get Posts List

```typescript
GET /api/public/posts

// Usage
const response = await publicApi.getPosts({
  page: 1,
  pageSize: 10,
  category: 'technology',
  tag: 'javascript',
  search: 'nextjs',
});

// Response
{
  data: PublicPost[],
  total: 100,
  page: 1,
  pageSize: 10
}
```

**Parameters:**
- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 10
- `category` (optional): Filter by category slug
- `tag` (optional): Filter by tag slug
- `search` (optional): Search query

#### 2. Get Single Post

```typescript
GET /api/public/posts/[slug]

// Usage
const post = await publicApi.getPostBySlug('my-blog-post');

// Response: PublicPost object
{
  id: "123",
  title: "My Blog Post",
  slug: "my-blog-post",
  content: "...",
  excerpt: "...",
  coverImage: "https://...",
  author: {
    id: "1",
    name: "John Doe",
    image: "https://...",
    bio: "..."
  },
  category: { ... },
  tags: [ ... ],
  publishedAt: "2026-08-03T...",
  viewCount: 42,
  createdAt: "2026-08-01T...",
  updatedAt: "2026-08-03T..."
}
```

#### 3. Get Featured Posts

```typescript
GET /api/public/posts/featured

// Usage
const featured = await publicApi.getFeaturedPosts();

// Response: PublicPost[] (max 5 posts)
```

#### 4. Search Posts

```typescript
GET /api/public/search?q=query&limit=10

// Usage
const results = await publicApi.searchPosts('nextjs', 10);

// Response
{
  posts: PublicPost[],
  total: 15
}
```

### Authenticated Endpoints

Require valid session cookie.

#### 5. Get User Bookmarks

```typescript
GET /api/user/bookmarks

// Usage
const bookmarks = await userApi.getBookmarks();

// Response: PublicPost[]
// Returns 401 if not authenticated
```

#### 6. Get User Profile

```typescript
GET /api/user/profile

// Usage
const profile = await userApi.getProfile();

// Response
{
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  image: "https://...",
  role: "user"
}
```

---

## Type Definitions

### PublicPost

```typescript
interface PublicPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
  };
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## Usage Examples

### 1. Blog Listing Page

```typescript
// app/(blog)/blog/page.tsx
import { publicApi } from '@/lib/api-client';

export default async function BlogPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  
  const { data: posts, total } = await publicApi.getPosts({
    page,
    pageSize: 12,
  });

  return (
    <div>
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
      <Pagination total={total} page={page} />
    </div>
  );
}
```

### 2. Single Post Page

```typescript
// app/(blog)/blog/[slug]/page.tsx
import { publicApi } from '@/lib/api-client';
import { notFound } from 'next/navigation';

export default async function PostPage({ params }) {
  const { slug } = await params;
  
  try {
    const post = await publicApi.getPostBySlug(slug);
    return <BlogViewer post={post} />;
  } catch (error) {
    notFound();
  }
}
```

### 3. Search Feature

```typescript
// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { publicApi } from '@/lib/api-client';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const { posts } = await publicApi.searchPosts(query, 5);
    setResults(posts);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      {results.map(post => (
        <SearchResult key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 4. User Bookmarks

```typescript
// app/bookmarks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

export default function BookmarksPage() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      userApi.getBookmarks().then(setBookmarks);
    }
  }, [isAuthenticated]);

  return (
    <div>
      {bookmarks.map(post => (
        <BookmarkCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## Error Handling

### Automatic Redirect on 401

```typescript
// src/lib/api-client.ts
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to admin login
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
      window.location.href = `${adminUrl}/signin?returnUrl=${window.location.href}`;
    }
    return Promise.reject(error);
  }
);
```

### Manual Error Handling

```typescript
try {
  const post = await publicApi.getPostBySlug(slug);
  return post;
} catch (error) {
  if (error.response?.status === 404) {
    notFound();
  }
  console.error('Failed to fetch post:', error);
  throw error;
}
```

---

## Performance Optimization

### 1. Server-Side Rendering

Fetch data on the server for better SEO:

```typescript
// Server Component
export default async function Page() {
  const posts = await publicApi.getPosts(); // Runs on server
  return <PostList posts={posts} />;
}
```

### 2. Incremental Static Regeneration

Cache pages and revalidate periodically:

```typescript
export const revalidate = 3600; // Revalidate every hour

export default async function Page() {
  const posts = await publicApi.getPosts();
  return <PostList posts={posts} />;
}
```

### 3. Client-Side Caching

Use SWR or React Query for client-side data fetching:

```typescript
import useSWR from 'swr';

function usePosts() {
  const { data, error } = useSWR(
    '/posts',
    () => publicApi.getPosts(),
    { revalidateOnFocus: false }
  );

  return {
    posts: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}
```

---

## Admin App Requirements

For the public site to work, the admin app must implement these endpoints. See the prompt provided earlier for implementation details.

### Required Admin App Changes

1. **Create `/api/public/` routes**
   - Filter for published content only
   - Remove sensitive data from responses
   - Add pagination support

2. **Configure CORS**
   ```typescript
   headers: {
     'Access-Control-Allow-Origin': process.env.PUBLIC_SITE_URL,
     'Access-Control-Allow-Credentials': 'true',
   }
   ```

3. **Add Rate Limiting**
   - Prevent abuse of public endpoints
   - Set reasonable limits (e.g., 100 req/min)

---

## Next Steps

- [Authentication Flow](./authentication.md)
- [API Client Development](../development/api-client.md)
- [Troubleshooting API Issues](../deployment/troubleshooting.md)

---

**Last Updated:** 2026-08-03
