# Discussion System - Quick Reference

Quick reference guide for developers working with the discussion and comment system.

---

## Quick Links

- **Full Documentation**: [discussions-and-comments.md](./discussions-and-comments.md)
- **User Interface**: `/discussions` (manage own comments)
- **Admin Interface**: `/admin/discussions` (moderate all)
- **Blog Comments**: `/blog/[slug]` (public commenting)

---

## Key Files

### Database
```
prisma/schema/schema.prisma          → Discussion model definition
```

### API Routes
```
src/app/api/blog/[slug]/comments/route.ts           → Public: GET (published comments)
src/app/api/discussions/route.ts                    → User: GET (own), POST (create)
src/app/api/discussions/[id]/route.ts               → User: PUT (edit), DELETE (soft delete)
src/app/api/admin/discussions/route.ts              → Admin: GET (all), PATCH (bulk)
src/app/api/admin/discussions/[id]/route.ts         → Admin: PATCH (status change)
```

### Components - Blog Comments
```
src/components/blog/comment/
  ├─ CommentSection.tsx           → Main container
  ├─ CommentForm.tsx              → Post new comment
  ├─ CommentList.tsx              → List of comments
  ├─ CommentItem.tsx              → Individual comment
  └─ AuthPromptModal.tsx          → Sign-in prompt
```

### Components - User Management
```
src/components/discussion/
  ├─ DiscussionFilters.tsx        → Search/filter bar
  ├─ DiscussionTable.tsx          → Comments table
  ├─ DiscussionTableRow.tsx       → Table row
  ├─ DiscussionPagination.tsx     → Pagination controls
  ├─ EditDiscussionModal.tsx      → Edit modal
  └─ DeleteDiscussionModal.tsx    → Delete confirmation
```

### Components - Admin Moderation
```
src/components/admin/discussion-management/
  ├─ DiscussionManagement.tsx     → Main component
  ├─ DiscussionFilters.tsx        → Admin filters
  ├─ DiscussionTable.tsx          → Admin table
  ├─ DiscussionTableRow.tsx       → Admin table row
  ├─ DiscussionPagination.tsx     → Pagination
  └─ StatusChangeModal.tsx        → Status change modal
```

### Pages
```
src/app/(admin)/discussions/page.tsx              → User management page
src/app/(admin)/admin/discussions/page.tsx        → Admin moderation page
src/components/blog/view/BlogViewer.tsx           → Integrates CommentSection
```

### Types
```
src/types/discussion.d.ts         → Discussion types
src/types/notification.d.ts       → Updated with comment types
src/types/roles.ts                → Updated with discussion permissions
src/types/audit.ts                → Updated with discussion actions
```

### Libraries
```
src/lib/discussion-notifications.ts → Notification helpers
src/lib/audit-log.ts                → Audit logging (updated)
src/lib/notifications.ts            → Base notifications (updated)
```

### Navigation
```
src/components/layout/AdminSidebar.tsx → Updated with discussion links
```

---

## Database Schema

```prisma
model Discussion {
  id                String      @id @default(uuid())
  content           String
  status            String      @default("pending")
  sourceType        String      // "blog_post", "product_review", "product_qa"
  sourceId          String
  userId            String
  user              User        @relation(...)
  parentId          String?
  editedAt          DateTime?
  editCount         Int         @default(0)
  deletedAt         DateTime?
  permanentDeleteAt DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([sourceType, sourceId])
  @@index([status])
  @@index([permanentDeleteAt])
}
```

**Migration**: `20260727234314_add_discussion_model`

---

## API Endpoints

For complete API documentation with detailed request/response examples, see: **[Discussion API Reference](../api/discussion-api-reference.md)**

### Public Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/blog/[slug]/comments` | Get published comments for blog post | Not required |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/discussions` | Get own comments | Required |
| POST | `/api/discussions` | Create comment | Required |
| PUT | `/api/discussions/[id]` | Edit comment | Required |
| DELETE | `/api/discussions/[id]` | Delete comment | Required |

### Admin Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/admin/discussions` | Get all comments | `moderate_discussions` |
| PATCH | `/api/admin/discussions/[id]` | Change status | `moderate_discussions` |

**See Also**: [Discussion API Reference](../api/discussion-api-reference.md) for complete specifications, error codes, and examples.

---

## Type Definitions

### DiscussionStatus
```typescript
type DiscussionStatus = "pending" | "published" | "banned" | "deleted";
```

