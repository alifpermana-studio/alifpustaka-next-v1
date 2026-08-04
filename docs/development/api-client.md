# API Client Usage Guide

How to use the API client to fetch data from the admin app.

---

## Overview

The API client (`src/lib/api-client.ts`) provides a type-safe interface for communicating with the admin app's REST API.

---

## Basic Usage

### Import the Client

```typescript
import { publicApi, userApi } from '@/lib/api-client';
```

### Public API (No Auth Required)

```typescript
// Get posts list
const { data, total } = await publicApi.getPosts({
  page: 1,
  pageSize: 10,
});

// Get single post
const post = await publicApi.getPostBySlug('my-post');

// Get featured posts
const featured = await publicApi.getFeaturedPosts();

// Search posts
const { posts } = await publicApi.searchPosts('nextjs', 10);
```

### User API (Auth Required)

```typescript
// Get user's bookmarks
const bookmarks = await userApi.getBookmarks();

// Get user profile
const profile = await userApi.getProfile();
```

---

## Server Components

Fetch data on the server for better SEO and performance.

### Example: Blog Listing

```typescript
// app/(blog)/blog/page.tsx
import { publicApi } from '@/lib/api-client';

interface PageProps {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  
  const { data: posts, total, pageSize } = await publicApi.getPosts({
    page,
    pageSize: 12,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1>Blog Posts</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

### Example: Single Post

```typescript
// app/(blog)/blog/[slug]/page.tsx
import { publicApi } from '@/lib/api-client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const post = await publicApi.getPostBySlug(slug);
    return <BlogViewer post={post} />;
  } catch (error) {
    if (error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const post = await publicApi.getPostBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [post.coverImage],
      },
    };
  } catch {
    return { title: 'Post Not Found' };
  }
}
```

---

## Client Components

For interactive features that require client-side data fetching.

### Example: Search Component

```typescript
'use client';

