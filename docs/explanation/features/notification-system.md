# Notification System

## Overview

The notification system provides real-time user notifications for important events such as role changes, post status updates, and discussion interactions. It consists of server-side notification creation, API endpoints for retrieval and management, and a React context for client-side state management.

## Architecture

### Core Components

1. **Notification Library** (`src/lib/notifications.ts`)
2. **Notification Context** (`src/context/NotificationContext.tsx`)
3. **UI Component** (`src/components/layout/AdminHeader.tsx`)
4. **API Endpoints** (`src/app/api/notifications/`)
5. **Type Definitions** (`src/types/notification.d.ts`)

## File Structure

```
src/
├── lib/
│   └── notifications.ts              # Server-side notification creation functions
├── context/
│   └── NotificationContext.tsx       # Client-side state management
├── components/
│   └── layout/
│       └── AdminHeader.tsx           # Notification UI display
├── app/
│   └── api/
│       └── notifications/
│           ├── route.ts              # GET (fetch) & POST (create)
│           ├── [id]/route.ts         # PATCH (mark single as read)
│           └── mark-all-read/route.ts # PATCH (mark all as read)
└── types/
    └── notification.d.ts             # TypeScript type definitions
```

---

## 1. Server-Side: Notification Library

**File:** `src/lib/notifications.ts`

### Purpose
Provides helper functions to create notifications in the database for various system events.

### Core Function

#### `createNotification(params: CreateNotificationParams)`

Creates a notification record in the database.

**Parameters:**
- `userId`: Target user ID
- `type`: Notification type (see types below)
- `title`: Notification title
- `message`: Notification message
- `linkTo`: Optional navigation link
- `relatedEntityType`: Optional entity type (e.g., "post", "user", "discussion")
- `relatedEntityId`: Optional entity ID

### Notification Functions

#### User Management

**`notifyUserRoleChange(userId, oldRole, newRole)`**
- **Triggered by:** `src/app/api/users/route.ts:256`
- **When:** Admin changes user's role
- **Type:** `role_change`
- **Link:** `/p` (profile)

**`notifyUserStatusChange(userId, username, oldStatus, newStatus)`**
- **Triggered by:** `src/app/api/users/route.ts:247`
- **When:** Admin changes user's account status (active/inactive/banned)
- **Type:** `status_change`
- **Link:** `/p/{username}`

#### Post Management

**`notifyPostApproved(userId, postTitle, postId)`**
- **Triggered by:** 
  - `src/app/api/blog-post/route.ts:323`
  - `src/app/api/admin/posts/review/[slug]/route.ts:220`
- **When:** Admin approves a pending post
- **Type:** `post_approved`
- **Link:** `/posts`

**`notifyPostRejected(userId, postTitle, postId)`**
- **Triggered by:**
  - `src/app/api/blog-post/route.ts:95`
  - `src/app/api/admin/posts/review/[slug]/route.ts:227`
- **When:** Admin rejects a post or sends it back for revision
- **Type:** `post_rejected`
- **Link:** `/posts`

#### Discussion Management

**`notifyCommentReply(userId, commenterName, commentId, sourceTitle)`**
- **Type:** `comment_reply`
- **When:** User receives a reply to their comment
- **Link:** `/discussions`

**`notifyCommentStatusChanged(userId, commentContent, oldStatus, newStatus, commentId)`**
- **Triggered by:**
  - `src/app/api/admin/discussions/route.ts:248`
  - `src/app/api/admin/discussions/[id]/route.ts:110`
- **When:** Admin changes comment status (published/banned/deleted/pending)
- **Type:** `comment_status_changed`
- **Link:** `/discussions`
- **Note:** Truncates comment content to 50 characters

---

## 2. API Endpoints

### `GET /api/notifications`

**File:** `src/app/api/notifications/route.ts`

Fetches user's notifications with unread count.

**Query Parameters:**
- `limit` (optional): Number of notifications to fetch (default: 5)
- `unreadOnly` (optional): Only return unread notifications (boolean)

**Response:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "notifications": [...],
    "unreadCount": 3
  }
}
```

**Authorization:** Requires active user session

---

### `POST /api/notifications`

**File:** `src/app/api/notifications/route.ts`

Creates a new notification (system/admin use).

**Request Body:**
```json
{
  "userId": "user-id",
  "type": "role_change",
  "title": "Title",
  "message": "Message",
  "linkTo": "/path",
  "relatedEntityType": "user",
  "relatedEntityId": "entity-id"
}
```

**Authorization:** Requires active user session

---

### `PATCH /api/notifications/[id]`

**File:** `src/app/api/notifications/[id]/route.ts`

Marks a single notification as read.

**Authorization:** 
- Requires active user session
- User must own the notification

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": null
}
```

