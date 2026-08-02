# Gallery Admin API Reference

Complete API reference for admin gallery management endpoints.

**Last Updated:** 2026-07-26

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [List Public Galleries](#list-public-galleries)
4. [Block Single Image](#block-single-image)
5. [Bulk Block Images](#bulk-block-images)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Overview

The Gallery Admin API provides endpoints for Content Admins to review and manage public gallery images uploaded by users.

**Features:**
- List public galleries with filtering and search
- Block single inappropriate image (make private)
- Bulk block multiple images at once
- Pagination support
- Author information included
- Privacy filtering (public only)
- Role-based access control
- Storage bucket migration
- Audit logging and notifications
- Grouped notifications for bulk actions

**Access Control:**
```
Content Admin → Can view all public galleries
Super Admin   → Can view all public galleries
Other roles   → No access
```

---

## Authentication

All gallery admin endpoints require authentication with proper permissions.

**Required:** Active user session with `manage_public_gallery` permission  
**Header:** `Cookie: better-auth.session_token=<token>`

**Allowed Roles:**
- **Content Admin:** Full access to public gallery management
- **Super Admin:** Full access to public gallery management

---

## List Public Galleries

Retrieve a paginated list of public galleries with filtering and search capabilities.

### Endpoint

```
GET /api/galleries
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | "" | Search by title or slug (case-insensitive) |
| `sort` | string | Yes | - | Sort field (title, slug, uploadTime, updatedAt) |
| `order` | string | Yes | - | Sort order (asc, desc) |
| `skip` | number | Yes | - | Pagination offset |
| `limit` | number | Yes | - | Results per page (10, 20, 50) |

### Authentication

**Required:** Active user session with `manage_public_gallery` permission

### Permission Checks

- Must have `manage_public_gallery` permission
- Only Content Admin and Super Admin roles have this permission

### Visibility Rules

**Public Galleries Only:**
- Only galleries where `isPrivate=false` are returned
- Private galleries are never shown to admins via this endpoint
- Users manage their own private galleries separately

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 25 gallery item(s)",
  "data": [
    {
      "id": "gallery_123",
      "title": "Sunset at the Beach",
      "slug": "sunset-beach",
      "format": ".jpg",
      "isPrivate": false,
      "footnote": null,
      "tags": ["nature", "photography", "sunset"],
      "uploadTime": "2026-07-20T10:30:00.000Z",
      "updatedAt": "2026-07-20T14:22:00.000Z",
      "author": {
        "id": "user_456",
        "name": "John Doe",
        "username": "johndoe",
        "image": "https://example.com/avatar.jpg",
        "role": "user"
      }
    },
    {
      "id": "gallery_124",
      "title": "Mountain Landscape",
      "slug": "mountain-landscape",
      "format": ".png",
      "isPrivate": false,
      "footnote": null,
      "tags": ["landscape", "mountains", "hiking"],
      "uploadTime": "2026-07-19T15:20:00.000Z",
      "updatedAt": "2026-07-19T15:20:00.000Z",
      "author": {
        "id": "user_789",
        "name": "Jane Smith",
        "username": "janesmith",
        "image": null,
        "role": "user"
      }
    }
  ],
  "meta": {
    "pagination": {
      "total": 25,
      "skip": 0,
      "limit": 20,
      "hasMore": true
    }
  }
}
```

### Response Fields

#### Gallery Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique gallery identifier (UUID) |
| `title` | string | Gallery title |
| `slug` | string | URL-friendly slug (unique) |
| `format` | string | File extension (.jpg, .png, .gif, .webp) |
| `isPrivate` | boolean | Privacy flag (always `false` in this endpoint) |
| `footnote` | string \| null | Admin notes about the image |
| `tags` | string[] | Array of tag strings |
| `uploadTime` | string (ISO 8601) | Initial upload timestamp |
| `updatedAt` | string (ISO 8601) | Last modification timestamp |
| `author` | object | User who uploaded the gallery |

#### Author Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User identifier |
| `name` | string | User's display name |
| `username` | string \| null | Username (nullable) |
| `image` | string \| null | Avatar URL (nullable) |
| `role` | string | User role |

#### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of matching galleries |
| `skip` | number | Current offset |
| `limit` | number | Results per page |
| `hasMore` | boolean | Whether more pages exist |

### Error Responses

**400 Bad Request** - Missing required parameter
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Missing required parameter"
  }
}
```

**400 Bad Request** - Invalid parameter value
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid parameter value"
  }
}
```

**Details for Invalid Parameters:**
- `sort`: Must be one of: title, slug, uploadTime, updatedAt
- `order`: Must be one of: asc, desc
- `limit`: Must be one of: 10, 20, 50

**401 Unauthorized** - Not authenticated
```json
{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Authentication required"
  }
}
```

**403 Forbidden** - No gallery management permission
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to manage gallery"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to fetch galleries"
  }
}
```

### Example Requests

#### Get First Page (Default Sort)

```typescript
const response = await fetch(
  '/api/galleries?sort=uploadTime&order=desc&skip=0&limit=20',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} galleries`);
  result.data.forEach(gallery => {
    console.log(`${gallery.title} by ${gallery.author.name}`);
  });
}
```

