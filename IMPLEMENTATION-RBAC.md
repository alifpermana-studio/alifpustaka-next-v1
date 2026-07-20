# User Roles & Status System Implementation

## Overview

This implementation adds a comprehensive role-based access control (RBAC) system with user status management and audit logging to the Alif Pustaka application.

## Features Implemented

### 1. User Roles (7 roles)

- **Super Admin** - Full system access, can assign all roles
- **Content Admin** - Manages blog posts and public gallery
- **User Admin** - Manages users and roles (limited)
- **Sales Admin** - Placeholder for future sales features
- **Support Admin** - Placeholder for future support features
- **Editor** - Can review and publish posts (except Content Admin posts)
- **Author** - Can create and submit posts for review
- **User** - Basic authenticated user

### 2. User Status (4 statuses)

- **Active** - Normal access
- **Inactive** - Temporarily disabled
- **Banned** - Permanently blocked
- **Deleted** - Soft deleted (hidden from public, visible to admins)

### 3. Audit Logging

- Tracks all user, post, and gallery changes
- 1-year retention policy
- Role-based access to audit logs
- Async logging (non-blocking)

### 4. Enhanced API Response Format

```typescript
{
  success: boolean;
  message: string;
  data: any;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta?: {
    timestamp: string;
    auditLogId?: string;
    pagination?: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  };
}
```

## Setup Instructions

### 1. Database Migration

The Prisma migration has been applied successfully. The following changes were made:

- Added `status` column to `user` table (default: 'active')
- Created `audit_log` table with indexes

### 2. Create Super Admin User

Run the SQL script in Supabase SQL Editor:

**Important:** First, generate a bcrypt hash for the password `process.env.SUPERADMIN_PASSWORD`:

```bash
# Install bcrypt if not installed
npm install bcrypt

# Generate hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
```

Then, update the `<BCRYPT_HASH_HERE>` placeholder in `scripts/setup-super-admin.sql` with the generated hash and run the script in Supabase.

Alternatively, you can run the migration scripts directly:

1. `scripts/migrations/add-user-status.sql` (already applied via Prisma)
2. `scripts/migrations/create-audit-log-table.sql` (already applied via Prisma)
3. `scripts/setup-super-admin.sql` (manual - requires bcrypt hash)

### 3. Super Admin Credentials

```
Email: superadmin@alifpustaka.web.id
Password: process.env.SUPERADMIN_PASSWORD
```

## Permission Matrix

| Role          | Assign Roles         | Ban/Unban | Publish Posts | Review Posts | Manage Public Gallery |
| ------------- | -------------------- | --------- | ------------- | ------------ | --------------------- |
| Super Admin   | All                  | ✅        | ✅            | ✅           | ✅                    |
| Content Admin | ❌                   | ❌        | ✅            | ✅           | ✅                    |
| User Admin    | user, author, editor | ✅        | ❌            | ❌           | ❌                    |
| Sales Admin   | ❌                   | ❌        | ❌            | ❌           | ❌                    |
| Support Admin | ❌                   | ❌        | ❌            | ❌           | ❌                    |
| Editor        | ❌                   | ❌        | ✅            | ✅*          | ❌                    |
| Author        | ❌                   | ❌        | ❌            | ❌           | ❌                    |
| User          | ❌                   | ❌        | ❌            | ❌           | ❌                    |

*Editor can review posts from Authors and other Editors, but NOT from Content Admin

## Post Workflow

```
Author/Editor Creates → "drafted"
         ↓
Author/Editor Submits → "submitted" (visible for review)
         ↓
Editor/Content Admin Reviews:
  → Send back to "drafted" (needs revision)
  → Publish → "published" (public)
         ↓
Delete → "deleted" (soft delete)
```

## API Endpoints

### User Management

- `GET /api/users` - List users (User Admin, Super Admin)
- `PATCH /api/users` - Update user role/status
- `GET /api/users/[id]` - Get user details
- `GET /api/users/[id]/audit-logs` - Get user audit logs

### Audit Logs

- `GET /api/audit-logs` - List audit logs (role-based filtering)
- `GET /api/audit-logs/[id]` - Get specific audit log

### Posts (Updated)

- `GET /api/post-list` - List posts (role-based filtering)
- `PUT /api/blog-post` - Create/update posts with role checks

### Gallery (Updated)

- `GET /api/image-list` - List images (role-based filtering)
- `PUT /api/upload-image-database` - Upload image with audit log
- `PUT /api/update-image` - Update image with Content Admin moderation
- `DELETE /api/delete-image` - Delete image with audit log

## Usage Examples