---

### `PATCH /api/notifications/mark-all-read`

**File:** `src/app/api/notifications/mark-all-read/route.ts`

Marks all user's unread notifications as read.

**Authorization:** Requires active user session

---

## 3. Client-Side: Notification Context

**File:** `src/context/NotificationContext.tsx`

### Purpose
Manages notification state on the client side and provides functions to interact with notifications.

### Context Value

```typescript
{
  notifications: Notification[],      // List of notifications
  unreadCount: number,                // Count of unread notifications
  fetchNotifications: () => Promise<void>, // Refresh notifications
  markAsRead: (id: string) => Promise<void>, // Mark single as read
  markAllAsRead: () => Promise<void>, // Mark all as read
  isLoading: boolean                  // Loading state
}
```

### Features

#### Auto-refresh Strategy
1. **On mount:** Fetches notifications immediately
2. **On window focus:** Refetches when user switches back to tab
3. **Polling:** Refetches every 2 minutes as fallback

#### State Management
- Optimistically updates UI when marking notifications as read
- Decrements unread count locally before server confirmation
- Maintains list of latest 5 notifications

### Usage

```typescript
import { useNotification } from '@/context/NotificationContext';

function Component() {
  const { notifications, unreadCount, markAsRead } = useNotification();
  
  // Access notifications and functions
}
```

---

## 4. UI Component: AdminHeader

**File:** `src/components/layout/AdminHeader.tsx`

### Notification Bell Button

Located in the header (line 148-161), displays:
- Bell icon
- Unread count badge (shows "9+" if more than 9)
- Opens notification dropdown on click

### Notification Dropdown

**Features:**
- Lists latest notifications with icons based on type
- Shows timestamp using `date-fns/formatDistanceToNow`
- Highlights unread notifications with accent background
- "Mark all as read" button (appears when unread > 0)
- Click notification to mark as read and navigate to link
- Empty state with bell icon when no notifications

### Notification Icons

**Mapped by type** (line 354-367):
- `role_change`: User icon (blue)
- `status_change`: AlertTriangle icon (orange)
- `post_approved`: CheckCircle icon (green)
- `post_rejected`: XCircle icon (red)
- `comment_reply`: Bell icon (gray)
- `comment_status_changed`: Bell icon (gray)

---

## 5. Type Definitions

**File:** `src/types/notification.d.ts`

### `NotificationType`

```typescript
type NotificationType = 
  | "role_change" 
  | "status_change" 
  | "post_approved" 
  | "post_rejected"
  | "comment_reply"
  | "comment_status_changed"
```

### `Notification`

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}
```

---

## Event Flow Examples

### Example 1: Admin Approves Post

1. Admin approves post via `PATCH /api/admin/posts/review/[slug]`
2. Server calls `notifyPostApproved(userId, postTitle, postId)`
3. Notification created in database with type `post_approved`
4. User's NotificationContext polls or refocuses
5. `GET /api/notifications` returns new notification
6. Context updates state, unread count increments
7. Bell icon shows badge with new count
8. User clicks bell, sees "Post Approved" notification
9. User clicks notification, marks as read, navigates to `/posts`

### Example 2: Admin Changes User Role

1. Admin updates user via `PATCH /api/users`
2. Server detects role change, calls `notifyUserRoleChange()`
3. Notification created: "Your role has been changed from user to editor"
4. User sees notification in real-time (within 2 minutes or on focus)
5. User clicks notification, navigates to profile page

### Example 3: Comment Status Changed

1. Admin changes comment status via `PATCH /api/admin/discussions/[id]`
2. Server calls `notifyCommentStatusChanged()` with truncated content
3. User receives notification: "Your comment has been approved and is now published"
4. Clicking navigates to `/discussions`

---

## Related Features

### Authentication
- All notification endpoints require authentication via `requireAuthorization` middleware
- Users can only access their own notifications

### Database
- Notifications stored in `notification` table via Prisma
- Related to `user` table via `userId`
- Tracks `isRead` status and `readAt` timestamp

### User Management
- Integrates with user role/status changes in `src/app/api/users/route.ts`

### Post Management
- Integrates with post approval workflow:
  - `src/app/api/blog-post/route.ts`
  - `src/app/api/admin/posts/review/[slug]/route.ts`

### Discussion Management
- Integrates with comment moderation:
  - `src/app/api/admin/discussions/route.ts`
  - `src/app/api/admin/discussions/[id]/route.ts`

---

## Future Enhancements

Potential improvements:
- WebSocket/SSE for real-time push notifications
- Email notifications for critical events
- Notification preferences/settings
- Notification grouping and pagination
- Push notifications for mobile devices
- Rich notification content with images/previews
