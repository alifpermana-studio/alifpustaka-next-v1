# System Overview

High-level architecture and system design of Alif Pustaka CMS.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Public Blog │  │  Admin Panel │  │  Auth Pages  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application (App Router)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Pages & Routes                     │  │
│  │  /blog, /admin, /posts, /gallery, /signin, etc.     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Routes                          │  │
│  │  /api/posts, /api/users, /api/auth, etc.            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Components & Business Logic              │  │
│  │  - React Components (93 components)                   │  │
│  │  - Context Providers (Auth, Notifications)           │  │
│  │  - Utility Libraries (permissions, audit-log)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data & Storage Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ Cloudflare R2│  │  Better Auth │     │
│  │  + Prisma    │  │ (S3 Storage) │  │   Sessions   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Brevo     │  │    Google    │  │    GitHub    │     │
│  │    (Email)   │  │    OAuth     │  │    OAuth     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.2.9 (App Router)
- **UI Library:** React 19.2.4
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Markdown:** React Markdown + Syntax Highlighting

### Backend
- **API:** Next.js API Routes (Serverless)
- **Authentication:** Better Auth
- **ORM:** Prisma
- **Database:** PostgreSQL

### Storage
- **Database:** PostgreSQL (Supabase or Self-hosted VPS)
- **Images:** Cloudflare R2 (S3-compatible)
- **Sessions:** Database-backed

### External Services
- **Email:** Brevo (SMTP + API)
- **OAuth:** Google & GitHub
- **CDN:** Cloudflare (for R2)

---

## Core Components

### 1. Authentication System
- Email/password authentication
- Google OAuth integration
- GitHub OAuth integration
- Session management (30-day expiration)
- Email verification
- Password reset

**Key Files:**
- `src/lib/auth.ts` - Better Auth configuration
- `src/lib/utils/generate-username.ts` - Username generation
- `src/context/AuthContext.tsx` - Auth state management

---

### 2. Role-Based Access Control (RBAC)
- 8-tier role hierarchy
- 18 granular permissions
- Role-level scoring (10-100)
- Permission inheritance
- Active status requirement

**Key Files:**
- `src/lib/permissions.ts` - Permission utilities
- `src/constants/permissions.ts` - Permission definitions

**Roles:**
```
Super Admin (100)      → Full system access
├── Content Admin (80) → All content operations
├── User Admin (80)    → User management only
├── Sales Admin (70)   → Sales features
├── Support Admin (70) → Support features
├── Editor (50)        → Review and publish
├── Author (30)        → Create content
└── User (10)          → Basic access
```

---

### 3. Blog Management System
- Rich markdown editor
- Editorial workflow (Draft → Pending → Published)
- Post review and approval
- Tag management
- Image integration
- SEO metadata

**Key Features:**
- Auto-save drafts
- Live markdown preview
- Permission-based publishing
- Audit logging

**Key Files:**
- `src/app/(admin)/posts/` - Post management pages
- `src/components/blog/` - Blog components
- `src/app/api/blog-post/` - Post API

---

### 4. Discussion System
- Public commenting on blog posts
- User comment management
- Admin moderation
- Status-based workflow
- 30-minute edit window
- 30-day soft delete
- Markdown support

**Key Files:**
- `src/app/api/discussions/` - Discussion API
- `src/app/api/admin/discussions/` - Admin moderation API
- `src/components/discussions/` - Comment components

---

### 5. Gallery Management
- Image upload via presigned URLs
- Cloudflare R2 storage
- Public/private visibility
- Metadata management (title, tags, slug)
- Role-based access control

**Key Files:**
- `src/app/(admin)/gallery/` - Gallery pages
- `src/app/api/upload-image-database/` - Upload API
- `src/app/api/get-presigned-url/` - S3 presigned URL generation

---

### 6. Notification System
- Real-time in-app notifications
- Role change notifications
- Post approval/rejection alerts
- Unread badge indicator
- Mark as read functionality

**Key Files:**
- `src/context/NotificationContext.tsx` - Notification state
- `src/app/api/notifications/` - Notification API
- `src/components/notifications/` - Notification UI

---

