# Public Blog Post Viewing

## Overview

Public-facing blog post viewer that displays published posts with full markdown rendering, scroll progress tracking, table of contents navigation, and social sharing capabilities.

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
│       │   ├── BlogViewer.tsx         # Client component - main rendering
│       │   └── TableOfContents.tsx    # Table of contents with navigation
│       ├── ScrollProgress.tsx         # Scroll progress indicator
│       └── ShareButton.tsx            # Share functionality
```

### Components

#### 1. Page Component (Server)

**Location:** `src/app/(public)/blog/[slug]/page.tsx`

Server-side page that:

- Fetches post data by slug
- Generates metadata for SEO
- Handles 404 for non-existent post
- Passes data to client component

```typescript
// Key responsibilities:
- async function getPost(slug: string)
- export async function generateMetadata()
- Renders <BlogViewer /> with props
```

**Props passed to BlogViewer:**

- `post`: Full post data including content, author, tags
- `postUrl`: Complete URL for sharing

#### 2. API Route

**Location:** `src/app/api/blog/[slug]/route.ts`

REST endpoint that:

- Fetches published post only (`status: "published"`)
- Includes author information
- Formats tags from relations
- Returns 404 for unpublished/missing post

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

Main client component that renders:

**Hero Section:**

- Featured image (16:9 aspect ratio, responsive)
- Priority loading for LCP optimization

**Post Header:**

- Title (h1, responsive sizing)
- Description/excerpt
- Tags (info badges)
- Author info with avatar
- Relative timestamp ("2 days ago")

**Sidebar (Desktop - Sticky):**

- Scroll progress circle (64x64px)
- Table of contents button
- Share button

**Content Section:**

- Full markdown with custom components
- Auto-generated IDs for h3 and h4 headings
- Syntax highlighted code blocks
- Responsive images with captions

**Mobile Controls (Bottom Sticky):**

- Share button (with scroll progress indicator)
- Table of contents button
- Horizontal scroll progress bar

**Features:**

- Full markdown support (GFM, syntax highlighting, raw HTML)
- Custom styled components for all markdown elements
- Responsive design with mobile-specific controls
- Dark mode support via theme context
- Smooth scroll tracking with Framer Motion

**Helper Functions:**

```typescript
// Converts heading text to URL-safe slug
function slugify(text: string | React.ReactNode): string;
```

#### 4. TableOfContents Component

**Location:** `src/components/blog/view/TableOfContents.tsx`

Interactive navigation component:

**Icon Button:**

- 48x48px rounded button (mobile) / 64x64px (desktop)
- List icon from lucide-react
- Accent theme colors
- Disabled state when no h3/h4 headings exist

**Dropdown Panel:**

- Width: 256px (w-64)
- Max height: 384px (max-h-96) with scroll
- **Desktop:** Opens to the right of button
- **Mobile:** Opens above button
- Click outside to close

**Navigation:**

- Extracts h3 and h4 headings from markdown
- Hierarchical structure (h4 indented under h3)
- Active heading detection via IntersectionObserver
- Active item highlighted with `bg-primary/10 text-primary`
- Smooth scrolling with navbar offset (`scroll-mt-24`)
- Closes dropdown on item click

**Features:**

- Real-time active heading tracking
- Keyboard accessible
- Theme-aware styling
- Automatic slug generation matching heading IDs

**Functions:**

```typescript
// Extract h3 and h4 from markdown
function extractHeadings(markdown: string): TocItem[];

