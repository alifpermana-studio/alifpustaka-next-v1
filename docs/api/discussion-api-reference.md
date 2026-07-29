# Discussion API Reference

Complete API reference for discussion and comment management endpoints.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
   - [Get Blog Post Comments](#get-blog-post-comments)
3. [User Endpoints](#user-endpoints)
   - [Get Own Comments](#get-own-comments)
   - [Create Comment](#create-comment)
   - [Edit Comment](#edit-comment)
   - [Delete Comment](#delete-comment)
4. [Admin Endpoints](#admin-endpoints)
   - [Get All Comments](#get-all-comments)
   - [Change Comment Status](#change-comment-status)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Authentication

Most discussion API endpoints require authentication via session cookie.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Exception:** Public endpoints (e.g., `GET /api/blog/[slug]/comments`) do not require authentication.

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
    "timestamp": "2026-07-29T02:36:36.405Z"
  }
}
```

---

## Public Endpoints

### Get Blog Post Comments

Retrieve published comments for a specific blog post (no authentication required).

#### Endpoint

```
GET /api/blog/[slug]/comments
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Blog post slug |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | string | No | `"0"` | Number of comments to skip |
| `limit` | string | No | `"10"` | Maximum comments per page (1-50) |

#### Request Example

```http
GET /api/blog/nextjs-tutorial/comments?skip=0&limit=10
Host: example.com
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Found 3 comment(s)",
  "data": [
    {
      "id": "disc123abc",
      "content": "Great article! Very helpful.",
      "status": "published",
      "sourceType": "blog_post",
      "sourceId": "post123",
      "userId": "user123",
      "parentId": null,
      "editedAt": null,
      "editCount": 0,
      "createdAt": "2026-07-28T10:30:00.000Z",
      "updatedAt": "2026-07-28T10:30:00.000Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "username": "johndoe",
        "image": "https://example.com/avatar.jpg"
      },
      "replies": [],
      "replyCount": 0
    }
  ],
  "meta": {
    "timestamp": "2026-07-29T02:36:36.405Z",
    "pagination": {
      "total": 3,
      "skip": 0,
      "limit": 10,
      "hasMore": false
    }
  }
}
```

**Post Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "Not Found",
  "data": null,
  "error": {
    "code": "not_found",
    "message": "Post not found"
  },
  "meta": {
    "timestamp": "2026-07-29T02:36:36.405Z"
  }
}
```

#### Notes

- **No authentication required** - Public endpoint
- Only returns comments with status "published"
- Includes nested replies (currently empty array, ready for future implementation)
- Results sorted by `createdAt` descending (newest first)
- Used by `CommentSection` component on blog post pages

---

## User Endpoints

### Get Own Comments

Retrieve a paginated list of the authenticated user's own comments.

#### Endpoint

```
GET /api/discussions
```

#### Query Parameters

| Parameter | Type | Required | Default | Values | Description |
|-----------|------|----------|---------|--------|-------------|
| `skip` | string | Yes | - | `"0"`, `"10"`, `"20"`, ... | Number of comments to skip |
| `limit` | string | Yes | - | `"10"`, `"20"`, `"50"` | Maximum comments per page |
| `search` | string | No | `""` | Any string | Search in comment content |
| `status` | string | No | `""` | `""`, `"pending"`, `"published"`, `"banned"`, `"deleted"` | Filter by status |
| `sourceType` | string | No | `""` | `""`, `"blog_post"`, `"product_review"`, `"product_qa"` | Filter by source type |

#### Request Example

```http
GET /api/discussions?skip=0&limit=10&status=published&sourceType=blog_post
Host: example.com
Cookie: better-auth.session_token=<token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Found 2 discussion(s)",
  "data": [
    {
      "id": "disc123abc",
      "content": "Great article! Very helpful.",
      "status": "published",
      "sourceType": "blog_post",
      "sourceId": "post123",
      "sourceTitle": "Next.js Tutorial",
      "userId": "user123",
      "parentId": null,
      "editedAt": null,
      "editCount": 0,
      "deletedAt": null,
      "permanentDeleteAt": null,
      "createdAt": "2026-07-28T10:30:00.000Z",
      "updatedAt": "2026-07-28T10:30:00.000Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "username": "johndoe",
        "image": "https://example.com/avatar.jpg"
      },
      "replyCount": 0,
      "canEdit": false,
      "canDelete": true
    }
  ],
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z",
    "pagination": {
      "total": 2,
      "skip": 0,
      "limit": 10,
      "hasMore": false
    }
  }
}
```

**No Comments Found (200 OK):**
```json
{
  "success": true,
  "message": "No discussions found",
  "data": [],
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z",
    "pagination": {
      "total": 0,
      "skip": 0,
      "limit": 10,
      "hasMore": false
    }
  }
}
```

**Missing Parameter (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "missing_parameter",
    "message": "Missing required parameter"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

**Invalid Parameter (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid parameter value"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

#### Notes

- Only returns comments belonging to the authenticated user
- `canEdit` is `true` only if comment was created within the last 30 minutes and status is not "banned" or "deleted"
- `canDelete` is `true` if comment status is not "deleted"
- Results are sorted by `createdAt` in descending order (newest first)

---

### Create Comment

Create a new comment on a blog post or other content.

#### Endpoint

```
POST /api/discussions
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Comment content (1-5000 characters) |
| `sourceType` | string | Yes | Type of content: `"blog_post"`, `"product_review"`, `"product_qa"` |
| `sourceId` | string | Yes | ID of the content being commented on |
| `parentId` | null | Yes | Always `null` for flat comments |

#### Request Example

```http
POST /api/discussions
Host: example.com
Cookie: better-auth.session_token=<token>
Content-Type: application/json

{
  "content": "Great article! Very helpful explanation of Next.js concepts.",
  "sourceType": "blog_post",
  "sourceId": "post123",
  "parentId": null
}
```

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "disc123abc",
    "content": "Great article! Very helpful explanation of Next.js concepts.",
    "status": "pending",
    "sourceType": "blog_post",
    "sourceId": "post123",
    "userId": "user123",
    "parentId": null,
    "createdAt": "2026-07-28T14:11:45.092Z",
    "user": {
      "id": "user123",
      "name": "John Doe",
      "username": "johndoe",
      "image": "https://example.com/avatar.jpg"
    }
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Content must be between 1 and 5000 characters"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

**Source Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "Not Found",
  "data": null,
  "error": {
    "code": "not_found",
    "message": "Post not found"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

**Cannot Comment on Unpublished (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "Cannot comment on unpublished posts"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

#### Notes

- All new comments start with status "pending"
- Content must be 1-5000 characters after trimming
- Source content must exist and be published
- Comment appears immediately to the author with "pending" badge
- Admin must approve before it becomes visible to others

---

### Edit Comment

Edit the content of an existing comment (within 30-minute window).

#### Endpoint

```
PUT /api/discussions/[id]
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Comment ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Updated comment content (1-5000 characters) |

#### Request Example

```http
PUT /api/discussions/disc123abc
Host: example.com
Cookie: better-auth.session_token=<token>
Content-Type: application/json

{
  "content": "Great article! Very helpful explanation of Next.js concepts. Updated with more details."
}
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": "disc123abc",
    "content": "Great article! Very helpful explanation of Next.js concepts. Updated with more details.",
    "editedAt": "2026-07-28T14:15:00.000Z",
    "editCount": 1,
    "updatedAt": "2026-07-28T14:15:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-28T14:15:00.092Z"
  }
}
```

**Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "Not Found",
  "data": null,
  "error": {
    "code": "not_found",
    "message": "Comment not found"
  },
  "meta": {
    "timestamp": "2026-07-28T14:15:00.092Z"
  }
}
```

**Insufficient Permissions (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only edit your own comments"
  },
  "meta": {
    "timestamp": "2026-07-28T14:15:00.092Z"
  }
}
```

**Edit Time Expired (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "Edit time limit (30 minutes) has expired"
  },
  "meta": {
    "timestamp": "2026-07-28T14:15:00.092Z"
  }
}
```

**Cannot Edit Deleted/Banned (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "Cannot edit deleted or banned comments"
  },
  "meta": {
    "timestamp": "2026-07-28T14:15:00.092Z"
  }
}
```

#### Notes

- **30-minute time limit** from comment creation
- Only the comment owner can edit
- Cannot edit comments with status "banned" or "deleted"
- Each edit increments `editCount` and updates `editedAt`
- Audit log is created for the edit action

---

### Delete Comment

Soft delete a comment (30-day grace period before permanent deletion).

#### Endpoint

```
DELETE /api/discussions/[id]
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Comment ID |

