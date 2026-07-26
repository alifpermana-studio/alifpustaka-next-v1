# R2ImageHandler and GalleryContext Documentation

## R2ImageHandler (`src/lib/R2ImageHandler.ts`)

R2ImageHandler is a client-side library that provides functions to interact with gallery-related API endpoints. It acts as an abstraction layer between React components and the backend APIs.

### Functions

#### 1. getR2PresignedURL

Requests a presigned URL from the server for direct file upload to R2.

```typescript
export const getR2PresignedURL = async (imageData: UploadImage)
```

**Parameters:**
- `imageData: UploadImage` - Image metadata containing:
  - `slug: string` - Image filename slug
  - `format: string` - File extension (e.g., ".jpg")
  - `type: string` - MIME type (e.g., "image/jpeg")

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  data: string | null;  // Presigned URL
  error: any | null;
}
```

**Usage:**
```typescript
const result = await getR2PresignedURL({
  slug: "my-image.jpg",
  format: ".jpg",
  type: "image/jpeg"
});

if (result.success) {
  const presignedURL = result.data;
  // Use presignedURL for upload
}
```

**API Endpoint:** `GET /api/get-presigned-url?slug={slug}{format}&type={type}&action=generate-presigned-url`

---

#### 2. uploadImage

Uploads an image file directly to R2 using a presigned URL, then saves metadata to the database.

```typescript
export const uploadImage = async (
  imageData: UploadImage,
  presignedURL: string,
  onProgress: (event: progressFallbackType) => void
)
```

**Parameters:**
- `imageData: UploadImage` - Complete image data including:
  - `imageFile: File` - The actual file object
  - `slug: string`
  - `format: string`
  - `type: string`
  - `title: string`
  - `tags: string[]`
  - `path: string`
  - `size: number`
- `presignedURL: string` - Presigned URL from getR2PresignedURL
- `onProgress: function` - Callback for upload progress updates

**Progress Event:**
```typescript
interface progressFallbackType {
  message: string;
  progress: number;  // 0-100
  error: string | null;
}
```

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  data: Gallery | null;  // Created gallery record
  error: any | null;
}
```

**Process:**
1. Uploads file to R2 using presigned URL (with progress tracking)
2. Calls `uploadImageDatabase` to save metadata
3. Returns final result

**Usage:**
```typescript
const result = await uploadImage(
  imageData,
  presignedURL,
  ({ message, progress, error }) => {
    console.log(`${message}: ${progress}%`);
  }
);
```

---

#### 3. uploadImageDatabase (internal)

Saves image metadata to the database after successful R2 upload.

```typescript
const uploadImageDatabase = async (
  imageData: UploadImage,
  onProgress: (event: progressFallbackType) => void
)
```

**API Endpoint:** `PUT /api/upload-image-database`

**Note:** This is an internal function called by `uploadImage`. Not meant to be called directly.

---

#### 4. getImageList

Fetches the current user's image list with filtering, sorting, and pagination.

```typescript
export const getImageList = async (filter: ImageFilterType)
```

**Parameters:**
```typescript
interface ImageFilterType {
  order: string;      // "asc" | "desc"
  sort: string;       // "uploadTime" | "title" | "size"
  max: number;        // Items per page
  skip: number;       // Offset for pagination
  search: string;     // Search query
}
```

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    images: ImageGallery[];
    total: number;
  } | null;
  error: any | null;
}
```

**API Endpoint:** `GET /api/image-list?sort={sort}&order={order}&search={search}&skip={skip}&max={max}`

**Usage:**
```typescript
const result = await getImageList({
  sort: "uploadTime",
  order: "desc",
  max: 20,
  skip: 0,
  search: "logo"
});

if (result.success) {
  const { images, total } = result.data;
}
```

---

#### 5. updateImage

Updates image metadata and optionally moves the file between public/private buckets.

```typescript
export const updateImage = async (imageData: UpdateImage)
```

**Parameters:**
```typescript
interface UpdateImage {
  id: string;
  title: string;
  slug: string;           // New slug (without extension)
  oldSlug: string;        // Current slug (without extension)
  tags: string[];
  format: string;         // File extension (e.g., ".jpg")
  isPrivate: boolean;
  oldIsPrivate: boolean;
  isFeatured: boolean;
  path: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  data: Gallery | null;   // Updated gallery record
  error: any | null;
}
```

**API Endpoint:** `PUT /api/update-image`

**Backend Operations:**
- If `oldIsPrivate !== isPrivate`: Moves file between buckets
- If `oldSlug !== slug`: Renames file in same bucket
- Updates database record
- Creates audit log

**Usage:**
```typescript
const result = await updateImage({
  id: "cuid123",
  title: "Updated Title",
  slug: "new-slug",
  oldSlug: "old-slug",
  format: ".jpg",
  tags: ["tag1", "tag2"],
  isPrivate: true,
  oldIsPrivate: false,
  isFeatured: false,
  path: "apus-user-private/new-slug"
});
```

---

#### 6. deleteImage

Deletes an image from R2 storage and removes its database record.

```typescript
export const deleteImage = async (imageData: ImageGallery)
```

**Parameters:**
- `imageData: ImageGallery` - Complete gallery record

**Returns:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
  error: any | null;
}
```

**API Endpoint:** `DELETE /api/delete-image`

**Usage:**
```typescript
const result = await deleteImage(image);

if (result.success) {
  console.log("Image deleted successfully");
}
```