// Generate ID from heading text
function slugify(text: string): string;
```

#### 5. ScrollProgress Component

**Location:** `src/components/blog/ScrollProgress.tsx`

Dual-mode scroll indicator:

**Desktop (Circular):**

- 64x64px circle with percentage (0-100%)
- SVG-based with animated stroke
- Uses Framer Motion's `useScroll` and `useSpring`
- Accent color theme
- Hidden on mobile

**Mobile (Horizontal Bar):**

- 2px height, full width
- Bottom of screen, sticky
- Fades out when scroll reaches 100%
- Accent color theme
- Hidden on desktop

**Props:**

```typescript
{
  progress: MotionValue<number>; // From useScroll hook
}
```

#### 6. ShareButton Component

**Location:** `src/components/blog/ShareButton.tsx`

Social sharing functionality:

**Features:**

- Native Web Share API (when available)
- Clipboard fallback with tooltip feedback
- 48x48px rounded button
- Accent theme colors
- Shows scroll percentage indicator on mobile

**Desktop:**

- Always visible in sidebar
- No percentage display

**Mobile:**

- Hidden until user scrolls
- Shows scroll percentage overlay
- Part of bottom sticky controls

**Props:**

```typescript
{
  progress?: MotionValue<number>;  // Optional, for mobile indicator
  title: string;                   // Post title for sharing
  url: string;                     // Post URL for sharing
}
```

## Markdown Rendering

### Custom Components

Uses custom components from `src/components/post/editor/MdComponents.tsx`:

**Headings:**

- **h1-h6:** Responsive sizing, proper spacing
- **h3, h4:** Include auto-generated IDs and `scroll-mt-24` for ToC navigation
- **Slugification:** Converts heading text to URL-safe anchors

**Text Elements:**

- **Paragraphs:** Relaxed line height (`leading-relaxed`)
- **Blockquote:** Left border accent (`border-l-4 border-primary`)
- **Links:** External links open in new tab with `rel="noopener noreferrer"`

**Media:**

- **Images:** Figure with caption, responsive, modal zoom on click
- **Custom Image Loader:** Direct src passthrough for flexibility

**Code:**

- **Inline Code:** Rounded background, accent color
- **Code Blocks:**
  - Syntax highlighting with language detection
  - Line numbers in sidebar
  - Copy button with feedback
  - Language label in header

**Lists:**

- **Ordered/Unordered:** Custom markers with proper spacing
- **Nested Support:** Handles multi-level lists

**Tables:**

- **Responsive:** Overflow scroll container
- **Striped Rows:** Alternating background colors
- **Styled Headers:** Bold with accent background

**Other:**

- **HR:** Themed divider with `border-primary/30`
- **All elements:** Theme-aware with base-content colors

### Plugins

- **remark-gfm:** GitHub Flavored Markdown (tables, strikethrough, task lists)
- **rehype-highlight:** Automatic syntax highlighting for code blocks
- **rehype-raw:** Raw HTML support in markdown

## Layout Integration

The blog post page uses the `(public)` layout which provides:

- **Navbar:** Fixed at top with theme switcher
- **Footer:** At bottom with copyright and links
- **Theme Support:** Light/dark mode via ThemeContext
- **Mouse Gradient Effect:** Cursor-following radial gradient

**Layout Features:**

- Auto-scrolling navigation links
- Mobile hamburger menu
- Brand logo (theme-aware)
- Responsive design

## URL Structure

```
/blog/[slug]
```

**Example:** `/blog/getting-started-with-nextjs`

**Route:** `src/app/(public)/blog/[slug]/page.tsx`

## SEO & Metadata

Automatically generates:

- **Page Title:** Post title
- **Meta Description:** Post description
- **Open Graph Tags:**
  - og:title
  - og:description
  - og:image (featured image)
- **Dynamic Generation:** Based on fetched post data

## Styling

**Framework:** Tailwind CSS with custom theme

**Theme Colors:**

```css
--color-primary: Theme-aware accent color --color-accent: Action color for
  buttons/progress --color-base-100/200/300: Background layers
  --color-base-content: Text color --color-info: Badge and info elements;
