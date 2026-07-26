# Gallery Management System

Comprehensive guide for the admin gallery management system at `/admin/gallery-management`. This system allows Content Admins to review and manage public gallery images uploaded by users.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Interface](#user-interface)
4. [API Endpoints](#api-endpoints)
5. [Components Architecture](#components-architecture)
6. [Usage Guide](#usage-guide)
7. [Developer Guide](#developer-guide)

---

## Overview

The Gallery Management System provides a full-featured interface for Content Admins to oversee public gallery content. Built with the same architecture as the Post Management system, it offers:

- **Search & Filter**: Find gallery items quickly with real-time search
- **Public Content Only**: Only displays galleries where `isPrivate=false`
- **Image Preview**: View full-size images with complete metadata in modal
- **Block Images**: Make inappropriate images private with admin notes
- **Author Information**: See who uploaded each gallery item
- **Auto-refresh**: Automatically updates every 60 seconds
- **Audit Logging**: Track all moderation actions

**Access**: Available at `/admin/gallery-management` (requires `manage_public_gallery` permission)

---

## Features

### 🔍 Search & Filtering

#### Search

- **Debounced search** (2-second delay) to avoid excessive API calls
- Searches in: Gallery titles and slugs
- Case-insensitive matching
- Real-time filtering without page refresh

#### Sorting

- **Sort by**: Upload Time (default), Title, Slug, Updated Date
- **Order**: Ascending or Descending
- Default: Upload Time (Descending)

#### Refresh

- Automatic refresh every 60 seconds
- Updates timestamp display
- Maintains current filter settings
- Silent background updates

### 🖼️ Gallery View

#### Table Display

- **Thumbnail**: Shows image preview (40x40px)
- **Title & Slug**: Gallery identification
- **Author**: User who uploaded with avatar
- **Tags**: Display first 3 tags + count
- **Dates**: Upload time and last update
- **Actions**: View button to open modal

#### Image Modal

- **Fixed Header**: Title and slug remain visible
- **Scrollable Content**: Image and metadata scroll independently
- **Full-size Image**: Display image up to 50vh height
- **Complete Metadata**:
  - All tags with styled badges
  - Author information with avatar
  - Upload and update timestamps
- **Admin Notes**: Textarea for adding moderation notes (max 200 characters)
- **Block Action**: Button to block inappropriate images
- **Keyboard Support**: ESC key to close
- **Click Outside**: Click backdrop to close

### 🚫 Image Blocking

#### Block Feature

- **Admin Notes Required**: Must provide reason before blocking (max 200 characters)
- **Pre-filled Notes**: Shows existing footnote if available
- **Character Counter**: Real-time count showing used/available characters
- **Confirmation Modal**: Custom confirmation dialog before blocking
- **Automatic Actions**:
  - Moves image from `apus-user-public` to `apus-user-private` bucket
  - Updates database: `isPrivate=true`, adds footnote, updates path
  - Creates audit log with action `image_blocked`
  - Notifies image owner with reason
  - Removes image from admin gallery list
  - Refreshes gallery list automatically

#### What Happens When Blocked

1. **Storage Migration**: Image file moved from public to private S3 bucket
2. **Database Update**: Gallery record marked as private
3. **Owner Notification**: User receives notification with block reason
4. **Audit Trail**: Action logged for compliance and review
5. **Visibility**: Image disappears from public gallery and admin list
6. **Owner Access**: User can still view in their private gallery

### 📊 Pagination

- **Page size**: 20 galleries per page
- **Navigation**: Previous/Next buttons
- **Indicators**: Shows "Page X of Y" and "Showing X-Y of Z"
- Maintains position when searching

---

## User Interface

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ Gallery Management                                          │
│ Last updated: 4:05:38 PM                                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search by title or slug...                          ]    │
│  X gallery items found                                     │
│                                                             │
├─────────┬──────────┬──────┬──────────┬──────────┬─────────┤
│ Gallery │ Author   │ Tags │ Uploaded │ Updated  │ Actions │
├─────────┼──────────┼──────┼──────────┼──────────┼─────────┤
│ 🖼️ Img1 │ John Doe │ nat  │ Jul 25   │ Jul 25   │ [View]  │
│ 🖼️ Img2 │ Jane S.  │ art  │ Jul 24   │ Jul 24   │ [View]  │
│ 🖼️ Img3 │ Bob Lee  │ tech │ Jul 23   │ Jul 23   │ [View]  │
└─────────┴──────────┴──────┴──────────┴──────────┴─────────┘
│                                                             │
│  Showing 1-3 of 3        [← Previous]  Page 1 of 1  [Next →] │
└────────────────────────────────────────────────────────────┘
```

### Modal View

```
┌─────────────────────────────────────────────────────┐
│  Gallery Title                                  [×] │
│  Slug: gallery-slug                                 │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │                                                 │ │
│ │              [Full-size Image]                 │ │
│ │                                                 │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Tags                                                │
│ [nature] [photography] [landscape]                  │
│                                                     │
│ Author                                              │
│ 👤 John Doe (@johndoe)                             │
│                                                     │
│ Uploaded                    Last Updated            │
│ July 25, 2026, 10:30 AM    July 25, 2026, 2:45 PM │
│                                                     │
│ ─────────────────────────────────────────────────  │
│ Admin Notes                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Add notes about this image...                   │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ 0/200 characters                                    │
│                                                     │
│ [ Block Image ]                                     │
│ Blocking will make this image private and notify   │
│ the owner.                                          │
└─────────────────────────────────────────────────────┘
```

### Block Confirmation Modal

```
┌───────────────────────────────────────┐
│  Block Image?                     [×] │
├───────────────────────────────────────┤
│                                       │
│  Are you sure you want to block       │
│  "Beautiful Sunset"?                  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ This will:                      │  │
│  │ • Make this image private       │  │
│  │ • Notify John Doe               │  │
│  │ • Remove it from public gallery │  │
│  └─────────────────────────────────┘  │
│                                       │
│           [ Cancel ] [ Block Image ]  │
└───────────────────────────────────────┘
```

### Color Scheme

Matches the Post Management system:

- **Background**: `bg-base-200`, `bg-base-300`
- **Borders**: `border-base-300`
- **Text**: `text-base-content`, `text-base-content/70`
- **Hover**: `hover:bg-base-300/30`
- **Focus**: `focus:border-accent focus:ring-accent`
- **Rounded**: `rounded-xl` for containers, `rounded-lg` for images
- **Modal**: `max-w-4xl h-[90vh]` with flex layout

---

## API Endpoints

### GET `/api/galleries`

Fetch public galleries for admin review.

**Query Parameters:**

```typescript
{
  search?: string;      // Search in title/slug
  sort: string;         // "title" | "slug" | "uploadTime" | "updatedAt"
  order: string;        // "asc" | "desc"
  skip: string;         // Number of items to skip (for pagination)
  limit: string;        // Number of items to fetch ("10" | "20" | "50")
}
```

**Response:**

```typescript
{
  success: true,
  message: "Found X gallery item(s)",
  data: [
    {
      id: string,
      title: string,
      slug: string,
      format: string,         // File extension (.jpg, .png, etc.)
      isPrivate: boolean,     // Always false for this endpoint
      footnote: string | null, // Admin notes about the image
      tags: string[],
      uploadTime: Date,
      updatedAt: Date,
      author: {
        id: string,
        name: string,
        username: string | null,
        image: string | null,
        role: string
      }
    }
  ],
  meta: {
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

- Only returns galleries where `isPrivate=false`
- Combines search with privacy filter
- Returns empty array if no galleries found
- Requires `manage_public_gallery` permission

**See**: [Gallery API Reference](../api/gallery-admin-api-reference.md) for complete documentation

### PATCH `/api/galleries/[id]`

Block an image by making it private with admin notes.

**Request Body:**

```typescript
{
  action: "block",
  footnote: string  // Required, max 200 characters
}
```

**Response:**

```typescript
{
  success: true,
  message: "Image blocked successfully",
  data: {
    id: string,
    isPrivate: true,
    footnote: string,
    updatedAt: string
  }
}
```

**Behavior:**

- Validates `manage_public_gallery` permission
- Requires footnote (1-200 characters)
- Copies image from `apus-user-public` to `apus-user-private` bucket
- Deletes image from `apus-user-public` bucket
- Updates database: `isPrivate=true`, `footnote`, `path`
- Creates audit log: `image_blocked`
- Sends notification to owner with footnote

**See**: [Gallery Admin API Reference](../api/gallery-admin-api-reference.md) for complete documentation

---

## Components Architecture

### Component Tree

```
GalleryManagementPage (page.tsx)
└── GalleryManagement
    ├── GalleryFilters
    │   ├── Search Input
    │   └── Total Count Display
    ├── GalleryTable
    │   ├── Table Headers
    │   └── GalleryTableRow (for each gallery)
    │       ├── Image Thumbnail
    │       ├── Title & Slug
    │       ├── Author Info
    │       ├── Tags Display
    │       ├── Upload & Update Dates
    │       └── View Button
    ├── GalleryPagination
    │   ├── Previous Button
    │   ├── Page Indicator
    │   └── Next Button
    ├── GalleryModal
    │   ├── Fixed Header (Title & Slug)
    │   └── Scrollable Content
    │       ├── Full-size Image
    │       ├── Tags Section
    │       ├── Author Section
    │       ├── Dates Section
    │       ├── Admin Notes Textarea
    │       └── Block Button
    └── BlockImageModal
        ├── Confirmation Message
        ├── Warning Notice
        └── Action Buttons
```

### File Structure

```
src/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   │       └── gallery-management/
│   │           └── page.tsx                # Main page component
│   └── api/
│       └── galleries/
│           ├── route.ts                    # List galleries API
│           └── [id]/
│               └── route.ts                # Block image API
└── components/
    ├── admin/
    │   └── gallery-management/
    │       ├── GalleryManagement.tsx       # Main client component
    │       ├── GalleryFilters.tsx          # Search & filter bar
    │       ├── GalleryTable.tsx            # Table container
    │       ├── GalleryTableRow.tsx         # Individual gallery row
    │       ├── GalleryPagination.tsx       # Pagination controls
    │       ├── GalleryModal.tsx            # Image detail modal
    │       └── BlockImageModal.tsx         # Block confirmation modal
    └── layout/
        └── AdminSidebar.tsx                # Navigation (updated)
```

### Data Flow

**Listing Galleries:**
```
User Action (Search/Page Change)
    ↓
GalleryManagement.fetchGalleries()
    ↓
API: GET /api/galleries
    ↓
Prisma: gallery.findMany({ where: { isPrivate: false } })
    ↓
Response with gallery data
    ↓
State Update (galleries, pagination)
    ↓
Re-render Table
```

**Blocking Image:**
```
Admin clicks Block Button
    ↓
BlockImageModal opens
    ↓
Admin confirms action
    ↓
API: PATCH /api/galleries/[id] { action: "block", footnote: "..." }
    ↓
S3: Copy image (apus-user-public → apus-user-private)
    ↓
S3: Delete from apus-user-public
    ↓
Prisma: Update gallery (isPrivate=true, footnote, path)
    ↓
Prisma: Create audit log (image_blocked)
    ↓
Prisma: Create notification (owner)
    ↓
Response: Success
    ↓
Modal closes, list refreshes
    ↓
Image removed from admin list
```

---

## Usage Guide

### For Content Admins

#### Accessing Gallery Management

1. Navigate to `/admin`
2. Click **Admin** → **Gallery Management** in sidebar
3. View list of all public galleries

#### Finding Galleries

**Search:**

1. Type in search box at the top
2. Wait 2 seconds for automatic search
3. Results update showing matching titles/slugs

**Browse:**

1. Scroll through paginated list
2. Use Previous/Next buttons to navigate
3. See upload date and author for each item

#### Viewing Gallery Details

1. Click anywhere on a gallery row (or click **View** button)
2. Modal opens with:
   - Full-size image display
   - Complete tag list
   - Author information
   - Upload and update timestamps
   - Admin notes section
   - Block action button
3. Scroll within modal to see all content
4. Close by:
   - Clicking the × button
   - Pressing ESC key
   - Clicking outside the modal

#### Blocking Inappropriate Images

**When to Block:**
- Inappropriate content
- Copyright violations
- Spam or offensive material
- Terms of service violations

**How to Block:**

1. Click on gallery item to open modal
2. Scroll to **Admin Notes** section at bottom
3. Enter reason for blocking (required, max 200 characters)
4. Click **Block Image** button
5. Review confirmation modal:
   - Image title and author name displayed
   - Warning about consequences shown
6. Click **Block Image** to confirm or **Cancel** to abort
7. Wait for processing (image is being moved to private storage)
8. Success notification appears
9. Modal closes automatically
10. Gallery list refreshes (blocked image removed)

**What Happens:**
- Image file moved from public to private storage bucket
- Database updated with block reason
- Image owner receives notification with your reason
- Action logged in audit trail
- Image becomes private (only owner can see it)
- Image removed from public gallery and admin list

**Important Notes:**
- Footnote is **required** - you must provide a reason
- Block button is disabled until you enter a note
- Character limit is 200 characters
- Action cannot be undone via this interface
- Owner can view the blocked image in their private gallery
- Owner can see your admin notes/reason

#### Understanding Gallery Info

**Table Columns:**

- **Gallery**: Thumbnail + Title + Slug
- **Author**: User avatar + Name + Username
- **Tags**: First 3 tags (e.g., "nature, photo, landscape +2 more")
- **Uploaded**: Initial upload date
- **Updated**: Last modification date
- **Actions**: View button

**Modal Sections:**

- **Header** (fixed): Title and slug
- **Image**: Full-size display centered
- **Tags**: All tags as styled badges
- **Author**: Avatar, name, username, role
- **Dates**: Full timestamps with time
- **Admin Notes**: Textarea for moderation notes
- **Block Button**: Action to make image private

---

## Developer Guide

### Adding New Features

#### Add Search Filter

1. Update API endpoint validation in `api/galleries/route.ts`:

```typescript
const sortFilter = ["title", "slug", "uploadTime", "updatedAt", "newField"];

if (newFieldValue) {
  where.newField = newFieldValue;
}
```

2. Add UI control in `GalleryFilters.tsx`:

```typescript
<Select
  value={filter.newFilter}
  onChange={(value) =>
    onFilterChange({ ...filter, newFilter: value })
  }
  options={newFilterOptions}
/>
```

3. Update FilterState interface in `GalleryManagement.tsx`:

```typescript
interface FilterState {
  search: string;
  newFilter: string; // Add here
}
```

#### Add Table Column

1. Update `GalleryTable.tsx` header:

```typescript
<th className="p-4 text-left text-sm font-semibold text-base-content">
  New Column
</th>
```

2. Update `GalleryTableRow.tsx` to add cell:

```typescript
<td className="p-4">
  <div className="text-sm text-base-content/70">
    {gallery.newField}
  </div>
</td>
```

3. Update interface in all files:

```typescript
interface GalleryListItem {
  // ... existing fields
  newField: string;
}
```

4. Update API response in `api/galleries/route.ts`:

```typescript
const listWithFormattedData = list.map((gallery) => ({
  // ... existing fields
  newField: gallery.newField,
}));
```

#### Customize Modal Display

1. Edit `GalleryModal.tsx` layout:

```typescript
<div className="space-y-4 pb-4">
  {/* Add new section */}
  <div>
    <h3 className="font-semibold text-base-content mb-2">New Section</h3>
    <p className="text-sm text-base-content/70">{gallery.newData}</p>
  </div>
</div>
```

2. Adjust image size in `GalleryModal.tsx`:

```typescript
// Change max-h-[50vh] to desired height
className = "h-auto max-h-[70vh] w-auto max-w-full object-contain";
```

### Image Display

Gallery images are fetched using the image API endpoint:

```typescript
const imageUrl = `/api/image?p=${gallery.isPrivate}&src=${gallery.slug}${gallery.format}`;
```

**Format:**

- `p`: Privacy flag (always `false` for public galleries)
- `src`: Slug + file format (e.g., `my-image.jpg`)

**Example:**

```
/api/image?p=false&src=sunset-beach.jpg
```

This endpoint:

- Validates privacy settings
- Serves image from appropriate storage
- Handles file type and caching

### Styling Guidelines

Always maintain consistency with post-management:

```typescript
// Table container
className =
  "mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-200";

// Table cells
className = "p-4 text-sm text-base-content";

// Table row hover
className =
  "border-b border-base-300 transition-colors hover:bg-base-300/30 cursor-pointer";

// Search input
className =
  "border-base-300 bg-base-200 text-base-content focus:border-accent focus:ring-accent h-10 w-full rounded-xl border pr-4 pl-10 text-sm focus:ring-2 focus:ring-offset-0 focus:outline-none";

// Modal
className = "max-w-4xl h-[90vh] flex flex-col";

// Modal header (fixed)
className = "border-base-300 shrink-0 border-b px-6 pt-6 pb-4";

// Modal content (scrollable)
className = "flex-1 overflow-y-auto px-6 py-4";
```

### State Management

The component uses React hooks for state management:

```typescript
// Gallery data
const [galleries, setGalleries] = useState<GalleryListItem[]>([]);
const [loading, setLoading] = useState(true);

// Filters
const [filter, setFilter] = useState<FilterState>({
  search: "",
});

// Pagination
const [pagination, setPagination] = useState({
  skip: 0,
  limit: 20,
  total: 0,
  hasMore: false,
});

// Modal
const [selectedGallery, setSelectedGallery] = useState<GalleryListItem | null>(
  null,
);
const [isModalOpen, setIsModalOpen] = useState(false);

// Block feature (in GalleryModal)
const [footnote, setFootnote] = useState(gallery?.footnote || "");
const [isBlocking, setIsBlocking] = useState(false);
const [showBlockModal, setShowBlockModal] = useState(false);

// Auto-refresh
const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
```

### Block Image Implementation

**API Call:**

```typescript
const handleConfirmBlock = async () => {
  setIsBlocking(true);

  try {
    const response = await fetch(`/api/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "block",
        footnote: footnote.trim(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Image blocked successfully", "success");
      setShowBlockModal(false);
      onClose();
      onBlockSuccess(); // Refresh gallery list
    } else {
      showToast(result.error?.message || "Failed to block image", "error");
    }
  } catch (error) {
    showToast("Network error", "error");
  } finally {
    setIsBlocking(false);
  }
};
```

**S3 Storage Migration:**

When blocking an image, the API handles:

1. Copy image from `apus-user-public` to `apus-user-private` bucket
2. Delete image from `apus-user-public` bucket
3. Update database path to `apus-user-private/[slug]`

```typescript
// In API endpoint
const copyCommand = new CopyObjectCommand({
  Bucket: "apus-user-private",
  CopySource: `/apus-user-public/${gallery.slug}${gallery.format}`,
  Key: `${gallery.slug}${gallery.format}`,
});

await s3Client.send(copyCommand);

const deleteCommand = new DeleteObjectCommand({
  Bucket: "apus-user-public",
  Key: `${gallery.slug}${gallery.format}`,
});

await s3Client.send(deleteCommand);
```

### Performance Optimizations

1. **Debounced Search**: 2-second delay prevents excessive API calls
2. **Auto-refresh**: Silent updates every 60 seconds without loading state
3. **Pagination**: Limits data fetched per request (20 items)
4. **Image Optimization**: Next.js Image component with proper sizing
5. **Modal Lazy Loading**: Only renders when open

### Permission System

Gallery management requires specific permission:

```typescript
// Check in component
if (!hasPermission("manage_public_gallery")) {
  router.push("/admin");
  return <AccessDenied />;
}

// Check in API
if (!permissions.hasPermission(currentUser.role, "manage_public_gallery")) {
  return NextResponse.json(
    errorResponse("insufficient_permissions", "..."),
    { status: 403 }
  );
}
```

**Roles with Permission:**

- `super_admin`: Full access
- `content_admin`: Full access

### Error Handling

All API calls include proper error handling:

```typescript
try {
  const response = await fetch(`/api/galleries?${params}`);
  const result = await response.json();

  if (result.success) {
    setGalleries(result.data);
    setPagination((prev) => ({
      ...prev,
      total: result.meta.pagination?.total || 0,
      hasMore: result.meta.pagination?.hasMore || false,
    }));
  } else {
    showToast(result.error?.message || "Failed to fetch galleries", "error");
  }
} catch (error) {
  showToast("Failed to fetch galleries", "error");
}
```

### Testing Checklist

- [ ] Search works with 2-second debounce
- [ ] Only public galleries (`isPrivate=false`) are shown
- [ ] Pagination navigates correctly
- [ ] Auto-refresh updates every 60 seconds
- [ ] Modal opens on row click
- [ ] Modal shows full-size image
- [ ] Modal displays all metadata
- [ ] Modal header stays fixed while scrolling
- [ ] Image URL format is correct (`/api/image?p=false&src=...`)
- [ ] Author avatars display correctly
- [ ] Tags display (first 3 + count)
- [ ] Footnote textarea pre-fills existing notes
- [ ] Character counter updates correctly (0-200)
- [ ] Block button disabled when footnote empty
- [ ] Block confirmation modal appears
- [ ] Block confirmation shows correct details
- [ ] Image moves from public to private bucket
- [ ] Database updates correctly (isPrivate, footnote, path)
- [ ] Audit log created with action `image_blocked`
- [ ] Notification sent to owner with footnote
- [ ] Notification links to `/gallery` (not specific image)
- [ ] Blocked image disappears from admin list
- [ ] Gallery list auto-refreshes after block
- [ ] Permission check works (`manage_public_gallery`)
- [ ] Unauthorized users redirected
- [ ] Styling matches post-management
- [ ] TypeScript compiles without errors
- [ ] Responsive design works on mobile
- [ ] ESC key closes modal
- [ ] Click outside closes modal
- [ ] S3 error handling works properly

---

## Troubleshooting

### Common Issues

#### Galleries not loading

- **Check**: User has `manage_public_gallery` permission
- **Check**: Database has galleries with `isPrivate=false`
- **Check**: API endpoint returns valid data
- **Solution**: Check browser console for errors

#### Images not displaying

- **Check**: Image URL format is correct
- **Check**: `/api/image` endpoint is working
- **Check**: Gallery has valid `slug` and `format` fields
- **Solution**: Verify `gallery.slug + gallery.format` exists in storage

#### Search not working

- **Check**: Debounce timer (wait 2 seconds after typing)
- **Check**: Search string is not empty
- **Solution**: Try clearing search and trying again

#### Modal not opening

- **Check**: Click handler is attached to row
- **Check**: Gallery data is valid
- **Check**: Modal component is imported
- **Solution**: Check browser console for JavaScript errors

#### Styling looks different

- **Check**: Tailwind classes are correct
- **Check**: Base colors defined in theme
- **Check**: Modal dimensions (`max-w-4xl h-[90vh]`)
- **Solution**: Compare with PostManagement styling

#### Permission denied

- **Check**: User role is `content_admin` or `super_admin`
- **Check**: Permission in `src/lib/permissions.ts`
- **Solution**: Update user role in database

#### Block button not working

- **Check**: Footnote is not empty (required)
- **Check**: Footnote is under 200 characters
- **Check**: Gallery is currently public
- **Solution**: Add admin notes before blocking

#### Image not moving to private bucket

- **Check**: S3/R2 credentials are correct
- **Check**: Both buckets exist (apus-user-public, apus-user-private)
- **Check**: API logs for S3 errors
- **Solution**: Verify R2 configuration in environment variables

#### Notification not received

- **Check**: Owner userId is different from admin userId
- **Check**: Notification created in database
- **Check**: User has active account
- **Solution**: Check notification table and user status

---

## Future Enhancements

Potential features for future development:

1. **Advanced Filters**
   - Filter by date range
   - Filter by specific tags
   - Filter by author
   - Filter by file format

2. **Bulk Actions**
   - Hide/archive multiple galleries
   - Add/remove tags in bulk
   - Change privacy settings

3. **Moderation Tools**
   - Flag inappropriate content
   - Add moderation notes
   - Ban/suspend users

4. **Analytics**
   - View count per gallery
   - Most popular tags
   - Upload trends over time

5. **Advanced Features**
   - Featured gallery selection
   - Gallery categories
   - Download original images
   - Export gallery data

---

## Related Documentation

- [Gallery API Reference](../api/gallery-admin-api-reference.md) - Complete API documentation
- [Post Management](./blog-management.md) - Similar admin interface
- [RBAC Implementation](./rbac-implementation.md) - Permission system
- [Image API](../api/gallery-api-reference.md) - Image serving endpoint

---

**Last Updated:** July 26, 2026  
**Version:** 1.1  
**Maintained by:** Development Team
