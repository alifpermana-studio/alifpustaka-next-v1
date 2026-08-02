# Blog API Reference

Complete API reference for blog post management endpoints.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Get Post List](#get-post-list)
3. [Bulk Operations](#bulk-operations)
4. [Single Post Operations](#single-post-operations)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Authentication

All blog API endpoints require authentication via session cookie.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Unauthorized Response:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null,
  "error": {
    "code": "unauthorized",
    "message": "You must be logged in to access this resource"
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

---

## Get Post List

Retrieve a paginated list of the authenticated user's posts.

### Endpoint

```
GET /api/post-list
```

### Query Parameters

| Parameter | Type | Required | Default | Values | Description |
|-----------|------|----------|---------|--------|-------------|
| `search` | string | No | `""` | Any string | Search in title and slug |
| `status` | string | No | `""` | `""`, `"published"`, `"submitted"`, `"drafted"`, `"deleted"` | Filter by post status |
| `sort` | string | Yes | - | `"title"`, `"slug"`, `"uploadTime"`, `"updatedAt"` | Field to sort by |
| `order` | string | Yes | - | `"asc"`, `"desc"` | Sort order |
| `skip` | string | Yes | - | `"0"`, `"20"`, `"40"`, ... | Number of posts to skip |
| `max` | string | Yes | - | `"10"`, `"20"`, `"50"` | Maximum posts per page |

### Request Example

```http
GET /api/post-list?search=tutorial&status=published&sort=updatedAt&order=desc&skip=0&max=20
Host: example.com
Cookie: better-auth.session_token=<token>
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Found 2 post(s)",
  "data": [
    {
      "id": "clx123abc",
      "title": "Next.js Tutorial",
      "slug": "nextjs-tutorial",
      "desc": "Learn Next.js from scratch",
      "content": "# Introduction\n\nWelcome to...",
      "image": "https://example.com/image.jpg",
      "footnote": "Updated July 2026",
      "status": "published",
      "userId": "user123",
      "uploadTime": "2026-07-15T10:30:00.000Z",
      "updatedAt": "2026-07-20T14:22:00.000Z",
      "tags": ["tutorial", "nextjs", "react"]
    },
    {
      "id": "clx456def",
      "title": "TypeScript Best Practices",
      "slug": "typescript-best-practices",
      "desc": "Write better TypeScript code",
      "content": "# Best Practices\n\n1. Use types...",
      "image": "https://example.com/image2.jpg",
      "footnote": "",
      "status": "published",
      "userId": "user123",
      "uploadTime": "2026-07-10T08:15:00.000Z",
      "updatedAt": "2026-07-18T16:45:00.000Z",
      "tags": ["typescript", "tutorial"]
    }
  ],
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z",
    "pagination": {
      "total": 45,
      "skip": 0,
      "limit": 20,
      "hasMore": true
    }
  }
}
```

**No Posts Found (200 OK):**
```json
{
  "success": true,
  "message": "No posts found",
  "data": [],
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z",
    "pagination": {
      "total": 0,
      "skip": 0,
      "limit": 20,
      "hasMore": false
    }
  }
}
```

**Invalid Parameters (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid parameter value",
  "data": null,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid parameter value"
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

### Behavior

- **Security:** Only returns posts where `userId` matches authenticated user
- **Search:** Case-insensitive, searches in `title` and `slug` fields
- **Filtering:** Search works in combination with status filter
- **Sorting:** Supports multiple sort fields with ascending/descending order
- **Pagination:** Uses skip/limit pattern for consistent pagination

---

## Bulk Operations

Perform operations on multiple posts at once.

### Endpoint

```
PATCH /api/posts/bulk
```

### Request Body

```typescript
{
  action: "change_status" | "delete" | "add_tags" | "remove_tags",
  postIds: string[],
  data?: {
    status?: "published" | "submitted" | "drafted" | "deleted",
    tags?: string[]
  }
}
```

### Operations

#### 1. Change Status

Update status for multiple posts.

**Request:**
```json
{
  "action": "change_status",
  "postIds": ["clx123abc", "clx456def", "clx789ghi"],
  "data": {
    "status": "published"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 post(s) updated",
  "data": {
    "succeeded": 3,
    "failed": 0
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

**Valid Status Values:**
- `"published"` - Post is live
- `"submitted"` - Awaiting review
- `"drafted"` - Work in progress
- `"deleted"` - Soft deleted

#### 2. Delete Posts

Soft delete multiple posts (sets status to "deleted").

**Request:**
```json
{
  "action": "delete",
  "postIds": ["clx123abc", "clx456def"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 post(s) deleted",
  "data": {
    "succeeded": 2,
    "failed": 0
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

#### 3. Add Tags

Add tags to multiple posts. Creates tags if they don't exist.

**Request:**
```json
{
  "action": "add_tags",
  "postIds": ["clx123abc", "clx456def"],
  "data": {
    "tags": ["tutorial", "nextjs", "typescript"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tags added to 2 post(s)",
  "data": {
    "succeeded": 2,
    "failed": 0
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

**Behavior:**
- Creates new tags if they don't exist
- Skips tags that already exist on the post
- Trims whitespace from tag names

#### 4. Remove Tags

Remove tags from multiple posts.

**Request:**
```json
{
  "action": "remove_tags",
  "postIds": ["clx123abc", "clx456def"],
  "data": {
    "tags": ["outdated", "draft"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tags removed from 2 post(s)",
  "data": {
    "succeeded": 2,
    "failed": 0
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

**Behavior:**
- Only removes specified tags
- Ignores tags that don't exist on the post
- Does not delete tag entities, only relationships

### Error Responses

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Action and postIds array are required",
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Action and postIds array are required"
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

**Permission Denied (403 Forbidden):**
```json
{
  "success": false,
  "message": "You can only modify your own posts",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only modify your own posts"
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

**Partial Success:**
```json
{
  "success": true,
  "message": "3 post(s) updated, 1 failed",
  "data": {
    "succeeded": 3,
    "failed": 1
  },
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

### Security

- Verifies all posts belong to authenticated user
- Returns 403 if any post is owned by another user
- Uses `Promise.allSettled` for parallel processing
- Creates audit logs for all operations

---

## Single Post Operations

Update or delete individual posts.

### Endpoint

```
PUT /api/blog-post
```

### Delete Post

**Request:**
```json
{
  "action": "deleted",
  "data": {
    "id": "clx123abc",
    "title": "Post Title",
    "slug": "post-slug"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": null,
  "meta": {
    "timestamp": "2026-07-21T16:11:36.004Z"
  }
}
```

For other operations (create, update, publish), see the blog-post API documentation.

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Not authenticated |
| `insufficient_permissions` | 403 | User doesn't own the post(s) |
| `not_found` | 404 | Post not found |
| `validation_error` | 400 | Invalid request data |
| `invalid_parameter` | 400 | Invalid query parameter |
| `missing_parameter` | 400 | Required parameter missing |
| `internal_error` | 500 | Server error |

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:

- **Recommended:** 100 requests per minute per user
- **Bulk operations:** 20 requests per minute per user
- **Search:** 50 requests per minute per user

---

## Examples

### Example 1: Get Published Posts

```bash
curl -X GET \
  'https://example.com/api/post-list?search=&status=published&sort=updatedAt&order=desc&skip=0&max=20' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN'
```

### Example 2: Search for Tutorial Posts

```bash
curl -X GET \
  'https://example.com/api/post-list?search=tutorial&status=&sort=title&order=asc&skip=0&max=20' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN'
```

### Example 3: Bulk Publish Posts

```bash
curl -X PATCH \
  'https://example.com/api/posts/bulk' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN' \
  -d '{
    "action": "change_status",
    "postIds": ["clx123abc", "clx456def"],
    "data": {
      "status": "published"
    }
  }'
```

### Example 4: Add Tags to Multiple Posts

```bash
curl -X PATCH \
  'https://example.com/api/posts/bulk' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN' \
  -d '{
    "action": "add_tags",
    "postIds": ["clx123abc", "clx456def", "clx789ghi"],
    "data": {
      "tags": ["tutorial", "nextjs", "typescript"]
    }
  }'
```

### Example 5: Delete Single Post

```bash
curl -X PUT \
  'https://example.com/api/blog-post' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN' \
  -d '{
    "action": "deleted",
    "data": {
      "id": "clx123abc",
      "title": "Old Post",
      "slug": "old-post"
    }
  }'
```

### Example 6: Get Second Page

```bash
curl -X GET \
  'https://example.com/api/post-list?search=&status=published&sort=updatedAt&order=desc&skip=20&max=20' \
  -H 'Cookie: better-auth.session_token=YOUR_TOKEN'
```

---

## TypeScript Types

```typescript
// Post Status
type PostStatus = "drafted" | "submitted" | "published" | "deleted";

// Post Interface
interface Post {
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  content: string;
  image: string;
  footnote: string;
  status: PostStatus;
  userId: string;
  uploadTime: Date;
  updatedAt?: Date;
  tags: string[];
}

// API Response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta: {
    timestamp: string;
    pagination?: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

// Bulk Action Request
interface BulkActionRequest {
  action: "change_status" | "delete" | "add_tags" | "remove_tags";
  postIds: string[];
  data?: {
    status?: PostStatus;
    tags?: string[];
  };
}

// Bulk Action Response
interface BulkActionResponse {
  succeeded: number;
  failed: number;
}
```

---

## Best Practices

### For Frontend Developers

1. **Always handle errors gracefully**
```typescript
try {
  const response = await fetch('/api/post-list?...');
  const result = await response.json();
  
  if (!result.success) {
    showNotification(result.error.message, 'error');
    return;
  }
  
  // Use result.data
} catch (error) {
  showNotification('Network error', 'error');
}
```

2. **Use debounced search**
```typescript
const [searchInput, setSearchInput] = useState('');

useEffect(() => {
  const timeoutId = setTimeout(() => {
    fetchPosts(searchInput);
  }, 2000);
  
  return () => clearTimeout(timeoutId);
}, [searchInput]);
```

3. **Check pagination metadata**
```typescript
if (result.meta.pagination.hasMore) {
  // Show "Load More" or enable "Next" button
}
```

4. **Validate before bulk operations**
```typescript
if (selectedPosts.size === 0) {
  showNotification('No posts selected', 'warning');
  return;
}
```

### For Backend Developers

1. **Always verify ownership**
```typescript
const post = await prisma.post.findUnique({
  where: { id: postId },
});

if (post.userId !== currentUser.userId) {
  return errorResponse('insufficient_permissions', ...);
}
```

2. **Use transactions for consistency**
```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations
});
```

3. **Create audit logs**
```typescript
createAuditLogAsync({
  action: "post_deleted",
  entityType: "post",
  entityId: postId,
  performedBy: currentUser.userId,
  performedByRole: currentUser.role,
  // ...
});
```

4. **Handle partial failures gracefully**
```typescript
const results = await Promise.allSettled(operations);
const succeeded = results.filter(r => r.status === 'fulfilled').length;
const failed = results.filter(r => r.status === 'rejected').length;
```

---

## Related Documentation

- [Blog Management System](./blog-management.md) - Full feature documentation
- [Error Codes Reference](../development/error-codes.md) - Complete error code list
- [API Response Standards](../development/error-codes.md) - Response format standards

---

**Last Updated:** July 21, 2026  
**Version:** 1.0  
**API Version:** v1