#### Search Galleries

```typescript
// Search for "nature" in title or slug
const response = await fetch(
  '/api/galleries?search=nature&sort=uploadTime&order=desc&skip=0&limit=20',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.meta.pagination.total} galleries matching "nature"`);
}
```

#### Sort by Title

```typescript
// Get galleries sorted alphabetically by title
const response = await fetch(
  '/api/galleries?sort=title&order=asc&skip=0&limit=50',
  { credentials: 'include' }
);
```

#### Pagination

```typescript
// Get second page (skip first 20)
const response = await fetch(
  '/api/galleries?sort=uploadTime&order=desc&skip=20&limit=20',
  { credentials: 'include' }
);

const result = await response.json();
if (result.success) {
  console.log(`Showing ${result.data.length} of ${result.meta.pagination.total} total galleries`);
  console.log(`Has more pages: ${result.meta.pagination.hasMore}`);
}
```

---

## Block Single Image

Block an inappropriate image by making it private with admin notes.

### Endpoint

```
PATCH /api/galleries/[id]
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gallery ID (UUID) |

### Request Body

```json
{
  "action": "block",
  "footnote": "This image contains inappropriate content and violates our community guidelines."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be "block" |
| `footnote` | string | Yes | Admin notes/reason for blocking (1-200 characters) |

### Authentication

**Required:** Active user session with `manage_public_gallery` permission

### Permission Checks

- Must have `manage_public_gallery` permission
- Only Content Admin and Super Admin roles have this permission

### Business Logic

**Validation:**
- Footnote is required (cannot be empty)
- Footnote must be 1-200 characters
- Image must currently be public (`isPrivate=false`)

**Storage Migration:**
1. Copy image from `apus-user-public` to `apus-user-private` bucket
2. Delete image from `apus-user-public` bucket
3. Update database path to `apus-user-private/[slug]`

**Database Updates:**
- Set `isPrivate=true`
- Store `footnote` with admin notes
- Update `path` to private bucket location
- Update `updatedAt` timestamp

**Audit & Notifications:**
- Creates audit log with action: `image_blocked`
- Sends notification to image owner with footnote
- Notification links to `/gallery` page

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Image blocked successfully",
  "data": {
    "id": "gallery_123",
    "isPrivate": true,
    "footnote": "This image contains inappropriate content and violates our community guidelines.",
    "updatedAt": "2026-07-26T06:30:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Invalid action
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid action. Must be 'block'"
  }
}
```

**400 Bad Request** - Missing footnote
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Footnote is required"
  }
}
```

**400 Bad Request** - Footnote too long
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Footnote must not exceed 200 characters"
  }
}
```

**400 Bad Request** - Already private
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Image is already private"
  }
}
```

**403 Forbidden** - No permission
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to manage images"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Image not found"
  }
}
```

**500 Internal Server Error** - S3 operation failed
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to move image to private storage"
  }
}
```

**500 Internal Server Error** - Database operation failed
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to block image"
  }
}
```

### Example

```typescript
// Block an inappropriate image
const response = await fetch('/api/galleries/gallery_123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    action: 'block',
    footnote: 'This image contains inappropriate content and violates our community guidelines.'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Image blocked successfully');
  console.log('Image is now private:', result.data.isPrivate);
  console.log('Admin notes:', result.data.footnote);
  // Image has been moved to private storage
  // Owner has been notified
  // Audit log created
}
```

### Storage Migration Details

When an image is blocked, the following S3 operations occur:

```typescript
// 1. Copy from public to private bucket
const copyCommand = new CopyObjectCommand({
  Bucket: "apus-user-private",
  CopySource: `/apus-user-public/${slug}${format}`,
  Key: `${slug}${format}`
});
await s3Client.send(copyCommand);

// 2. Delete from public bucket
const deleteCommand = new DeleteObjectCommand({
  Bucket: "apus-user-public",
  Key: `${slug}${format}`
});
await s3Client.send(deleteCommand);

// 3. Update database path
await prisma.gallery.update({
  where: { id },
  data: {
    isPrivate: true,
    footnote: footnote.trim(),
    path: `apus-user-private/${slug}`
  }
});
```

