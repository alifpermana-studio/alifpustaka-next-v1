# Blog Management - Quick Reference

Quick reference guide for common blog management tasks.

---

## Quick Access

**URL:** `/blog`  
**Permission Required:** Authenticated user  
**Default View:** Published posts

---

## Common Tasks

### 🔍 Find Posts

```
1. Type in search box (waits 2 seconds)
2. Select status filter dropdown
3. Choose sort field and order
4. Click refresh to update
```

**Search Tips:**
- Searches title and slug
- Case-insensitive
- Combines with status filter

---

### ✏️ Edit Post

```
1. Find your post
2. Click ⋮ menu
3. Select "Edit"
4. Make changes
5. Save
```

---

### 🗑️ Delete Posts

**Single Post:**
```
1. Click ⋮ menu
2. Select "Delete"
3. Confirm in modal
```

**Multiple Posts:**
```
1. Check boxes for posts to delete
2. Click "Delete" in bottom bar
3. Confirm in browser dialog
```

---

### 🏷️ Manage Tags

**Add Tags to Multiple Posts:**
```
1. Select posts with checkboxes
2. Click "Manage Tags"
3. Type tags in "Add Tags" field
   Example: tutorial, nextjs, typescript
4. Click "Add Tags" button
```

**Remove Tags from Multiple Posts:**
```
1. Select posts with checkboxes
2. Click "Manage Tags"
3. Type tags in "Remove Tags" field
4. Click "Remove Tags" button
```

---

### 📝 Change Status

**Single Post:**
```
Use the editor to change status
```

**Multiple Posts:**
```
1. Select posts with checkboxes
2. Click "Change Status"
3. Select new status from dropdown
4. Click confirm button
```

---

## Status Reference

| Status | Color | Meaning |
|--------|-------|---------|
| 🟢 Published | Green | Live on website |
| 🟡 Submitted | Yellow | Awaiting review |
| 🔵 Drafted | Blue | Work in progress |
| 🔴 Deleted | Red | Soft deleted |

---

## Keyboard Shortcuts

Currently none implemented. Consider adding in future versions.

---

## Filter Options

### Status Filter
- **All Status** - Show all posts
- **Published** (default) - Only published posts
- **Submitted** - Posts awaiting review
- **Drafted** - Draft posts
- **Deleted** - Deleted posts

### Sort By
- **Title** - Alphabetical by title
- **Slug** - Alphabetical by URL slug
- **Last Updated** - Most recently modified

### Order
- **↓ Descending** - Newest/Z-A first
- **↑ Ascending** - Oldest/A-Z first

---

## Bulk Actions Bar

Appears at bottom of screen when posts are selected.

```
┌───────────────────────────────────────────────────────┐
│ X posts selected │ Change Status | Manage Tags | Delete │ ✕ │
└───────────────────────────────────────────────────────┘
```

**Actions:**
- **Change Status** - Update status for all selected posts
- **Manage Tags** - Add or remove tags
- **Delete** - Soft delete all selected posts
- **✕** - Clear selection

---

## Action Menu (⋮)

Available on each post row:

| Icon | Action | Description |
|------|--------|-------------|
| 👁️ | Preview | View post as published |
| 📋 | Copy Link | Copy URL to clipboard |
| ✏️ | Edit | Open in editor |
| 🗑️ | Delete | Soft delete post |

---

## Pagination Controls

```
Showing 1-20 of 45          [← Previous] Page 1 of 3 [Next →]
```

- **Page size:** 20 posts per page
- **Navigation:** Previous/Next buttons
- **Note:** Selection clears when changing pages

---

## Tag Input Format

Tags must be comma-separated:

✅ **Correct:**
```
tutorial, nextjs, typescript
```
```
web development, react, coding
```

❌ **Incorrect:**
```
tutorial nextjs typescript    (missing commas)
tutorial;nextjs;typescript    (wrong separator)
```

---

## API Quick Reference

### Get Posts
```http
GET /api/post-list?search=&status=published&sort=updatedAt&order=desc&skip=0&max=20
```

### Bulk Actions
```http
PATCH /api/posts/bulk
Content-Type: application/json

{
  "action": "change_status" | "delete" | "add_tags" | "remove_tags",
  "postIds": ["id1", "id2"],
  "data": { ... }
}
```

---

## Troubleshooting

### Posts not showing?
- Check status filter (default is "published")
- Clear search box
- Click refresh button

### Can't select a post?
- Deleted posts cannot be selected
- Check if post belongs to you

### Bulk action not working?
- Ensure posts are selected (checkboxes checked)
- Verify you own all selected posts
- Check browser console for errors

### Tags not saving?
- Use comma-separated format
- Avoid special characters
- Check spelling

---

## Best Practices

✅ **Do:**
- Use descriptive titles
- Add relevant tags
- Keep drafts organized
- Review before publishing
- Use bulk actions for efficiency

❌ **Don't:**
- Delete posts unnecessarily (they can't be recovered from /blog)
- Use too many tags per post
- Forget to save drafts
- Change status without reviewing content

---

## Need Help?

- Full documentation: [Blog Management System](./blog-management.md)
- RBAC permissions: [RBAC Implementation](./rbac-implementation.md)
- Report issues: Project issue tracker

---

**Last Updated:** July 21, 2026  
**Version:** 1.0
