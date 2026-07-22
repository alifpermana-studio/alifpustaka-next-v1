# User Management System

## Overview

The User Management system provides a comprehensive interface for Super Admins and User Admins to manage user accounts, roles, and statuses within the Alif Pustaka application.

**Route:** `/admin/user-management`  
**Access:** Super Admin, User Admin (requires `view_all_users` permission)  
**Component Structure:** Server component wrapper → Client component logic

---

## Features

### 1. User List Table

- **Columns:**
  - Checkbox (for bulk selection)
  - User (Avatar + Name + Username)
  - Email
  - Role (color-coded badge)
  - Status (color-coded badge)
  - Created Date
  - Actions (dropdown menu)

- **Avatar Display:**
  - Shows user image if available
  - Falls back to initials (e.g., "JD" for John Doe)
  - Accent-colored background for initials

- **Visual Indicators:**
  - Deleted users: grayed out, actions disabled
  - Non-manageable users: "No actions" text

### 2. Search and Filters

- **Search:** 
  - Searches by name, username, or email
  - Debounced 500ms for performance
  - Real-time results

- **Role Filter:**
  - All Roles (default)
  - Super Admin, Content Admin, User Admin, Sales Admin, Support Admin
  - Editor, Author, User

- **Status Filter:**
  - All Status (default)
  - Active, Inactive, Banned, Deleted

- **Results Count:** Shows total users found

### 3. Pagination

- 20 users per page
- Previous/Next navigation
- Current range display (e.g., "1-20 of 150")
- Page indicator (e.g., "Page 1 of 8")

### 4. Single User Actions

**Edit User:**
- Opens modal with current user information
- Change role (filtered by permission)
- Change status (active/inactive/banned)
- Shows preview of changes before saving
- Confirmation with audit trail notice

**Permission Rules:**
- User Admin can assign: User, Author, Editor
- Super Admin can assign: All roles
- Cannot edit users with higher role hierarchy
- Cannot edit deleted users

### 5. Bulk Actions

**Available Actions:**
- Activate (set status to active)
- Deactivate (set status to inactive)
- Ban (set status to banned)

**Features:**
- Select all checkbox (selects only manageable users on current page)
- Individual selection checkboxes
- Fixed bottom action bar appears when users selected
- Confirmation modal with user count
- Automatic filtering of non-manageable users
- Success/error notifications with counts

**Selection Behavior:**
- Selection clears on page change
- Selection clears on filter change
- Cannot select deleted users
- Cannot select users with higher role hierarchy

### 6. Auto-Refresh

- Silently refreshes user list every 60 seconds
- Preserves current page, filters, and selection
- "Last updated" timestamp display
- Non-intrusive background operation

---

## Component Architecture

### Server Component Pattern

**File:** `src/app/(admin)/admin/user-management/page.tsx`
```typescript
import { UserManagement } from "@/components/admin/user-management/UserManagement";

export default function UserManagementPage() {
  return <UserManagement />;
}
```

**Benefits:**
- Clean server component wrapper
- Future-ready for server-side data fetching
- Easy to add server-side permission checks
- Follows Next.js 16 best practices

### Client Component

**File:** `src/components/admin/user-management/UserManagement.tsx`
- Main container with all client-side logic
- State management for users, filters, pagination, modals
- API integration for CRUD operations
- Permission checks and access control

### Sub-Components

All located in `src/components/admin/user-management/`:

1. **UserFilters.tsx** - Search and filter controls
2. **UserTable.tsx** - Table structure with headers
3. **UserTableRow.tsx** - Individual user row with data
4. **UserActionsDropdown.tsx** - Per-user action menu
5. **UserPagination.tsx** - Pagination controls
6. **EditUserModal.tsx** - Single user edit dialog
7. **BulkActionBar.tsx** - Fixed bottom bulk action toolbar
8. **BulkActionConfirmModal.tsx** - Bulk action confirmation

---

## API Integration

### GET /api/users

**Query Parameters:**
- `search` - Search term for name/username/email
- `role` - Filter by role
- `status` - Filter by status
- `skip` - Pagination offset
- `limit` - Results per page (default: 20)

**Response:**
```typescript
{
  success: true,
  data: UserListItem[],
  meta: {
    pagination: {
      total: number,
      skip: number,
      limit: number,
      hasMore: boolean
    }
  }
}
```

### PATCH /api/users

**Request Body:**
```typescript
{
  userId: string,
  role?: UserRole,
  status?: UserStatus
}
```

**Permission Checks:**
- `canAssignRole()` - Validates role assignment rights
- `canManageUser()` - Validates user management rights
- `canManageUserStatus()` - Validates status change rights

**Audit Logging:**
- Creates `user_role_change` audit log entry
- Creates `user_status_change` audit log entry
- Includes old/new values and metadata

---

## Permission Matrix

