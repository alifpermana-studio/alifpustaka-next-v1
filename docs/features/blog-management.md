# Blog Management System

Comprehensive guide for the blog post management system at `/blog`. This system allows users to manage their own blog posts with advanced filtering, bulk operations, and status management.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Interface](#user-interface)
4. [Post Status Workflow](#post-status-workflow)
5. [API Endpoints](#api-endpoints)
6. [Components Architecture](#components-architecture)
7. [Usage Guide](#usage-guide)
8. [Developer Guide](#developer-guide)

---

## Overview

The Blog Management System provides a full-featured interface for authors to manage their blog posts. Built with the same architecture as the User Management system, it offers:

- **Search & Filter**: Find posts quickly with real-time search and status filtering
- **Bulk Operations**: Manage multiple posts at once
- **Status Management**: Track posts through their lifecycle (drafted, submitted, published, deleted)
- **Tag Management**: Add or remove tags in bulk or individually
- **Pagination**: Navigate through large post collections efficiently

**Access**: Available at `/blog` (requires authentication)

---

## Features

### 🔍 Search & Filtering

#### Search
- **Debounced search** (2-second delay) to avoid excessive API calls
- Searches in: Post titles and slugs
- Case-insensitive matching
- Works in combination with status filter

#### Status Filter
- **Default**: Shows "Published" posts
- **Options**: All Status, Published, Submitted, Drafted, Deleted
- Search results respect the selected status filter
- Real-time filtering without page refresh

#### Sorting
- **Sort by**: Title, Slug, Last Updated
- **Order**: Ascending or Descending (toggle button)
- Default: Last Updated (Descending)

#### Refresh
- Manual refresh button to reload posts
- Updates timestamp display
- Maintains current filter settings

### ✅ Selection & Bulk Actions

#### Selection
- **Individual selection**: Click checkbox on each row
- **Select all**: Checkbox in table header
- **Indeterminate state**: Shows when some (but not all) posts are selected
- Deleted posts cannot be selected

#### Bulk Operations
- **Change Status**: Update status for multiple posts at once
  - Published, Submitted, Drafted, Deleted
  - Confirmation modal with status selection
  
- **Delete Posts**: Soft delete multiple posts
  - Browser confirmation dialog
  - Sets status to "deleted" (can be recovered)
  
- **Manage Tags**: Add or remove tags from multiple posts
  - Add tags: Comma-separated input (e.g., `tech, tutorial, nextjs`)
  - Remove tags: Comma-separated input
  - Can perform both operations in one modal

### 📄 Individual Post Actions

Each post has a dropdown menu with:
- **Preview**: View post as it appears to readers
- **Copy Link**: Copy post URL to clipboard
- **Edit**: Open post in editor
- **Delete**: Soft delete with confirmation modal

### 📊 Pagination

- **Page size**: 20 posts per page
- **Navigation**: Previous/Next buttons
- **Indicators**: Shows "Page X of Y" and "Showing X-Y of Z posts"
- Selection clears when changing pages

---

## Post Status Workflow

```
┌─────────┐
│ Drafted │ ← Author creates/saves draft
└────┬────┘
     │
     ↓
┌───────────┐
│ Submitted │ ← Author submits for review
└─────┬─────┘
      │
      ↓
┌───────────┐
│ Published │ ← Editor/Admin publishes (requires review_posts permission)
└─────┬─────┘
      │
      ↓
┌─────────┐
│ Deleted  │ ← Soft deleted (can be recovered via content management)
└─────────┘
```

### Status Descriptions

| Status | Description | Visible To | Actions Available |
|--------|-------------|------------|-------------------|
| **Drafted** | Work in progress | Author only | Edit, Submit, Delete |
| **Submitted** | Awaiting review | Author + Reviewers | Edit, Publish (reviewers), Delete |
| **Published** | Live on site | Everyone | Edit, Unpublish, Delete |
| **Deleted** | Soft deleted | Author + Admins | Recover (via content management) |

---

## User Interface

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ My Posts                                                    │
│ Manage your blog posts                                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search...        ]  [Status ▼] [Sort ▼] [↕] [↻]        │
│  X posts found                                             │
│                                                             │
├───┬─────────────┬──────────────┬──────┬────────┬─────────┤
│ ☐ │ Title       │ Last Updated │ Tags │ Status │ Actions │
├───┼─────────────┼──────────────┼──────┼────────┼─────────┤
│ ☐ │ My Post     │ Jul 21, 2026 │ tech │ 🟢 Pub │    ⋮   │
│ ☐ │ Draft Post  │ Jul 20, 2026 │ blog │ 🔵 Dra │    ⋮   │
│ ☐ │ Review Post │ Jul 19, 2026 │ news │ 🟡 Sub │    ⋮   │
└───┴─────────────┴──────────────┴──────┴────────┴─────────┘
│                                                             │
│  Showing 1-3 of 3              [← Previous]  Page 1 of 1  [Next →] │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ When posts are selected:                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3 posts selected │ Change Status | Manage Tags | 🗑️ Delete │ ✕ │ │
│  └─────────────────────────────────────────────────────┘   │
│  (Fixed at bottom center)                                   │
└────────────────────────────────────────────────────────────┘
```

### Color Scheme

Matches the User Management system exactly:

- **Background**: `bg-base-200`, `bg-base-300`
- **Borders**: `border-base-300`
- **Text**: `text-base-content`, `text-base-content/70`
- **Hover**: `hover:bg-base-300/30`
- **Focus**: `focus:border-accent focus:ring-accent`
- **Rounded**: `rounded-xl` for containers, `rounded-lg` for buttons

### Status Badges

| Status | Badge Color | Variant |
|--------|-------------|---------|
| Published | Green | `success` |
| Submitted | Yellow | `warning` |
| Drafted | Blue | `info` |
| Deleted | Red | `danger` |

---

## API Endpoints

### GET `/api/post-list`

Fetch user's posts with filtering and pagination.

**Query Parameters:**
```typescript
{
  search?: string;      // Search in title/slug
  status?: string;      // "published" | "submitted" | "drafted" | "deleted" | ""
  sort: string;         // "title" | "slug" | "uploadTime" | "updatedAt"
  order: string;        // "asc" | "desc"
  skip: string;         // Number of posts to skip (for pagination)
  max: string;          // Number of posts to fetch ("10" | "20" | "50")
}
```

**Response:**
```typescript
{
  success: true,
  message: "Found X post(s)",
  data: Post[],
  meta: {
    timestamp: string,
    pagination: {
      total: number,
      skip: number,
      limit: number,
      hasMore: boolean
    }
  }
}
```

**Behavior:**
- Only returns posts where `userId` matches authenticated user
- Combines search with status filter
- Returns empty array if no posts found

### PATCH `/api/posts/bulk`

Perform bulk operations on multiple posts.

**Request Body:**
```typescript
{
  action: "change_status" | "delete" | "add_tags" | "remove_tags",
  postIds: string[],
  data?: {
    status?: PostStatus,  // For change_status
    tags?: string[]       // For add_tags/remove_tags
  }
}
```

**Actions:**

#### 1. Change Status
```json
{
  "action": "change_status",
  "postIds": ["post-1", "post-2"],
  "data": { "status": "published" }
}
```

#### 2. Delete Posts
```json
{
  "action": "delete",
  "postIds": ["post-1", "post-2"]
}
```

#### 3. Add Tags
```json
{
  "action": "add_tags",
  "postIds": ["post-1", "post-2"],
  "data": { "tags": ["tutorial", "nextjs", "typescript"] }
}
```

#### 4. Remove Tags
```json
{
  "action": "remove_tags",
  "postIds": ["post-1", "post-2"],
  "data": { "tags": ["outdated", "draft"] }
}
```

**Response:**
```typescript
{
  success: true,
  message: "X post(s) updated, Y failed",
  data: {
    succeeded: number,
    failed: number
  }
}
```

**Security:**
- Verifies all posts belong to authenticated user
- Returns 403 if any post is owned by another user
- Uses `Promise.allSettled` for parallel processing

### PUT `/api/blog-post`

Update or delete individual post (existing endpoint).

Used for single post deletion:
```json
{
  "action": "deleted",
  "data": {
    "id": "post-id",
    "title": "Post Title",
    "slug": "post-slug"
  }
}
```

---

## Components Architecture

### Component Tree

```
BlogPage (page.tsx)
├── PostFilters
│   ├── Search Input
│   ├── Status Select
│   ├── Sort Select
│   ├── Order Toggle Button
│   └── Refresh Button
├── PostTable
│   ├── Table Headers (with Select All checkbox)
│   └── PostTableRow (for each post)
│       ├── Checkbox
│       ├── Title (ReactMarkdown)
│       ├── Last Updated
│       ├── Tags
│       ├── Status Badge
│       └── PostActionsDropdown
│           ├── Preview
│           ├── Copy Link
│           ├── Edit
│           └── Delete
├── PostPagination
│   ├── Previous Button
│   ├── Page Indicator
│   └── Next Button
├── PostBulkActionBar (conditional)
│   ├── Selected Count
│   ├── Change Status Button
│   ├── Manage Tags Button
│   ├── Delete Button
│   └── Clear Selection Button
└── Modals
    ├── DeletePostModal
    ├── BulkStatusChangeModal
    └── BulkTagModal
```

### File Structure

```
src/
├── app/
│   ├── (admin)/
│   │   └── blog/
│   │       └── page.tsx                    # Main page component
│   └── api/
│       ├── post-list/
│       │   └── route.ts                    # List posts API
│       └── posts/
│           └── bulk/
│               └── route.ts                # Bulk operations API
└── components/
    └── blog/
        ├── PostFilters.tsx                 # Search & filter bar
        ├── PostTable.tsx                   # Table container
        ├── PostTableRow.tsx                # Individual post row
        ├── PostActionsDropdown.tsx         # Action menu per post
        ├── PostBulkActionBar.tsx           # Bulk action bar
        ├── PostPagination.tsx              # Pagination controls
        ├── DeletePostModal.tsx             # Delete confirmation
        ├── BulkStatusChangeModal.tsx       # Bulk status change
        └── BulkTagModal.tsx                # Bulk tag management
```

---

## Usage Guide

### For Authors

#### Creating and Managing Posts

1. **Access your posts**: Navigate to `/blog`
2. **View all posts**: Default view shows published posts
3. **Find a post**: 
   - Type in search box (waits 2 seconds before searching)
   - Select status filter to narrow results
   - Use sort options to organize list

#### Editing a Post

1. Click the **⋮** menu on the post row
2. Select **Edit**
3. Make changes in the editor
4. Save as draft or submit for review

#### Deleting a Post

**Single Post:**
1. Click **⋮** menu on post row
2. Select **Delete**
3. Confirm in modal
4. Post status changes to "deleted"

**Multiple Posts:**
1. Select posts using checkboxes
2. Click **Delete** in bulk action bar
3. Confirm in browser dialog
4. All selected posts marked as deleted

#### Managing Tags

**Bulk Add Tags:**
1. Select posts using checkboxes
2. Click **Manage Tags** in bulk action bar
3. Enter tags in "Add Tags" field (comma-separated)
   - Example: `tutorial, nextjs, typescript`
4. Click **Add Tags**

**Bulk Remove Tags:**
1. Select posts using checkboxes
2. Click **Manage Tags** in bulk action bar
3. Enter tags in "Remove Tags" field (comma-separated)
4. Click **Remove Tags**

#### Changing Post Status

**Single Post:**
- Use the editor to change status and save

**Multiple Posts:**
1. Select posts using checkboxes
2. Click **Change Status** in bulk action bar
3. Select new status from dropdown
4. Click **Change Status** or **Delete Posts** (if deleting)

---

## Developer Guide

### Adding New Features

#### Add New Filter

1. Update `FilterState` interface in `page.tsx`:
```typescript
interface FilterState {
  search: string;
  status: PostStatus | "";
  sort: string;
  order: string;
  newFilter: string;  // Add here
}
```

2. Update API endpoint in `api/post-list/route.ts`:
```typescript
const newFilter = searchParams.get("newFilter") || "";

// Add to where clause
if (newFilter) {
  where.newField = newFilter;
}
```

3. Add UI control in `PostFilters.tsx`:
```typescript
<Select
  value={filter.newFilter}
  onChange={(value) =>
    onFilterChange({ ...filter, newFilter: value })
  }
  options={newFilterOptions}
/>
```

#### Add New Bulk Action

1. Update bulk API in `api/posts/bulk/route.ts`:
```typescript
if (action === "new_action") {
  // Implementation
  const results = await Promise.allSettled(
    validPostIds.map(async (postId) => {
      // Perform action
      await prisma.post.update({
        where: { id: postId },
        data: { /* updates */ },
      });
      return postId;
    })
  );
  
  // Return results
}
```

2. Add button in `PostBulkActionBar.tsx`:
```typescript
<Button
  variant="secondary"
  size="sm"
  onClick={() => onBulkAction("new_action")}
>
  <Icon className="h-4 w-4" />
  New Action
</Button>
```

3. Handle action in `page.tsx`:
```typescript
const handleBulkAction = (action: "status" | "delete" | "tags" | "new_action") => {
  // Handle new action
};
```

### Styling Guidelines

Always maintain consistency with user-management:

```typescript
// Container
className="rounded-xl border border-base-300 bg-base-200"

// Table cells
className="p-4 text-sm text-base-content"

// Hover effects
className="transition-colors hover:bg-base-300/30"

// Input fields
className="border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border px-4 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none"

// Buttons (use Button component with variants)
<Button variant="primary" size="sm">Action</Button>
```

### State Management

The page uses React hooks for state management:

```typescript
// Posts data
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);

// Filters
const [filter, setFilter] = useState<FilterState>({
  search: "",
  status: "published",  // Default
  sort: "updatedAt",
  order: "desc",
});

// Pagination
const [pagination, setPagination] = useState({
  skip: 0,
  limit: 20,
  total: 0,
  hasMore: false,
});

// Selection
const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

// Modals
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
```

### Performance Optimizations

1. **Debounced Search**: 2-second delay prevents excessive API calls
2. **Memoized Selectable Posts**: `useMemo` in PostTable for better performance
3. **Silent Refresh**: Background updates without loading state
4. **Promise.allSettled**: Parallel bulk operations with error handling
5. **Pagination**: Limits data fetched per request

### Error Handling

All API calls include proper error handling:

```typescript
try {
  const response = await fetch(`/api/post-list?${params}`);
  const result = await response.json();

  if (result.success) {
    // Handle success
  } else {
    showNotification(
      result.error?.message || "Failed to fetch posts",
      "error",
    );
  }
} catch (error) {
  showNotification("Failed to fetch posts", "error");
}
```

### Testing Checklist

- [ ] Search works with debounce
- [ ] Status filter defaults to "published"
- [ ] Search respects status filter
- [ ] Sort and order toggle work
- [ ] Pagination navigates correctly
- [ ] Only user's posts are shown
- [ ] Select all/individual selection works
- [ ] Bulk status change succeeds
- [ ] Bulk delete shows confirmation
- [ ] Bulk tags add/remove correctly
- [ ] Individual delete works
- [ ] Dropdown actions (preview, copy, edit, delete) work
- [ ] Modals open/close properly
- [ ] Styling matches user-management
- [ ] TypeScript compiles without errors
- [ ] Responsive design works on mobile

---

## Troubleshooting

### Common Issues

#### Posts not loading
- **Check**: User is authenticated
- **Check**: Database connection is active
- **Check**: API endpoint returns valid data
- **Solution**: Check browser console for errors

#### Search not working
- **Check**: Debounce timer (wait 2 seconds after typing)
- **Check**: Status filter is set correctly
- **Solution**: Try clearing filters and searching again

#### Bulk actions failing
- **Check**: Posts are owned by current user
- **Check**: Network tab for API errors
- **Solution**: Ensure all selected posts belong to the user

#### Tags not saving
- **Check**: Tag input format (comma-separated)
- **Check**: No special characters in tag names
- **Solution**: Use simple alphanumeric tags

#### Styling looks different
- **Check**: Tailwind classes are correct
- **Check**: Base colors defined in theme
- **Solution**: Compare with UserTable styling

---

## Future Enhancements

Potential features for future development:

1. **Advanced Filters**
   - Filter by date range
   - Filter by tag
   - Filter by word count

2. **Batch Operations**
   - Duplicate posts
   - Export to markdown
   - Schedule publishing

3. **Analytics**
   - View count per post
   - Most popular tags
   - Publishing trends

4. **Collaboration**
   - Co-author assignments
   - Comment on drafts
   - Version history

5. **Templates**
   - Save post templates
   - Quick start from template

---

## Related Documentation

- [RBAC Implementation](./rbac-implementation.md) - Role and permission system
- [User Management](../README.md) - Similar interface for user management
- [API Response Standards](../development/error-codes.md) - Error handling

---

**Last Updated:** July 21, 2026  
**Version:** 1.0  
**Maintained by:** Development Team
