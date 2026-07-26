# Gallery Feature Documentation

## Overview

The Gallery feature provides a complete image management system for users to upload, view, update, and delete images. Images can be stored as either public or private in Cloudflare R2 storage.

## Architecture

### File Structure

```
src/
├── app/
│   ├── (admin)/
│   │   └── gallery/
│   │       └── page.tsx                    # Main gallery page
│   └── api/
│       ├── get-presigned-url/route.ts      # Generate presigned URLs
│       ├── upload-image-database/route.ts  # Save image metadata to DB
│       ├── image-list/route.ts             # Fetch user images
│       ├── image/route.ts                  # Serve images (public/private)
│       ├── update-image/route.ts           # Update image metadata
│       └── delete-image/route.ts           # Delete images
├── components/
│   └── gallery/
│       ├── upload-card/
│       │   ├── UploadCard.tsx              # Upload UI container
│       │   ├── UploadFormHandler.tsx       # Upload form logic
│       │   ├── ImageInputField.tsx         # File input component
│       │   ├── UploadMetadata.tsx          # Metadata input fields
│       │   └── ActionButton.tsx            # Upload action buttons
│       └── user-gallery/
│           ├── UserGallery.tsx             # Gallery container
│           ├── GalleryFilter.tsx           # Filter and search UI
│           ├── GridLayout.tsx              # Grid view with modals
│           ├── ListLayout.tsx              # List view
│           ├── ImageModal.tsx              # Full-size image viewer
│           ├── UpdateMetadata.tsx          # Edit form fields
│           └── ActionUpdate.tsx            # Update action buttons
├── context/
│   └── GalleryContext.tsx                  # Gallery state management
├── hooks/
│   └── useGallery.tsx                      # Gallery context hook
└── lib/
    └── R2ImageHandler.ts                   # API client functions
```

## Core Components

### 1. Gallery Page (`src/app/(admin)/gallery/page.tsx`)

The main entry point that renders two sections:
- **UploadCard**: UI for uploading new images
- **UserGallery**: Display and manage existing images

```tsx
export default async function Gallery() {
  return (
    <div className="rounded-2xl border bg-white p-5 lg:p-6">
      <h3 className="mb-5 text-lg font-semibold">Gallery</h3>
      <div className="space-y-6">
        <UploadCard />
        <UserGallery />
      </div>
    </div>
  );
}
```

### 2. Upload Card Components

#### UploadCard.tsx
Main container for the upload functionality.

#### UploadFormHandler.tsx
Handles the upload process:
1. Validates form input
2. Requests presigned URL from API
3. Uploads file directly to R2 using presigned URL
4. Saves metadata to database
5. Refreshes gallery

#### ImageInputField.tsx
File input with drag-and-drop support and preview.

#### UploadMetadata.tsx
Input fields for image metadata:
- Title
- Slug (auto-generated from title)
- Tags
- Path
- Privacy toggle

### 3. User Gallery Components

#### UserGallery.tsx
Main gallery container that:
- Provides layout toggle (grid/list view)
- Renders GalleryFilter
- Conditionally renders GridLayout or ListLayout

#### GalleryFilter.tsx
Search and filter controls:
- Search by title, slug, or tags
- Sort by upload time, title, or size
- Order by ascending or descending

#### GridLayout.tsx
Grid view with image cards. Each card shows:
- Image thumbnail
- Title
- Privacy indicator (lock icon)
- Actions dropdown (Copy Link, Edit, Delete, Report)

Features three modal types:
- **EditModal**: Update image metadata
- **DeleteModal**: Confirm and delete image
- **ImageModal**: View full-size image

#### ListLayout.tsx
Alternative list view for images.

#### UpdateMetadata.tsx
Edit form fields for updating:
- Title
- Slug
- Tags (comma-separated)
- Path
- Privacy toggle

### 4. Context & State Management

See [R2ImageHandler and GalleryContext Documentation](./GALLERY_CONTEXT.md) for details.

## User Flow

### Upload Flow

1. User fills in image metadata (title, tags, privacy)
2. User selects image file
3. Click "Upload" button
4. System requests presigned URL from `/api/get-presigned-url`
5. File uploaded directly to R2 using presigned URL
6. Metadata saved to database via `/api/upload-image-database`
7. Gallery refreshes to show new image

### View Flow

1. Gallery loads user's images from `/api/image-list`
2. Images displayed in grid or list view
3. Thumbnails loaded via `/api/image?src=slug&p=isPrivate`
4. Click image to view full-size in modal

### Update Flow

1. Click "Edit" from image dropdown menu
2. EditModal opens with current metadata pre-filled
3. User modifies fields
4. Click "Update" button
5. Request sent to `/api/update-image` with changes
6. If slug or privacy changed, file is moved/copied in R2
7. Database updated with new metadata
8. Gallery refreshes

### Delete Flow

1. Click "Delete" from image dropdown menu
2. DeleteModal shows confirmation with image preview
3. Click "Delete" button
4. Request sent to `/api/delete-image`
5. File deleted from R2 bucket
6. Database record removed
7. Gallery refreshes

## Storage Strategy

### Cloudflare R2 Buckets

Two buckets are used:
- **apus-user-public**: Public images accessible via direct URL
- **apus-user-private**: Private images requiring authentication

### Database Schema

The `gallery` table stores:
```prisma
model Gallery {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  format      String
  size        Int
  path        String
  type        String
  tags        String[]
  userId      String
  isPrivate   Boolean  @default(false)
  isFeatured  Boolean  @default(false)
  uploadTime  DateTime @default(now())
}
```

### File Naming Convention

- Slug stored in DB: `my-image` (no extension)
- Format stored in DB: `.jpg`
- Full filename: `slug + format` = `my-image.jpg`
- R2 key: `my-image.jpg`
- Path in DB: `apus-user-private/my-image` or `apus-user-public/my-image`

## Permissions

Gallery operations are protected by authentication and authorization:

- **Upload**: Authenticated users can upload
- **View List**: Users see only their own images
- **View Image**: 
  - Public images: Anyone can view
  - Private images: Only authenticated users
- **Update**: Users can update their own images; Content Admin and Super Admin can update any image
- **Delete**: Users can delete their own images; Content Admin and Super Admin can delete any image

## API Reference

See [Gallery API Endpoints Documentation](./GALLERY_API.md) for detailed API documentation.

## Security Features

1. **Authentication**: All operations require active session
2. **Authorization**: Role-based permissions for admin operations
3. **Presigned URLs**: Direct upload to R2 without exposing credentials
4. **Private Images**: Authentication required to access private images
5. **Audit Logs**: All create/update/delete operations logged
6. **Input Validation**: Slug uniqueness, required fields validation

## Performance Optimizations

1. **Direct Upload**: Files uploaded directly to R2, not through Next.js server
2. **Presigned URLs**: Temporary URLs with 5-minute expiration
3. **Pagination**: Image list supports skip/max parameters
4. **Optimized Images**: Thumbnails served with quality parameter
5. **Context Caching**: Gallery state cached in React Context

## Error Handling

All operations return standardized responses:
```typescript
{
  success: boolean;
  message: string;
  data: any | null;
  error: string | null;
}
```

Common errors:
- `validation_error`: Missing or invalid fields
- `not_found`: Image not found
- `insufficient_permissions`: User lacks required permissions
- `internal_error`: Server or storage errors
- `image-slug-exist`: Slug already in use