```

**Responsive Breakpoints:**

- Mobile-first approach
- `lg:` for desktop sidebar (1024px+)
- `md:` for medium screens (768px+)
- `max-lg:` for mobile-specific controls

**Dark Mode:**

- Automatic via ThemeContext
- All components theme-aware
- Consistent with editor preview styling

## Database Query

**Selection Criteria:**

- `slug` matches URL parameter
- `status === "published"`

**Includes:**

- User (author) information
- Tags via PostTag junction table
- All post metadata

**Optimization:**

- Explicit field selection (no over-fetching)
- Single query with nested relations

## State Management

**Framer Motion:**

- `useScroll()` with target ref for content section
- Tracks scroll progress as `scrollYProgress`
- Passed to ScrollProgress and ShareButton

**React Hooks:**

- `useState` for component states
- `useEffect` for side effects
- `useMemo` for heading extraction (TableOfContents)
- `useRef` for DOM references

**IntersectionObserver:**

- Tracks visible headings in viewport
- Updates active ToC item in real-time
- Root margin: `-100px 0px -66% 0px` for optimal triggering

## Environment Variables

**Required:**

- `NEXT_PUBLIC_APP_URL`: Base URL for API calls and share URLs
- `DATABASE_URL`: Prisma connection string (inherited)

**Usage:**

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
```

## Error Handling

**404 Cases:**

- Post not found
- Post not published
- Invalid slug format

**Error Display:**

- Next.js 404 page via `notFound()`
- Console logging for debugging
- Graceful API error responses

**Fallbacks:**

- Missing author image: No avatar shown
- Missing description: Section hidden
- No tags: Empty array, section hidden
- No h3/h4 headings: ToC button disabled

## Performance Optimizations

**Server-Side:**

- `cache: "no-store"` for fresh data
- Minimal API response payload
- Single database query

**Client-Side:**

- Priority loading for hero image (LCP)
- Optimized Next.js Image component
- Framer Motion's `useSpring` for smooth animations
- `useMemo` for heading extraction
- Lazy state updates with `useEffect`

**Code Splitting:**

- Server component for data fetching
- Client component for interactivity
- Separate components for each feature

## Accessibility

**Keyboard Navigation:**

- All buttons focusable
- ToC dropdown keyboard accessible
- Smooth scroll to headings

**ARIA:**

- `aria-label` on icon buttons
- Semantic HTML structure
- Proper heading hierarchy

**Screen Readers:**

- Alt text for images
- Descriptive button labels
- Structured navigation

## Mobile Experience

**Bottom Sticky Bar:**

- ShareButton with scroll indicator
- TableOfContents button
- Horizontal scroll progress bar
- Appears after initial scroll

**Responsive Changes:**

- Sidebar hidden on mobile
- Mobile controls at bottom
- ToC dropdown opens upward
- Touch-optimized button sizes (48x48px)

**Performance:**

- Conditional rendering based on screen size
- Mobile-specific components
- Optimized touch targets

## Future Enhancements

Potential improvements:

- **Static Generation:** `generateStaticParams()` for faster loading
- **Related Posts:** Show similar content at bottom
- **Reading Time:** Estimate based on word count
- **Breadcrumbs:** Navigation trail
- **Comment System:** User engagement
- **Post Reactions:** Like/bookmark features
- **View Counter:** Track post popularity
- **RSS Feed:** Syndication support
- **Print Styles:** Optimized for printing
- **Social Preview Cards:** Enhanced sharing
- **Syntax Theme Switcher:** Multiple code themes
- **Copy Link Button:** Quick URL sharing
- **Progress Save:** Remember reading position

## Testing Recommendations

**Unit Tests:**

- `slugify()` function
- `extractHeadings()` function
- Component rendering

**Integration Tests:**

- API route responses
- Metadata generation
- Navigation flow

**E2E Tests:**

- Full post viewing flow
- ToC navigation
- Share functionality
- Responsive behavior

## Troubleshooting

**Common Issues:**

1. **ToC not showing:**
   - Check for h3/h4 headings in content
   - Verify markdown formatting (`###` and `####`)

2. **Scroll progress not updating:**
   - Ensure content ref is attached
   - Check Framer Motion installation

3. **Share button not working:**
   - Check HTTPS (required for Web Share API)
   - Verify clipboard permissions

4. **Images not loading:**
   - Check image URLs
   - Verify Next.js Image configuration

5. **Active heading not highlighting:**
   - Check heading IDs match ToC items
   - Verify IntersectionObserver support

---

**Last Updated:** 2026-07-27