### DiscussionSourceType
```typescript
type DiscussionSourceType = "blog_post" | "product_review" | "product_qa";
```

### Discussion Interface
```typescript
interface Discussion {
  id: string;
  content: string;
  status: DiscussionStatus;
  sourceType: DiscussionSourceType;
  sourceId: string;
  userId: string;
  parentId: string | null;
  editedAt: Date | null;
  editCount: number;
  deletedAt: Date | null;
  permanentDeleteAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  sourceTitle?: string;
}
```

---

## Permissions

### New Permissions
```typescript
'manage_discussions'      // Full management (super_admin, content_admin)
'moderate_discussions'    // Moderation (+ support_admin)
'edit_own_discussions'    // Edit own (all users)
'reply_discussions'       // Post comments (all users)
```

### Role Access

| Role | manage | moderate | edit_own | reply |
|------|--------|----------|----------|-------|
| super_admin | ✅ | ✅ | ✅ | ✅ |
| content_admin | ✅ | ✅ | ✅ | ✅ |
| support_admin | ❌ | ✅ | ✅ | ✅ |
| user_admin | ❌ | ❌ | ✅ | ✅ |
| editor | ❌ | ❌ | ✅ | ✅ |
| author | ❌ | ❌ | ✅ | ✅ |
| user | ❌ | ❌ | ✅ | ✅ |

---

## Notification Types

### New Types
```typescript
"comment_reply"            // When user receives reply (future)
"comment_status_changed"   // When admin changes status
```

### Helper Functions
```typescript
// src/lib/discussion-notifications.ts
notifyCommentReply(userId, commenterName, commentId, sourceTitle)
notifyCommentStatusChanged(userId, content, oldStatus, newStatus, commentId)
```

---

## Audit Actions

### New Actions
```typescript
"discussion_created"        // User creates comment
"discussion_edited"         // User edits comment
"discussion_deleted"        // User/admin deletes comment
"discussion_status_changed" // Admin changes status
```

### Entity Type
```typescript
"discussion" // Added to EntityType union
```

---

## Key Features

### Comment Lifecycle

```
1. POST /api/discussions
   → Status: pending
   → User sees "Pending Review" badge

2. Admin: PATCH /api/admin/discussions/[id]
   → Status: published
   → User receives notification
   → Comment visible to public

3. User: PUT /api/discussions/[id] (within 30 min)
   → editCount++
   → editedAt updated
   → Shows "(edited)" badge

4. User/Admin: DELETE or status change
   → Status: deleted
   → deletedAt, permanentDeleteAt set
   → Hidden from public (visible to owner)

5. Cron job (after 30 days)
   → Permanent deletion from database
```

### Edit Rules
- **Time limit**: 30 minutes from `createdAt`
- **Allowed**: Only comment owner
- **Blocked**: Banned or deleted comments
- **Tracking**: `editCount` increments, `editedAt` updates

### Delete Rules
- **Soft delete**: Sets status to "deleted"
- **Grace period**: 30 days
- **Visibility**: Hidden from public, visible to owner
- **Permanent**: Requires cron job (not automatic)

### Status Flow
```
pending → published  (admin approval)
pending → banned     (policy violation)
pending → deleted    (admin/user removal)
published → banned   (retroactive moderation)
published → deleted  (admin/user removal)
```

---

## Common Tasks

### Adding Comment Section to New Content

1. **Import component**:
```tsx
import { CommentSection } from "@/components/blog/comment/CommentSection";
```

2. **Add to page**:
```tsx
<CommentSection postId={post.id} postTitle={post.title} />
```

3. **Verify source validation in API**:
```typescript
// src/app/api/discussions/route.ts
if (sourceType === "your_type") {
  const item = await prisma.yourModel.findUnique({
    where: { id: sourceId },
    select: { id: true, status: true },
  });
  
  if (!item || item.status !== "published") {
    return NextResponse.json(
      errorResponse("not_found", "Item not found or not published"),
      { status: 404 }
    );
  }
}
```

### Fetching Comments in Component

