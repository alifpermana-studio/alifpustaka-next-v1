# Features Documentation

Feature implementation guides and architecture documentation for the Alif Pustaka application.

---

## Overview

This directory contains comprehensive documentation for major features and systems implemented in the application.

---

## Feature Documentation

### [rbac.md](./rbac.md) - Role-Based Access Control
Complete RBAC system documentation.

**Contents:**
- 7 user roles with hierarchical permissions
- 4 user statuses (active, inactive, banned, deleted)
- Permission matrix
- Audit logging system
- API endpoints
- Usage examples
- Setup and verification

**Use this for:**
- Understanding the permission system
- Implementing role checks
- Managing user roles and status
- Audit log management

---

### [user-management.md](./user-management.md) - User Management
Admin user management interface documentation.

**Contents:**
- User management UI at `/admin/user-management`
- Search and filtering
- Role assignment
- Status management
- Bulk actions

**Use this for:**
- Admin interface functionality
- User management workflows
- UI component reference

---

### [blog-management.md](./blog-management.md) - Blog Management
Blog post management system documentation.

**Contents:**
- Blog management UI at `/blog`
- Post creation and editing
- Workflow (draft → submit → publish)
- Role-based permissions
- Content moderation

**Use this for:**
- Blog feature functionality
- Post workflows
- Editor capabilities

---

### [blog-management-quick-reference.md](./blog-management-quick-reference.md)
Quick reference for common blog management tasks.

**Use this for:**
- Quick task lookup
- Common operations
- Shortcuts and tips

---

### [blog-management-architecture.md](./blog-management-architecture.md)
Technical architecture and data flow for blog management.

**Contents:**
- System architecture diagrams
- Data flow
- Component structure
- Technical decisions

**Use this for:**
- Understanding system design
- Architectural decisions
- Technical implementation details

---

## Feature Overview

### Authentication
- Email/Password authentication
- Google OAuth
- GitHub OAuth
- Session management
- See [/docs/auth/](../auth/) for details

### Role-Based Access Control (RBAC)
- 7 user roles: Super Admin, Content Admin, User Admin, Sales Admin, Support Admin, Editor, Author, User
- Hierarchical permissions
- User status management
- Audit logging
- See [rbac.md](./rbac.md) for details

### Blog Management
- Post creation and editing
- Rich text editor
- Draft → Submit → Publish workflow
- Role-based publishing
- Content moderation
- See [blog-management.md](./blog-management.md) for details

### User Management
- Admin interface for user management
- Role assignment
- Status management (active, inactive, banned, deleted)
- Search and filtering
- Bulk actions
- See [user-management.md](./user-management.md) for details

### Gallery Management
- Image upload and storage (Cloudflare R2)
- Public/Private visibility control
- Content Admin moderation
- See [blog-management.md](./blog-management.md) for gallery features

---

## Quick Links

**For Developers:**
- [RBAC Implementation](./rbac.md#implementation-details)
- [API Usage](./rbac.md#usage-guide)
- [Blog Architecture](./blog-management-architecture.md)

**For Admins:**
- [User Management Guide](./user-management.md)
- [Blog Management Guide](./blog-management.md)
- [Permission Matrix](./rbac.md#permission-matrix)

**For Content Creators:**
- [Blog Quick Reference](./blog-management-quick-reference.md)
- [Post Workflow](./rbac.md#post-workflow)

---

## Related Documentation

- [API Reference](../api/) - API endpoints
- [Authentication](../auth/) - OAuth setup
- [Development](../development/) - Dev resources
- [Deployment](../deployment/) - Production deployment

---

**Last Updated:** 2026-07-25