| Role | Access User Management | Can Assign Roles | Can Change Status |
|------|----------------------|------------------|-------------------|
| **Super Admin** | ✅ Yes | All roles | ✅ Yes |
| **User Admin** | ✅ Yes | User, Author, Editor | ✅ Yes |
| **Content Admin** | ❌ No | ❌ No | ❌ No |
| **Sales Admin** | ❌ No | ❌ No | ❌ No |
| **Support Admin** | ❌ No | ❌ No | ❌ No |
| **Editor/Author/User** | ❌ No | ❌ No | ❌ No |

**Access Control:**
- Non-admins accessing `/admin/user-management` → Redirected to `/p/{username}`
- Admins without `view_all_users` → Redirected to `/admin`
- Client-side access check in UserManagement component

---

## Role & Status Badges

### Role Badge Colors

```typescript
const ROLE_BADGE_CONFIG = {
  super_admin: { variant: "danger", label: "Super Admin" },
  content_admin: { variant: "warning", label: "Content Admin" },
  user_admin: { variant: "warning", label: "User Admin" },
  sales_admin: { variant: "info", label: "Sales Admin" },
  support_admin: { variant: "info", label: "Support Admin" },
  editor: { variant: "accent", label: "Editor" },
  author: { variant: "info", label: "Author" },
  user: { variant: "neutral", label: "User" },
};
```

### Status Badge Colors

```typescript
const STATUS_BADGE_CONFIG = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  banned: { variant: "danger", label: "Banned" },
  deleted: { variant: "danger", label: "Deleted" },
};
```

---

## User Interface

### Table Layout

```
┌──────┬─────────────────────┬──────────────────┬──────────┬──────────┬─────────────┬─────────┐
│  ☐   │ User                │ Email            │ Role     │ Status   │ Created     │ Actions │
├──────┼─────────────────────┼──────────────────┼──────────┼──────────┼─────────────┼─────────┤
│  ☐   │ [Avatar] John Doe   │ john@example.com │ [Badge]  │ [Badge]  │ Jan 1, 2026 │ [•••]   │
│      │          @johndoe   │                  │          │          │             │         │
└──────┴─────────────────────┴──────────────────┴──────────┴──────────┴─────────────┴─────────┘
```

### Bulk Action Bar (Fixed Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  5 users selected  │  [Activate]  [Deactivate]  [Ban]  │  [✕]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Management

### Main State

```typescript
const [users, setUsers] = useState<UserListItem[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState({
  search: "",
  role: "",
  status: ""
});
const [pagination, setPagination] = useState({
  skip: 0,
  limit: 20,
  total: 0,
  hasMore: false
});
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
```

### Modal State

```typescript
const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
const [editModalOpen, setEditModalOpen] = useState(false);
const [bulkAction, setBulkAction] = useState<BulkActionState | null>(null);
const [bulkConfirmModalOpen, setBulkConfirmModalOpen] = useState(false);
```

---

## Error Handling

### Notification Types

- **Success:** "User updated successfully"
- **Error:** "Failed to update user: {error message}"
- **Warning:** "No users selected that you have permission to edit"
- **Bulk Result:** "5 users updated, 2 failed"

### Access Denied

- Client-side check using `hasPermission("view_all_users")`
- Shows access denied message
- Redirects to `/admin` page
- Prevents unauthorized API calls

---

## Future Enhancements

### Possible Server-Side Features

1. **Server-Side Permission Check:**
```typescript
// In page.tsx
export default async function UserManagementPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) redirect("/signin");
  
  const hasPermission = /* check permission */;
  if (!hasPermission) redirect("/admin");
  
  return <UserManagement />;
}
```

2. **Server-Side Initial Data:**
```typescript
export default async function UserManagementPage() {
  const initialUsers = await prisma.user.findMany({ take: 20 });
  const totalCount = await prisma.user.count();
  
  return <UserManagement initialUsers={initialUsers} initialTotal={totalCount} />;
}
```

---

## Testing Checklist

- [ ] Page loads at `/admin/user-management`
- [ ] Search by name works
- [ ] Search by username works
- [ ] Search by email works
- [ ] Role filter changes results
- [ ] Status filter changes results
- [ ] Pagination navigates correctly
- [ ] Select individual user works
- [ ] Select all selects only manageable users
- [ ] Edit user modal opens
- [ ] Role change saves correctly
- [ ] Status change saves correctly
- [ ] Bulk activate works
- [ ] Bulk deactivate works
- [ ] Bulk ban works
- [ ] Auto-refresh updates data
- [ ] Access denied for non-admin users
- [ ] User Admin cannot edit Super Admin
- [ ] Deleted users cannot be edited
- [ ] Notifications appear on actions

---

## Related Documentation

- [RBAC Implementation](./rbac-implementation.md) - Role-based access control overview
- [Admin Sidebar Menu Structure](../../src/components/layout/AdminSidebar.tsx) - Navigation structure
- [API Documentation - Users Endpoint](../../src/app/api/users/route.ts) - Backend API details
