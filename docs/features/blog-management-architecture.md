# Blog Management System - Architecture Diagrams

Visual representations of the Blog Management System architecture, data flow, and component relationships.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [API Architecture](#api-architecture)
5. [User Journey](#user-journey)
6. [State Management](#state-management)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Blog Management System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Frontend   │  │   API Layer  │  │   Database   │         │
│  │              │  │              │  │              │         │
│  │  React/Next  │◄─┤  API Routes  │◄─┤  PostgreSQL  │         │
│  │  TypeScript  │  │              │  │   (Prisma)   │         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Components   │  │  Endpoints   │  │    Tables    │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ PostFilters  │  │ /post-list   │  │ Post         │         │
│  │ PostTable    │  │ /posts/bulk  │  │ PostTag      │         │
│  │ PostRow      │  │ /blog-post   │  │ Tag          │         │
│  │ Modals       │  │              │  │ AuditLog     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BlogPage (page.tsx)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ State Management                                           │  │
│  │ • posts[], loading, filter, pagination, selectedPosts     │  │
│  │ • Modal states, deleteTarget                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ PostFilters Component                                      │  │
│  │ ┌─────────┐ ┌──────────┐ ┌──────┐ ┌──────┐ ┌────────┐   │  │
│  │ │ Search  │ │  Status  │ │ Sort │ │Order │ │Refresh │   │  │
│  │ │  Input  │ │ Dropdown │ │Select│ │Toggle│ │ Button │   │  │
│  │ └─────────┘ └──────────┘ └──────┘ └──────┘ └────────┘   │  │
│  │ Post Count: X posts found                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ PostTable Component                                        │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ Table Header                                          │  │  │
│  │ │ [☐] Title | Last Updated | Tags | Status | Actions  │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ PostTableRow (for each post)                         │  │  │
│  │ │ ┌──┬────────┬────────┬──────┬────────┬───────────┐  │  │  │
│  │ │ │☐ │ Title  │  Date  │ Tags │ Badge  │ Actions ⋮ │  │  │  │
│  │ │ └──┴────────┴────────┴──────┴────────┴───────────┘  │  │  │
│  │ │                                                       │  │  │
│  │ │ PostActionsDropdown                                  │  │  │
│  │ │ ┌─────────────────┐                                 │  │  │
│  │ │ │ 👁️ Preview      │                                 │  │  │
│  │ │ │ 📋 Copy Link    │                                 │  │  │
│  │ │ │ ✏️ Edit         │                                 │  │  │
│  │ │ │ 🗑️ Delete       │                                 │  │  │
│  │ │ └─────────────────┘                                 │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ PostPagination Component                                   │  │
│  │ Showing 1-20 of 45    [← Previous] Page 1/3 [Next →]     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ PostBulkActionBar (conditional - when posts selected)     │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ 3 selected │ Change Status │ Manage Tags │ Delete │ ✕ │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │ (Fixed at bottom center of screen)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Modals (conditional rendering)                                │
│  • DeletePostModal                                             │
│  • BulkStatusChangeModal                                       │
│  • BulkTagModal                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Fetch Posts Flow

```
User Action
    │
    ▼
┌──────────────┐
│ Filter/Page  │
│   Change     │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ BlogPage             │
│ • Update state       │
│ • Build query params │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ GET /api/post-list   │
│ ?search=...          │
│ &status=published    │
│ &sort=updatedAt      │
│ &order=desc          │
│ &skip=0&max=20       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ API Route Handler    │
│ • Validate params    │
│ • Check auth         │
│ • Build where clause │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Prisma Query         │
│ • findMany + count   │
│ • Filter by userId   │
│ • Include tags       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Transform Data       │
│ • Map tag names      │
│ • Build response     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response             │
│ {                    │
│   success: true,     │
│   data: Post[],      │
│   meta: {            │
│     pagination: {}   │
│   }                  │
│ }                    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ BlogPage             │
│ • Update posts state │
│ • Update pagination  │
│ • Clear loading      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Re-render UI         │
│ • Show posts         │
│ • Update pagination  │
└──────────────────────┘
```

### Bulk Action Flow

```
User Selects Posts
    │
    ▼
┌──────────────────┐
│ Select Checkboxes│
│ selectedPosts Set│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ PostBulkActionBar│
│ Shows at bottom  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User Clicks      │
│ "Change Status"  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ BulkStatusChangeModal│
│ • Show modal         │
│ • Select new status  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Confirm Button       │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────┐
│ PATCH /api/posts/bulk  │
│ {                      │
│   action: "change...", │
│   postIds: [...],      │
│   data: { status }     │
│ }                      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ API Handler            │
│ • Validate request     │
│ • Check ownership      │
│ • Filter valid IDs     │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Promise.allSettled     │
│ • Update each post     │
│ • Create audit logs    │
│ • Handle failures      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Response               │
│ {                      │
│   success: true,       │
│   message: "3 updated",│
│   data: {              │
│     succeeded: 3,      │
│     failed: 0          │
│   }                    │
│ }                      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ BlogPage               │
│ • Show notification    │
│ • Clear selection      │
│ • Refresh posts        │
│ • Close modal          │
└────────────────────────┘
```

---

## API Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  GET /api/post-list                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Request                                         │    │
│  │ • Query: search, status, sort, order, skip, max│    │
│  │ • Auth: Session cookie                         │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│                    ▼                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Handler                                         │    │
│  │ 1. Validate params                             │    │
│  │ 2. Check authentication                        │    │
│  │ 3. Build where clause (userId + filters)      │    │
│  │ 4. Execute Prisma queries (findMany + count)  │    │
│  │ 5. Transform tags                              │    │
│  │ 6. Build response with pagination             │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│                    ▼                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Response                                        │    │
│  │ • success, message, data[], meta               │    │
│  │ • Pagination: total, skip, limit, hasMore     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PATCH /api/posts/bulk                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ Request                                         │    │
│  │ • Body: { action, postIds, data }             │    │
│  │ • Auth: Session cookie                         │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│                    ▼                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Handler                                         │    │
│  │ 1. Validate request body                       │    │
│  │ 2. Check authentication                        │    │
│  │ 3. Verify post ownership                       │    │
│  │ 4. Route to action handler:                    │    │
│  │    ┌─────────────────────────────────────┐    │    │
│  │    │ • change_status                      │    │    │
│  │    │ • delete                             │    │    │
│  │    │ • add_tags                           │    │    │
│  │    │ • remove_tags                        │    │    │
│  │    └─────────────────────────────────────┘    │    │
│  │ 5. Execute with Promise.allSettled             │    │
│  │ 6. Create audit logs                           │    │
│  │ 7. Count succeeded/failed                      │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│                    ▼                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Response                                        │    │
│  │ • success, message                             │    │
│  │ • data: { succeeded, failed }                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## User Journey

### Create and Manage Posts Journey

```
┌──────────────────────────────────────────────────────────────┐
│                     User Journey Map                          │
└──────────────────────────────────────────────────────────────┘

[User logs in]
      │
      ▼
[Navigate to /blog]
      │
      ▼
┌─────────────────────────────┐
│ View Published Posts        │ ← Default view
│ (Status: Published)         │
└─────────┬───────────────────┘
          │
          ├────→ [Search for post]
          │           │
          │           ▼
          │      [Type in search box]
          │           │
          │           ▼
          │      [Wait 2 seconds - debounce]
          │           │
          │           ▼
          │      [View filtered results]
          │
          ├────→ [Change status filter]
          │           │
          │           ▼
          │      [Select: All, Submitted, Drafted, Deleted]
          │           │
          │           ▼
          │      [View posts with that status]
          │
          ├────→ [Edit single post]
          │           │
          │           ▼
          │      [Click ⋮ menu]
          │           │
          │           ▼
          │      [Select "Edit"]
          │           │
          │           ▼
          │      [Redirect to editor]
          │
          ├────→ [Delete single post]
          │           │
          │           ▼
          │      [Click ⋮ menu]
          │           │
          │           ▼
          │      [Select "Delete"]
          │           │
          │           ▼
          │      [Confirm in modal]
          │           │
          │           ▼
          │      [Post marked as deleted]
          │
          └────→ [Manage multiple posts]
                      │
                      ▼
                [Select posts via checkboxes]
                      │
                      ▼
                [Bulk action bar appears]
                      │
                      ├────→ [Change Status]
                      │           │
                      │           ▼
                      │      [Select new status]
                      │           │
                      │           ▼
                      │      [Confirm]
                      │           │
                      │           ▼
                      │      [All posts updated]
                      │
                      ├────→ [Manage Tags]
                      │           │
                      │           ▼
                      │      [Type tags (comma-separated)]
                      │           │
                      │           ├→ [Add Tags]
                      │           │      │
                      │           │      ▼
                      │           │ [Tags added to all]
                      │           │
                      │           └→ [Remove Tags]
                      │                  │
                      │                  ▼
                      │             [Tags removed from all]
                      │
                      └────→ [Delete Multiple]
                                  │
                                  ▼
                            [Confirm dialog]
                                  │
                                  ▼
                            [All marked as deleted]
```

---

## State Management

### BlogPage State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   BlogPage State                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  posts: Post[]                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [{                                                  │    │
│  │   id, title, slug, desc, content, image,           │    │
│  │   status, userId, uploadTime, updatedAt, tags      │    │
│  │ }]                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  loading: boolean                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ true → Show "Loading posts..."                     │    │
│  │ false → Render table                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  filter: FilterState                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ {                                                   │    │
│  │   search: "",              ← Debounced input       │    │
│  │   status: "published",     ← Default filter        │    │
│  │   sort: "updatedAt",       ← Sort field            │    │
│  │   order: "desc"            ← Sort direction        │    │
│  │ }                                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  pagination: PaginationState                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ {                                                   │    │
│  │   skip: 0,                 ← Offset                │    │
│  │   limit: 20,               ← Page size             │    │
│  │   total: 0,                ← Total posts           │    │
│  │   hasMore: false           ← More pages?           │    │
│  │ }                                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  selectedPosts: Set<string>                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Set(["post-id-1", "post-id-2"])                    │    │
│  │ • Add/remove on checkbox click                     │    │
│  │ • Clear on page change                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Modal States                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ deleteModalOpen: boolean                           │    │
│  │ deleteTarget: Post | null                          │    │
│  │ bulkStatusModalOpen: boolean                       │    │
│  │ bulkTagModalOpen: boolean                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

State Transitions:

Filter Change → fetchPosts() → Loading → Update posts state
Page Change → fetchPosts() → Loading → Update posts state
Selection → Update selectedPosts Set → Show/hide bulk bar
Modal Action → API call → Show notification → Refresh posts
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Tables                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Post                                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id          String   @id                           │    │
│  │ title       String                                 │    │
│  │ slug        String   @unique                       │    │
│  │ desc        String?                                │    │
│  │ content     String                                 │    │
│  │ image       String                                 │    │
│  │ footnote    String                                 │    │
│  │ status      String   (drafted|submitted|...)       │    │
│  │ userId      String   → User                        │    │
│  │ uploadTime  DateTime                               │    │
│  │ updatedAt   DateTime @updatedAt                    │    │
│  │                                                     │    │
│  │ Relations:                                         │    │
│  │ • user: User                                       │    │
│  │ • tags: PostTag[]                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  PostTag (Junction Table)                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ postId      String   → Post                        │    │
│  │ tagId       String   → Tag                         │    │
│  │                                                     │    │
│  │ @@id([postId, tagId])                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Tag                                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id          String   @id                           │    │
│  │ name        String   @unique                       │    │
│  │                                                     │    │
│  │ Relations:                                         │    │
│  │ • posts: PostTag[]                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  AuditLog                                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id              String   @id                       │    │
│  │ action          String   (post_created, ...)       │    │
│  │ entityType      String   "post"                    │    │
│  │ entityId        String   → Post.id                 │    │
│  │ performedBy     String   → User.id                 │    │
│  │ performedByRole String                             │    │
│  │ oldValue        Json?                              │    │
│  │ newValue        Json?                              │    │
│  │ metadata        Json?                              │    │
│  │ createdAt       DateTime                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Relationships:
Post 1 ─── ∞ PostTag ∞ ─── 1 Tag
Post ∞ ─── 1 User
Post 1 ─── ∞ AuditLog
```

---

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Authentication                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Session cookie required                          │    │
│  │ • requireActiveStatus() middleware                 │    │
│  │ • Returns 401 if not authenticated                 │    │
│  └────────────────────────────────────────────────────┘    │
│                    ↓                                         │
│  Layer 2: Authorization                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Verify post ownership: post.userId === user.id   │    │
│  │ • Returns 403 if not owner                         │    │
│  │ • Applies to all operations                        │    │
│  └────────────────────────────────────────────────────┘    │
│                    ↓                                         │
│  Layer 3: Input Validation                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Validate query parameters                        │    │
│  │ • Validate request body                            │    │
│  │ • Returns 400 if invalid                           │    │
│  └────────────────────────────────────────────────────┘    │
│                    ↓                                         │
│  Layer 4: Data Access                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Prisma ORM (SQL injection protection)            │    │
│  │ • Row-level filtering (userId)                     │    │
│  │ • Transaction support                              │    │
│  └────────────────────────────────────────────────────┘    │
│                    ↓                                         │
│  Layer 5: Audit Logging                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Log all operations                               │    │
│  │ • Record user, role, changes                       │    │
│  │ • Async to not block response                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** July 21, 2026  
**Created by:** Development Team
