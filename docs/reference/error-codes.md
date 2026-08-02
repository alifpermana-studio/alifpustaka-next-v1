# API Error Codes Reference

## Error Code Quick Reference

This document lists all error codes used in the RBAC system and their meanings.

## Authentication & Session Errors

### `unauthorized`
- **HTTP Status:** 401
- **Message:** "Authentication required"
- **Cause:** User is not logged in
- **Solution:** User must sign in

### `session_expired`
- **HTTP Status:** 401
- **Message:** "Your session has expired"
- **Cause:** Session token has expired
- **Solution:** User must sign in again

## Account Status Errors

### `account_inactive`
- **HTTP Status:** 403
- **Message:** "Your account is inactive"
- **Cause:** User status is set to "inactive"
- **Solution:** Contact support or admin to activate account

### `account_banned`
- **HTTP Status:** 403
- **Message:** "Your account has been banned"
- **Cause:** User status is set to "banned"
- **Solution:** Contact support

### `account_deleted`
- **HTTP Status:** 403
- **Message:** "Your account has been deleted"
- **Cause:** User status is set to "deleted"
- **Solution:** Account cannot be recovered

## Permission Errors

### `insufficient_permissions`
- **HTTP Status:** 403
- **Message:** Varies based on action
- **Examples:**
  - "You do not have sufficient permissions to perform this action"
  - "Only Editors and Admins can publish posts"
  - "User Admin can only assign: user, author, editor roles"
- **Cause:** User's role doesn't have required permission
- **Solution:** Contact admin to request role upgrade

### `forbidden`
- **HTTP Status:** 403
- **Message:** "Access forbidden"
- **Cause:** Generic access denied
- **Solution:** User lacks required access

## Role & Status Management Errors

### `invalid_role_assignment`
- **HTTP Status:** 400
- **Message:** "Cannot assign the specified role"
- **Cause:** 
  - User Admin trying to assign admin roles
  - Invalid role value
- **Solution:** Only Super Admin can assign admin roles

### `invalid_status_transition`
- **HTTP Status:** 400
- **Message:** "Invalid status transition"
- **Cause:** Attempted invalid status change
- **Solution:** Use valid status values (active, inactive, banned, deleted)

## Validation Errors

### `validation_error`
- **HTTP Status:** 400
- **Message:** Varies based on field
- **Examples:**
  - "Title and slug are required"
  - "Missing required fields"
  - "Image ID and slug are required"
- **Cause:** Required fields missing or invalid format
- **Solution:** Check request body and provide required fields

### `missing_parameter`
- **HTTP Status:** 400
- **Message:** "Missing required parameter"
- **Cause:** Required query parameter or body field missing
- **Solution:** Include all required parameters

### `invalid_parameter`
- **HTTP Status:** 400
- **Message:** "Invalid parameter value"
- **Cause:** Parameter value doesn't match expected format/values
- **Solution:** Check API documentation for valid values

## Resource Errors

### `not_found`
- **HTTP Status:** 404
- **Message:** Varies based on resource
- **Examples:**
  - "User not found"
  - "Post not found"
  - "Image not found"
  - "Audit log not found"
- **Cause:** Requested resource doesn't exist
- **Solution:** Verify resource ID is correct

## Server Errors

### `internal_error`
- **HTTP Status:** 500
- **Message:** Varies based on operation
- **Examples:**
  - "Failed to fetch users"
  - "Failed to update user"
  - "Failed to process blog post"
- **Cause:** Server-side error
- **Solution:** Check server logs, retry request, contact support

## Common Error Response Format

```typescript
{
  success: false,
  message: "Human-readable error message",
  data: null,
  error: {
    code: "error_code_here",
    message: "Detailed error description",
    details?: {
      // Additional context
    }
  },
  meta: {
    timestamp: "2026-07-20T11:13:19.323Z"
  }
}
```

## Error Handling in Frontend

### Example: Handle API Errors

```typescript
async function updateUser(userId: string, updates: any) {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates })
    });

    const result = await response.json();

    if (!result.success) {
      // Handle different error codes
      switch (result.error?.code) {
        case 'insufficient_permissions':
          alert('You do not have permission to perform this action');
          break;
        case 'invalid_role_assignment':
          alert('You cannot assign this role');
          break;
        case 'not_found':
          alert('User not found');
          break;
        case 'account_inactive':
        case 'account_banned':
        case 'account_deleted':
          // Redirect to login
          window.location.href = '/signin';
          break;
        case 'session_expired':
        case 'unauthorized':
          // Redirect to login
          window.location.href = '/signin';
          break;
        default:
          alert(result.message || 'An error occurred');
      }
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to connect to server');
    return null;
  }
}
```

### Example: Display User-Friendly Messages

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  insufficient_permissions: 'You do not have permission for this action.',
  account_inactive: 'Your account is inactive. Contact support.',
  account_banned: 'Your account has been banned.',
  session_expired: 'Your session expired. Please sign in again.',
  not_found: 'The requested item was not found.',
  validation_error: 'Please check your input and try again.',
  internal_error: 'Something went wrong. Please try again later.',
};

function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || 'An unexpected error occurred.';
}
```

## Role-Specific Error Scenarios

### User Admin Errors

| Action | Error Code | Reason |
|--------|-----------|--------|
| Assign "content_admin" role | `insufficient_permissions` | Can only assign user/author/editor |
| Change own role | `invalid_role_assignment` | Cannot change own role |
| Ban Super Admin | `insufficient_permissions` | Cannot manage Super Admin |

### Editor Errors

| Action | Error Code | Reason |
|--------|-----------|--------|
| Publish Content Admin post | `insufficient_permissions` | Cannot review admin posts |
| Assign roles | `insufficient_permissions` | No role management permission |
| Ban users | `insufficient_permissions` | No user management permission |

### Author Errors

| Action | Error Code | Reason |
|--------|-----------|--------|
| Publish post | `insufficient_permissions` | Must submit for review |
| Delete other's post | `insufficient_permissions` | Can only manage own posts |

### Content Admin Errors

| Action | Error Code | Reason |
|--------|-----------|--------|
| Assign roles | `insufficient_permissions` | No role management permission |
| Ban users | `insufficient_permissions` | No user management permission |

## Debugging Tips

1. **Check HTTP Status Code:** Indicates error category (400=client error, 403=permission, 404=not found, 500=server error)
2. **Read Error Code:** Machine-readable identifier for programmatic handling
3. **Read Error Message:** Human-readable explanation
4. **Check Error Details:** Additional context about the error
5. **Check Audit Logs:** For permission-related errors, check audit logs to see what happened

## Related Documentation

- [IMPLEMENTATION-RBAC.md](./IMPLEMENTATION-RBAC.md) - Full implementation guide
- [API Response Format](./IMPLEMENTATION-RBAC.md#4-enhanced-api-response-format) - Response structure
- [Permission Matrix](./IMPLEMENTATION-RBAC.md#permission-matrix) - Role capabilities

---

**Last Updated:** July 20, 2026