### Audit Log Entry

The block action creates an audit log entry:

```json
{
  "action": "image_blocked",
  "entityType": "gallery",
  "entityId": "gallery_123",
  "performedBy": "admin_user_id",
  "performedByRole": "content_admin",
  "oldValue": {
    "isPrivate": false,
    "footnote": null
  },
  "newValue": {
    "isPrivate": true,
    "footnote": "This image contains inappropriate content..."
  },
  "metadata": {
    "galleryTitle": "Sunset Beach",
    "gallerySlug": "sunset-beach",
    "ownerId": "user_456",
    "ownerName": "John Doe"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-07-26T06:30:00.000Z"
}
```

### Notification to Owner

The image owner receives a notification:

```json
{
  "userId": "user_456",
  "type": "image_blocked",
  "title": "Your image has been blocked",
  "message": "Your image \"Sunset Beach\" has been blocked. Reason: This image contains inappropriate content and violates our community guidelines.",
  "linkTo": "/gallery",
  "relatedEntityType": "gallery",
  "relatedEntityId": "gallery_123",
  "isRead": false,
  "createdAt": "2026-07-26T06:30:00.000Z"
}
```

---

## Bulk Block Images

Block multiple images at once with a shared footnote.

### Endpoint

```
POST /api/galleries/bulk-block
```

### Request Body

```json
{
  "galleryIds": ["gallery_123", "gallery_124", "gallery_125"],
  "footnote": "These images contain inappropriate content and violate our community guidelines."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `galleryIds` | string[] | Yes | Array of gallery IDs to block |
| `footnote` | string | Yes | Admin notes/reason for blocking (1-200 characters) |

### Authentication

**Required:** Active user session with `manage_public_gallery` permission

### Permission Checks

- Must have `manage_public_gallery` permission
- Only Content Admin and Super Admin roles have this permission

### Business Logic

**Validation:**
- Gallery IDs array required and cannot be empty
- Footnote is required (cannot be empty)
- Footnote must be 1-200 characters
- All galleries must exist in database
- Only public images are processed (private images skipped with error)

**Bulk Processing:**
- Uses `Promise.allSettled` for parallel processing
- Each image processed independently
- Tracks succeeded and failed operations
- Continues processing even if some images fail

**Storage Migration (Per Image):**
1. Copy image from `apus-user-public` to `apus-user-private` bucket
2. Delete image from `apus-user-public` bucket
3. Update database path to `apus-user-private/[slug]`

**Database Updates (Per Image):**
- Set `isPrivate=true`
- Store `footnote` with admin notes
- Update `path` to private bucket location
- Update `updatedAt` timestamp

**Audit & Notifications:**
- Creates individual audit log per image with action: `image_blocked_bulk`
- Includes bulk metadata (totalInBatch, batchIndex)
- Groups notifications by owner (one notification per owner)
- If owner has multiple images blocked, sends single notification with count
- Notification links to `/gallery` page

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "3 image(s) blocked successfully",
  "data": {
    "succeeded": 3,
    "failed": 0,
    "results": [
      {
        "id": "gallery_123",
        "success": true
      },
      {
        "id": "gallery_124",
        "success": true
      },
      {
        "id": "gallery_125",
        "success": true
      }
    ]
  }
}
```

**Partial Success (Some Failed):**

```json
{
  "success": true,
  "message": "2 image(s) blocked successfully, 1 failed",
  "data": {
    "succeeded": 2,
    "failed": 1,
    "results": [
      {
        "id": "gallery_123",
        "success": true
      },
      {
        "id": "gallery_124",
        "success": false,
        "error": "Image \"Mountain View\" is already private"
      },
      {
        "id": "gallery_125",
        "success": true
      }
    ]
  }
}
```

### Error Responses

**400 Bad Request** - Missing gallery IDs
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Gallery IDs are required"
  }
}
```

**400 Bad Request** - Missing footnote
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Footnote is required"
  }
}
```

**400 Bad Request** - Footnote too long
```json
{
  "success": false,
  "error": {
    "code": "invalid_parameter",
    "message": "Footnote must not exceed 200 characters"
  }
}
```

