# Explanation

Understanding Alif Pustaka's architecture, features, and design decisions.

---

## Overview

This section provides in-depth explanations of how Alif Pustaka works, why design decisions were made, and how different components interact.

---

## Architecture

Understanding the system design and technical decisions.

**[Architecture Documentation](./architecture/)**

- **[System Overview](./architecture/system-overview.md)** - High-level architecture
- **[Data Flow](./architecture/data-flow.md)** - How data moves through the system
- **[Technology Stack](./architecture/technology-stack.md)** - Why we chose these technologies

---

## Features

Deep dives into major features and how they work.

**[Feature Documentation](./features/)**

### Core Features
- **[RBAC System](./features/rbac.md)** - Role-based access control explained
- **[Blog Management](./features/posts-management.md)** - Editorial workflow and architecture
- **[Discussion System](./features/discussions-and-comments.md)** - Comment system design
- **[User Management](./features/admin-users.md)** - User administration

### Supporting Features
- **[Gallery Management](./features/galleries.md)** - Image storage and management
- **[Notification System](./features/notifications.md)** - Real-time notifications
- **[Audit Logging](./features/audit-logging.md)** - Activity tracking

### Quick References
- **[Blog Quick Reference](./features/posts-management-quick-reference.md)** - Common blog tasks
- **[Blog Architecture](./features/posts-management-architecture.md)** - Technical design
- **[Discussion Quick Reference](./features/discussions-quick-reference.md)** - Comment system reference

---

## Key Concepts

### Role-Based Access Control (RBAC)

Alif Pustaka uses an 8-tier role system with hierarchical permissions:

```
Super Admin (100)     ← Full system access
├── Content Admin (80)  ← All content operations
├── User Admin (80)     ← User management
├── Sales Admin (70)    ← Sales features
├── Support Admin (70)  ← Support features
├── Editor (50)         ← Review and publish
├── Author (30)         ← Create content
└── User (10)           ← Basic access
```

**Key principle:** Higher roles inherit lower role permissions.

See [RBAC System](./features/rbac.md) for complete details.

---

### Editorial Workflow

Blog posts follow a structured workflow:

```
Draft → Pending → Published
  ↑        ↓
  ←─── Rejected
```

**Roles:**
- **Authors** create and submit
- **Editors** review and approve
- **Content Admins** manage all content

See [Blog Management](./features/posts-management.md) for details.

---

### Authentication System

Three authentication methods:

1. **Email/Password** - Traditional authentication
2. **Google OAuth** - Social login with Google
3. **GitHub OAuth** - Social login with GitHub

**Features:**
- Automatic username generation for OAuth
- Email verification for credential accounts
- Session management (30-day expiration)
- Duplicate email prevention

See [Authentication Guide](../guides/authentication/overview.md) for implementation.

---

### Data Architecture

**Database:** PostgreSQL with Prisma ORM

**Key Models:**
- `user` - User accounts and profiles
- `post` - Blog posts and content
- `discussion` - Comments and discussions
- `gallery` - Image metadata
- `audit_log` - Activity tracking
- `notification` - User notifications

**Storage:**
- Database: PostgreSQL (self-hosted or Supabase)
- Images: Cloudflare R2 (S3-compatible)
- Sessions: Database-backed

---

### Security Model

**Authentication:**
- Bcrypt password hashing
- Session token management
- OAuth 2.0 for social login

**Authorization:**
- Permission-based access control
- Role hierarchy enforcement
- Active status requirement

**Audit:**
- All actions logged
- IP and user agent tracking
- 1-year retention

See [RBAC System](./features/rbac.md) for security details.

---

## Design Decisions

### Why Next.js App Router?

- Server-side rendering for SEO
- API routes for backend logic
- Built-in optimization
- Type-safe development

### Why Prisma ORM?

- Type-safe database access
- Migration management
- Easy schema changes
- Great developer experience

### Why PostgreSQL?

- Robust and reliable
- Advanced features (JSON, full-text search)
- Excellent performance
- Strong ecosystem

### Why Cloudflare R2?

- S3-compatible API
- No egress fees
- Cost-effective
- Global distribution

### Why Better Auth?

- Modern authentication library
- OAuth support built-in
- Database hooks for customization
- Type-safe configuration

---

## Common Patterns

### Permission Checking

```typescript
// Check permission
const hasPermission = checkUserPermissions(
  user.role,
  'manage_users'
);

// Check role level
const canAssignRole = getRoleLevel(user.role) >= 
                      getRoleLevel(targetRole);
```

### Audit Logging

```typescript
await createAuditLog({
  action: 'update_role',
  entityType: 'user',
  entityId: userId,
  performedBy: currentUser.id,
  oldValues: { role: 'user' },
  newValues: { role: 'author' },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Notification Creation

```typescript
await createNotification({
  userId: targetUser.id,
  type: 'role_change',
  title: 'Your role has been updated',
  message: 'You are now an Author',
  relatedEntity: 'user',
  relatedEntityId: targetUser.id
});
```

---

## System Boundaries

### What Alif Pustaka Does

✅ Content management (blog, gallery)  
✅ User management with RBAC  
✅ Editorial workflow  
✅ Comment system  
✅ Audit logging  
✅ Notification system  

### What Alif Pustaka Doesn't Do

❌ E-commerce functionality  
❌ Real-time chat  
❌ Video hosting  
❌ Email marketing campaigns  
❌ Analytics and reporting (basic only)  

---

## Performance Characteristics

### Response Times
- API endpoints: < 200ms (typical)
- Page loads: < 1s (cached)
- Database queries: Optimized with indexes

### Scalability
- Horizontal scaling via multiple instances
- Database connection pooling
- Cloudflare R2 for media scaling
- Session management supports load balancing

### Limitations
- Max upload size: 10MB (configurable)
- Session duration: 30 days
- Audit log retention: 1 year
- Pagination limit: 100 items/page

---

## Related Documentation

- **[Tutorials](../tutorials/)** - Learn by doing
- **[Guides](../guides/)** - How to accomplish specific tasks
- **[Reference](../reference/)** - API documentation and technical details

---

**Last Updated:** 2026-08-01
