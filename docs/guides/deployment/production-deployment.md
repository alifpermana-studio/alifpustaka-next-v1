# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Preparation

- [ ] Backup current database before migration
- [ ] Review migration SQL in `prisma/migrations/20260720110540_add_user_status_and_audit_log/migration.sql`
- [ ] Verify migration in staging environment first

### 2. Super Admin Setup

- [ ] Install bcrypt: `npm install bcrypt`
- [ ] Generate password hash:
  ```bash
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('process.env.SUPERADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
  ```
- [ ] Update `scripts/setup-super-admin.sql` with generated hash
- [ ] Verify Super Admin credentials are documented securely

### 3. Environment Variables

Verify these are set in production `.env`:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - Auth secret key
- [ ] `BETTER_AUTH_URL` - Production URL
- [ ] `BASE_URL` - Production base URL
- [ ] All R2/S3 credentials for gallery

### 4. Code Review

- [ ] Review all permission checks in API routes
- [ ] Verify audit log async calls won't block responses
- [ ] Check error messages don't expose sensitive info
- [ ] Confirm all imports resolve correctly

## Deployment Steps

### Step 1: Deploy Code

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to production (adjust for your platform)
# Example for Vercel:
vercel --prod
```

### Step 2: Run Database Migration

```bash
# In production environment
npx prisma migrate deploy
```

Expected output:

```
Applying migration `20260720110540_add_user_status_and_audit_log`
✔ All migrations have been successfully applied.
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Create Super Admin

1. Open Supabase SQL Editor
2. Run the updated `scripts/setup-super-admin.sql`
3. Verify with:
   ```sql
   SELECT id, name, username, email, role, status, "emailVerified"
   FROM "user"
   WHERE email = 'superadmin@alifpustaka.web.id';
   ```

### Step 5: Restart Application

- [ ] Restart all application instances
- [ ] Clear any caches
- [ ] Verify health checks pass

## Post-Deployment Verification

### 1. Super Admin Login Test

- [ ] Navigate to `/signin`
- [ ] Login with Super Admin credentials
- [ ] Verify successful authentication
- [ ] Check user object has role: "super_admin"
- [ ] Check user object has status: "active"

### 2. Permission Tests

#### Super Admin Tests

- [ ] Can access `/dashboard/users`
- [ ] Can view all users
- [ ] Can assign any role (test with a dummy user)
- [ ] Can change user status
- [ ] Can view all audit logs
- [ ] Can publish posts
- [ ] Can manage gallery

#### User Admin Tests (create test User Admin)

- [ ] Can view all users
- [ ] Can assign user/author/editor roles
- [ ] Cannot assign admin roles (should get error)
- [ ] Can ban/unban users
- [ ] Can view user-related audit logs

#### Content Admin Tests (create test Content Admin)

- [ ] Can view all posts
- [ ] Can publish posts (including from editors)
- [ ] Can switch public gallery to private
- [ ] Can view post-related audit logs
- [ ] Cannot assign roles
- [ ] Cannot ban users

#### Editor Tests (create test Editor)

- [ ] Can create and submit posts
- [ ] Can publish own posts
- [ ] Can review and publish Author posts
- [ ] Can review and publish other Editor posts
- [ ] Cannot publish Content Admin posts (should get error)
- [ ] Can view own audit logs

#### Author Tests (create test Author)

- [ ] Can create posts (drafted)
- [ ] Can submit posts for review
- [ ] Cannot publish posts (should get error)
- [ ] Can view own posts only
- [ ] Can view own audit logs

### 3. Status Tests

- [ ] Create test user with "inactive" status
- [ ] Verify inactive user cannot login
- [ ] Change user to "active"
- [ ] Verify user can now login
- [ ] Change user to "banned"
- [ ] Verify banned user cannot login

### 4. Audit Log Tests

- [ ] Change a user's role → Check audit log created
- [ ] Change a user's status → Check audit log created
- [ ] Submit a post → Check audit log created
- [ ] Publish a post → Check audit log created
- [ ] Upload image → Check audit log created
- [ ] Change gallery visibility → Check audit log created
- [ ] Verify audit logs include IP and user agent

### 5. API Response Format Tests

- [ ] Test successful response includes `success: true`
- [ ] Test error response includes structured error object
- [ ] Test pagination metadata is included
- [ ] Test timestamp is in ISO format

## Monitoring Setup

### 1. Database Monitoring

- [ ] Monitor `user` table for status column
- [ ] Monitor `audit_log` table growth
- [ ] Set up alerts for audit log size (>1M records)

