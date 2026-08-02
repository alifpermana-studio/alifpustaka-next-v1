# RBAC Implementation Verification Commands

## Quick Verification Steps

### 1. Check Database Schema

Run these SQL queries in Supabase SQL Editor:

```sql
-- Check if status column exists in user table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user' AND column_name = 'status';

-- Check if audit_log table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'audit_log';

-- Check audit_log indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'audit_log';

-- Count users by status
SELECT status, COUNT(*) as count
FROM "user"
GROUP BY status;

-- Count users by role
SELECT role, COUNT(*) as count
FROM "user"
GROUP BY role;

-- Check for Super Admin
SELECT id, name, username, email, role, status, "emailVerified"
FROM "user"
WHERE email = 'superadmin@alifpustaka.web.id';

-- Count audit logs
SELECT COUNT(*) as total_logs FROM "audit_log";

-- Recent audit logs
SELECT action, "entityType", "performedByRole", "createdAt"
FROM "audit_log"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### 2. Verify Files Created

Run in terminal:

```bash
# Check type definitions
ls src/types/roles.d.ts
ls src/types/api.d.ts
ls src/types/audit.d.ts

# Check utilities
ls src/lib/permissions.ts
ls src/lib/auth-middleware.ts
ls src/lib/audit-log.ts
ls src/lib/api-response.ts

# Check API endpoints
ls src/app/api/users/route.ts
ls src/app/api/users/[id]/route.ts
ls src/app/api/audit-logs/route.ts

# Check scripts
ls scripts/setup-super-admin.sql
ls scripts/cleanup-audit-logs.js
```

### 3. Test API Endpoints

After creating Super Admin and logging in, test these endpoints:

```bash
# Get current user (should show role and status)
curl http://localhost:3000/api/auth/session

# List users (Super Admin only)
curl http://localhost:3000/api/users?skip=0&limit=10

# View audit logs (Super Admin only)
curl http://localhost:3000/api/audit-logs?skip=0&limit=10
```

### 4. Manual Verification Checklist

Database:

- [ ] `user` table has `status` column
- [ ] `audit_log` table exists
- [ ] All indexes created on audit_log
- [ ] All existing users have status = 'active'

Files:

- [ ] 3 new type definition files in src/types/
- [ ] 4 new utility files in src/lib/
- [ ] 5 new API endpoint files
- [ ] 6 updated API endpoint files
- [ ] 3 documentation files (*.md)
- [ ] 3 script files

Functionality:

- [ ] Super Admin user created
- [ ] Super Admin can login
- [ ] Session includes role and status
- [ ] Auth context has new helper methods

### 5. Create Super Admin

1. Generate bcrypt hash:

```bash
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
```

2. Copy the generated hash

3. Open `scripts/setup-super-admin.sql`

4. Replace `<BCRYPT_HASH_HERE>` with the hash

5. Run the SQL in Supabase SQL Editor

6. Verify:

```sql
SELECT * FROM "user" WHERE email = 'superadmin@alifpustaka.web.id';
```

### 6. Test Super Admin Login

1. Navigate to http://localhost:3000/signin
2. Login with:
   - Email: `superadmin@alifpustaka.web.id`
   - Password: `process.env.SUPERADMIN_PASSWORD`
3. Should redirect to dashboard
4. Check browser console for user object (should have role: "super_admin", status: "active")

### 7. Test Role Assignment

As Super Admin:

1. Navigate to /api/users
2. Create test user with role "editor"
3. Verify audit log created
4. Login as editor user
5. Test editor permissions (can publish posts)

### 8. Test Status Blocking

1. Create test user with status "inactive"
2. Try to login as that user
3. Should get error: "Account is inactive"
4. Change status to "active"
5. Login should now work

### 9. Test Audit Logs

1. Change a user's role
2. Check /api/audit-logs
3. Should see "user_role_change" entry
4. Verify oldValue and newValue are correct

### 10. Test Permissions

Test each role:

- Super Admin: Can access everything
- User Admin: Can manage users, cannot assign admin roles
- Content Admin: Can publish posts, manage gallery
- Editor: Can publish posts (except Content Admin's)
- Author: Can submit but not publish
- User: Basic access only

## Quick Status Check

Run this in your terminal:

```bash
echo "=== RBAC Implementation Status ==="
echo ""
echo "Database Migration:"
npx prisma migrate status
echo ""
echo "Files Created:"
ls src/types/roles.d.ts src/types/api.d.ts src/types/audit.d.ts 2>/dev/null && echo "✅ Type definitions" || echo "❌ Type definitions"
ls src/lib/permissions.ts src/lib/auth-middleware.ts 2>/dev/null && echo "✅ Utilities" || echo "❌ Utilities"
ls src/app/api/users/route.ts src/app/api/audit-logs/route.ts 2>/dev/null && echo "✅ API endpoints" || echo "❌ API endpoints"
echo ""
echo "Documentation:"
ls IMPLEMENTATION-RBAC.md ERROR-CODES.md PRODUCTION-DEPLOYMENT.md 2>/dev/null && echo "✅ Documentation files" || echo "❌ Documentation files"
echo ""
echo "Next Step: Create Super Admin user"
echo "See: scripts/setup-super-admin.sql"
```

## Verification Complete!

Once all checks pass, the RBAC system is ready for use.

See full documentation in:

- `IMPLEMENTATION-RBAC.md` - Complete guide
- `ERROR-CODES.md` - Error reference
- `PRODUCTION-DEPLOYMENT.md` - Deployment checklist
- `SUMMARY.md` - Implementation summary
