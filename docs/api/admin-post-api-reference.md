# Admin Post API Reference

Complete API reference for admin post management and review endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [List Posts for Review](#list-posts-for-review)
4. [Get Post for Review](#get-post-for-review)
5. [Review Post (Approve/Reject)](#review-post-approvereject)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Overview

The Admin Post API provides endpoints for editors and admins to review, approve, and reject blog posts with role-based permissions.

**Features:**
- List posts awaiting review with filtering
- Fetch individual posts for detailed review
- Approve posts (publish)
- Reject posts (send back to draft)
- Role-based review permissions
- Audit logging for all review actions
- Notification system for authors

**Review Workflow:**
```
Author creates post → "drafted"
         ↓
Author submits → "submitted" (visible to reviewers)
         ↓
Reviewer approves → "published" (public)
    OR
Reviewer rejects → "drafted" (back to author with notes)
```

---

## Authentication

All admin post endpoints require authentication with review permissions.

**Required:** Active user session with `review_posts` permission  
**Header:** `Cookie: better-auth.session_token=<token>`

**Allowed Roles:**
- **Editor:** Can review posts from Authors and other Editors (NOT Content Admin posts)
- **Content Admin:** Can review all posts
- **Super Admin:** Can review all posts

---

## List Posts for Review

Retrieve a paginated list of posts with filtering and search capabilities.

### Endpoint

```
GET /api/admin/posts
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search by title or slug |
| `status` | string | No | "" | Filter by status ("", "published", "submitted", "drafted", "deleted") |
| `sort` | string | No | "uploadTime" | Sort field (title, slug, uploadTime, updatedAt) |
| `order` | string | No | "desc" | Sort order (asc, desc) |
| `skip` | number | No | 0 | Pagination offset |
| `limit` | number | No | 20 | Results per page (10, 20, 50) |

### Authentication

**Required:** Active user session with `review_posts` permission

### Permission Checks

- Must have `review_posts` permission
- Editors cannot review Content Admin posts (checked via `canReviewPost()`)

### Visibility Rules

**Published/Submitted Posts:**
- Visible to all reviewers

**Drafted/Deleted Posts:**
- Only visible to the post author
- Reviewers cannot see other users' drafts

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 15 post(s)",
  "data": [
    {
      "id": "post_123",
      "title": "Getting Started with Next.js",
      "slug": "getting-started-with-nextjs",
      "excerpt": "A comprehensive guide to building modern web applications with Next.js...",
      "status": "submitted",
      "uploadTime": "2026-07-20T10:30:00.000Z",
      "updatedAt": "2026-07-20T14:22:00.000Z",
      "author": {
        "id": "user_456",
        "name": "John Doe",
        "username": "johndoe",
        "role": "author"
      },
      "tags": [
        {
          "id": "tag_1",
          "name": "Next.js"
        },
        {
          "id": "tag_2",
          "name": "React"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "total": 15,
      "skip": 0,
      "limit": 20,
      "hasMore": false
    },
    "timestamp": "2026-07-25T09:48:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid status value. Must be one of: '', 'published', 'submitted', 'drafted', 'deleted'"
  }
}
```

**403 Forbidden** - No review permission
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to review posts"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch posts"
  }
}
```

### Example

```typescript
// Get all submitted posts awaiting review
const response = await fetch(
  '/api/admin/posts?status=submitted&sort=uploadTime&order=desc&skip=0&limit=20',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} posts awaiting review`);
  result.data.forEach(post => {
    console.log(`${post.title} by ${post.author.name} (${post.status})`);
  });
}

// Search posts
const searchResponse = await fetch(
  '/api/admin/posts?search=nextjs&status=&skip=0&limit=20',
  { credentials: 'include' }
);

// Get published posts
const publishedResponse = await fetch(
  '/api/admin/posts?status=published&sort=updatedAt&order=desc&skip=0&limit=50',
  { credentials: 'include' }
);
```

---

## Get Post for Review

Retrieve detailed information about a specific post for review.

### Endpoint

```
GET /api/admin/posts/review/[slug]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Post slug |

### Authentication

**Required:** Active user session with `review_posts` permission

### Permission Checks

1. Must have `review_posts` permission
2. Must pass `canReviewPost(reviewerRole, authorRole)` check
   - Editors cannot review Content Admin posts
3. Drafted/Deleted posts: Only accessible to author

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "id": "post_123",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "content": "# Introduction\n\nNext.js is a powerful React framework...",
    "excerpt": "A comprehensive guide to building modern web applications with Next.js...",
    "status": "submitted",
    "footnote": "Please review the technical accuracy of the code examples.",
    "uploadTime": "2026-07-20T10:30:00.000Z",
    "updatedAt": "2026-07-20T14:22:00.000Z",
    "author": {
      "id": "user_456",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author"
    },
    "tags": [
      {
        "id": "tag_1",
        "name": "Next.js"
      },
      {
        "id": "tag_2",
        "name": "React"
      },
      {
        "id": "tag_3",
        "name": "Web Development"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-25T09:48:30.000Z"
  }
}
```

### Error Responses

**403 Forbidden** - No review permission
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to review posts"
  }
}
```

**403 Forbidden** - Cannot access drafted post
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You cannot access this post"
  }
}
```

