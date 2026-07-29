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

### [user-management.md](./admin-users.md) - User Management

Admin user management interface documentation.

**Contents:**

- User management UI at `/admin/users`
- Search and filtering
- Role assignment
- Status management
- Bulk actions

**Use this for:**

- Admin interface functionality
- User management workflows
- UI component reference

---

### [blog-management.md](./admin-posts.md) - Blog Management

Blog post management system documentation.

**Contents:**

- Blog management UI at `/posts`
- Post creation and editing
- Workflow (draft → submit → publish)
- Role-based permissions
- Content moderation

**Use this for:**

- Blog feature functionality
- Post workflows
- Editor capabilities

---

### [public-blog-viewing.md](./public-blog-viewing.md) - Public Blog Viewing

Public-facing blog post viewer documentation.

**Contents:**

- Public blog viewer at `/blog/[slug]`
- Markdown rendering with custom components
- Scroll progress indicator
- Social sharing functionality
- SEO and metadata generation

**Use this for:**

- Public blog feature
- Markdown rendering
- Share functionality

---

### [discussions-and-comments.md](./discussions-and-comments.md) - Discussion & Comment System

Complete discussion and comment system documentation.

**Contents:**

- Comment section on blog posts
- User comment management at `/discussions`
- Admin moderation at `/admin/discussions`
- Flat comment structure (no nested replies)
- Status-based moderation (pending, published, banned, deleted)
- 30-minute edit window
- 30-day soft delete
- Markdown rendering with basic features
- Notification system integration
- Audit logging

**Use this for:**

- Understanding comment system
- User comment management workflows
- Admin moderation processes
- API integration for comments

---

### [discussions-quick-reference.md](./discussions-quick-reference.md) - Discussion Quick Reference

Quick reference guide for developers working with the discussion system.

**Contents:**

- File structure and locations
- API endpoints reference
- Type definitions
- Common tasks and code snippets
- Troubleshooting guide
- Database schema reference

**Use this for:**

- Quick task lookup
- API endpoint reference
- Code examples
- Common operations

---

### [blog-management-quick-reference.md](./posts-management-quick-reference.md)

Quick reference for common blog management tasks.

**Use this for:**

- Quick task lookup
- Common operations
- Shortcuts and tips

---

### [blog-management-architecture.md](./posts-management-architecture.md)

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
- Public blog viewing with markdown rendering
- Comment system with moderation
- See [blog-management.md](./posts-management.md), [public-blog-viewing.md](./public-blog-viewing.md), and [discussions-and-comments.md](./discussions-and-comments.md) for details

### Discussion & Comment System

- Public commenting on blog posts
- User comment management at `/discussions`
- Admin moderation at `/admin/discussions`
- Status-based workflow (pending → published)
- 30-minute edit window for users
- 30-day soft delete grace period
- Markdown support with basic formatting
- Notification system for status changes
- Audit logging for admin actions
- See [discussions-and-comments.md](./discussions-and-comments.md) for details

### User Management

- Admin interface for user management
- Role assignment
- Status management (active, inactive, banned, deleted)
- Search and filtering
- Bulk actions
- See [user-management.md](./admin-users.md) for details

### Gallery Management

- Image upload and storage (Cloudflare R2)
- Public/Private visibility control
- Content Admin moderation
- See [blog-management.md](./admin-posts.md) for gallery features

---

## Quick Links

**For Developers:**

- [RBAC Implementation](./rbac.md#implementation-details)
- [API Usage](./rbac.md#usage-guide)
- [Posts Architecture](./posts-management-architecture.md)
- [Discussion System Quick Reference](./discussions-quick-reference.md)

**For Admins:**

- [User Management Guide](./admin-users.md)
- [Post Management Guide](./admin-posts.md)
- [Discussion Moderation Guide](./discussions-and-comments.md#for-administrators)
- [Permission Matrix](./rbac.md#permission-matrix)

**For Content Creators:**

- [Blog Quick Reference](./posts-management-quick-reference.md)
- [Post Workflow](./rbac.md#post-workflow)
- [Public Blog Viewing](./public-blog-viewing.md)
- [Managing Your Comments](./discussions-and-comments.md#for-users)

---

## Related Documentation

- [API Reference](../api/) - API endpoints
- [Authentication](../auth/) - OAuth setup
- [Development](../development/) - Dev resources
- [Deployment](../deployment/) - Production deployment

---

**Last Updated:** 2026-07-28