### 7. Audit Logging
- Comprehensive activity tracking
- All CRUD operations logged
- IP address and user agent tracking
- 1-year retention
- Role-based access to logs

**Key Files:**
- `src/lib/audit-log.ts` - Audit logging utilities
- `src/app/api/audit-logs/` - Audit log API

---

## Data Models

### Core Models

**User**
- Authentication and profile data
- Role and status
- Email verification
- OAuth provider links

**Post**
- Blog content
- Status (draft, pending, published)
- Author relationship
- Tags (many-to-many)

**Gallery**
- Image metadata
- S3 storage reference
- Visibility (public/private)
- Owner relationship

**Discussion (other_discussion)**
- Comment content
- Post relationship
- Status (pending, published, banned)
- Soft delete support

**Audit Log**
- Action tracking
- Entity changes (old/new values)
- Performer and timestamp
- IP and user agent

**Notification**
- User notifications
- Related entity references
- Read/unread status

---

## Request Flow

### Example: Creating a Blog Post

```
1. User navigates to /posts/editor
   ↓
2. React component renders editor
   ↓
3. User writes content in markdown
   ↓
4. Auto-save drafts to API every 30s
   ↓
5. User clicks "Submit for Review"
   ↓
6. POST /api/blog-post
   ↓
7. API validates session (Better Auth)
   ↓
8. Check user permissions (RBAC)
   ↓
9. Update post status in database (Prisma)
   ↓
10. Create audit log entry
   ↓
11. Create notification for editors
   ↓
12. Return success response
   ↓
13. UI updates, shows success message
```

---

## Security Architecture

### Authentication
- Bcrypt password hashing (10 rounds)
- Session tokens in HttpOnly cookies
- OAuth 2.0 for social login
- CSRF protection (Better Auth)

### Authorization
- Permission checks on every API endpoint
- Role hierarchy enforcement
- Active status requirement
- Resource ownership validation

### Data Protection
- SQL injection prevention (Prisma ORM)
- XSS protection (React auto-escaping)
- CORS configuration
- Secure session management

### Audit & Compliance
- Complete activity logging
- IP and user agent tracking
- 1-year retention policy
- Export capabilities

---

## Performance Considerations

### Optimization Strategies
- Server-side rendering (Next.js)
- API route caching where appropriate
- Database query optimization (indexes)
- Image optimization (Next.js Image)
- Cloudflare CDN for media
- Connection pooling (Prisma)

### Scalability
- Stateless API design
- Horizontal scaling support
- Database connection pooling
- External storage (R2) for media
- Session storage in database

---

## Development Workflow

```
Local Development
    ↓
Feature Branch
    ↓
Pull Request
    ↓
Code Review
    ↓
Merge to Main
    ↓
CI/CD Pipeline
    ↓
Staging Environment
    ↓
Production Deployment
```

---

## Deployment Architecture

### Development
- Local PostgreSQL or Supabase
- Local Next.js dev server
- Mock email service (Mailtrap)

### Production Options

**Option 1: Vercel + Supabase**
```
Vercel (Next.js) → Supabase (PostgreSQL)
                 → Cloudflare R2 (Images)
                 → Brevo (Email)
```

**Option 2: VPS Self-hosted**
```
VPS (Next.js + PostgreSQL) → Cloudflare R2 (Images)
                           → Brevo (Email)
```

---

## System Boundaries

### What Alif Pustaka Manages
✅ Content creation and publishing  
✅ User authentication and authorization  
✅ Role-based permissions  
✅ Editorial workflow  
✅ Image storage and management  
✅ Comment moderation  
✅ Audit logging  

### What It Doesn't Manage
❌ Video hosting  
❌ Real-time chat  
❌ E-commerce transactions  
❌ Advanced analytics  
❌ Email campaigns  

---

## Related Documentation

- **[Data Flow](./data-flow.md)** - How data moves through the system
- **[Technology Stack](./technology-stack.md)** - Why we chose these technologies
- **[RBAC System](../features/rbac.md)** - Role-based access control details
- **[API Reference](../../reference/api/)** - Complete API documentation

---

**Last Updated:** 2026-08-01
