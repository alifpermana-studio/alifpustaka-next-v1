# Public Blog Post Viewing

## Overview

Public-facing blog post viewer that displays published posts with full markdown rendering, scroll progress tracking, and social sharing capabilities.

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── (public)/
│   │   └── blog/
│   │       └── [slug]/
│   │           └── page.tsx          # Server component - data fetching
│   └── api/
│       └── blog/
│           └── [slug]/
│               └── route.ts           # API endpoint for fetching posts
├── components/
│   └── blog/
│       ├── view/
│       │   └── BlogViewer.tsx         # Client component - rendering
│       ├── ScrollProgress.tsx         # Scroll progress indicator
│       └── ShareButton.tsx            # Share functionality
```

### Components

#### 1. Page Component (Server)
**Location:** `src/app/(public)/blog/[slug]/page.tsx`

Server-side page that:
- Fetches post data by slug
- Generates metadata for SEO
- Handles 404 for non-existent posts
- Passes data to client component

```typescript
// Key responsibilities:
- async function getPost(slug: string)
- export async function generateMetadata()
- Renders <BlogViewer /> with props
```

#### 2. API Route
**Location:** `src/app/api/blog/[slug]/route.ts`

REST endpoint that:
- Fetches published posts only
- Includes author information
- Formats tags from relations
- Returns 404 for unpublished/missing posts

**Response format:**
```typescript
{
  id: string;
  title: string;
  slug: string;
  desc: string | null;
  image: string;
  content: string;
  footnote: string;
  uploadTime: string;
  updatedAt: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}
```

#### 3. BlogViewer Component (Client)
**Location:** `src/components/blog/view/BlogViewer.tsx`

Client component that renders:
- Hero image (16:9 aspect ratio)
- Post metadata (title, description, tags, author)
- Markdown content with custom components
- Footnote section
- Share button (desktop sticky, mobile bottom)

**Features:**
- Full markdown support (GFM, syntax highlighting, raw HTML)
- Custom styled components for all markdown elements
- Responsive design
- Dark mode support

#### 4. ScrollProgress Component
**Location:** `src/components/blog/ScrollProgress.tsx`

Framer Motion-powered scroll indicator:
- Fixed horizontal bar at top
- Animates based on scroll position
- Blue progress bar (left to right)

```typescript
// Uses framer-motion's useScroll hook
const { scrollYProgress } = useScroll();
```

#### 5. ShareButton Component
**Location:** `src/components/blog/ShareButton.tsx`

Social sharing functionality:
- Uses native Web Share API when available
- Falls back to clipboard copy
- Shows tooltip on copy
- Sticky positioning on desktop (left sidebar)
- Bottom placement on mobile

## Markdown Rendering

### Custom Components

Uses custom components from `src/components/blog/editor/MdComponents.tsx`:

- **Headings (h1-h6):** Responsive sizing, proper spacing
- **Paragraphs:** Relaxed line height
- **Blockquote:** Left border accent
- **Links:** External links open in new tab
- **Images:** Figure with caption, responsive
- **Code:** Syntax highlighting with line numbers, copy button
- **Lists:** Custom markers with proper spacing
- **Tables:** Responsive overflow, striped rows
- **HR:** Themed divider

### Plugins

- `remark-gfm`: GitHub Flavored Markdown
- `rehype-highlight`: Syntax highlighting
- `rehype-raw`: Raw HTML support

## Layout Integration

The blog post page uses the `(public)` layout which provides:
- Navbar (fixed at top)
- Footer (at bottom)
- Theme support
- Mouse gradient effect

## URL Structure

```
/blog/[slug]
```

Example: `/blog/getting-started-with-nextjs`

## SEO & Metadata

Automatically generates:
- Page title
- Meta description
- Open Graph tags (title, description, image)

## Styling

- Uses Tailwind CSS with custom theme classes
- Responsive breakpoints (mobile-first)
- Dark mode support via theme context
- Consistent with editor preview styling

## Database Query

Only fetches posts where:
- `slug` matches parameter
- `status === "published"`

Includes relations:
- User (author) information
- Tags via PostTag junction table

## Environment Variables

Requires:
- `NEXT_PUBLIC_APP_URL`: Base URL for API calls and share URLs
- `DATABASE_URL`: Prisma connection string (inherited)

## Error Handling

- 404 page for missing/unpublished posts
- Console logging for debugging
- Graceful fallbacks for missing data

## Performance

- Server-side rendering (SSR)
- `cache: "no-store"` for fresh data
- Priority loading for hero image
- Optimized Next.js Image component

## Future Enhancements

Potential improvements:
- Static generation with `generateStaticParams()`
- Related posts section
- Reading time estimate
- Table of contents
- Comment system
- Post reactions
- View counter
- RSS feed generation