---

## GalleryContext (`src/context/GalleryContext.tsx`)

GalleryContext provides centralized state management for the gallery feature using React Context API. It manages image data, filters, loading states, and UI preferences.

### Context Type

```typescript
type GalleryContextType = {
  data: ImageGallery[];        // Current image list
  loading: boolean;            // Loading state
  dataVersion: number;         // Increments on data change
  error: string | null;        // Error message if any
  filter: ImageFilter;         // Current filter settings
  setFilter: (patch: Partial<ImageFilter>) => void;
  isGrid: boolean;             // View mode (grid/list)
  setIsGrid: (v: boolean) => void;
  refresh: () => void;         // Manual refresh trigger
};
```

### ImageFilter Type

```typescript
interface ImageFilter {
  sort: string;       // "uploadTime" | "title" | "size"
  order: string;      // "asc" | "desc"
  search: string;     // Search query
  max: number;        // Items per page
  skip: number;       // Pagination offset
}
```

### Provider Setup

The GalleryProvider must wrap components that need access to gallery state:

```tsx
// src/app/(admin)/layout.tsx
import { GalleryProvider } from "@/context/GalleryContext";

export default function AdminLayout({ children }) {
  return (
    <GalleryProvider>
      {children}
    </GalleryProvider>
  );
}
```

### Using the Context

#### useGallery Hook

```typescript
// src/hooks/useGallery.tsx
export const useGallery = () => {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used inside <GalleryProvider>");
  return ctx;
};
```

**Usage in Components:**

```tsx
import { useGallery } from "@/hooks/useGallery";

function MyGalleryComponent() {
  const { 
    data,           // Image array
    loading,        // Loading state
    error,          // Error message
    filter,         // Current filters
    setFilter,      // Update filters
    isGrid,         // Grid/list view
    setIsGrid,      // Toggle view
    refresh         // Refresh data
  } = useGallery();

  // Display images
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data.map(image => (
        <img key={image.id} src={`/api/image?src=${image.slug}`} />
      ))}
    </div>
  );
}
```

### State Management Features

#### 1. Automatic Data Fetching

The context automatically fetches data when:
- Filters change
- `refresh()` is called

```tsx
// Change filter - triggers automatic fetch
setFilter({ search: "logo" });

// Manual refresh after upload/update/delete
refresh();
```

#### 2. Filter Management

Filters are merged, not replaced:

```tsx
// Initial state
filter = { sort: "uploadTime", order: "asc", search: "", max: 20, skip: 0 }

// Update only search
setFilter({ search: "logo" });
// Result: { sort: "uploadTime", order: "asc", search: "logo", max: 20, skip: 0 }
```

#### 3. Data Versioning

`dataVersion` increments on every successful fetch, useful for triggering re-renders:

```tsx
useEffect(() => {
  console.log("Data updated!");
}, [dataVersion]);
```

#### 4. View Mode Persistence

Grid/list view preference stored in component state:

```tsx
const { isGrid, setIsGrid } = useGallery();

<button onClick={() => setIsGrid(!isGrid)}>
  {isGrid ? "Switch to List" : "Switch to Grid"}
</button>
```

### Internal Implementation

#### State Variables

```tsx
const [data, setData] = useState<ImageGallery[]>([]);
const [filter, _setFilter] = useState<ImageFilter>(initial);
const [isGrid, setIsGrid] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [dataVersion, setDataVersion] = useState(0);
const [tick, setTick] = useState(0);  // Manual refresh trigger
```

#### Fetch Process

```tsx
const fetchImages = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await getImageList(filter);
    if (res.success) {
      setData(res.data.images);
      setDataVersion((v) => v + 1);
    } else {
      setError(res.error ?? res.message ?? "Failed to load images");
      setData([]);
    }
  } catch (e: any) {
    setError(e?.message ?? "Unexpected error");
    setData([]);
  } finally {
    setLoading(false);
  }
}, [filter]);
```

#### Auto-fetch Effect

```tsx
useEffect(() => {
  if (tick) fetchImages();
}, [filtersKey, tick, fetchImages]);
```

- `filtersKey`: JSON.stringify(filter) - triggers on filter changes
- `tick`: Manual refresh counter - triggers on refresh() call

### Best Practices

1. **Always use refresh() after mutations:**
```tsx
const handleUpload = async () => {
  await uploadImage(data, url, onProgress);
  refresh();  // Refresh list
};
```

2. **Use loading state for UI feedback:**
```tsx
{loading ? <Spinner /> : <ImageGrid images={data} />}
```

3. **Handle errors gracefully:**
```tsx
{error && <Alert type="error">{error}</Alert>}
```

4. **Memoize filter objects:**
```tsx
const filter = useMemo(() => ({
  sort: "uploadTime",
  order: "desc",
  max: 20,
  skip: 0,
  search: searchQuery
}), [searchQuery]);

setFilter(filter);
```

5. **Don't call refresh() in render:**
```tsx
// Bad
function Component() {
  const { refresh } = useGallery();
  refresh();  // Infinite loop!
}

// Good
function Component() {
  const { refresh } = useGallery();
  
  useEffect(() => {
    refresh();
  }, []);
}
```

### Performance Considerations

- **Debounce search input:** Avoid fetching on every keystroke
- **Memoize callbacks:** Use `useCallback` for filter changes
- **Pagination:** Use `skip` and `max` to limit data fetched
- **Conditional rendering:** Only render visible images in viewport