#### Request Example

```http
DELETE /api/discussions/disc123abc
Host: example.com
Cookie: better-auth.session_token=<token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Comment deleted successfully. It will be permanently removed after 30 days.",
  "data": {
    "id": "disc123abc",
    "status": "deleted",
    "deletedAt": "2026-07-28T14:20:00.000Z",
    "permanentDeleteAt": "2026-08-27T14:20:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-28T14:20:00.092Z"
  }
}
```

**Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "Not Found",
  "data": null,
  "error": {
    "code": "not_found",
    "message": "Comment not found"
  },
  "meta": {
    "timestamp": "2026-07-28T14:20:00.092Z"
  }
}
```

**Insufficient Permissions (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only delete your own comments"
  },
  "meta": {
    "timestamp": "2026-07-28T14:20:00.092Z"
  }
}
```

**Already Deleted (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "Comment is already deleted"
  },
  "meta": {
    "timestamp": "2026-07-28T14:20:00.092Z"
  }
}
```

#### Notes

- **Soft delete**: Comment is hidden but not removed from database
- **30-day grace period**: `permanentDeleteAt` is set to 30 days from deletion
- Comment remains visible to owner during grace period
- Hidden from public and other users immediately
- Permanent deletion requires cron job (not automatic)
- Audit log is created for the deletion

---

## Admin Endpoints

All admin endpoints require the `moderate_discussions` permission.

### Get All Comments

Retrieve a paginated list of all comments from all users (admin only).

#### Endpoint

```
GET /api/admin/discussions
```

#### Required Permission

`moderate_discussions` (super_admin, content_admin, support_admin)

#### Query Parameters

| Parameter | Type | Required | Default | Values | Description |
|-----------|------|----------|---------|--------|-------------|
| `skip` | string | Yes | - | `"0"`, `"10"`, `"20"`, ... | Number of comments to skip |
| `limit` | string | Yes | - | `"10"`, `"20"`, `"50"` | Maximum comments per page |
| `search` | string | No | `""` | Any string | Search in comment content |
| `status` | string | No | `""` | `""`, `"pending"`, `"published"`, `"banned"`, `"deleted"` | Filter by status |
| `sourceType` | string | No | `""` | `""`, `"blog_post"`, `"product_review"`, `"product_qa"` | Filter by source type |
| `userId` | string | No | `""` | User ID | Filter by comment author |

#### Request Example

```http
GET /api/admin/discussions?skip=0&limit=20&status=pending
Host: example.com
Cookie: better-auth.session_token=<token>
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Found 2 discussion(s)",
  "data": [
    {
      "id": "disc123abc",
      "content": "Great article! Very helpful.",
      "status": "pending",
      "sourceType": "blog_post",
      "sourceId": "post123",
      "sourceTitle": "Next.js Tutorial",
      "userId": "user123",
      "parentId": null,
      "editedAt": null,
      "editCount": 0,
      "deletedAt": null,
      "permanentDeleteAt": null,
      "createdAt": "2026-07-28T10:30:00.000Z",
      "updatedAt": "2026-07-28T10:30:00.000Z",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "username": "johndoe",
        "image": "https://example.com/avatar.jpg",
        "role": "user"
      },
      "replyCount": 0
    }
  ],
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z",
    "pagination": {
      "total": 2,
      "skip": 0,
      "limit": 20,
      "hasMore": false
    }
  }
}
```

**Insufficient Permissions (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to moderate discussions"
  },
  "meta": {
    "timestamp": "2026-07-28T14:11:45.092Z"
  }
}
```