```typescript
// For public blog post comments (no auth required)
const fetchComments = async () => {
  const params = new URLSearchParams({
    skip: String((page - 1) * limit),
    limit: String(limit),
  });

  const response = await fetch(`/api/blog/${postSlug}/comments?${params}`);
  const result = await response.json();
  
  if (result.success) {
    setComments(result.data); // All published comments
  }
};

// For user's own comments (auth required)
const fetchOwnComments = async () => {
  const params = new URLSearchParams({
    sourceType: "blog_post",
    sourceId: postId,
    skip: "0",
    limit: "10",
    status: "", // Empty to see own pending + published
  });

  const response = await fetch(`/api/discussions?${params}`);
  const result = await response.json();
  
  if (result.success) {
    setComments(result.data);
  }
};
```

### Creating Comment

```typescript
const createComment = async (content: string) => {
  const response = await fetch("/api/discussions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content.trim(),
      sourceType: "blog_post",
      sourceId: postId,
      parentId: null,
    }),
  });

  const result = await response.json();
  
  if (result.success) {
    showToast("Comment submitted for review", "success");
    // Refresh comments
  }
};
```

### Editing Comment (with time check)

```typescript
const editComment = async (id: string, content: string) => {
  const response = await fetch(`/api/discussions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.trim() }),
  });

  const result = await response.json();
  
  if (!result.success && result.error?.code === "invalid_request") {
    // Likely expired 30-minute window
    showToast("Edit time limit expired", "error");
  }
};
```

### Changing Status (Admin)

```typescript
const changeStatus = async (id: string, status: DiscussionStatus) => {
  const response = await fetch(`/api/admin/discussions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();
  
  if (result.success) {
    showToast("Status updated successfully", "success");
    fetchNotifications(); // Refresh notification count
  }
};
```

---

## Markdown Support

### Blog Comments (Basic)

**Supported**:
- Bold: `**text**`
- Italic: `*text*`
- Links: `[text](url)`
- Lists: `- item` or `1. item`
- Blockquotes: `> quote`

**Not Supported**:
- Images
- Code blocks
- Tables
- Headings

**Rendering**:
```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Custom components for links, code, lists, blockquotes
    // Disabled: h1-h6, img, pre, table
  }}
>
  {comment.content}
</ReactMarkdown>
```

---

## Validation Rules

### Content
- **Min length**: 1 character (after trim)
- **Max length**: 5000 characters
- **Format**: Plain text with markdown

### Source
- **Type**: Must be in `sourceTypeFilter` array
- **Existence**: Must exist in database
- **Status**: Must be "published" (for blog posts)

### Edit Time
- **Window**: 30 minutes from `createdAt`
- **Calculation**: `new Date(Date.now() - 30 * 60 * 1000)`

### Delete Grace Period
- **Duration**: 30 days from `deletedAt`
- **Calculation**: `new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000)`

---

## Performance Optimizations

### Implemented
1. **useRef flag** - Prevents re-fetching on parent re-renders
2. **Pagination** - 10 comments per page (configurable)
3. **Database indexes** - Fast queries on userId, sourceType+sourceId, status
4. **Silent refresh** - Admin interface auto-refreshes without UI flash
5. **Optimistic filtering** - Client-side filter for pending comments

### Component Mount Optimization
```typescript
// Prevents repeated fetches
const hasFetched = useRef(false);

useEffect(() => {
  if (hasFetched.current && page === 1) return;
  // ... fetch logic
  hasFetched.current = true;
}, [postId, page]);
```

---

## Testing Checklist

### User Flows
- [ ] Guest clicks comment form → Auth modal appears
- [ ] User posts comment → Shows "Pending Review" badge
- [ ] User edits within 30 min → Success
- [ ] User edits after 30 min → Error message
- [ ] User deletes comment → Hidden from public
- [ ] User views `/discussions` → Sees own comments only

### Admin Flows
- [ ] Admin views `/admin/discussions` → Sees all comments
- [ ] Admin changes status → User receives notification
- [ ] Admin changes status → Audit log created
- [ ] Non-admin accesses admin page → Redirected to `/admin`
- [ ] Auto-refresh works → Updates every 60 seconds

### Edge Cases
- [ ] Empty content → Validation error
- [ ] 5001 characters → Validation error
- [ ] Non-existent source → Error
- [ ] Unpublished source → Error
- [ ] Edit deleted comment → Error
- [ ] Delete already deleted → Error

---

## Troubleshooting

### Issue: Comments not loading

**Check**:
```typescript
// 1. Console errors
console.log(result);

// 2. API response
fetch('/api/discussions?skip=0&limit=10&sourceType=blog_post&sourceId=xxx')

// 3. Database query
await prisma.discussion.findMany({ where: { sourceId: 'xxx' } })

// 4. User auth
console.log(user?.userId);
```

### Issue: Cannot edit comment

**Debug**:
```typescript
// Check time difference
const now = new Date();
const created = new Date(comment.createdAt);
const diff = (now.getTime() - created.getTime()) / 1000 / 60;
console.log(`Minutes since creation: ${diff}`); // Should be < 30

// Check comment status
console.log(comment.status); // Should not be "banned" or "deleted"

// Check ownership
console.log(comment.userId === user?.userId); // Should be true
```

### Issue: Repeated API calls

**Fix applied**:
```typescript
// useRef prevents re-fetching
const hasFetched = useRef(false);

if (hasFetched.current && page === 1) return; // Skip fetch
```

**If still occurring**:
- Check browser Network tab
- Verify parent component stability
- Check for context re-renders

---

## Environment Variables

None required. Uses existing database and auth configuration.

**For cron job** (optional):
```env
CRON_SECRET=your-secret-key-here
```

---

## Database Migration

**Migration file**: `20260727234314_add_discussion_model`

**Generated files**:
```
prisma/migrations/20260727234314_add_discussion_model/migration.sql
prisma/src/generated/prisma/ (Prisma Client updated)
```

**Tables created**:
- `discussion` (mapped from `Discussion` model)

**Relations added**:
- `User.discussions` → `Discussion[]`

---

## Useful Commands

### Prisma
```bash
# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Check migration status
npx prisma migrate status
```

### Development
```bash
# Start dev server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
```

### Database Queries
```sql
-- View all discussions
SELECT * FROM discussion ORDER BY "createdAt" DESC LIMIT 10;

-- Count by status
SELECT status, COUNT(*) FROM discussion GROUP BY status;

-- Find comments needing cleanup
SELECT * FROM discussion 
WHERE "permanentDeleteAt" <= NOW() 
AND status = 'deleted';
```

---

## Migration Guide

### From No Comments → With Comments

1. **Run migration**:
```bash
npx prisma migrate dev --name add_discussion_model
npx prisma generate
```

2. **Update sidebar** (already done):
```tsx
// src/components/layout/AdminSidebar.tsx
{ to: "/discussions", label: "My Comments", icon: MessageSquare }
```

3. **Add to blog posts** (already done):
```tsx
// src/components/blog/view/BlogViewer.tsx
<CommentSection postId={post.id} postTitle={post.title} />
```

4. **Deploy**:
```bash
git add .
git commit -m "feat: add discussion and comment system"
git push
```

5. **Set up cron** (optional):
- Create cleanup endpoint
- Configure Vercel cron
- Set CRON_SECRET environment variable

### Adding to Existing Content Types

Example: Adding comments to products

1. **Verify source type exists**:
```typescript
// Already in: DiscussionSourceType
"product_review" // ✅ Available
```

2. **Add validation**:
```typescript
// src/app/api/discussions/route.ts
if (sourceType === "product_review") {
  const product = await prisma.product.findUnique({
    where: { id: sourceId },
    select: { id: true, published: true },
  });
  
  if (!product?.published) {
    return NextResponse.json(
      errorResponse("not_found", "Product not found"),
      { status: 404 }
    );
  }
}
```

3. **Add CommentSection**:
```tsx
// src/app/products/[slug]/page.tsx
<CommentSection postId={product.id} postTitle={product.name} />
```

---

## Code Snippets

### Check User Permission
```typescript
import { useAuth } from "@/context/AuthContext";

const { hasPermission } = useAuth();

if (hasPermission("moderate_discussions")) {
  // Show admin features
}
```

### Format Relative Time
```typescript
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
  addSuffix: true,
});
// Output: "2 hours ago"
```

### Truncate Content
```typescript
const truncate = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
```

### Status Badge Color
```typescript
const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    pending: "badge-warning",
    published: "badge-success",
    banned: "badge-error",
    deleted: "badge-ghost",
  };
  return badges[status] || "badge-ghost";
};
```

---

## Related Files

### Context Providers
```
src/context/AuthContext.tsx        → User authentication
src/context/ToastContext.tsx       → Toast notifications
src/context/NotificationContext.tsx → Notification system
```

### Middleware
```
src/lib/auth-middleware.ts         → Authentication check
src/lib/permissions.ts             → Permission validation
```

### Response Helpers
```
src/lib/api-response.ts            → successResponse, errorResponse
```

---

*Last updated: 2026-07-28*
*Quick reference for developers*