**403 Forbidden** - No permission
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to manage images"
  }
}
```

**404 Not Found** - No galleries found
```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "No galleries found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "internal_error",
    "message": "Failed to block images"
  }
}
```

### Example

```typescript
// Block multiple images with shared reason
const response = await fetch('/api/galleries/bulk-block', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    galleryIds: ['gallery_123', 'gallery_124', 'gallery_125'],
    footnote: 'These images contain inappropriate content and violate our community guidelines.'
  })
});

const result = await response.json();
if (result.success) {
  console.log(`Successfully blocked: ${result.data.succeeded} images`);
  console.log(`Failed: ${result.data.failed} images`);
  
  result.data.results.forEach(item => {
    if (item.success) {
      console.log(`✓ Image ${item.id} blocked`);
    } else {
      console.log(`✗ Image ${item.id} failed: ${item.error}`);
    }
  });
}
```

### Grouped Notifications

When multiple images from the same owner are blocked, they receive a single notification:

**Single Image (Owner A):**
```json
{
  "userId": "user_456",
  "type": "image_blocked",
  "title": "Your image has been blocked",
  "message": "Your image \"Sunset Beach\" has been blocked. Reason: Inappropriate content.",
  "linkTo": "/gallery"
}
```

**Multiple Images (Owner A):**
```json
{
  "userId": "user_456",
  "type": "image_blocked",
  "title": "Your images have been blocked",
  "message": "3 of your images have been blocked. Reason: Inappropriate content.",
  "linkTo": "/gallery"
}
```

### Audit Log Entries

Each blocked image creates an audit log entry with bulk metadata:

```json
{
  "action": "image_blocked_bulk",
  "entityType": "gallery",
  "entityId": "gallery_123",
  "performedBy": "admin_user_id",
  "performedByRole": "content_admin",
  "oldValue": {
    "isPrivate": false,
    "footnote": null
  },
  "newValue": {
    "isPrivate": true,
    "footnote": "Inappropriate content..."
  },
  "metadata": {
    "galleryTitle": "Sunset Beach",
    "gallerySlug": "sunset-beach",
    "ownerId": "user_456",
    "ownerName": "John Doe",
    "bulkOperation": true,
    "totalInBatch": 3,
    "batchIndex": 1
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-07-26T11:30:00.000Z"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `missing_parameter` | 400 | Required parameter not provided |
| `invalid_parameter` | 400 | Parameter value invalid or out of range |
| `unauthorized` | 401 | Not authenticated |
| `account_inactive` | 403 | User account is not active |
| `insufficient_permissions` | 403 | User lacks `manage_public_gallery` permission |
| `not_found` | 404 | Image not found |
| `internal_error` | 500 | Server error during processing |

---

## Examples

### Gallery Management Service

```typescript
interface Gallery {
  id: string;
  title: string;
  slug: string;
  format: string;
  isPrivate: boolean;
  footnote: string | null;
  tags: string[];
  uploadTime: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string;
  };
}

interface GalleryListResponse {
  success: boolean;
  message: string;
  data: Gallery[];
  meta: {
    pagination: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

class GalleryAdminService {
  /**
   * Fetch public galleries with filters
   */
  static async getPublicGalleries(options: {
    search?: string;
    sort?: string;
    order?: string;
    skip?: number;
    limit?: number;
  }): Promise<GalleryListResponse> {
    const params = new URLSearchParams({
      sort: options.sort || 'uploadTime',
      order: options.order || 'desc',
      skip: String(options.skip || 0),
      limit: String(options.limit || 20),
    });

    if (options.search) {
      params.append('search', options.search);
    }

    const response = await fetch(`/api/galleries?${params}`, {
      credentials: 'include',
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch galleries');
    }

    return result;
  }

  /**
   * Get image URL for display
   */
  static getImageUrl(gallery: Gallery): string {
    return `/api/image?p=${gallery.isPrivate}&src=${gallery.slug}${gallery.format}`;
  }

  /**
   * Search galleries by keyword
   */
  static async searchGalleries(keyword: string): Promise<Gallery[]> {
    const result = await this.getPublicGalleries({
      search: keyword,
      sort: 'uploadTime',
      order: 'desc',
      skip: 0,
      limit: 50,
    });

    return result.data;
  }

  /**
   * Get galleries by specific user
   */
  static async getGalleriesByAuthor(
    galleries: Gallery[],
    authorId: string
  ): Gallery[] {
    return galleries.filter(g => g.author.id === authorId);
  }

  /**
   * Get total count of public galleries
   */
  static async getTotalCount(): Promise<number> {
    const result = await this.getPublicGalleries({
      sort: 'uploadTime',
      order: 'desc',
      skip: 0,
      limit: 1,
    });

    return result.meta.pagination.total;
  }
}

export default GalleryAdminService;
```

### React Hook for Gallery Management

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseGalleriesOptions {
  initialLimit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useGalleries(options: UseGalleriesOptions = {}) {
  const {
    initialLimit = 20,
    autoRefresh = true,
    refreshInterval = 60000,
  } = options;

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    search: '',
    sort: 'uploadTime',
    order: 'desc',
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: initialLimit,
    total: 0,
    hasMore: false,
  });

  const fetchGalleries = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          sort: filter.sort,
          order: filter.order,
          skip: String(pagination.skip),
          limit: String(pagination.limit),
        });

        if (filter.search) {
          params.append('search', filter.search);
        }

        const response = await fetch(`/api/galleries?${params}`, {
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success) {
          setGalleries(result.data);
          setPagination(prev => ({
            ...prev,
            total: result.meta.pagination.total,
            hasMore: result.meta.pagination.hasMore,
          }));
        } else {
          setError(result.error?.message || 'Failed to fetch galleries');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [filter, pagination.skip, pagination.limit]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    fetchGalleries(false);
  }, [filter, pagination.skip]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchGalleries(true);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchGalleries, autoRefresh, refreshInterval]);

  const nextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  };

  const prevPage = () => {
    if (pagination.skip > 0) {
      setPagination(prev => ({
        ...prev,
        skip: Math.max(0, prev.skip - prev.limit),
      }));
    }
  };

  const updateFilter = (updates: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  return {
    galleries,
    loading,
    error,
    filter,
    pagination,
    fetchGalleries,
    updateFilter,
    nextPage,
    prevPage,
  };
}
```

### Complete Gallery Dashboard Example

```typescript
import { useGalleries } from '@/hooks/useGalleries';
import GalleryAdminService from '@/services/GalleryAdminService';