### Check User Role in Frontend

```typescript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, hasRole, hasPermission, isActive, canManageUser } = useAuth();

  // Check specific role
  if (hasRole("editor")) {
    // Show editor features
  }

  // Check multiple roles
  if (hasRole(["editor", "content_admin"])) {
    // Show content management features
  }

  // Check permission
  if (hasPermission("publish_posts")) {
    // Show publish button
  }

  // Check if user is active
  if (!isActive()) {
    // Show account status warning
  }

  // Check if can manage another user
  if (canManageUser("author")) {
    // Show user management options
  }
}
```

### Update User Role (API)

```typescript
// PATCH /api/users
const response = await fetch("/api/users", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id-here",
    role: "editor", // new role
    status: "active", // optional status update
  }),
});

const result = await response.json();
// Returns updated user with audit log
```

### Publish a Post (API)

```typescript
// PUT /api/blog-post
const response = await fetch("/api/blog-post", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: {
      id: "post-id",
      title: "Post Title",
      slug: "post-slug",
      // ... other fields
    },
    action: "published", // drafted | submitted | published | deleted
  }),
});

const result = await response.json();
// Creates audit log automatically
```

### View Audit Logs (API)

```typescript
// GET /api/audit-logs?entityType=user&skip=0&limit=50
const response = await fetch("/api/audit-logs?entityType=user&skip=0&limit=50");
const result = await response.json();
// Returns filtered audit logs based on role
```

## Maintenance

### Audit Log Cleanup

Run the cleanup script to delete logs older than 1 year:

```bash
node scripts/cleanup-audit-logs.js
```

**Recommended:** Set up a cron job to run this monthly:

- On Linux/Mac: Add to crontab
- On Windows: Use Task Scheduler
- On Vercel/Cloud: Use scheduled functions

## Files Created

**Type Definitions (7 files):**

- `src/types/roles.d.ts`
- `src/types/api.d.ts`
- `src/types/audit.d.ts`
- Updated: `src/types/auth.d.ts`
- Updated: `src/types/apus-post.d.ts`

**Utilities (4 files):**

- `src/lib/permissions.ts`
- `src/lib/auth-middleware.ts`
- `src/lib/audit-log.ts`
- `src/lib/api-response.ts`

**API Endpoints (7 files):**

- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/api/users/[id]/audit-logs/route.ts`
- `src/app/api/audit-logs/route.ts`
- `src/app/api/audit-logs/[id]/route.ts`
- Updated: `src/app/api/post-list/route.ts`
- Updated: `src/app/api/blog-post/route.ts`
- Updated: `src/app/api/image-list/route.ts`
- Updated: `src/app/api/upload-image-database/route.ts`
- Updated: `src/app/api/update-image/route.ts`
- Updated: `src/app/api/delete-image/route.ts`

**Core Updates (3 files):**

- Updated: `src/lib/auth.ts`
- Updated: `src/context/AuthContext.tsx`
- Updated: `prisma/schema/schema.prisma`

**Scripts (4 files):**

- `scripts/setup-super-admin.sql`
- `scripts/generate-super-admin-sql.js`
- `scripts/cleanup-audit-logs.js`
- `scripts/migrations/add-user-status.sql`
- `scripts/migrations/create-audit-log-table.sql`

## Testing Checklist

- [x] Database migration applied successfully
- [x] Prisma client generated with AuditLog model
- [ ] Super Admin user created (manual - requires bcrypt hash)
- [ ] Super Admin can login
- [ ] User Admin can assign user/author/editor roles
- [ ] User Admin cannot assign admin roles
- [ ] Editor can publish posts
- [ ] Editor cannot publish Content Admin posts
- [ ] Content Admin can switch public gallery to private
- [ ] Audit logs are created for all changes
- [ ] Inactive users cannot login
- [ ] Role changes take effect on next request

## Next Steps

1. **Create Super Admin**: Generate bcrypt hash and run `scripts/setup-super-admin.sql`
2. **Test Authentication**: Login with Super Admin credentials
3. **Test Role Assignment**: Create test users and assign different roles
4. **Test Permissions**: Verify each role can only perform allowed actions
5. **Test Audit Logs**: Check that all changes are logged properly
6. **Set up Cleanup**: Schedule monthly audit log cleanup

## Support

For issues or questions:

- Check the implementation plan document
- Review the permission matrix above
- Test with Super Admin account first
- Check audit logs for debugging

---

**Implementation Date:** July 20, 2026
**Status:** ✅ Complete (Backend Implementation)
**Next Phase:** Frontend UI for user management and role assignment
