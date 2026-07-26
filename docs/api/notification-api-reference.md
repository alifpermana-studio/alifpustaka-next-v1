# Notification API Reference

Complete API reference for notification management endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Get Notifications](#get-notifications)
4. [Create Notification](#create-notification)
5. [Mark Notification as Read](#mark-notification-as-read)
6. [Mark All as Read](#mark-all-as-read)
7. [Error Codes](#error-codes)
8. [Examples](#examples)

---

## Overview

The Notification API provides endpoints for managing user notifications with support for read/unread tracking.

**Features:**
- Fetch user notifications with filtering
- Create system notifications
- Mark individual notifications as read
- Bulk mark all as read
- Unread count tracking
- Link notifications to entities

**Notification Types:**
- `role_change` - User role updated
- `status_change` - User status updated
- `post_approved` - Post approved by reviewer
- `post_rejected` - Post rejected by reviewer
- `system` - General system notifications
- Custom types as needed

---

## Authentication

All notification endpoints require authentication via session cookie.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Access Control:**
- Users can only access their own notifications
- Creating notifications should be restricted to admin/system operations

---

## Get Notifications

Retrieve user's notifications with optional filtering.

### Endpoint

```
GET /api/notifications
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 5 | Maximum number of notifications to return |
| `unreadOnly` | string | No | "false" | "true" to show only unread notifications |

### Authentication

**Required:** Active user session

### Business Logic

- Fetches notifications for authenticated user only
- Optional filter for unread notifications
- Returns notifications with unread count
- Ordered by creation date (most recent first)

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "userId": "user_456",
        "type": "role_change",
        "title": "Role Updated",
        "message": "Your role has been changed to Editor",
        "isRead": false,
        "readAt": null,
        "linkTo": "/profile",
        "relatedEntityType": "user",
        "relatedEntityId": "user_456",
        "createdAt": "2026-07-25T09:30:00.000Z"
      },
      {
        "id": "notif_124",
        "userId": "user_456",
        "type": "post_approved",
        "title": "Post Approved",
        "message": "Your post 'Getting Started with Next.js' has been approved and published",
        "isRead": true,
        "readAt": "2026-07-25T09:35:00.000Z",
        "linkTo": "/blog/getting-started-with-nextjs",
        "relatedEntityType": "post",
        "relatedEntityId": "post_789",
        "createdAt": "2026-07-24T14:20:00.000Z"
      }
    ],
    "unreadCount": 1
  },
  "meta": {
    "timestamp": "2026-07-25T09:45:00.000Z"
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Authentication required"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch notifications"
  }
}
```

### Example

```typescript
// Get recent notifications
const response = await fetch('/api/notifications?limit=10', {
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log(`You have ${result.data.unreadCount} unread notifications`);
  result.data.notifications.forEach(notif => {
    console.log(`[${notif.isRead ? 'Read' : 'Unread'}] ${notif.title}`);
  });
}

// Get only unread notifications
const unreadResponse = await fetch('/api/notifications?unreadOnly=true&limit=20', {
  credentials: 'include'
});
```

---

## Create Notification

Create a new notification for a user.

### Endpoint

```
POST /api/notifications
```

### Request Body

```json
{
  "userId": "user_456",
  "type": "system",
  "title": "System Maintenance",
  "message": "The system will undergo maintenance on Saturday",
  "linkTo": "/announcements/maintenance",
  "relatedEntityType": "announcement",
  "relatedEntityId": "announce_123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Target user ID |
| `type` | string | Yes | Notification type |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification message |
| `linkTo` | string | No | URL to navigate when clicked |
| `relatedEntityType` | string | No | Entity type (post, user, announcement, etc.) |
| `relatedEntityId` | string | No | Related entity ID |

### Authentication

**Required:** Active user session

**Note:** This endpoint should be restricted to admin/system operations in production. Consider adding permission checks.

### Business Logic

- Creates notification for specified user
- Sets `isRead: false` by default
- Returns created notification object

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "notif_125",
    "userId": "user_456",
    "type": "system",
    "title": "System Maintenance",
    "message": "The system will undergo maintenance on Saturday",
    "isRead": false,
    "readAt": null,
    "linkTo": "/announcements/maintenance",
    "relatedEntityType": "announcement",
    "relatedEntityId": "announce_123",
    "createdAt": "2026-07-25T09:45:00.000Z"
  },
  "meta": {
    "timestamp": "2026-07-25T09:45:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Missing required fields: userId, type, title, message"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to create notification"
  }
}
```

### Example

```typescript
// Create notification (admin/system use)
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userId: 'user_456',
    type: 'system',
    title: 'Welcome!',
    message: 'Welcome to Alif Pustaka. Start by creating your first post.',
    linkTo: '/blog/new'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Notification sent to user');
}
```

---

## Mark Notification as Read

Mark a specific notification as read.

### Endpoint

```
PATCH /api/notifications/[id]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Notification ID |

### Authentication

**Required:** Active user session

### Permission Checks

- User must own the notification
- Cannot mark other users' notifications as read

### Business Logic

- Sets `isRead: true`
- Sets `readAt: new Date()`
- Idempotent (no error if already read)

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": null,
  "meta": {
    "timestamp": "2026-07-25T09:46:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden** - Not notification owner
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "Access denied"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Notification not found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to update notification"
  }
}
```

### Example

```typescript
// Mark notification as read
const response = await fetch('/api/notifications/notif_123', {
  method: 'PATCH',
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log('Notification marked as read');
}

// Handle click on notification
async function handleNotificationClick(notificationId: string, linkTo?: string) {
  // Mark as read
  await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    credentials: 'include'
  });
  
  // Navigate to link
  if (linkTo) {
    window.location.href = linkTo;
  }
}
```

---

## Mark All as Read

Mark all unread notifications as read for the authenticated user.

### Endpoint

```
PATCH /api/notifications/mark-all-read
```

### Authentication

**Required:** Active user session

### Business Logic

- Finds all unread notifications for authenticated user
- Bulk updates: sets `isRead: true` and `readAt: new Date()`
- Returns success regardless of how many notifications were updated

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": null,
  "meta": {
    "timestamp": "2026-07-25T09:47:00.000Z"
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Authentication required"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to mark all notifications as read"
  }
}
```

### Example

```typescript
// Mark all notifications as read
const response = await fetch('/api/notifications/mark-all-read', {
  method: 'PATCH',
  credentials: 'include'
});

const result = await response.json();
if (result.success) {
  console.log('All notifications marked as read');
  // Refresh notification list
  loadNotifications();
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `missing_parameter` | 400 | Required parameter not provided |
| `unauthorized` | 401 | Not authenticated |
| `insufficient_permissions` | 403 | Cannot access this notification |
| `not_found` | 404 | Notification not found |
| `internal_error` | 500 | Server error |

---

## Examples

### Notification Component

```typescript
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  linkTo?: string;
  createdAt: string;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    const response = await fetch('/api/notifications?limit=10', {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      setNotifications(result.data.notifications);
      setUnreadCount(result.data.unreadCount);
    }
  }

  async function markAsRead(notificationId: string) {
    await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      credentials: 'include'
    });

    // Update local state
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function markAllAsRead() {
    await fetch('/api/notifications/mark-all-read', {
      method: 'PATCH',
      credentials: 'include'
    });

    // Update local state
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.linkTo) {
      window.location.href = notification.linkTo;
    }

    setIsOpen(false);
  }

  return (
    <div className="notification-bell">
      <button onClick={() => setIsOpen(!isOpen)}>
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
```

### Notification Service

```typescript
class NotificationService {
  static async getNotifications(limit: number = 10, unreadOnly: boolean = false) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });

    const response = await fetch(`/api/notifications?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    linkTo?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  }

  static async markAsRead(notificationId: string) {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error.message);
    }
  }

  static async markAllAsRead() {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PATCH',
      credentials: 'include'
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error.message);
    }
  }

  static async getUnreadCount() {
    const data = await this.getNotifications(1, false);
    return data.unreadCount;
  }
}

