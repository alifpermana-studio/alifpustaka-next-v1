# Tutorial: Managing Users and Roles

Learn how to manage users, assign roles, and control access in Alif Pustaka.

---

## What You'll Learn

- How to create and manage user accounts
- How to assign roles based on permissions
- How to change user status (active, inactive, banned)
- How to use bulk operations
- How to view user activity logs

**Time:** 10 minutes

---

## Prerequisites

- Alif Pustaka installed and running
- Super Admin or User Admin account
- Understanding of the [RBAC system](../explanation/features/rbac-system.md)

---

## Step 1: Access User Management

### 1.1 Login as Super Admin

Navigate to [http://localhost:3000/signin](http://localhost:3000/signin)

```
Email: superadmin@alifpustaka.web.id
Password: [Your SUPERADMIN_PASSWORD]
```

### 1.2 Open User Management

Go to **User Management** at `/admin/users`

You'll see:
- List of all users
- Search and filter options
- User status indicators
- Action buttons

---

## Step 2: Create a New User

### 2.1 Via Signup Page (Recommended for Real Users)

1. Open `/signup` in an incognito window
2. Fill in the form:
   - Name: `Sarah Writer`
   - Email: `sarah@example.com`
   - Username: `sarahwriter`
   - Password: `SecurePass123!`
3. Click **Sign Up**
4. User is created with "user" role by default

### 2.2 Via Admin Panel (For Testing)

1. In User Management, click **Create User** (if available)
2. Or use Prisma Studio: `npx prisma studio`
3. Manually insert user record

**Note:** Most users self-register. Admins assign roles after registration.

---

## Step 3: Assign Roles

### 3.1 Understanding Role Hierarchy

```
Super Admin (100)      ← Can assign any role
├── Content Admin (80) ← Cannot assign admin roles
├── User Admin (80)    ← Can assign: User, Author, Editor
├── Sales Admin (70)
├── Support Admin (70)
├── Editor (50)
├── Author (30)
└── User (10)          ← Default role
```

### 3.2 Assign Author Role

1. Find `sarah@example.com` in the user list
2. Click **Edit** or role dropdown
3. Select **Author**
4. Click **Save** or **Update**
5. User now has author permissions

**Effect:** Sarah can now create blog posts at `/posts/editor`

### 3.3 Assign Editor Role

1. Create another user: `mike@example.com`
2. Assign role: **Editor**
3. Save changes

**Effect:** Mike can now review and approve posts at `/admin/posts`

### 3.4 Role Assignment Rules

**As Super Admin:**
- ✅ Can assign any role
- ✅ Can modify other Super Admins

**As User Admin:**
- ✅ Can assign: User, Author, Editor
- ❌ Cannot assign: Admin roles
- ❌ Cannot modify Super Admins

**As Content Admin:**
- ❌ Cannot assign any roles
- ✅ Can manage all content

---

## Step 4: Manage User Status

### 4.1 User Statuses

- **Active** - Can login and perform actions
- **Inactive** - Cannot login, account suspended
- **Banned** - Permanently restricted
- **Deleted** - Soft deleted, can be restored

### 4.2 Deactivate a User

1. Find user in the list
2. Click **Actions** → **Deactivate**
3. Confirm the action

**Effect:**
- User immediately logged out
- Cannot login until reactivated
- All sessions terminated

### 4.3 Ban a User

1. Select user
2. Click **Actions** → **Ban**
3. Add reason (optional): `Violated community guidelines`
4. Confirm

**Effect:**
- User permanently restricted
- Cannot login
- Content remains visible (unless removed)
- Audit log records ban with reason

### 4.4 Reactivate a User

1. Filter by status: **Inactive** or **Banned**
2. Find user
3. Click **Activate**
4. User can login again

---

## Step 5: Bulk Operations

### 5.1 Select Multiple Users

1. Check boxes next to users
2. Or use **Select All** for current page

### 5.2 Bulk Status Change

1. Select users with "user" role
2. Click **Bulk Actions** → **Activate**
3. Confirm operation
4. All selected users activated

**Use Cases:**
- Activate new registrations after verification
- Deactivate inactive accounts
- Clean up test accounts

### 5.3 Bulk Role Assignment

1. Select multiple users
2. **Bulk Actions** → **Assign Role** → **Author**
3. Confirm
4. All selected users now have author role

**Warning:** Bulk operations cannot be undone easily. Always verify selection first.

---

## Step 6: Search and Filter Users

### 6.1 Search by Text

In the search box, type:
- Name: `Sarah`
- Email: `sarah@example.com`
- Username: `sarahwriter`

Search is debounced (500ms) for performance.

### 6.2 Filter by Role

1. Click **Filter by Role** dropdown
2. Select **Author**
3. Only authors displayed

### 6.3 Filter by Status

1. Click **Filter by Status** dropdown
2. Select **Active**
3. Only active users shown

### 6.4 Combined Filters

Combine search and filters:
- Search: `sarah`
- Role: `Author`
- Status: `Active`

Result: Active authors named Sarah

---

## Step 7: View User Activity

### 7.1 Access Audit Logs

1. Click on a user
2. Click **View Activity** or **Audit Logs**
3. Navigate to `/api/users/[id]/audit-logs`

### 7.2 What's Logged

Audit logs track:
- Role changes
- Status changes
- Post creations/edits
- Login attempts
- Permission changes

Example log entry:
```json
{
  "action": "update_role",
  "entityType": "user",
  "performedBy": "superadmin@alifpustaka.web.id",
  "oldValues": {"role": "user"},
  "newValues": {"role": "author"},
  "ipAddress": "192.168.1.100",
  "timestamp": "2026-08-01T10:30:00Z"
}
```

### 7.3 Filter Logs

- By action type
- By date range
- By performer

---

## Step 8: Permission Verification

### 8.1 Test Author Permissions

Login as `sarah@example.com`:

**Should have access to:**
- ✅ `/posts/editor` - Create posts
- ✅ `/posts` - View own posts
- ✅ `/gallery` - Upload images

**Should NOT have access to:**
- ❌ `/admin/users` - User management
- ❌ `/admin/posts` - Post review
- ❌ Role assignment

### 8.2 Test Editor Permissions

Login as `mike@example.com`:

**Should have access to:**
- ✅ Everything Author has
- ✅ `/admin/posts` - Review and approve posts
- ✅ Publish posts directly

**Should NOT have access to:**
- ❌ `/admin/users` - User management
- ❌ Review Content Admin posts

---

## What You've Learned

✅ Created user accounts  
✅ Assigned roles based on hierarchy  
✅ Changed user status (active, inactive, banned)  
✅ Performed bulk operations  
✅ Searched and filtered users  
✅ Viewed audit logs  
✅ Verified permissions  

---

## Permission Matrix Reference

| Permission | Super Admin | User Admin | Editor | Author | User |
|------------|-------------|------------|--------|--------|------|
| View users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign roles | All | Limited | ❌ | ❌ | ❌ |
| Ban users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create posts | ✅ | ❌ | ✅ | ✅ | ❌ |
| Review posts | ✅ | ❌ | ✅ | ❌ | ❌ |
| Publish posts | ✅ | ❌ | ✅ | ❌ | ❌ |

See [complete permission matrix](../explanation/features/rbac-system.md#permission-matrix) for all permissions.

---

## Best Practices

### Role Assignment
- Start with lowest role needed
- Promote based on demonstrated need
- Review permissions quarterly

### User Status
- Use "inactive" for temporary suspension
- Use "banned" for policy violations
- Document ban reasons in audit logs

### Security
- Limit Super Admin accounts (2-3 max)
- User Admins for day-to-day user management
- Regular audit log reviews

---

## Common Scenarios

### Scenario 1: New Content Team Member

1. User signs up → Gets "user" role
2. Verify email and identity
3. Assign "author" role
4. After 2-3 months of quality posts → Promote to "editor"

### Scenario 2: Suspicious Activity

1. Notice unusual login attempts
2. Change status to "inactive" immediately
3. Investigate via audit logs
4. If confirmed malicious → Ban user
5. Document in audit log

### Scenario 3: Role Change Request

1. User requests editor privileges
2. Review their post history
3. Check audit logs for activity
4. If appropriate → Assign editor role
5. Notify user via notification system

---

## Next Steps

- **[Setting Up OAuth Tutorial](./setting-up-oauth.md)** - Add social login
- **[RBAC System Explanation](../explanation/features/rbac-system.md)** - Deep dive into permissions
- **[User Management Guide](../guides/administration/user-management.md)** - Advanced features
- **[Audit Logging Reference](../reference/api/audit-log-api-reference.md)** - API documentation

---

## Troubleshooting

**Cannot assign admin roles?**
- Check your own role (must be Super Admin)
- User Admins can only assign limited roles

**User still can access after deactivation?**
- Sessions may take up to 24 hours to expire
- Use force logout (if implemented)
- Or manually delete session from database

**Bulk operation failed?**
- Check you have permission for all selected users
- Cannot modify users with higher roles
- Check database connection

---

**Last Updated:** 2026-08-01