**403 Forbidden** - Cannot review this author
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You cannot review posts from this author"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Post not found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch post"
  }
}
```

### Example

```typescript
// Get post for review
const response = await fetch(
  '/api/admin/posts/review/getting-started-with-nextjs',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  const post = result.data;
  console.log(`Title: ${post.title}`);
  console.log(`Author: ${post.author.name} (${post.author.role})`);
  console.log(`Status: ${post.status}`);
  console.log(`Tags: ${post.tags.map(t => t.name).join(', ')}`);
  console.log(`Content length: ${post.content.length} characters`);
  
  if (post.footnote) {
    console.log(`Author's note: ${post.footnote}`);
  }
}
```

---

## Review Post (Approve/Reject)

Approve or reject a post after review.

### Endpoint

```
PATCH /api/admin/posts/review/[slug]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Post slug |

### Request Body

```json
{
  "action": "approve",
  "footnote": "Great article! Approved for publication."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Review action: "approve" or "reject" |
| `footnote` | string | Yes | Review notes/feedback for author |

### Authentication

**Required:** Active user session with `review_posts` permission

### Permission Checks

Same as GET endpoint:
1. Must have `review_posts` permission
2. Must pass `canReviewPost()` check
3. Cannot review own posts (unless reviewer ≠ author)

### Business Logic

**Approve Action:**
- Changes post status to "published"
- Updates `footnote` with review notes
- Creates audit log: `post_approved`
- Sends notification to author (if reviewer ≠ author)

**Reject Action:**
- Changes post status to "drafted"
- Updates `footnote` with revision notes
- Creates audit log: `post_rejected`
- Sends notification to author (if reviewer ≠ author)

### Success Response

**Status:** 200 OK

**Approve:**
```json
{
  "success": true,
  "message": "Post approved and published",
  "data": {
    "id": "post_123",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "status": "published",
    "footnote": "Great article! Approved for publication.",
    "updatedAt": "2026-07-25T09:49:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-25T09:49:00.000Z",
    "auditLogId": "audit_890"
  }
}
```

**Reject:**
```json
{
  "success": true,
  "message": "Post rejected and sent to draft",
  "data": {
    "id": "post_123",
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "status": "drafted",
    "footnote": "Please add more code examples and improve the introduction.",
    "updatedAt": "2026-07-25T09:49:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-25T09:49:00.000Z",
    "auditLogId": "audit_891"
  }
}
```

### Error Responses

**400 Bad Request** - Invalid action
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid action. Must be 'approve' or 'reject'"
  }
}
```

**400 Bad Request** - Missing footnote
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Footnote is required"
  }
}
```

**403 Forbidden** - Cannot review
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You cannot review this post"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Post not found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to update post"
  }
}
```

### Example

```typescript
// Approve post
const approveResponse = await fetch(
  '/api/admin/posts/review/getting-started-with-nextjs',
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      action: 'approve',
      footnote: 'Excellent article! Well-researched and clearly written. Approved for publication.'
    })
  }
);

const approveResult = await approveResponse.json();
if (approveResult.success) {
  console.log('Post approved and published!');
  console.log('Audit log ID:', approveResult.meta.auditLogId);
}

// Reject post with feedback
const rejectResponse = await fetch(
  '/api/admin/posts/review/getting-started-with-nextjs',
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      action: 'reject',
      footnote: 'Please address the following:\n1. Add more code examples\n2. Improve the introduction\n3. Fix typos in section 3'
    })
  }
);

const rejectResult = await rejectResponse.json();
if (rejectResult.success) {
  console.log('Post sent back to author for revision');
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `missing_parameter` | 400 | Required parameter not provided |
| `invalid_parameter` | 400 | Parameter value invalid |
| `unauthorized` | 401 | Not authenticated |
| `account_inactive` | 403 | User account is not active |
| `insufficient_permissions` | 403 | User lacks required permissions |
| `not_found` | 404 | Post not found |
| `internal_error` | 500 | Server error |

---

## Examples

### Post Review Dashboard

```typescript
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  uploadTime: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  tags: Array<{ id: string; name: string }>;
}

function ReviewDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState({
    status: 'submitted',
    search: '',
    sort: 'uploadTime',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    loadPosts();
  }, [filters, pagination.skip]);

  async function loadPosts() {
    const params = new URLSearchParams({
      ...filters,
      skip: pagination.skip.toString(),
      limit: pagination.limit.toString()
    });

    const response = await fetch(`/api/admin/posts?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      setPosts(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.pagination.total,
        hasMore: result.meta.pagination.hasMore
      }));
    }
  }

  function handleFilterChange(field: string, value: string) {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, skip: 0 }));
  }

  function viewPost(slug: string) {
    window.location.href = `/admin/posts/review/${slug}`;
  }

  return (
    <div className="review-dashboard">
      <h1>Post Review Dashboard</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search posts..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="published">Published</option>
          <option value="drafted">Drafted</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
        >
          <option value="uploadTime">Upload Time</option>
          <option value="updatedAt">Last Updated</option>
          <option value="title">Title</option>
        </select>

        <select
          value={filters.order}
          onChange={(e) => handleFilterChange('order', e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="posts-list">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>
                  <div>{post.title}</div>
                  <div className="excerpt">{post.excerpt}</div>
                </td>
                <td>
                  {post.author.name}
                  <br />
                  <span className="role">({post.author.role})</span>
                </td>
                <td>
                  <span className={`status status-${post.status}`}>
                    {post.status}
                  </span>
                </td>
                <td>{new Date(post.uploadTime).toLocaleString()}</td>
                <td>
                  <button onClick={() => viewPost(post.slug)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
          disabled={pagination.skip === 0}
        >
          Previous
        </button>
        <span>
          Showing {pagination.skip + 1} - {pagination.skip + posts.length} of {pagination.total}
        </span>
        <button
          onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
          disabled={!pagination.hasMore}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ReviewDashboard;
```

### Post Review Page

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

function PostReviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<any>(null);
  const [footnote, setFootnote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    const response = await fetch(`/api/admin/posts/review/${slug}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      setPost(result.data);
      setFootnote(result.data.footnote || '');
    } else {
      alert(result.error.message);
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!footnote.trim()) {
      alert('Please provide feedback in the footnote');
      return;
    }

    const confirmed = confirm(
      action === 'approve'
        ? 'Are you sure you want to approve and publish this post?'
        : 'Are you sure you want to reject this post and send it back to the author?'
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/posts/review/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, footnote })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        window.location.href = '/admin/posts';
      } else {
        alert(result.error.message);
      }
    } catch (error) {
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-review-page">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="meta">
          <span>By {post.author.name} ({post.author.role})</span>
          <span>Status: {post.status}</span>
          <span>Submitted: {new Date(post.uploadTime).toLocaleString()}</span>
        </div>
        <div className="tags">
          {post.tags.map(tag => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))}
        </div>
      </div>

      <div className="post-content">
        <h2>Content</h2>
        <div className="content-preview">
          {/* Render markdown content */}
          <pre>{post.content}</pre>
        </div>
      </div>

      <div className="review-section">
        <h2>Review Feedback</h2>
        <textarea
          value={footnote}
          onChange={(e) => setFootnote(e.target.value)}
          placeholder="Provide feedback for the author..."
          rows={6}
          required
        />

        <div className="actions">
          <button
            onClick={() => handleReview('approve')}
            disabled={isSubmitting || !footnote.trim()}
            className="btn-approve"
          >
            {isSubmitting ? 'Processing...' : 'Approve & Publish'}
          </button>
          <button
            onClick={() => handleReview('reject')}
            disabled={isSubmitting || !footnote.trim()}
            className="btn-reject"
          >
            {isSubmitting ? 'Processing...' : 'Reject & Send Back'}
          </button>
          <button
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostReviewPage;
```

### Review Service

```typescript
class PostReviewService {
  static async getPostsForReview(filters: {
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
    skip?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/admin/posts?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return {
        posts: result.data,
        pagination: result.meta.pagination
      };
    }
    throw new Error(result.error.message);
  }

  static async getPostForReview(slug: string) {
    const response = await fetch(`/api/admin/posts/review/${slug}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async approvePost(slug: string, footnote: string) {
    const response = await fetch(`/api/admin/posts/review/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'approve', footnote })
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async rejectPost(slug: string, footnote: string) {
    const response = await fetch(`/api/admin/posts/review/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'reject', footnote })
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async getPendingReviewCount() {
    const { posts } = await this.getPostsForReview({
      status: 'submitted',
      limit: 1
    });
    return posts.pagination?.total || 0;
  }
}

export default PostReviewService;
```

---

## Related Documentation

- [Blog API Reference](./blog-api-reference.md) - General blog post endpoints
- [RBAC System](../features/rbac.md) - Review permissions details
- [Blog Management](../features/blog-management.md) - Blog feature overview
- [Audit Log API](./audit-log-api-reference.md) - Review action audit logs
- [Notification API](./notification-api-reference.md) - Author notifications

---

## Review Permission Matrix

| Reviewer Role | Can Review Posts From |
|---------------|----------------------|
| **Editor** | Author, Editor (NOT Content Admin) |
| **Content Admin** | All roles (Author, Editor, Content Admin) |
| **Super Admin** | All roles |

**Note:** Reviewers cannot review their own posts unless they are also the author.

---

**Last Updated:** 2026-07-25  
**API Version:** 1.0
