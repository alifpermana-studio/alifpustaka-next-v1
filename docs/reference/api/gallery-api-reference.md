# Gallery API Reference

Complete API reference for image/gallery management endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Get Image](#get-image)
4. [List Images](#list-images)
5. [Upload Image](#upload-image)
6. [Update Image](#update-image)
7. [Delete Image](#delete-image)
8. [Get Presigned URL](#get-presigned-url)
9. [Error Codes](#error-codes)
10. [Examples](#examples)

---

## Overview

The Gallery API provides endpoints for managing user images with role-based access control and visibility settings.

**Features:**
- Public/Private image storage
- Role-based visibility filtering
- Direct S3 upload via presigned URLs
- Image metadata management
- Audit logging for all operations

**Storage:**
- **Public images:** `apus-user-public` bucket (Cloudflare R2)
- **Private images:** `apus-user-private` bucket (Cloudflare R2)

---

## Authentication

All gallery endpoints (except public image retrieval) require authentication via session cookie.

**Required:** Active user session  
**Header:** `Cookie: better-auth.session_token=<token>`

**Role-Based Access:**
- **All Users:** Access to own images only (regardless of role level)
- Privacy is enforced at the API level

---

## Get Image

Retrieve an image from storage.

### Endpoint

```
GET /api/image
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `src` | string | Yes | Image source key/path |
| `p` | string | No | "true" for private, "false" for public (default: "false") |

### Authentication

- **Public images:** No authentication required
- **Private images:** Requires active session

### Success Response

**Status:** 200 OK  
**Content-Type:** Image MIME type (image/jpeg, image/png, etc.)  
**Body:** Image binary stream

### Error Responses

**400 Bad Request** - Missing parameters
```json
{
  "error": "Missing required query parameters: src"
}
```

**401 Unauthorized** - No session for private image
```json
{
  "error": "No user token found",
  "message": "Session expired or not authenticated"
}
```

**500 Internal Server Error** - Failed to fetch from storage
```json
{
  "error": "Failed to fetch image"
}
```

### Example

```typescript
// Public image
const response = await fetch('/api/image?src=images/photo.jpg&p=false');
const blob = await response.blob();

// Private image (requires authentication)
const response = await fetch('/api/image?src=images/private-photo.jpg&p=true', {
  credentials: 'include'
});
const blob = await response.blob();
```

---

## List Images

Retrieve a paginated list of images based on user role and permissions.

### Endpoint

```
GET /api/image-list
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | string | No | "uploadTime" | Sort field (uploadTime, title, slug) |
| `order` | string | No | "desc" | Sort order (asc, desc) |
| `search` | string | No | - | Search in title, slug, tags |
| `skip` | number | No | 0 | Pagination offset |
| `max` | number | No | 20 | Maximum results per page |

### Authentication

**Required:** Active user session with appropriate permissions

### Access Control

**All users can only see their own images** - regardless of role level.

- **Super Admin:** Own images only
- **Content Admin:** Own images only
- **Regular Users:** Own images only

**Note:** This ensures complete privacy for all users' galleries.

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Found 15 image(s)",
  "data": {
    "images": [
      {
        "id": "img_123",
        "title": "Sample Image",
        "slug": "sample-image",
        "path": "images/sample-image.jpg",
        "format": "image/jpeg",
        "size": 245678,
        "type": "image",
        "isPrivate": false,
        "isFeatured": false,
        "tags": ["nature", "landscape"],
        "uploadedBy": "user_456",
        "uploadTime": "2026-07-25T09:30:00.000Z",
        "updatedAt": "2026-07-25T09:30:00.000Z",
        "user": {
          "id": "user_456",
          "name": "John Doe",
          "username": "johndoe"
        }
      }
    ],
    "total": 15
  },
  "meta": {
    "pagination": {
      "total": 15,
      "skip": 0,
      "limit": 20,
      "hasMore": false
    }
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

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "account_inactive",
    "message": "Your account is currently inactive"
  }
}
```

### Example

```typescript
const response = await fetch(
  '/api/image-list?search=landscape&sort=uploadTime&order=desc&skip=0&max=20',
  { credentials: 'include' }
);
const result = await response.json();

if (result.success) {
  console.log(`Found ${result.data.total} images`);
  console.log(result.data.images);
}
```

---

## Upload Image

Create a database record for an uploaded image (after S3 upload completes).

### Endpoint

```
PUT /api/upload-image-database
```

### Request Body

```json
{
  "title": "My Image",
  "slug": "my-image-2026",
  "format": "image/jpeg",
  "size": 245678,
  "path": "images/user_123/my-image-2026.jpg",
  "type": "image",
  "tags": ["nature", "landscape"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Image title |
| `slug` | string | Yes | URL-friendly slug (unique) |
| `format` | string | Yes | MIME type (image/jpeg, image/png, etc.) |
| `size` | number | Yes | File size in bytes |
| `path` | string | Yes | S3 storage path |
| `type` | string | Yes | Asset type (usually "image") |
| `tags` | string[] | No | Array of tags |

### Authentication

**Required:** Active user session

### Business Logic

- Automatically determines privacy based on path (contains "private")
- Sets `isFeatured` to false by default
- Associates image with authenticated user
- Creates audit log: `gallery_uploaded`

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "img_123",
    "title": "My Image",
    "slug": "my-image-2026",
    "path": "images/user_123/my-image-2026.jpg",
    "format": "image/jpeg",
    "size": 245678,
    "type": "image",
    "isPrivate": false,
    "isFeatured": false,
    "tags": ["nature", "landscape"],
    "uploadedBy": "user_123",
    "uploadTime": "2026-07-25T09:35:00.000Z"
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
    "message": "Missing required fields: title, slug, format, size, path"
  }
}
```

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

### Example

```typescript
// After uploading to S3 via presigned URL
const response = await fetch('/api/upload-image-database', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'Beautiful Sunset',
    slug: 'beautiful-sunset-2026',
    format: 'image/jpeg',
    size: 245678,
    path: 'images/user_123/beautiful-sunset-2026.jpg',
    type: 'image',
    tags: ['sunset', 'nature']
  })
});

const result = await response.json();
if (result.success) {
  console.log('Image record created:', result.data.id);
}
```

---

## Update Image

Update image metadata and visibility settings.

### Endpoint

```
PUT /api/update-image
```

### Request Body

```json
{
  "id": "img_123",
  "title": "Updated Title",
  "slug": "updated-slug",
  "oldSlug": "original-slug",
  "tags": ["updated", "tags"],
  "format": "image/jpeg",
  "isPrivate": false,
  "oldIsPrivate": true,
  "isFeatured": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Image ID |
| `title` | string | Yes | Updated title |
| `slug` | string | Yes | Updated slug |
| `oldSlug` | string | Yes | Previous slug (for S3 operations) |
| `tags` | string[] | No | Updated tags |
| `format` | string | Yes | MIME type |
| `isPrivate` | boolean | Yes | New visibility |
| `oldIsPrivate` | boolean | Yes | Previous visibility |
| `isFeatured` | boolean | No | Featured status |

### Authentication

**Required:** Active user session with appropriate permissions

### Permissions

- **Owner:** Can edit own images
- **Content Admin:** Can edit all images
- **Super Admin:** Can edit all images

**Visibility Toggle Permission:**
- Checked via `canToggleGalleryVisibility()`
- Content Admin and Super Admin can toggle any image
- Regular users can toggle own images

### Business Logic

**Visibility Change:**
- Copies file between `apus-user-private` ↔ `apus-user-public` buckets
- Deletes old file after successful copy
- Creates audit log: `gallery_visibility_changed`

**Slug Change:**
- Copies and renames file within same bucket
- Deletes old file after successful copy

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Image updated successfully",
  "data": {
    "id": "img_123",
    "title": "Updated Title",
    "slug": "updated-slug",
    "isPrivate": false,
    "updatedAt": "2026-07-25T09:40:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Image ID is required"
  }
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to edit this image"
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

### Example

```typescript
const response = await fetch('/api/update-image', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    id: 'img_123',
    title: 'Beautiful Sunset (Updated)',
    slug: 'beautiful-sunset-updated',
    oldSlug: 'beautiful-sunset-2026',
    tags: ['sunset', 'nature', 'evening'],
    format: 'image/jpeg',
    isPrivate: false,
    oldIsPrivate: true,
    isFeatured: true
  })
});

const result = await response.json();
if (result.success) {
  console.log('Image updated successfully');
}
```

---

## Delete Image

Delete an image from storage and database.

### Endpoint

```
DELETE /api/delete-image
```

### Request Body

```json
{
  "id": "img_123",
  "slug": "image-slug",
  "isPrivate": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Image ID |
| `slug` | string | Yes | Image slug (for S3 path) |
| `isPrivate` | boolean | Yes | Determines which bucket to delete from |

### Authentication

**Required:** Active user session with appropriate permissions

### Permissions

- **Owner:** Can delete own images
- **Content Admin:** Can delete all images
- **Super Admin:** Can delete all images

### Business Logic

- Deletes file from appropriate S3 bucket (public or private)
- Deletes database record
- Creates audit log: `gallery_deleted`

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Image ID and slug are required"
  }
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You can only delete your own images"
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

### Example

```typescript
const response = await fetch('/api/delete-image', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    id: 'img_123',
    slug: 'beautiful-sunset-2026',
    isPrivate: false
  })
});

const result = await response.json();
if (result.success) {
  console.log('Image deleted successfully');
}
```

---

## Get Presigned URL

Generate a presigned URL for direct S3 upload.

### Endpoint

```
GET /api/get-presigned-url
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Unique slug for the image |
| `type` | string | Yes | MIME type (e.g., image/jpeg) |

### Authentication

**Required:** Active user session

### Business Logic

- Checks slug uniqueness in database
- Generates presigned URL for `apus-user-private` bucket
- URL expires in 300 seconds (5 minutes)
- Returns upload URL for client-side direct upload

### Success Response

**Status:** 200 OK

```json
{
  "success": true,
  "message": "Pre-signed URL generated",
  "data": "https://apus-user-private.r2.cloudflarestorage.com/...",
  "error": null
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "missing_parameter",
    "message": "Slug and type are required"
  }
}
```

**401 Unauthorized**
```json
{
  "error": "No user token found",
  "message": "Session expired or not authenticated"
}
```

**409 Conflict** - Slug already exists
```json
{
  "success": false,
  "error": {
    "code": "slug_exists",
    "message": "Slug already exists. Please use a different slug."
  }
}
```

### Example

```typescript
// Step 1: Get presigned URL
const urlResponse = await fetch(
  '/api/get-presigned-url?slug=my-image-2026&type=image/jpeg',
  { credentials: 'include' }
);
const { data: presignedUrl } = await urlResponse.json();

// Step 2: Upload directly to S3
const fileBlob = await file.arrayBuffer();
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileBlob
});

if (uploadResponse.ok) {
  // Step 3: Create database record
  await fetch('/api/upload-image-database', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title: 'My Image',
      slug: 'my-image-2026',
      format: 'image/jpeg',
      size: fileBlob.byteLength,
      path: 'images/user_123/my-image-2026.jpg',
      type: 'image'
    })
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
| `not_found` | 404 | Image not found |
| `slug_exists` | 409 | Slug already in use |
| `internal_error` | 500 | Server error |

---

## Examples

### Complete Upload Workflow

```typescript
async function uploadImage(file: File) {
  const slug = generateSlug(file.name);
  
  try {
    // 1. Get presigned URL
    const urlRes = await fetch(
      `/api/get-presigned-url?slug=${slug}&type=${file.type}`,
      { credentials: 'include' }
    );
    const { data: presignedUrl } = await urlRes.json();
    
    // 2. Upload to S3
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: await file.arrayBuffer()
    });
    
    if (!uploadRes.ok) throw new Error('Upload failed');
    
    // 3. Create database record
    const dbRes = await fetch('/api/upload-image-database', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: file.name,
        slug: slug,
        format: file.type,
        size: file.size,
        path: `images/user_123/${slug}.${getExtension(file.type)}`,
        type: 'image',
        tags: []
      })
    });
    
    const result = await dbRes.json();
    return result.data;
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Change Image Visibility

```typescript
async function makeImagePublic(imageId: string, slug: string) {
  const response = await fetch('/api/update-image', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      id: imageId,
      slug: slug,
      oldSlug: slug,
      isPrivate: false,
      oldIsPrivate: true,
      // ... other required fields
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Image is now public');
  }
}
```

### Search and Filter Images

```typescript
async function searchImages(query: string) {
  const params = new URLSearchParams({
    search: query,
    sort: 'uploadTime',
    order: 'desc',
    skip: '0',
    max: '20'
  });
  
  const response = await fetch(`/api/image-list?${params}`, {
    credentials: 'include'
  });
  
  const result = await response.json();
  if (result.success) {
    return result.data.images;
  }
}
```

---

## Related Documentation

- [RBAC System](../features/rbac.md) - Permission system details
- [Error Codes](../development/error-codes.md) - Complete error reference
- [Blog Management](../features/blog-management.md) - Related content management

---

**Last Updated:** 2026-07-25 (Updated: Changed image list access to owner-only for all roles)  
**API Version:** 1.0
