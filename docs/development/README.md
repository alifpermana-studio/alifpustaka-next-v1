# Development Documentation

Developer resources, guidelines, and reference materials for the Alif Pustaka project.

---

## Overview

This directory contains development guidelines, error code references, verification commands, and checklists for developers working on the project.

---

## Documentation Files

### [error-codes.md](./error-codes.md)
API error codes reference.

**Contents:**
- Complete list of error codes
- Error descriptions
- Common causes
- Solutions

**Use this for:**
- Debugging API errors
- Understanding error responses
- Implementing error handling

---

### [verification.md](./verification.md)
RBAC verification commands and SQL queries.

**Contents:**
- SQL verification queries
- Manual testing checklist
- Database inspection commands
- Quick status checks

**Use this for:**
- Verifying RBAC implementation
- Testing permissions
- Database validation
- Quick system checks

---

### [checklist.md](./checklist.md)
Post-implementation checklist and action items.

**Contents:**
- Action items timeline
- Test scenarios by role
- Verification procedures
- Common issues troubleshooting

**Use this for:**
- Post-deployment verification
- Feature implementation tracking
- System validation

---

### [commit-message.md](./commit-message.md)
Commit message template and guidelines.

**Contents:**
- Commit message format
- Example messages
- Best practices

**Use this for:**
- Writing consistent commit messages
- Understanding project conventions

---

## Quick Reference

### Error Codes
Common error codes:
- `unauthorized` - Not authenticated
- `account_inactive` - User status not active
- `insufficient_permissions` - Missing required permission
- `invalid_role` - Role doesn't exist

See [error-codes.md](./error-codes.md) for complete list.

---

### Verification Commands

Quick database checks:

```sql
-- Check user status
SELECT id, email, role, status FROM "user" WHERE email = 'user@example.com';

-- View recent audit logs
SELECT action, "entityType", "performedBy", "createdAt" 
FROM "audit_log" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

See [verification.md](./verification.md) for more commands.

---

## Development Workflow

1. **Setup** - Follow [Getting Started](../GETTING_STARTED.md)
2. **Implement** - Follow feature documentation
3. **Test** - Use verification commands
4. **Verify** - Follow checklists
5. **Commit** - Use commit message template
6. **Deploy** - Follow [deployment guide](../deployment/production-deployment.md)

---

## Related Documentation

- [RBAC System](../features/rbac.md) - Permission system
- [Getting Started](../GETTING_STARTED.md) - Initial setup
- [Production Deployment](../deployment/production-deployment.md) - Deployment guide

---

**Last Updated:** 2026-07-25