#### Notes

- Returns comments from all users (not just the authenticated user)
- Includes author's role information
- No `canEdit` or `canDelete` flags (admin cannot edit content)
- Results sorted by `createdAt` descending (newest first)

---

### Change Comment Status

Change the status of a comment (admin only).

#### Endpoint

```
PATCH /api/admin/discussions/[id]
```

#### Required Permission

`moderate_discussions` (super_admin, content_admin, support_admin)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Comment ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status: `"pending"`, `"published"`, `"banned"`, `"deleted"` |

#### Request Example

```http
PATCH /api/admin/discussions/disc123abc
Host: example.com
Cookie: better-auth.session_token=<token>
Content-Type: application/json

{
  "status": "published"
}
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Comment status updated successfully",
  "data": {
    "id": "disc123abc",
    "status": "published",
    "updatedAt": "2026-07-28T14:25:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-28T14:25:00.092Z"
  }
}
```

**Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "Not Found",
  "data": null,
  "error": {
    "code": "not_found",
    "message": "Comment not found"
  },
  "meta": {
    "timestamp": "2026-07-28T14:25:00.092Z"
  }
}
```

**Insufficient Permissions (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to moderate discussions"
  },
  "meta": {
    "timestamp": "2026-07-28T14:25:00.092Z"
  }
}
```

