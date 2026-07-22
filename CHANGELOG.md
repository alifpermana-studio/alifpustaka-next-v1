# Changelog

All notable changes to the Alif Pustaka project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- User Management System at `/admin/user-management` (2026-07-22)
  - Full CRUD operations for user roles and status
  - Search by name, username, or email (debounced 500ms)
  - Filter by role and status
  - Pagination (20 users per page)
  - Checkbox selection with bulk operations
  - Bulk actions: Activate, Deactivate, Ban
  - Individual user edit modal for role/status changes
  - Auto-refresh every 60 seconds
  - Permission-based UI (only Super Admin and User Admin can access)
  - Access control: admins can only manage users with lower role hierarchy
  - Deleted users shown with visual indicators
  - All changes logged in audit trail

- Admin Menu Submenus (2026-07-22)
  - Content Management submenu (visible to Content Admin and Super Admin)
  - Sales Management submenu (visible to Sales Admin and Super Admin)
  - Support Management submenu (visible to Support Admin and Super Admin)
  - Admin menu repositioned above Settings in sidebar
  - Conditional visibility based on user permissions

- New Permissions:
  - `manage_sales` - Granted to Sales Admin and Super Admin
  - `manage_support` - Granted to Support Admin and Super Admin

- Blog Management System at `/blog`
  - Advanced search with 2-second debounce
  - Status filtering (Published, Submitted, Drafted, Deleted) with "Published" as default
  - Sort by Title, Slug, Last Updated with ascending/descending order
  - Manual refresh button
  - Pagination (20 posts per page)
  - Checkbox selection (individual and select all with indeterminate state)
  - Bulk operations:
    - Change status for multiple posts
    - Soft delete multiple posts
    - Add tags to multiple posts (comma-separated input)
    - Remove tags from multiple posts (comma-separated input)
  - Individual post actions:
    - Preview post
    - Copy post link
    - Edit post
    - Delete post with confirmation modal
  - Table columns: [Checkbox], Title, Last Updated, Tags, Status, Actions
  - Removed "Report" option from action menu
  - UI matches User Management system styling exactly

- API Endpoints:
  - `GET /api/post-list` - Enhanced with status filter and user-only filtering
  - `PATCH /api/posts/bulk` - New endpoint for bulk operations
    - Change status
    - Bulk delete
    - Add/remove tags
    - Proper audit logging

- Blog Management Components:
  - `PostFilters.tsx` - Search, status filter, sort options, order toggle, refresh
  - `PostTable.tsx` - Table with selectable rows
  - `PostTableRow.tsx` - Individual post row with markdown title rendering
  - `PostActionsDropdown.tsx` - Post action menu
  - `PostBulkActionBar.tsx` - Fixed bottom bulk action bar
  - `PostPagination.tsx` - Pagination controls
  - `BulkStatusChangeModal.tsx` - Bulk status change modal
  - `BulkTagModal.tsx` - Bulk tag management modal
  - `DeletePostModal.tsx` - Single post deletion confirmation

- Documentation:
  - [Blog Management System](./docs/features/blog-management.md) - Comprehensive guide
  - [Blog Management Quick Reference](./docs/features/blog-management-quick-reference.md) - Quick reference
  - [Blog API Reference](./docs/api/blog-api-reference.md) - Complete API documentation

### Changed
- `/api/post-list` endpoint now:
  - Accepts `status` query parameter
  - Only returns posts owned by authenticated user (removed role-based viewing)
  - Returns pagination metadata (total, skip, limit, hasMore)
  - Supports sorting by `updatedAt` field

### Removed
- Deprecated blog components:
  - `BlogComponent.tsx`
  - `BlogOptions.tsx`
  - `PostFilter.tsx`
  - `OptionList.tsx`

### Updated
- Type definitions:
  - Added `status` field to `PostFilter` interface
  - Added `updatedAt` field to `Post` interface

---

## [1.0.0] - 2026-07-15

### Added
- Initial release with authentication system
- OAuth integration (Google, GitHub)
- Role-Based Access Control (RBAC)
- User management system
- Audit logging
- Production deployment configuration

---

## Notes

### Blog Management System - July 21, 2026

**Implemented by:** Development Team  
**Duration:** Single session  
**Files Modified:** 2  
**Files Created:** 10  
**Files Removed:** 4  

**Key Features:**
- Full-featured blog post management matching user-management UI
- Search with debounce to reduce API calls
- Status filtering with "Published" as default
- Comprehensive bulk operations (status, delete, tags)
- User-specific post listing (only shows own posts)
- Soft delete with confirmation modals
- Tag management with comma-separated input
- Complete TypeScript type safety

**Testing:**
- ✅ TypeScript compilation successful
- ✅ All components follow consistent styling
- ✅ API endpoints validated
- ✅ Proper error handling implemented
- ✅ Audit logging for bulk operations

**Documentation:**
- Full feature guide with usage examples
- Quick reference for common tasks
- Complete API reference with curl examples
- TypeScript type definitions
- Troubleshooting guide

---

**Maintained by:** Alif Pustaka Development Team  
**Last Updated:** July 21, 2026
