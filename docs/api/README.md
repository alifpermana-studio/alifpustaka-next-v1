# API Documentation

API reference documentation for the Alif Pustaka application.

---

## Overview

This directory contains comprehensive API endpoint documentation organized by feature category.

**API Categories:**
- Blog Management
- Gallery/Image Management
- User Management
- Notifications
- Audit Logs
- Admin Post Review
- Authentication Utilities

---

## Documentation Files

### [blog-api-reference.md](./blog-api-reference.md) - Blog Management
Complete API reference for blog post management endpoints.

**Endpoints:**
- `GET /api/post-list` - List blog posts with filtering
- `PATCH /api/posts/bulk` - Bulk update posts
- `PUT /api/blog-post` - Create/update single post
- `DELETE /api/blog-post` - Delete post

**Use this for:**
- Blog post CRUD operations
- Post listing and filtering
- Bulk operations

---

### [gallery-api-reference.md](./gallery-api-reference.md) - Gallery Management
Complete API reference for image/gallery management endpoints.

**Endpoints:**
- `GET /api/image` - Retrieve image from storage
- `GET /api/image-list` - List images with role-based filtering
- `PUT /api/upload-image-database` - Create image record after upload
- `PUT /api/update-image` - Update image metadata and visibility
- `DELETE /api/delete-image` - Delete image
- `GET /api/get-presigned-url` - Generate presigned URL for S3 upload

**Use this for:**
- Image upload workflow
- Gallery management
- Public/private image handling
- Direct S3 uploads

---

### [user-management-api-reference.md](./user-management-api-reference.md) - User Management
Complete API reference for user administration endpoints.

**Endpoints:**
- `GET /api/users` - List users with search and filters
- `PATCH /api/users` - Update user role/status
- `GET /api/users/[id]` - Get user details
- `GET /api/users/[id]/audit-logs` - Get user audit logs

**Use this for:**
- User administration
- Role assignment
- Status management
- User profile viewing

---

### [notification-api-reference.md](./notification-api-reference.md) - Notifications
Complete API reference for notification management endpoints.

**Endpoints:**
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/[id]` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read

**Use this for:**
- Notification system
- User alerts
- Activity notifications
- Read/unread tracking

---

### [audit-log-api-reference.md](./audit-log-api-reference.md) - Audit Logs
Complete API reference for audit log endpoints.

**Endpoints:**
- `GET /api/audit-logs` - List audit logs with filtering
- `GET /api/audit-logs/[id]` - Get audit log details

**Use this for:**
- Audit trail viewing
- Compliance reporting
- Activity tracking
- Change history

---

### [admin-post-api-reference.md](./admin-post-api-reference.md) - Admin Post Review
Complete API reference for post review and approval endpoints.

**Endpoints:**
- `GET /api/admin/posts` - List posts for review
- `GET /api/admin/posts/review/[slug]` - Get post for review
- `PATCH /api/admin/posts/review/[slug]` - Approve/reject post

**Use this for:**
- Post review workflow
- Editorial approval process
- Content moderation

---

### [auth-utility-api-reference.md](./auth-utility-api-reference.md) - Auth Utilities
API reference for authentication utility endpoints.

**Endpoints:**
- `POST /api/check-credential-user` - Check if user has credential account

**Use this for:**
- Password reset eligibility
- Account type detection
- Login flow optimization

---

## Related Documentation

- [Error Codes](../development/error-codes.md) - API error code reference
- [RBAC System](../features/rbac.md) - Role-based access control for APIs
- [Blog Management](../features/blog-management.md) - Blog feature documentation
- [User Management](../features/user-management.md) - User management feature

---

## API Authentication

All API endpoints (except public endpoints) require authentication via Better Auth session cookies.

**Include credentials in requests:**

```typescript
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Session Cookie:**
- Name: `better-auth.session_token`
- HttpOnly: Yes
- Secure: Yes (production)
- SameSite: Lax

---

## Response Format

All API endpoints follow a consistent response format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    auditLogId?: string;
    pagination?: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  };
}
```

### Success Response Example

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "role": "editor"
  },
  "meta": {
    "timestamp": "2026-07-25T09:50:00.000Z",
    "auditLogId": "audit_789"
  }
}
```

### Error Response Example

```json
{
  "success": false,
  "message": "Failed to update user",
  "data": null,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to assign this role",
    "details": {
      "requiredPermission": "assign_roles",
      "currentRole": "user"
    }
  },
  "meta": {
    "timestamp": "2026-07-25T09:50:00.000Z"
  }
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `missing_parameter` | 400 | Required parameter not provided |
| `invalid_parameter` | 400 | Parameter value invalid |
| `validation_error` | 400 | Data validation failed |
| `unauthorized` | 401 | Not authenticated |
| `account_inactive` | 403 | User account is not active |
| `insufficient_permissions` | 403 | User lacks required permissions |
| `not_found` | 404 | Resource not found |
| `internal_error` | 500 | Server error |

See [Error Codes](../development/error-codes.md) for complete reference.

---

## Pagination

Endpoints that return lists support pagination with consistent parameters:

**Query Parameters:**
- `skip` (number, default: 0) - Number of records to skip
- `limit` (number, default: varies) - Maximum records to return

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "total": 100,
      "skip": 0,
      "limit": 20,
      "hasMore": true
    }
  }
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented on API endpoints. This may be added in future versions.

**Best Practices:**
- Implement client-side debouncing for search inputs
- Use reasonable pagination limits
- Cache responses when appropriate

---

## API Versioning

**Current Version:** 1.0

API endpoints do not currently include version numbers in the URL. Breaking changes will be documented and communicated before implementation.

---

## Quick Reference by Feature

### Blog Management
- List posts: `GET /api/post-list`
- Create/update: `PUT /api/blog-post`
- Bulk update: `PATCH /api/posts/bulk`
- Delete: `DELETE /api/blog-post`

### Gallery Management
- List images: `GET /api/image-list`
- Get image: `GET /api/image?src=...&p=...`
- Upload: `GET /api/get-presigned-url` → S3 → `PUT /api/upload-image-database`
- Update: `PUT /api/update-image`
- Delete: `DELETE /api/delete-image`

### User Management
- List users: `GET /api/users`
- Update user: `PATCH /api/users`
- View profile: `GET /api/users/[id]`
- User logs: `GET /api/users/[id]/audit-logs`

### Notifications
- Get notifications: `GET /api/notifications`
- Mark as read: `PATCH /api/notifications/[id]`
- Mark all read: `PATCH /api/notifications/mark-all-read`

### Post Review
- List for review: `GET /api/admin/posts`
- Get for review: `GET /api/admin/posts/review/[slug]`
- Approve/reject: `PATCH /api/admin/posts/review/[slug]`

### Audit Logs
- List logs: `GET /api/audit-logs`
- Get log: `GET /api/audit-logs/[id]`

---

**Last Updated:** 2026-07-25  
**Total API Endpoints Documented:** 20+
