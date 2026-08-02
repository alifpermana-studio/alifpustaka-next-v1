# Discussion & Comment System

Comprehensive guide for the discussion and comment management system. This feature enables users to comment on blog posts and provides administrators with tools to moderate all discussions.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [User Interfaces](#user-interfaces)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Components](#components)
8. [Permissions & Roles](#permissions--roles)
9. [Notification System](#notification-system)
10. [Usage Guide](#usage-guide)
11. [Developer Guide](#developer-guide)

---

## Overview

The Discussion & Comment System provides a comprehensive solution for user engagement on blog posts. It consists of three main parts:

1. **Public Comment Section** - On blog post pages (`/blog/[slug]`)
2. **User Management** - At `/discussions` for managing own comments
3. **Admin Moderation** - At `/admin/discussions` for moderating all comments

### Key Characteristics

- **Flat comment structure** (no nested replies)
- **Multi-source support** (blog posts, product reviews, product Q&A)
- **Status-based moderation** (pending, published, banned, deleted)
- **30-minute edit window** for users
- **30-day soft delete** before permanent removal
- **Real-time notifications** for status changes
- **Audit logging** for all admin actions

**Access Levels**:
- Public: View published comments on blog posts
- Authenticated Users: Post comments, manage own comments at `/discussions`
- Admins: Moderate all comments at `/admin/discussions` (super_admin, content_admin, support_admin)

---

## Features

### 🔍 For Public Users (Blog Comment Section)

#### Viewing Comments
- View all published comments on blog posts
- See comment author, timestamp, and content
- Markdown rendering with basic formatting support
- Pagination (10 comments per page, newest first)

#### Authentication Check
- Unauthenticated users see "Sign in to comment" prompt
- Modal appears when attempting to post
- Direct redirect to `/signin` page

### ✍️ For Authenticated Users

#### Posting Comments
- **Textarea with markdown support**:
  - Bold, italic, links, lists, blockquotes
  - Limited features (no images, tables, code blocks)
- **Character limit**: 5000 characters with live counter
- **Auto-save**: None (intentional - explicit submission)
- **Status**: All new comments start as "pending"

#### Viewing Own Comments
- See pending comments with "Pending Review" badge
- Published comments visible to everyone
- Deleted comments hidden from public but visible to owner

#### Editing Comments
- **Time limit**: 30 minutes from posting
- **Edit tracking**: Shows "(edited)" indicator and edit count
- **Restrictions**: Cannot edit banned or deleted comments

#### Deleting Comments
- **Soft delete**: Hidden immediately but recoverable
- **Grace period**: 30 days before permanent deletion
- **Visibility**: Deleted comments only visible to owner

#### Management Interface (`/discussions`)
- Filter by: status, source type, search content
- View all own comments across all sources
- Edit recent comments (within 30-minute window)
- Delete own comments
- See reply count for each comment
- Navigate to source (blog post, etc.)

### 👮 For Administrators

#### Moderation Interface (`/admin/discussions`)
- **View all comments** from all users
- **Filter by**: status, user, source type, search
- **See author info**: name, username, role, avatar
- **Change status**: pending → published, pending → banned, etc.
- **Cannot edit content** (only status changes)
- **Auto-refresh**: Silent background refresh every 60 seconds

#### Status Management
- **Pending**: Awaiting review (default for new comments)
- **Published**: Visible to everyone
- **Banned**: Removed for policy violations
- **Deleted**: Soft deleted (30-day grace period)

#### Admin Actions
- Each status change creates audit log
- User receives notification automatically
- Cannot modify comment content (only status)

---

## Architecture

### Technology Stack

**Frontend**:
- React (Client Components)
- Next.js App Router
- TailwindCSS + DaisyUI
- React Markdown (for rendering)
- Lucide Icons

**Backend**:
- Next.js API Routes
- Prisma ORM
- PostgreSQL (via Supabase)
- Better Auth (authentication)

**State Management**:
- React Context (Auth, Toast, Notification)
- Local component state
- useRef for fetch optimization

### Data Flow

```
User Action → Component → API Route → Prisma → Database
                                    ↓
                            Notification Service
                                    ↓
                            Audit Log Service
```

### Comment Lifecycle

```
1. User posts comment → Status: pending
2. Admin reviews → Status: published/banned
3. User edits (within 30 min) → editCount++, editedAt updated
4. User/Admin deletes → Status: deleted, deletedAt set
5. After 30 days → Permanent deletion (requires cron job)
```

---

## User Interfaces

### 1. Blog Comment Section (`/blog/[slug]`)

**Location**: Below blog post content and tags

**Components**:
- Comment form (textarea + submit)
- Comment list (10 per page)
- Pagination controls
- Auth prompt modal

**Features**:
- **For guests**: View published comments, see sign-in modal
- **For users**: Post new comments, see own pending comments
- **Markdown rendering**: Basic formatting only
- **Real-time validation**: Character count, empty check

### 2. User Management (`/discussions`)

**Layout**: Full-page management interface

**Sections**:
- Header with total count
- Filter bar (search, status, source type)
- Comments table with checkboxes and actions
- Bulk action bar (fixed bottom, appears when comments selected)
- Pagination

**Columns**:
- Checkbox (for bulk selection)
- Content (truncated with edit indicator)
- Status (badge with color coding)
- Source (type + title)
- Replies (count)
- Created (relative time)
- Actions (Edit/Delete buttons)

**Actions**:
- Edit: Opens modal (only if within 30 minutes)
- Delete: Opens confirmation modal
- Bulk: Select multiple → Change status or delete

**Bulk Features**:
- Checkbox selection (select all/individual)
- Fixed bottom action bar with selected count
- Bulk status change modal (pending/published/deleted)
- Bulk delete with confirmation
- Cannot select deleted comments
- Selection clears on page/filter change

### 3. Admin Moderation (`/admin/discussions`)

**Layout**: Similar to user management but with admin features

**Additional Features**:
- View comments from all users
- Filter by user
- See author information
- Change status via modal
- Auto-refresh every 60 seconds
- Last updated timestamp

**Columns**:
- Content (with edit count)
- Author (avatar, name, username, role)
- Status (current state)
- Source (type + title)
- Replies (count)
- Created (timestamp)
- Actions (Change Status button)

---

## API Reference

For complete API endpoint documentation including request/response formats, parameters, and examples, see:

**[Discussion API Reference](../api/discussion-api-reference.md)**

### Public Endpoints

- `GET /api/blog/[slug]/comments` - Get published comments for a blog post (no auth required)

### User Endpoints

- `GET /api/discussions` - Get own comments with pagination and filters
- `POST /api/discussions` - Create new comment (status: pending)
- `PATCH /api/discussions` - Bulk actions (change status, delete multiple comments)
- `PUT /api/discussions/[id]` - Edit comment (30-minute window)
- `DELETE /api/discussions/[id]` - Soft delete comment (30-day grace period)

### Admin Endpoints

- `GET /api/admin/discussions` - Get all comments (requires `moderate_discussions`)
- `PATCH /api/admin/discussions/[id]` - Change comment status (requires `moderate_discussions`)

**Key Features:**
- Public endpoint for blog post comments (no authentication)
- User endpoints require authentication
- User bulk operations for managing own comments
- Admin endpoints require `moderate_discussions` permission
- Automatic audit logging for all admin actions
- Automatic notifications for status changes
- 30-minute edit window enforcement
- Content validation (1-5000 characters)
- Source existence validation
- Ownership validation for bulk operations

For detailed specifications, request/response examples, and error codes, refer to the **[Discussion API Reference](../api/discussion-api-reference.md)**.

---

## Database Schema

### Discussion Model

```prisma
model Discussion {
  id                String      @id @default(uuid())
  content           String
  status            String      @default("pending")
  
  sourceType        String      // Polymorphic source
  sourceId          String
  
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  parentId          String?     // For future nested replies
  parent            Discussion? @relation("DiscussionReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies           Discussion[] @relation("DiscussionReplies")
  
  editedAt          DateTime?   @db.Timestamptz(3)
  editCount         Int         @default(0)
  
  deletedAt         DateTime?   @db.Timestamptz(3)
  permanentDeleteAt DateTime?   @db.Timestamptz(3)
  
  createdAt         DateTime    @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime    @updatedAt @db.Timestamptz(3)
  
  @@map("discussion")
  @@index([userId])
  @@index([sourceType, sourceId])
  @@index([status])
  @@index([parentId])
  @@index([createdAt])
  @@index([permanentDeleteAt])
}
```

### Key Fields

- **content**: The comment text (supports markdown)
- **status**: Current moderation state
- **sourceType**: Type of content commented on
- **sourceId**: ID of the source content
- **userId**: Author of the comment
- **parentId**: For future reply support (currently always null)
- **editedAt**: Last edit timestamp
- **editCount**: Number of edits made
- **deletedAt**: When soft deleted
- **permanentDeleteAt**: When to permanently delete (30 days after deletedAt)

### Indexes

Optimized for:
- User's own comments lookup (`userId`)
- Comments for specific content (`sourceType`, `sourceId`)
- Status filtering (`status`)
- Time-based sorting (`createdAt`)
- Cleanup queries (`permanentDeleteAt`)

---

## Components

### Public Blog Components (`/src/components/blog/comment/`)

#### `CommentSection.tsx`
Main container component for blog post comments.

**Props**:
```typescript
{
  postId: string;      // Blog post ID
  postSlug: string;    // Blog post slug for API
  postTitle: string;   // For notifications
}
```

**Features**:
- Fetches comments via `/api/blog/[slug]/comments` (public endpoint)
- No authentication required for viewing
- Pagination (10 per page)
- Manual refresh on comment post

#### `CommentForm.tsx`
Form for posting new comments.

**Features**:
- Textarea with character counter
- Markdown hint text
- Auth check (shows modal if not logged in)
- Expandable (shows buttons only when focused)
- Submit validation

#### `CommentList.tsx`
Renders list of comments.

**Props**:
```typescript
{
  comments: Discussion[];
  currentUserId?: string;
  loading: boolean;
}
```

#### `CommentItem.tsx`
Individual comment display.

**Features**:
- User avatar and info
- Relative timestamp
- Edit indicator
- Pending badge (for owner)
- Markdown rendering (basic features only)

#### `AuthPromptModal.tsx`
Modal for unauthenticated users.

**Actions**:
- Sign In: Redirects to `/signin`
- Cancel: Closes modal

### User Management Components (`/src/components/discussion/`)

#### `DiscussionFilters.tsx`
Filter bar for user's comments.

**Filters**:
- Search (debounced)
- Status dropdown
- Source type dropdown
- Refresh button

#### `DiscussionTable.tsx`
Table displaying user's comments.

**Features**:
- Sortable columns
- Responsive layout
- Action buttons per row

#### `DiscussionTableRow.tsx`
Individual comment row.

**Displays**:
- Content (truncated)
- Status badge
- Source info
- Reply count
- Actions (Edit/Delete)

#### `DiscussionPagination.tsx`
Pagination controls.

**Features**:
- Previous/Next buttons
- Page numbers with ellipsis
- Disabled states

#### `EditDiscussionModal.tsx`
Modal for editing comments.

**Features**:
- Textarea with character counter
- Edit count display
- 30-minute warning
- Save/Cancel buttons

#### `DeleteDiscussionModal.tsx`
Confirmation modal for deletion.

**Features**:
- Content preview
- 30-day grace period warning
- Delete/Cancel buttons

### Admin Components (`/src/components/admin/discussion-management/`)

#### `DiscussionManagement.tsx`
Main admin moderation component.

**Features**:
- Permission check (`moderate_discussions`)
- Auto-refresh (60 seconds)
- Last updated timestamp
- Fetch all comments

#### `DiscussionFilters.tsx`
Admin filter bar.

**Filters**:
- Search
- Status
- Source type
- (Note: User filter removed from UI but supported in API)

#### `DiscussionTable.tsx`
Admin comments table.

**Columns**:
- Content
- Author (with avatar and role)
- Status
- Source
- Replies
- Created
- Actions

#### `DiscussionTableRow.tsx`
Admin comment row.

**Displays**:
- Full author info (name, username, role, avatar)
- Status badge
- Change Status button

#### `StatusChangeModal.tsx`
Modal for changing comment status.

**Features**:
- Content preview with author info
- Status dropdown
- Status descriptions
- Warning alerts (for banned/deleted)
- Info about notifications and audit logging

#### `DiscussionPagination.tsx`
Same as user pagination component.

---

## Permissions & Roles

### New Permissions

```typescript
export type Permission =
  // ... existing permissions
  | 'manage_discussions'      // Full management access
  | 'moderate_discussions'    // View all, change status
  | 'edit_own_discussions'    // Edit own comments
  | 'reply_discussions';      // Post comments
```

### Role Permissions

**All Users** (including guests after authentication):
- `edit_own_discussions` - Edit own comments (30-min limit)
- `reply_discussions` - Post new comments

**Content Admins** (`content_admin`):
- All user permissions
- `manage_discussions` - Full management
- `moderate_discussions` - Moderate all comments

**Support Admins** (`support_admin`):
- All user permissions
- `moderate_discussions` - Moderate all comments

**Super Admins** (`super_admin`):
- All permissions including discussions

### Access Control

**Public Comment Section**:
- View: Everyone (published comments only)
- Post: Authenticated users

**User Management (`/discussions`)**:
- Access: Authenticated users
- View: Own comments only
- Edit: Own comments (within 30 minutes)
- Delete: Own comments

**Admin Moderation (`/admin/discussions`)**:
- Access: Users with `moderate_discussions` permission
- View: All comments from all users
- Edit: Cannot edit content (only status)
- Delete: Can change status to deleted

---

## Notification System

### Notification Types

```typescript
export type NotificationType = 
  // ... existing types
  | "comment_reply"            // New
  | "comment_status_changed";  // New
```

### Notification Triggers

#### Comment Reply (Future Feature)
```typescript
notifyCommentReply(
  userId: string,              // Recipient
  commenterName: string,       // Who replied
  commentId: string,
  sourceTitle: string          // Blog post title
)
```

**When**: User receives reply to their comment
**Message**: "{name} replied to your comment on '{title}'"
**Link**: `/discussions`

#### Comment Status Changed
```typescript
notifyCommentStatusChanged(
  userId: string,              // Comment author
  commentContent: string,      // Comment text (truncated)
  oldStatus: string,
  newStatus: string,
  commentId: string
)
```

**When**: Admin changes comment status
**Messages**:
- Published: "Your comment has been approved and is now published"
- Banned: "Your comment has been removed for violating community guidelines"
- Deleted: "Your comment has been deleted"
- Pending: "Your comment is pending review"

**Link**: `/discussions`

### Notification Library

**Location**: `/src/lib/discussion-notifications.ts`

**Functions**:
- `createNotification()` - Base notification creator
- `notifyCommentReply()` - Notify on reply (prepared for future)
- `notifyCommentStatusChanged()` - Notify on status change

---

## Usage Guide

### For Users

#### Posting a Comment

1. Navigate to a published blog post
2. Scroll to comment section below post content
3. If not logged in:
   - Click textarea → Auth modal appears
   - Click "Sign In" → Redirect to login
   - After login, return to blog post
4. If logged in:
   - Click textarea to expand form
   - Type comment (supports markdown)
   - Review character count
   - Click "Post Comment"
5. Comment appears with "Pending Review" badge
6. Wait for admin approval

#### Editing a Comment

1. Go to `/discussions`
2. Find your comment (must be within 30 minutes of posting)
3. Click "Edit" button
4. Modify content in modal
5. Review character count
6. Click "Save Changes"
7. Comment shows "(edited)" indicator

#### Deleting a Comment

1. Go to `/discussions`
2. Find your comment
3. Click "Delete" button
4. Read warning about 30-day grace period
5. Click "Delete Comment"
6. Comment is hidden but still visible to you
7. After 30 days, it will be permanently deleted (requires cron job)

#### Managing Your Comments

1. Visit `/discussions`
2. Use filters to find specific comments:
   - **Search**: Find by content
   - **Status**: Filter by pending/published/deleted
   - **Source Type**: Filter by blog post/product review
3. Click "Refresh" to update list
4. Navigate pages if you have many comments

**Bulk Actions**:
1. Select comments using checkboxes
2. Click "Select All" to select all visible comments
3. Bulk action bar appears at bottom with selected count
4. Choose action:
   - **Change Status**: Select new status (pending/published/deleted)
   - **Delete**: Soft delete with 30-day grace period
5. Confirm action in modal
6. Comments are updated, selection clears

**Notes**:
- Cannot select deleted comments for bulk actions
- Selection clears when changing pages or filters
- Bulk actions only work on your own comments

### For Admins

#### Moderating Comments

1. Go to `/admin/discussions`
2. Review pending comments (filter: Status = Pending)
3. For each comment:
   - Read content
   - Check author info (name, role)
   - Verify source context
4. Click "Change Status" button
5. Select new status:
   - **Published**: Approve for public viewing
   - **Banned**: Remove for policy violation
   - **Deleted**: Mark as deleted
   - **Pending**: Keep in review state
6. Read warnings in modal
7. Click "Update Status"
8. User receives automatic notification

#### Finding Specific Comments

Use filters:
- **Search**: Search in comment content
- **Status**: Filter by moderation state
- **Source Type**: Filter by content type

**Note**: Auto-refresh runs every 60 seconds in background

#### Bulk Moderation

**User Bulk Actions** (✅ Available at `/discussions`):
- Users can bulk manage their own comments
- Select multiple comments with checkboxes
- Bulk change status (pending/published/deleted)
- Bulk delete with confirmation
- Only works on user's own comments

**Admin Bulk Moderation** (⏳ Future):
- Admin bulk moderation for all comments
- Similar to user bulk actions but with more permissions
- May include bulk ban functionality

#### Monitoring Activity

1. Check "Last updated" timestamp
2. Review recent comments (sorted newest first)
3. Use audit logs at `/admin/audit-logs` to see:
   - Who changed status
   - When changes occurred
   - Old vs new status values

---

## Developer Guide

### Adding Discussion Support to New Content Types

Currently supports: `blog_post`, `product_review`, `product_qa`

To add a new type (e.g., `forum_post`):

1. **Update type definition**:
```typescript
// src/types/discussion.d.ts
export type DiscussionSourceType =
  "blog_post" | "product_review" | "product_qa" | "forum_post";
```

2. **Update API validation**:
```typescript
// src/app/api/discussions/route.ts
const sourceTypeFilter = [
  "", "blog_post", "product_review", "product_qa", "forum_post"
];
```

3. **Add source existence check**:
```typescript
// src/app/api/discussions/route.ts
if (sourceType === "forum_post") {
  const forumPost = await prisma.forumPost.findUnique({
    where: { id: sourceId },
    select: { id: true, status: true },
  });
  // ... validation
}
```

4. **Update source title fetching**:
```typescript
// src/app/api/discussions/route.ts & CommentSection.tsx
if (discussion.sourceType === "forum_post") {
  const post = await prisma.forumPost.findUnique({
    where: { id: discussion.sourceId },
    select: { title: true },
  });
  sourceTitle = post?.title || "Unknown Forum Post";
}
```

5. **Add to filter dropdowns**:
```typescript
// src/components/*/DiscussionFilters.tsx
<option value="forum_post">Forum Posts</option>
```

### Implementing Nested Replies

Schema already supports nested replies via `parentId` field.

To enable:

1. **Update API to accept parentId**:
```typescript
// POST /api/discussions
const { content, sourceType, sourceId, parentId } = body;

// Validate parent exists
if (parentId) {
  const parent = await prisma.discussion.findUnique({
    where: { id: parentId },
  });
  // ... validation
}
```

2. **Update CommentItem to show replies**:
```typescript
// src/components/blog/comment/CommentItem.tsx
{discussion.replies && discussion.replies.length > 0 && (
  <div className="ml-8 mt-4">
    {discussion.replies.map(reply => (
      <CommentItem key={reply.id} comment={reply} isOwn={...} />
    ))}
  </div>
)}
```

3. **Add reply button to CommentItem**:
```typescript
<button onClick={() => onReply(discussion.id)}>Reply</button>
```

4. **Update notification system**:
```typescript
// Call notifyCommentReply() when reply is posted
await notifyCommentReply(
  parentComment.userId,
  currentUser.name,
  newComment.id,
  sourceTitle
);
```

### Setting Up Permanent Deletion Cron Job

Comments with status "deleted" should be permanently removed after 30 days.

**Using Vercel Cron**:

1. **Create API route**:
```typescript
// src/app/api/cron/cleanup-discussions/route.ts
export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  const result = await prisma.discussion.deleteMany({
    where: {
      permanentDeleteAt: {
        lte: now
      }
    }
  });

  return NextResponse.json({
    success: true,
    deleted: result.count
  });
}
```

2. **Add to vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-discussions",
    "schedule": "0 0 * * *"
  }]
}
```

3. **Set environment variable**:
```
CRON_SECRET=your-secret-key
```

### Customizing Edit Time Limit

Currently: 30 minutes

To change:

```typescript
// src/app/api/discussions/[id]/route.ts
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
// Change to 1 hour:
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
```

```typescript
// src/components/discussion/DiscussionTableRow.tsx
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
// Match the API time limit
```

### Adding Rich Text Editor

Currently uses plain textarea with markdown.

To add rich editor:

1. Install library (e.g., TipTap, Lexical)
2. Replace textarea in `CommentForm.tsx`
3. Update validation for rich content
4. Update markdown rendering in `CommentItem.tsx`

### Optimizing Performance

**Current optimizations**:
- useRef flag prevents unnecessary fetches
- Pagination (10 comments per page)
- Indexed database queries
- Silent background refresh for admins

**Further optimizations**:
- Implement React Query for caching
- Add optimistic updates
- Use virtual scrolling for long lists
- Implement infinite scroll instead of pagination

### Testing

**Manual testing checklist**:

User flows:
- [ ] Post comment as guest → See auth modal
- [ ] Post comment as user → See pending badge
- [ ] Edit comment within 30 min → Success
- [ ] Edit comment after 30 min → Error
- [ ] Delete comment → Hidden from public
- [ ] View own deleted comment → Visible

Admin flows:
- [ ] View all comments → See all users
- [ ] Change status to published → User notified
- [ ] Change status to banned → User notified
- [ ] View audit logs → See status changes
- [ ] Auto-refresh → Updates silently

**Unit tests** (to be added):
```typescript
// Example test structure
describe('CommentSection', () => {
  it('shows auth modal for guests', () => {});
  it('allows posting for authenticated users', () => {});
  it('filters pending comments for owner', () => {});
});
```

---

## Troubleshooting

### Comments not appearing

**Check**:
1. Comment status (must be "published" for public view)
2. User authentication (own pending comments require login)
3. API response (check browser console)
4. Database (verify record exists)

### Cannot edit comment

**Possible causes**:
1. 30-minute window expired
2. Comment is banned or deleted
3. Not the comment owner
4. Network error

### Admin cannot see comments

**Check**:
1. User has `moderate_discussions` permission
2. Role is super_admin, content_admin, or support_admin
3. Not redirected to `/admin` (permission check)

### Repeated API requests

**Fixed in implementation**:
- useRef flag prevents re-fetching
- Only fetches on mount, page change, or manual refresh

**If issue persists**:
- Check browser network tab
- Verify useEffect dependencies
- Check for context re-renders

### Notifications not sent

**Check**:
1. Notification service is running
2. User email is verified
3. Database notification record created
4. Check notification context refresh

### Audit logs not created

**Verify**:
1. `createAuditLogAsync()` is called
2. Next.js `after()` function is available
3. Database audit_log table exists
4. No errors in server logs

---

## Future Enhancements

### Planned Features

1. **Nested Replies**
   - Support threaded discussions
   - Reply notifications
   - Collapsible threads

2. **Rich Text Editor**
   - WYSIWYG editor
   - Image upload support
   - Emoji picker

3. **Reactions**
   - Like/upvote buttons
   - Reaction counts
   - Most liked sorting

4. **Mentions**
   - @username mentions
   - Auto-complete
   - Mention notifications

5. **Reporting**
   - User report feature
   - Admin review queue
   - Auto-ban on multiple reports

6. **Search Improvements**
   - Full-text search
   - Filter by date range
   - Sort by likes/replies

7. **Bulk Operations**
   - Bulk status changes
   - Bulk delete
   - Export comments

8. **Analytics**
   - Comment count graphs
   - Most active users
   - Engagement metrics

### Migration Path

If implementing nested replies:

1. Keep `parentId` field (already in schema)
2. Update UI to show reply button
3. Add reply form component
4. Update API to handle parent validation
5. Add notifications for replies
6. Test thoroughly before enabling

---

## Related Documentation

- [Posts Management](./posts-management.md)
- [User Management](./admin-users.md)
- [RBAC System](./rbac.md)
- [Notification System](../notifications.md)
- [Audit Logging](../audit-logs.md)

---

## Changelog

### Version 1.0.2 (2026-07-29)

**User Bulk Actions**:
- Added bulk selection with checkboxes on `/discussions` page
- Added bulk action bar (fixed bottom) for selected comments
- Added bulk status change modal (pending/published/deleted)
- Added bulk delete with confirmation
- Users can now manage multiple own comments at once
- Selection clears on page/filter change
- Cannot select deleted comments for bulk actions

**API Updates**:
- Added `PATCH /api/discussions` endpoint for bulk operations
- Supports `change_status` and `delete` actions
- Ownership validation (users can only bulk modify own comments)
- Status validation (no "banned" for regular users)
- Audit logging for bulk actions with metadata

**Components Added**:
- `DiscussionBulkActionBar.tsx` - Fixed bottom bulk action bar
- `BulkStatusChangeModal.tsx` - Bulk status change modal

**Components Updated**:
- `DiscussionTable.tsx` - Added checkbox column and select all
- `DiscussionTableRow.tsx` - Added checkbox cell and selection state
- `discussions/page.tsx` - Added bulk logic and handlers

**Documentation**:
- Updated all discussion documentation with bulk features
- Added bulk action examples and testing checklist
- Updated limitations (bulk operations now available for users)

### Version 1.0.1 (2026-07-29)

**API Updates**:
- Added public endpoint `GET /api/blog/[slug]/comments` for fetching published blog post comments
- No authentication required for viewing published comments
- Separated public comment viewing from user's own comment management
- Updated `CommentSection` component to use new public endpoint with `postSlug` prop

**Bug Fixes**:
- Fixed issue where `GET /api/discussions` was filtering by userId instead of sourceId
- Comments now properly load on blog post pages for all visitors
- Updated `BlogViewer` to pass `postSlug` to `CommentSection`

**Documentation**:
- Updated API reference with public endpoint details
- Updated all feature documentation files
- Added examples for public comment fetching

### Version 1.0.0 (2026-07-28)

**Initial Release**:
- Flat comment system for blog posts
- User management interface at `/discussions`
- Admin moderation interface at `/admin/discussions`
- 30-minute edit window
- 30-day soft delete
- Status-based moderation
- Notification system integration
- Audit logging for admin actions
- Markdown rendering with basic features
- Pagination (10 comments per page)
- Auth check for comment posting
- Permission-based access control

**Database**:
- Created `Discussion` model
- Added indexes for performance
- Integrated with existing `User` model

**API**:
- User endpoints: GET, POST, PUT, DELETE
- Admin endpoints: GET, PATCH
- Full validation and error handling

**Components**:
- 5 blog comment components
- 6 user management components
- 6 admin moderation components

**Known Limitations**:
- No nested replies (schema ready, UI not implemented)
- No bulk operations
- No rich text editor
- No reactions or voting
- Permanent deletion requires manual cron job

---

*Last updated: 2026-07-28*
*Author: Development Team*
