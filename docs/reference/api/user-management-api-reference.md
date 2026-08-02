# User Management API Reference

Complete API reference for user management endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [List Users](#list-users)
4. [Update User](#update-user)
5. [Get User Details](#get-user-details)
6. [Get User Audit Logs](#get-user-audit-logs)
7. [Error Codes](#error-codes)
8. [Examples](#examples)

---

## Overview

The User Management API provides endpoints for administrators to manage users, roles, and statuses with comprehensive audit logging.

**Features:**
- User listing with search and filters
- Role assignment with permission validation
- User status management (active, inactive, banned, deleted)
- User profile viewing
- Audit log tracking

**Role Requirements:**
- **Super Admin:** Full user management access
- **User Admin:** Limited user management (can only assign: user, author, editor roles)
- **Regular Users:** Can only view own profile

---

## Authentication

All user management endpoints require authentication with appropriate permissions.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Permission Checks:**
- Listing users: `view_all_users` permission
- Updating users: Role-based assignment permissions
- Viewing details: Self OR `view_all_users` permission
- Viewing audit logs: Self OR `view_all_audit_logs` OR `view_user_audit_logs` permission

---

## List Users

Retrieve a paginated list of users with search and filtering capabilities.

### Endpoint

```
GET /api/users
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search by name, username, or email (case-insensitive) |
| `role` | string | No | - | Filter by role (super_admin, content_admin, user_admin, etc.) |
| `status` | string | No | - | Filter by status (active, inactive, banned, deleted) |
| `skip` | number | No | 0 | Pagination offset |
| `limit` | number | No | 50 | Maximum results per page |

### Authentication

**Required:** Active user session with `view_all_users` permission

**Allowed Roles:** User Admin, Super Admin

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 45 user(s)",
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author",
      "status": "active",
      "emailVerified": true,
      "image": "https://example.com/avatar.jpg",
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-07-20T14:22:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 45,
      "skip": 0,
      "limit": 50,
      "hasMore": false
    },
    "timestamp": "2026-07-25T09:45:00.000Z"
  }
}
```

**Note:** Password fields are excluded from the response for security.

### Error Responses

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to view all users"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch users"
  }
}
```

### Example

```typescript
// Search for authors
const response = await fetch(
  '/api/users?search=john&role=author&status=active&skip=0&limit=20',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} users`);
  result.data.forEach(user => {
    console.log(`${user.name} (${user.role})`);
  });
}
```

---

## Update User

Update a user's role and/or status.

### Endpoint

```
PATCH /api/users
```

### Request Body

```json
{
  "userId": "user_123",
  "role": "editor",
  "status": "active"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | ID of user to update |
| `role` | string | No | New role (super_admin, content_admin, user_admin, sales_admin, support_admin, editor, author, user) |
| `status` | string | No | New status (active, inactive, banned, deleted) |

**Note:** At least one of `role` or `status` must be provided.

### Authentication

**Required:** Active user session with role assignment permissions

### Permission Checks

**Role Assignment:**
- Verified via `canAssignRole(currentRole, targetRole)`
- **Super Admin:** Can assign all roles
- **User Admin:** Can only assign user, author, editor roles
- Cannot assign roles to Super Admin users

**User Management:**
- Verified via `canManageUser(currentRole, targetUserRole)`
- Super Admin can manage all users
- User Admin cannot manage Super Admin or other admins

**Status Management:**
- Verified via `canManageUserStatus(currentRole)`
- User Admin and Super Admin can change status

### Business Logic

- Creates audit log: `user_role_change` (if role changed)
- Creates audit log: `user_status_change` (if status changed)
- Sends notification to user about role/status change
- Validates that at least one field is being updated

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "editor",
    "status": "active",
    "updatedAt": "2026-07-25T09:46:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-25T09:46:00.000Z",
    "auditLogId": "audit_789"
  }
}
```

### Error Responses

**400 Bad Request** - Missing parameters
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "User ID is required"
  }
}
```

**400 Bad Request** - No updates provided
```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "No valid updates provided. Provide role or status."
  }
}
```

**403 Forbidden** - Cannot assign role
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to assign this role"
  }
}
```

**403 Forbidden** - Cannot manage user
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to manage this user"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "User not found"
  }
}
```

### Example

```typescript
// Promote user to editor
const response = await fetch('/api/users', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userId: 'user_123',
    role: 'editor'
  })
});

const result = await response.json();
if (result.success) {
  console.log('User promoted to editor');
  console.log('Audit log ID:', result.meta.auditLogId);
}

// Ban a user
const banResponse = await fetch('/api/users', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userId: 'user_456',
    status: 'banned'
  })
});

// Update both role and status
const updateResponse = await fetch('/api/users', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userId: 'user_789',
    role: 'author',
    status: 'active'
  })
});
```

---

## Get User Details

Retrieve detailed information about a specific user including recent audit logs.

### Endpoint

```
GET /api/users/[id]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

### Authentication

**Required:** Active user session

### Permission Checks

- **Own profile:** All users can view their own profile
- **Other profiles:** Requires User Admin or Super Admin role

### Business Logic

