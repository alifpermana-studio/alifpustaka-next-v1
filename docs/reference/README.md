# Reference Documentation

Technical reference materials for Alif Pustaka CMS.

---

## Overview

This section contains API documentation, error codes, and technical references for developers.

---

## API Reference

Complete API endpoint documentation with request/response formats, authentication, and examples.

**[API Documentation](./api/)**

### Core APIs
- **[Blog API](./api/blog-api-reference.md)** - Post management endpoints
- **[Discussion API](./api/discussion-api-reference.md)** - Comment system endpoints
- **[Gallery API](./api/gallery-api-reference.md)** - Image management endpoints
- **[User Management API](./api/user-management-api-reference.md)** - User administration endpoints

### System APIs
- **[Notification API](./api/notification-api-reference.md)** - Notification system endpoints
- **[Audit Log API](./api/audit-log-api-reference.md)** - Audit logging endpoints
- **[Admin Post API](./api/admin-post-api-reference.md)** - Post review workflow endpoints
- **[Auth Utility API](./api/auth-utility-api-reference.md)** - Authentication helper endpoints

---

## Error Codes

**[Error Codes Reference](./error-codes.md)**

Complete list of API error codes with descriptions and solutions:

- `unauthorized` - Authentication required
- `account_inactive` - User account not active
- `insufficient_permissions` - Missing required permission
- `not_found` - Resource not found
- `validation_error` - Input validation failed

---

## Contributing

Documentation for developers contributing to the project.

**[Contributing Guide](./contributing/)**

- **[Commit Guidelines](./contributing/commit-guidelines.md)** - Commit message format and conventions
- **[Verification Commands](./contributing/verification.md)** - SQL queries and testing commands
- **[Implementation Checklist](./contributing/checklist.md)** - Post-implementation verification

---

## Quick Reference

### Authentication
All API endpoints require session authentication:

```typescript
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-08-01T10:30:00Z"
  }
}
```

### Common Status Codes
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

---

## Related Documentation

- **[Tutorials](../tutorials/)** - Step-by-step learning guides
- **[Guides](../guides/)** - How-to documentation
- **[Explanation](../explanation/)** - Conceptual documentation

---

**Last Updated:** 2026-08-01
