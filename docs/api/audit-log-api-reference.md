# Audit Log API Reference

Complete API reference for audit log endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [List Audit Logs](#list-audit-logs)
4. [Get Audit Log Details](#get-audit-log-details)
5. [Error Codes](#error-codes)
6. [Examples](#examples)

---

## Overview

The Audit Log API provides endpoints for viewing system audit logs with role-based filtering.

**Features:**
- Comprehensive audit trail for all system actions
- Role-based access control
- Entity-based filtering (user, post, gallery)
- Date range filtering
- Detailed change tracking (old/new values)
- Pagination support

**Tracked Actions:**
- **User Events:** user_created, user_role_change, user_status_change, user_deleted
- **Post Events:** post_created, post_submitted, post_published, post_drafted, post_deleted, post_approved, post_rejected
- **Gallery Events:** gallery_uploaded, gallery_visibility_changed, gallery_deleted

**Retention Policy:** 1 year (see maintenance documentation for cleanup procedures)

---

## Authentication

All audit log endpoints require authentication via session cookie.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Role-Based Filtering:**
- **Super Admin:** All logs (user, post, gallery)
- **User Admin:** User logs only
- **Editors/Content Roles:** Post logs they can review
- **Regular Users:** Only logs where they are performer or subject

---

## List Audit Logs

Retrieve a paginated list of audit logs with filtering.

### Endpoint

```
GET /api/audit-logs
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `entityType` | string | No | - | Filter by entity type (user, post, gallery) |
| `entityId` | string | No | - | Filter by specific entity ID |
| `action` | string | No | - | Filter by action type |
| `performedBy` | string | No | - | Filter by performer user ID |
| `startDate` | string | No | - | Filter logs from this date (ISO 8601) |
| `endDate` | string | No | - | Filter logs until this date (ISO 8601) |
| `skip` | number | No | 0 | Pagination offset |
| `limit` | number | No | 50 | Maximum results per page |

### Authentication

**Required:** Active user session

### Role-Based Access

**Super Admin:**
- Full access to all audit logs
- Can filter by any entity type

**User Admin:**
- Access to user entity logs only
- Cannot view post or gallery logs

**Editor/Content Admin:**
- Access to post logs for posts they can review
- Filtered by `canReviewPost()` permission

**Regular Users:**
- Access only to logs where they are:
  - Performer (`performedBy` = user ID)
  - Subject (`entityId` = user ID AND `entityType` = "user")

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 25 audit log(s)",
  "data": [
    {
      "id": "audit_789",
      "action": "user_role_change",
      "entityType": "user",
      "entityId": "user_123",
      "performedBy": "admin_456",
      "performerRole": "super_admin",
      "oldValue": {
        "role": "author"
      },
      "newValue": {
        "role": "editor"
      },
      "metadata": {
        "reason": "Promotion based on quality content"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "createdAt": "2026-07-20T14:22:00.000Z"
    },
    {
      "id": "audit_790",
      "action": "post_published",
      "entityType": "post",
      "entityId": "post_456",
      "performedBy": "editor_789",
      "performerRole": "editor",
      "oldValue": {
        "status": "submitted"
      },
      "newValue": {
        "status": "published"
      },
      "metadata": {
        "postTitle": "Getting Started with Next.js"
      },
      "ipAddress": "192.168.1.101",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-07-20T15:30:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "total": 25,
      "skip": 0,
      "limit": 50,
      "hasMore": false
    },
    "timestamp": "2026-07-25T09:50:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden** - No permission to view logs
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to view these audit logs"
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
// Get all recent audit logs (Super Admin)
const response = await fetch('/api/audit-logs?skip=0&limit=50', {
  credentials: 'include'
});

// Filter by entity type
const userLogs = await fetch('/api/audit-logs?entityType=user&skip=0&limit=50', {
  credentials: 'include'
});

// Filter by specific user
const specificUserLogs = await fetch(
  '/api/audit-logs?entityType=user&entityId=user_123&skip=0&limit=50',
  { credentials: 'include' }
);

// Filter by action
const roleChanges = await fetch(
  '/api/audit-logs?action=user_role_change&skip=0&limit=50',
  { credentials: 'include' }
);

// Filter by date range
const startDate = '2026-07-01T00:00:00.000Z';
const endDate = '2026-07-31T23:59:59.999Z';
const julyLogs = await fetch(
  `/api/audit-logs?startDate=${startDate}&endDate=${endDate}&skip=0&limit=50`,
  { credentials: 'include' }
);

// Filter by performer
const adminActions = await fetch(
  '/api/audit-logs?performedBy=admin_456&skip=0&limit=50',
  { credentials: 'include' }
);

// Combined filters
const combinedLogs = await fetch(
  '/api/audit-logs?entityType=post&action=post_published&startDate=2026-07-01T00:00:00.000Z',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} audit logs`);
  result.data.forEach(log => {
    console.log(`${log.action} by ${log.performerRole} at ${log.createdAt}`);
  });
}
```

---

## Get Audit Log Details

Retrieve detailed information about a specific audit log entry.

### Endpoint

```
GET /api/audit-logs/[id]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Audit log ID |

### Authentication

**Required:** Active user session

### Permission Checks

**Super Admin:**
- Can view all audit logs

**User Admin:**
- Can view user entity logs only

**Editor/Content Admin:**
- Can view post entity logs for posts they can review

**Regular Users:**
- Can view logs where they are performer or subject

### Business Logic

- Fetches specific audit log entry
- Parses JSON values (oldValue, newValue, metadata) for readability
- Returns detailed audit information

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Audit log retrieved successfully",
  "data": {
    "id": "audit_789",
    "action": "user_role_change",
    "entityType": "user",
    "entityId": "user_123",
    "performedBy": "admin_456",
    "performerRole": "super_admin",
    "oldValue": {
      "role": "author"
    },
    "newValue": {
      "role": "editor"
    },
    "metadata": {
      "reason": "Promotion based on quality content",
      "previousRoleHeldSince": "2026-06-15T10:30:00.000Z"
    },
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "createdAt": "2026-07-20T14:22:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-25T09:51:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden** - No permission to view this log
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to view this audit log"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Audit log not found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch audit log"
  }
}
```

### Example

```typescript
// Get specific audit log details
const response = await fetch('/api/audit-logs/audit_789', {
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  const log = result.data;
  console.log(`Action: ${log.action}`);
  console.log(`Performed by: ${log.performerRole}`);
  console.log(`Old value:`, log.oldValue);
  console.log(`New value:`, log.newValue);
  console.log(`Date: ${new Date(log.createdAt).toLocaleString()}`);
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Not authenticated |
| `account_inactive` | 403 | User account is not active |
| `insufficient_permissions` | 403 | User lacks required permissions |
| `not_found` | 404 | Audit log not found |
| `internal_error` | 500 | Server error |

---

## Examples

### Audit Log Viewer Component

```typescript
import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performerRole: string;
  oldValue: any;
  newValue: any;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 50,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.skip]);

  async function loadLogs() {
    const params = new URLSearchParams({
      skip: pagination.skip.toString(),
      limit: pagination.limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
    });

    const response = await fetch(`/api/audit-logs?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      setLogs(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.pagination.total,
        hasMore: result.meta.pagination.hasMore
      }));
    }
  }

  function handleFilterChange(field: string, value: string) {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, skip: 0 })); // Reset to first page
  }

  function nextPage() {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  }

  function previousPage() {
    if (pagination.skip > 0) {
      setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
    }
  }

  return (
    <div className="audit-log-viewer">
      <h2>Audit Logs</h2>

      <div className="filters">
        <select
          value={filters.entityType}
          onChange={(e) => handleFilterChange('entityType', e.target.value)}
        >
          <option value="">All Entity Types</option>
          <option value="user">User</option>
          <option value="post">Post</option>
          <option value="gallery">Gallery</option>
        </select>

        <select
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="user_role_change">Role Change</option>
          <option value="user_status_change">Status Change</option>
          <option value="post_published">Post Published</option>
          <option value="post_approved">Post Approved</option>
          <option value="post_rejected">Post Rejected</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          placeholder="Start Date"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          placeholder="End Date"
        />

        <button onClick={loadLogs}>Apply Filters</button>
      </div>

      <div className="audit-log-list">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Performed By</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td>{log.performerRole}</td>
                <td>
                  {log.oldValue && log.newValue && (
                    <div>
                      <div>Old: {JSON.stringify(log.oldValue)}</div>
                      <div>New: {JSON.stringify(log.newValue)}</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={previousPage} disabled={pagination.skip === 0}>
          Previous
        </button>
        <span>
          Showing {pagination.skip + 1} - {pagination.skip + logs.length} of {pagination.total}
        </span>
        <button onClick={nextPage} disabled={!pagination.hasMore}>
          Next
        </button>
      </div>
    </div>
  );
}

export default AuditLogViewer;
```

### Audit Log Service

```typescript
class AuditLogService {
  static async getLogs(filters: {
    entityType?: string;
    entityId?: string;
    action?: string;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/audit-logs?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return {
        logs: result.data,
        pagination: result.meta.pagination
      };
    }
    throw new Error(result.error.message);
  }

  static async getLogById(logId: string) {
    const response = await fetch(`/api/audit-logs/${logId}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async getUserActivity(userId: string, limit: number = 50) {
    return this.getLogs({
      entityType: 'user',
      entityId: userId,
      limit
    });
  }

  static async getPostActivity(postId: string, limit: number = 50) {
    return this.getLogs({
      entityType: 'post',
      entityId: postId,
      limit
    });
  }

  static async getRoleChanges(startDate?: string, endDate?: string) {
    return this.getLogs({
      action: 'user_role_change',
      startDate,
      endDate
    });
  }

  static async getAdminActions(adminId: string, limit: number = 100) {
    return this.getLogs({
      performedBy: adminId,
      limit
    });
  }
}

export default AuditLogService;
```

### Export Audit Logs

```typescript
async function exportAuditLogs(filters: any) {
  // Fetch all logs matching filters
  let allLogs: any[] = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `/api/audit-logs?${new URLSearchParams({ ...filters, skip: skip.toString(), limit: limit.toString() })}`,
      { credentials: 'include' }
    );

    const result = await response.json();
    if (result.success) {
      allLogs = allLogs.concat(result.data);
      hasMore = result.meta.pagination.hasMore;
      skip += limit;
    } else {
      break;
    }
  }

  // Convert to CSV
  const headers = ['Date', 'Action', 'Entity Type', 'Entity ID', 'Performed By', 'Role', 'Old Value', 'New Value'];
  const rows = allLogs.map(log => [
    new Date(log.createdAt).toISOString(),
    log.action,
    log.entityType,
    log.entityId,
    log.performedBy,
    log.performerRole,
    JSON.stringify(log.oldValue || {}),
    JSON.stringify(log.newValue || {})
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Activity Timeline

```typescript
async function getUserActivityTimeline(userId: string) {
  const { logs } = await AuditLogService.getUserActivity(userId, 100);

  const timeline = logs.map(log => {
    let description = '';

    switch (log.action) {
      case 'user_role_change':
        description = `Role changed from ${log.oldValue.role} to ${log.newValue.role}`;
        break;
      case 'user_status_change':
        description = `Status changed from ${log.oldValue.status} to ${log.newValue.status}`;
        break;
      case 'post_created':
        description = `Created post: ${log.metadata?.postTitle || 'Untitled'}`;
        break;
      case 'post_published':
        description = `Published post: ${log.metadata?.postTitle || 'Untitled'}`;
        break;
      default:
        description = log.action.replace(/_/g, ' ');
    }

    return {
      date: new Date(log.createdAt),
      description,
      performedBy: log.performerRole,
      type: log.entityType
    };
  });

  return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
}
```

### Compliance Report

```typescript
async function generateComplianceReport(startDate: string, endDate: string) {
  const { logs } = await AuditLogService.getLogs({
    startDate,
    endDate,
    limit: 1000
  });

  const report = {
    period: { startDate, endDate },
    summary: {
      totalActions: logs.length,
      userChanges: logs.filter(l => l.entityType === 'user').length,
      postChanges: logs.filter(l => l.entityType === 'post').length,
      galleryChanges: logs.filter(l => l.entityType === 'gallery').length
    },
    byAction: logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPerformer: logs.reduce((acc, log) => {
      const key = `${log.performedBy} (${log.performerRole})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    criticalActions: logs.filter(l =>
      ['user_role_change', 'user_status_change', 'user_deleted'].includes(l.action)
    )
  };

  return report;
}
```

---

## Related Documentation

- [RBAC System](../features/rbac.md) - Permission system and audit log creation
- [User Management API](./user-management-api-reference.md) - User operations that create audit logs
- [Development Verification](../development/verification.md) - SQL queries for audit log verification
- [Error Codes](../development/error-codes.md) - Complete error reference

---

## Action Types Reference

### User Actions
| Action | Description | Triggered By |
|--------|-------------|--------------|
| `user_created` | New user registered | User registration |
| `user_role_change` | User role updated | Admin changing role |
| `user_status_change` | User status updated | Admin changing status |
| `user_deleted` | User soft deleted | Admin deleting user |

### Post Actions
| Action | Description | Triggered By |
|--------|-------------|--------------|
| `post_created` | New post created | Author creating post |
| `post_submitted` | Post submitted for review | Author submitting post |
| `post_published` | Post published | Editor/Admin publishing |
| `post_approved` | Post approved | Editor/Admin approving |
| `post_rejected` | Post rejected | Editor/Admin rejecting |
| `post_drafted` | Post sent to draft | Editor sending back |
| `post_deleted` | Post deleted | Author/Admin deleting |

### Gallery Actions
| Action | Description | Triggered By |
|--------|-------------|--------------|
| `gallery_uploaded` | Image uploaded | User uploading image |
| `gallery_visibility_changed` | Privacy toggled | Owner/Admin changing visibility |
| `gallery_deleted` | Image deleted | Owner/Admin deleting |

---

**Last Updated:** 2026-07-25  
**API Version:** 1.0