**Invalid Status (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Invalid status"
  },
  "meta": {
    "timestamp": "2026-07-28T14:25:00.092Z"
  }
}
```

**Already Has Status (400 Bad Request):**
```json
{
  "success": false,
  "message": "Bad Request",
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "Comment already has this status"
  },
  "meta": {
    "timestamp": "2026-07-28T14:25:00.092Z"
  }
}
```

#### Notes

- **Audit log** is automatically created for the status change
- **Notification** is automatically sent to the comment author
- If status is changed to "deleted", `deletedAt` and `permanentDeleteAt` are set
- Admin cannot modify comment content (only status)
- Common workflow: `pending` → `published` (approve) or `pending` → `banned` (reject)

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `unauthorized` | User not authenticated | 401 |
| `insufficient_permissions` | User lacks required permission | 403 |
| `not_found` | Resource not found | 404 |
| `missing_parameter` | Required parameter missing | 400 |
| `invalid_parameter` | Parameter value invalid | 400 |
| `validation_error` | Request validation failed | 400 |
| `invalid_request` | Request cannot be processed | 400 |
| `internal_error` | Server error | 500 |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for:

- Comment creation (e.g., 10 comments per hour per user)
- Comment edits (e.g., 20 edits per hour per user)
- API requests (e.g., 100 requests per minute per user)

**Recommended Implementation:**
- Use Redis or in-memory cache
- Implement sliding window algorithm
- Return 429 Too Many Requests when exceeded

---

## Examples

### Example 1: Post a Comment

**Request:**
```bash
curl -X POST https://example.com/api/discussions \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=abc123" \
  -d '{
    "content": "Excellent tutorial! Helped me understand Next.js routing.",
    "sourceType": "blog_post",
    "sourceId": "post456",
    "parentId": null
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "disc789",
    "content": "Excellent tutorial! Helped me understand Next.js routing.",
    "status": "pending",
    "sourceType": "blog_post",
    "sourceId": "post456",
    "userId": "user123",
    "parentId": null,
    "createdAt": "2026-07-28T14:30:00.000Z",
    "user": {
      "id": "user123",
      "name": "Jane Smith",
      "username": "janesmith",
      "image": "https://example.com/jane.jpg"
    }
  }
}
```

---

### Example 2: Edit a Comment

**Request:**
```bash
curl -X PUT https://example.com/api/discussions/disc789 \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=abc123" \
  -d '{
    "content": "Excellent tutorial! Helped me understand Next.js routing and data fetching."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": "disc789",
    "content": "Excellent tutorial! Helped me understand Next.js routing and data fetching.",
    "editedAt": "2026-07-28T14:35:00.000Z",
    "editCount": 1,
    "updatedAt": "2026-07-28T14:35:00.000Z"
  }
}
```

---

### Example 3: Admin Approves Comment

**Request:**
```bash
curl -X PATCH https://example.com/api/admin/discussions/disc789 \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=admin-token" \
  -d '{
    "status": "published"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Comment status updated successfully",
  "data": {
    "id": "disc789",
    "status": "published",
    "updatedAt": "2026-07-28T14:40:00.000Z"
  }
}
```

**Side Effects:**
- Audit log created with action "discussion_status_changed"
- Notification sent to user: "Your comment has been approved and is now published"

---

### Example 4: Get Pending Comments (Admin)

**Request:**
```bash
curl -X GET "https://example.com/api/admin/discussions?skip=0&limit=20&status=pending" \
  -H "Cookie: better-auth.session_token=admin-token"
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 discussion(s)",
  "data": [
    {
      "id": "disc001",
      "content": "First comment awaiting approval...",
      "status": "pending",
      "sourceType": "blog_post",
      "sourceId": "post123",
      "sourceTitle": "Getting Started with React",
      "userId": "user456",
      "createdAt": "2026-07-28T14:00:00.000Z",
      "user": {
        "id": "user456",
        "name": "Alice Johnson",
        "username": "alicej",
        "image": "https://example.com/alice.jpg",
        "role": "user"
      },
      "replyCount": 0
    }
  ],
  "meta": {
    "pagination": {
      "total": 5,
      "skip": 0,
      "limit": 20,
      "hasMore": false
    }
  }
}
```

---

### Example 5: Delete Own Comment

**Request:**
```bash
curl -X DELETE https://example.com/api/discussions/disc789 \
  -H "Cookie: better-auth.session_token=abc123"
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully. It will be permanently removed after 30 days.",
  "data": {
    "id": "disc789",
    "status": "deleted",
    "deletedAt": "2026-07-28T14:45:00.000Z",
    "permanentDeleteAt": "2026-08-27T14:45:00.000Z"
  }
}
```

---

## Related Documentation

- [Discussion Feature Guide](../features/discussions-and-comments.md) - Complete feature documentation
- [Discussion Quick Reference](../features/discussions-quick-reference.md) - Developer quick reference
- [Audit Log API](./audit-log-api-reference.md) - Audit logging endpoints
- [Notification API](./notification-api-reference.md) - Notification endpoints

---

**Last Updated:** 2026-07-28  
**API Version:** 1.0