export default NotificationService;
```

### Sending Notifications (Internal Use)

```typescript
// In server-side code (e.g., after user role change)
import { createNotification } from '@/lib/notifications';

async function notifyUserRoleChange(
  userId: string,
  oldRole: string,
  newRole: string
) {
  await createNotification({
    userId,
    type: 'role_change',
    title: 'Role Updated',
    message: `Your role has been changed from ${oldRole} to ${newRole}`,
    linkTo: '/profile',
    relatedEntityType: 'user',
    relatedEntityId: userId
  });
}

async function notifyPostApproved(
  userId: string,
  postTitle: string,
  postSlug: string
) {
  await createNotification({
    userId,
    type: 'post_approved',
    title: 'Post Approved',
    message: `Your post "${postTitle}" has been approved and published`,
    linkTo: `/blog/${postSlug}`,
    relatedEntityType: 'post',
    relatedEntityId: postSlug
  });
}

async function notifyPostRejected(
  userId: string,
  postTitle: string,
  postSlug: string
) {
  await createNotification({
    userId,
    type: 'post_rejected',
    title: 'Post Needs Revision',
    message: `Your post "${postTitle}" has been sent back for revision`,
    linkTo: `/blog/edit/${postSlug}`,
    relatedEntityType: 'post',
    relatedEntityId: postSlug
  });
}
```

### Real-time Updates with Polling

```typescript
function useNotifications(pollInterval: number = 30000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications?limit=10', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
          setNotifications(result.data.notifications);
          setUnreadCount(result.data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return { notifications, unreadCount };
}

// Usage
function Header() {
  const { notifications, unreadCount } = useNotifications(30000);

  return (
    <header>
      <nav>
        <NotificationBell count={unreadCount} notifications={notifications} />
      </nav>
    </header>
  );
}
```

---

## Related Documentation

- [User Management API](./user-management-api-reference.md) - User operations that trigger notifications
- [RBAC System](../features/rbac.md) - Role-based notifications
- [Error Codes](../development/error-codes.md) - Complete error reference

---

## Notification Types Reference

| Type | Description | Triggered By |
|------|-------------|--------------|
| `role_change` | User role updated | Admin changing user role |
| `status_change` | User status updated | Admin changing user status |
| `post_approved` | Post approved and published | Editor/Content Admin approving post |
| `post_rejected` | Post sent back for revision | Editor/Content Admin rejecting post |
| `system` | General system notification | System/Admin announcements |

**Note:** You can create custom notification types as needed for your application.

---

**Last Updated:** 2026-07-25  
**API Version:** 1.0