### 2. Error Monitoring

Watch for these errors in logs:

- [ ] "Account is inactive/banned/deleted" - Expected for blocked users
- [ ] "Insufficient permissions" - Expected for unauthorized actions
- [ ] "Failed to create audit log" - Investigate immediately
- [ ] Database connection errors

### 3. Audit Log Cleanup

- [ ] Schedule monthly cleanup job:
  ```bash
  # Add to cron (Linux/Mac)
  0 0 1 * * /usr/bin/node /path/to/scripts/cleanup-audit-logs.js

  # Or use cloud scheduler (Vercel Cron, AWS EventBridge, etc.)
  ```

### 4. Performance Monitoring

- [ ] Monitor API response times (should not increase)
- [ ] Monitor database query performance
- [ ] Check audit log indexes are being used

## Rollback Plan

If issues occur, follow this rollback procedure:

### 1. Immediate Rollback (Code Only)

```bash
# Revert to previous deployment
git revert HEAD
npm run build
# Deploy previous version
```

### 2. Database Rollback (if needed)

```sql
-- Only if absolutely necessary
-- This will lose audit log data!

-- Drop audit log table
DROP TABLE "audit_log";

-- Remove status column
ALTER TABLE "user" DROP COLUMN "status";

-- Revert Prisma migration
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20260720110540_add_user_status_and_audit_log';
```

⚠️ **Warning:** Database rollback will lose all audit logs and user statuses!

### 3. Partial Rollback (Keep Database, Revert Code)

This is the recommended approach if issues arise:

- Keep database changes (status, audit_log)
- Revert code to previous version
- All users will have status "active" by default
- Audit logs will stop being created but existing ones remain

## Known Issues & Workarounds

### Issue 1: User Cannot Login After Status Change

**Symptom:** User changed to "active" but still cannot login

**Solution:**

1. Check session table - old sessions may still exist
2. Force logout user:
   ```sql
   DELETE FROM "session" WHERE "userId" = 'user-id-here';
   ```
3. User must login again

### Issue 2: Audit Logs Not Being Created

**Symptom:** Actions complete but no audit logs appear

**Possible Causes:**

- Async logging failing silently
- Database connection issue
- Prisma client not regenerated

**Solution:**

1. Check server logs for "Failed to create audit log"
2. Verify Prisma client regenerated: `npx prisma generate`
3. Test audit log creation manually:
   ```typescript
   await prisma.auditLog.create({
     data: {
       id: randomUUID(),
       action: "test",
       entityType: "user",
       entityId: "test-id",
       performedBy: "test-user",
       performedByRole: "super_admin",
       createdAt: new Date(),
     },
   });
   ```

### Issue 3: Editor Can't Publish Posts

**Symptom:** Editor gets "insufficient permissions" when publishing

**Possible Causes:**

- Session not synced with new role
- User role not properly set in database

**Solution:**

1. Check user role in database:
   ```sql
   SELECT id, name, email, role FROM "user" WHERE id = 'user-id';
   ```
2. Force session refresh (logout/login)
3. Verify session has updated role

## Success Criteria

Deployment is successful when:

- [ ] All database migrations applied without errors
- [ ] Super Admin can login and access all features
- [ ] Role-based permissions work as expected
- [ ] User status blocking works (inactive users cannot login)
- [ ] Audit logs are being created for all actions
- [ ] No increase in API response times
- [ ] No errors in production logs (except expected permission denials)
- [ ] All existing functionality still works

## Communication Plan

### Before Deployment

- [ ] Notify team of deployment window
- [ ] Inform users of new features (if applicable)
- [ ] Prepare support team for potential questions

### After Deployment

- [ ] Announce successful deployment
- [ ] Share Super Admin credentials with authorized personnel (securely)
- [ ] Update documentation with production URLs
- [ ] Send summary to stakeholders

## Emergency Contacts

Ensure these people are available during deployment:

- [ ] Database Administrator
- [ ] DevOps Engineer
- [ ] Backend Lead Developer
- [ ] Product Owner

## Documentation

Updated documentation:

- [ ] `IMPLEMENTATION-RBAC.md` - Implementation guide
- [ ] `ERROR-CODES.md` - Error reference
- [ ] `PRODUCTION-DEPLOYMENT.md` - This file
- [ ] API documentation (if exists)

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________
**Status:** [ ] Success [ ] Failed [ ] Rolled Back

**Notes:**

---

---

---