function GalleryDashboard() {
  const {
    galleries,
    loading,
    error,
    filter,
    pagination,
    updateFilter,
    nextPage,
    prevPage,
  } = useGalleries();

  const [searchInput, setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilter({ search: searchInput });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  if (loading) {
    return <div>Loading galleries...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="gallery-dashboard">
      <h1>Gallery Management</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title or slug..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {/* Filters */}
      <select
        value={filter.sort}
        onChange={(e) => updateFilter({ sort: e.target.value })}
      >
        <option value="uploadTime">Upload Time</option>
        <option value="updatedAt">Last Updated</option>
        <option value="title">Title</option>
        <option value="slug">Slug</option>
      </select>

      <select
        value={filter.order}
        onChange={(e) => updateFilter({ order: e.target.value })}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {galleries.map(gallery => (
          <div key={gallery.id} className="gallery-card">
            <img
              src={GalleryAdminService.getImageUrl(gallery)}
              alt={gallery.title}
            />
            <h3>{gallery.title}</h3>
            <p>By {gallery.author.name}</p>
            <div className="tags">
              {gallery.tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={prevPage} disabled={pagination.skip === 0}>
          Previous
        </button>
        <span>
          Showing {pagination.skip + 1} - {pagination.skip + galleries.length} of {pagination.total}
        </span>
        <button onClick={nextPage} disabled={!pagination.hasMore}>
          Next
        </button>
      </div>
    </div>
  );
}

export default GalleryDashboard;
```

---

## Related Documentation

- [Gallery Management Feature](../features/gallery-management.md) - Complete feature guide
- [Image API Reference](./gallery-api-reference.md) - Image serving endpoint
- [RBAC System](../features/rbac-implementation.md) - Permission details
- [User Management API](./user-management-api-reference.md) - Similar admin API

---

## Privacy & Security

### Privacy Filter

- List endpoint ONLY returns galleries where `isPrivate=false`
- Private galleries are never exposed through admin list endpoints
- Users manage their own private galleries through `/gallery`
- Blocked images become private and only accessible to owner

### Permission Checks

```typescript
// Required permission
hasPermission(userRole, "manage_public_gallery")

// Allowed roles
["super_admin", "content_admin"]
```

### Data Security

- No sensitive user data exposed (email, password, etc.)
- Author information limited to public profile data
- All requests require authentication
- Session token validated on each request
- S3 bucket migration ensures proper storage separation
- Audit logging tracks all moderation actions

### Block Action Security

- Footnote is required (cannot block without reason)
- Action creates permanent audit trail
- Owner receives notification with admin's reason
- Storage migration ensures image privacy
- Only authorized admins can block images

---

**Last Updated:** 2026-07-26  
**API Version:** 1.2