- Fetches user details (excludes password)
- Includes last 20 audit logs for the user
- Audit logs ordered by creation date (descending)

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "editor",
      "status": "active",
      "emailVerified": true,
      "image": "https://example.com/avatar.jpg",
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-07-20T14:22:00.000Z"
    },
    "auditLogs": [
      {
        "id": "audit_789",
        "action": "user_role_change",
        "entityType": "user",
        "entityId": "user_123",
        "performedBy": "admin_456",
        "performerRole": "super_admin",
        "oldValue": { "role": "author" },
        "newValue": { "role": "editor" },
        "createdAt": "2026-07-20T14:22:00.000Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-25T09:47:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden** - Cannot view other user's profile
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only view your own profile"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "User not found"
  }
}
```

### Example

```typescript
// View own profile
const response = await fetch('/api/users/user_123', {
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log('User:', result.data.user.name);
  console.log('Recent activity:', result.data.auditLogs.length, 'logs');
}
```

---

## Get User Audit Logs

Retrieve audit logs for a specific user.

### Endpoint

```
GET /api/users/[id]/audit-logs
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Maximum number of logs to return |

### Authentication

**Required:** Active user session

### Permission Checks

- **Own logs:** All users can view their own audit logs
- **Other users' logs:** Requires `view_all_audit_logs` OR `view_user_audit_logs` permission

**Allowed Roles:** Self, User Admin, Super Admin

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 12 audit log(s) for user",
  "data": [
    {
      "id": "audit_789",
      "action": "user_role_change",
      "entityType": "user",
      "entityId": "user_123",
      "performedBy": "admin_456",
      "performerRole": "super_admin",
      "oldValue": { "role": "author" },
      "newValue": { "role": "editor" },
      "metadata": { "reason": "Promotion" },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-07-20T14:22:00.000Z"
    },
    {
      "id": "audit_790",
      "action": "user_status_change",
      "entityType": "user",
      "entityId": "user_123",
      "performedBy": "admin_456",
      "performerRole": "super_admin",
      "oldValue": { "status": "inactive" },
      "newValue": { "status": "active" },
      "metadata": {},
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-07-19T10:15:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-07-25T09:48:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only view your own audit logs"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch audit logs"
  }
}
```

### Example

```typescript
// Get user's audit logs
const response = await fetch('/api/users/user_123/audit-logs?limit=100', {
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} audit logs`);
  result.data.forEach(log => {
    console.log(`${log.action} at ${log.createdAt}`);
  });
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `missing_parameter` | 400 | Required parameter not provided |
| `validation_error` | 400 | Data validation failed |
| `unauthorized` | 401 | Not authenticated |
| `account_inactive` | 403 | User account is not active |
| `insufficient_permissions` | 403 | User lacks required permissions |
| `not_found` | 404 | User not found |
| `internal_error` | 500 | Server error |

---

## Examples

### User Management Dashboard

```typescript
class UserManagement {
  async loadUsers(filters: { search?: string; role?: string; status?: string }) {
    const params = new URLSearchParams({
      skip: '0',
      limit: '50',
      ...filters
    });

    const response = await fetch(`/api/users?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return {
        users: result.data,
        total: result.meta.pagination.total
      };
    }
    throw new Error(result.error.message);
  }

  async promoteUser(userId: string, newRole: string) {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, role: newRole })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }

  async banUser(userId: string) {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, status: 'banned' })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }

  async reactivateUser(userId: string) {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, status: 'active' })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }

  async getUserProfile(userId: string) {
    const response = await fetch(`/api/users/${userId}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }
}
```

### Search and Filter Users

```typescript
async function searchUsers(query: string) {
  const response = await fetch(
    `/api/users?search=${encodeURIComponent(query)}&skip=0&limit=20`,
    { credentials: 'include' }
  );

  const result = await response.json();
  return result.success ? result.data : [];
}

async function getActiveEditors() {
  const response = await fetch(
    '/api/users?role=editor&status=active&skip=0&limit=50',
    { credentials: 'include' }
  );

  const result = await response.json();
  return result.success ? result.data : [];
}
```

### Bulk User Operations

```typescript
async function bulkPromoteUsers(userIds: string[], newRole: string) {
  const results = await Promise.allSettled(
    userIds.map(userId =>
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole })
      }).then(r => r.json())
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed };
}
```

### View User Activity

```typescript
async function getUserActivity(userId: string) {
  const response = await fetch(`/api/users/${userId}/audit-logs?limit=100`, {
    credentials: 'include'
  });

  const result = await response.json();
  if (result.success) {
    return result.data.map(log => ({
      action: log.action,
      date: new Date(log.createdAt),
      performedBy: log.performedBy,
      details: log.oldValue && log.newValue
        ? `Changed from ${JSON.stringify(log.oldValue)} to ${JSON.stringify(log.newValue)}`
        : 'No details'
    }));
  }
  return [];
}
```

---

## Related Documentation

- [RBAC System](../features/rbac.md) - Complete role and permission documentation
- [Audit Log API](./audit-log-api-reference.md) - Audit log endpoints
- [User Management UI](../features/user-management.md) - Frontend documentation
- [Error Codes](../development/error-codes.md) - Complete error reference

---

## Role Assignment Matrix

Quick reference for role assignment permissions:

| Current Role | Can Assign |
|--------------|------------|
| **Super Admin** | All roles (super_admin, content_admin, user_admin, sales_admin, support_admin, editor, author, user) |
| **User Admin** | Limited roles (user, author, editor) |
| **Others** | Cannot assign roles |

## Status Management Permissions

| Current Role | Can Manage Status |
|--------------|-------------------|
| **Super Admin** | ✅ All users |
| **User Admin** | ✅ Limited users (not Super Admin) |
| **Others** | ❌ Cannot manage status |

---

**Last Updated:** 2026-07-25  
**API Version:** 1.0