import { useState } from 'react';
import { publicApi, PublicPost } from '@/lib/api-client';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { posts } = await publicApi.searchPosts(query, 5);
      setResults(posts);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search posts..."
      />
      
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>

      {results.length > 0 && (
        <div>
          {results.map((post) => (
            <SearchResult key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example: Bookmarks Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { userApi, PublicPost } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

export default function BookmarksPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    userApi
      .getBookmarks()
      .then(setBookmarks)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please log in to view bookmarks</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>My Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p>No bookmarks yet</p>
      ) : (
        bookmarks.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
```

---

## Advanced Usage

### Pagination

```typescript
interface BlogListProps {
  initialPage?: number;
}

export default function BlogList({ initialPage = 1 }: BlogListProps) {
  const [page, setPage] = useState(initialPage);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    publicApi
      .getPosts({ page, pageSize: 10 })
      .then((response) => {
        setPosts(response.data);
        setTotal(response.total);
      });
  }, [page]);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      
      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= Math.ceil(total / 10)}
      >
        Next
      </button>
    </div>
  );
}
```

### Filtering

```typescript
interface FilteredPostsProps {
  category?: string;
  tag?: string;
}

export default function FilteredPosts({ category, tag }: FilteredPostsProps) {
  const [posts, setPosts] = useState<PublicPost[]>([]);

  useEffect(() => {
    publicApi
      .getPosts({ category, tag })
      .then((response) => setPosts(response.data));
  }, [category, tag]);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### With Loading States

```typescript
function usePosts(params?: { page?: number; category?: string }) {
  const [data, setData] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    publicApi
      .getPosts(params)
      .then((response) => setData(response.data))
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [params?.page, params?.category]);

  return { data, isLoading, error };
}

// Usage
export default function PostList() {
  const { data: posts, isLoading, error } = usePosts({ page: 1 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return posts.map((post) => <PostCard key={post.id} post={post} />);
}
```

---

## Error Handling

### Automatic Redirect on 401

The API client automatically redirects to login on 401:

```typescript
// Happens automatically in api-client.ts
if (error.response?.status === 401) {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  window.location.href = `${adminUrl}/signin?returnUrl=${window.location.href}`;
}
```

### Manual Error Handling

```typescript
try {
  const post = await publicApi.getPostBySlug(slug);
  return post;
} catch (error) {
  if (error.response?.status === 404) {
    // Post not found
    notFound();
  } else if (error.response?.status === 500) {
    // Server error
    console.error('Server error:', error);
  } else {
    // Other errors
    console.error('Unknown error:', error);
  }
  throw error;
}
```

### User-Friendly Error Messages

```typescript
function getErrorMessage(error: any): string {
  if (error.response?.status === 404) {
    return 'Content not found';
  } else if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  } else if (!navigator.onLine) {
    return 'No internet connection';
  } else {
    return 'Something went wrong';
  }
}

// Usage
try {
  const posts = await publicApi.getPosts();
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

---

## Performance Optimization

### Server-Side Rendering (SSR)

```typescript
// Fetched on every request
export default async function Page() {
  const posts = await publicApi.getPosts();
  return <PostList posts={posts} />;
}
```

### Static Site Generation (SSG)

```typescript
// Generated at build time
export const dynamic = 'force-static';

export default async function Page() {
  const posts = await publicApi.getPosts();
  return <PostList posts={posts} />;
}
```

### Incremental Static Regeneration (ISR)

```typescript
// Regenerate every hour
export const revalidate = 3600;

export default async function Page() {
  const posts = await publicApi.getPosts();
  return <PostList posts={posts} />;
}
```

### Client-Side Caching with SWR

```typescript
import useSWR from 'swr';

function usePosts() {
  const { data, error, isLoading } = useSWR(
    '/posts',
    () => publicApi.getPosts(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    posts: data?.data,
    isLoading,
    error,
  };
}
```

---

## TypeScript Support

### Type-Safe API Calls

```typescript
import { PublicPost, PaginatedResponse } from '@/lib/api-client';

async function fetchPosts(): Promise<PaginatedResponse<PublicPost>> {
  return await publicApi.getPosts();
}

async function fetchPost(slug: string): Promise<PublicPost> {
  return await publicApi.getPostBySlug(slug);
}
```

### Custom Types

```typescript
interface PostWithComments extends PublicPost {
  comments: Comment[];
}

// Type assertion if needed
const postWithComments = post as PostWithComments;
```

---

## Testing

### Mocking API Calls

```typescript
// __tests__/api-client.test.ts
import { publicApi } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
  publicApi: {
    getPosts: jest.fn(),
    getPostBySlug: jest.fn(),
  },
}));

describe('API Client', () => {
  it('fetches posts', async () => {
    const mockPosts = [{ id: '1', title: 'Test' }];
    
    (publicApi.getPosts as jest.Mock).mockResolvedValue({
      data: mockPosts,
      total: 1,
    });

    const result = await publicApi.getPosts();
    expect(result.data).toEqual(mockPosts);
  });
});
```

---

## Best Practices

### 1. Use Server Components When Possible

```typescript
// ✓ Preferred: Server component
export default async function Page() {
  const posts = await publicApi.getPosts();
  return <PostList posts={posts} />;
}

// ✗ Avoid: Client component with useEffect
'use client';
export default function Page() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    publicApi.getPosts().then(setPosts);
  }, []);
  return <PostList posts={posts} />;
}
```

### 2. Handle Errors Gracefully

```typescript
// ✓ Good
try {
  const post = await publicApi.getPostBySlug(slug);
  return post;
} catch (error) {
  console.error('Failed to fetch post:', error);
  notFound();
}

// ✗ Bad
const post = await publicApi.getPostBySlug(slug); // Unhandled error
```

### 3. Use TypeScript Types

```typescript
// ✓ Good
const posts: PublicPost[] = await publicApi.getPosts().then(r => r.data);

// ✗ Bad
const posts: any = await publicApi.getPosts(); // Loses type safety
```

### 4. Cache Appropriately

```typescript
// ✓ Good: Cache frequently accessed data
export const revalidate = 3600; // 1 hour

// ✗ Bad: No caching for static content
export const dynamic = 'force-dynamic';
```

---

## Next Steps

- [Local Development Setup](./local-setup.md)
- [API Integration Architecture](../architecture/api-integration.md)
- [Troubleshooting](../deployment/troubleshooting.md)

---

**Last Updated:** 2026-08-03
