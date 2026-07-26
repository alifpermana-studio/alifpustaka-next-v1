# Documentation Index

**Last Updated:** 2026-07-25

Welcome to the project documentation. This guide will help you navigate through setup guides, feature documentation, API references, and development resources.

---

## Getting Started

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide for new developers
  - Prerequisites and installation
  - Environment configuration
  - Database setup
  - OAuth configuration (Google, GitHub)
  - Cloudflare R2 setup
  - Email service setup
  - Troubleshooting

---

## API Reference

Complete API documentation for all endpoints:

### Core APIs
- **[Blog API](./api/blog-api-reference.md)** - Blog post management (list, create, update, delete)
- **[Gallery API](./api/gallery-api-reference.md)** - Image/gallery management with S3 integration
- **[User Management API](./api/user-management-api-reference.md)** - User administration and role management

### System APIs
- **[Notification API](./api/notification-api-reference.md)** - User notification system
- **[Audit Log API](./api/audit-log-api-reference.md)** - Audit trail and compliance logging
- **[Admin Post API](./api/admin-post-api-reference.md)** - Post review and approval workflow
- **[Auth Utility API](./api/auth-utility-api-reference.md)** - Authentication helpers

**Quick Start:** See [api/README.md](./api/README.md) for API overview and common patterns.

---

## Features

Documentation for major features and systems:

- **[RBAC Implementation](./features/rbac.md)** - Role-based access control system (consolidated guide)
- **[User Management](./features/user-management.md)** - Admin user management interface
- **[Blog Management](./features/blog-management.md)** - Blog post management system
- **[Blog Management Quick Reference](./features/blog-management-quick-reference.md)** - Common blog tasks
- **[Blog Management Architecture](./features/blog-management-architecture.md)** - Architecture diagrams and data flow

---

## Authentication

- **[OAuth Setup](./auth/oauth-setup.md)** - Google and GitHub OAuth configuration
- **[OAuth Implementation](./auth/oauth-implementation.md)** - Database hooks and username generation
- **[OAuth Troubleshooting](./auth/oauth-troubleshooting.md)** - Common OAuth issues and fixes

**Quick Start:** See [auth/README.md](./auth/README.md) for authentication overview.

---

## Development

Resources for developers working on the project:

- **[Error Codes](./development/error-codes.md)** - API error codes reference
- **[Verification](./development/verification.md)** - RBAC verification commands and SQL checks
- **[Checklist](./development/checklist.md)** - Post-implementation checklist
- **[Commit Message Template](./development/commit-message.md)** - Commit message guidelines

---

## Deployment

- **[Production Deployment](./deployment/production-deployment.md)** - Comprehensive deployment checklist
  - Pre-deployment checks
  - Deployment steps
  - Verification procedures
  - Rollback plans

---

## Sprint History

Historical sprint documentation for the blog editor:

- **[Blog Editor Sprints](./sprints/blog-editor/)** - Sprint reports and progress tracking
  - **[SPRINTS_COMPLETE.md](./sprints/blog-editor/SPRINTS_COMPLETE.md)** - Combined Sprint 1 & 2 summary
  - **[SPRINT1_FINAL_REPORT.md](./sprints/blog-editor/SPRINT1_FINAL_REPORT.md)** - Sprint 1: Bug fixes (10 bugs fixed, 270+ tests)
  - **[SPRINT2_FINAL_REPORT.md](./sprints/blog-editor/SPRINT2_FINAL_REPORT.md)** - Sprint 2: Foundation work (9 components extracted)
  - **[COMPLETION_CHECKLIST.md](./sprints/blog-editor/COMPLETION_CHECKLIST.md)** - Full completion checklist

---

## Archive

Historical and deprecated documentation:

- **[Archive Directory](./archive/)** - Deprecated approaches and implementation history
  - RBAC implementation summaries (archived - see features/rbac.md)
  - OAuth username fix (deprecated approach)
  - Historical records

---

## Documentation Structure

```
docs/
├── README.md                          # This file
├── GETTING_STARTED.md                 # Setup guide
│
├── api/                               # API references (NEW - 7 comprehensive guides)
│   ├── README.md                      # API overview
│   ├── blog-api-reference.md          # Blog endpoints
│   ├── gallery-api-reference.md       # Gallery/image endpoints
│   ├── user-management-api-reference.md  # User management endpoints
│   ├── notification-api-reference.md  # Notification endpoints
│   ├── audit-log-api-reference.md     # Audit log endpoints
│   ├── admin-post-api-reference.md    # Post review endpoints
│   └── auth-utility-api-reference.md  # Auth utility endpoints
│
├── auth/                              # Authentication guides
│   ├── README.md                      # Auth overview (consolidated)
│   ├── oauth-setup.md
│   ├── oauth-implementation.md
│   └── oauth-troubleshooting.md
│
├── deployment/                        # Deployment guides
│   ├── README.md
│   └── production-deployment.md
│
├── development/                       # Developer resources
│   ├── README.md
│   ├── error-codes.md
│   ├── verification.md
│   ├── checklist.md
│   └── commit-message.md
│
├── features/                          # Feature documentation
│   ├── README.md
│   ├── rbac.md                        # RBAC (consolidated)
│   ├── user-management.md
│   ├── blog-management.md
│   ├── blog-management-quick-reference.md
│   └── blog-management-architecture.md
│
├── sprints/                           # Sprint history
│   ├── README.md
│   └── blog-editor/
│       ├── README.md
│       ├── SPRINTS_COMPLETE.md
│       ├── SPRINT1_FINAL_REPORT.md
│       ├── SPRINT2_FINAL_REPORT.md
│       └── [other sprint files]
│
└── archive/                           # Deprecated docs
    ├── README.md
    ├── rbac-implementation-original.md
    ├── summary.md
    ├── final-status.md
    ├── oauth-username-fix-deprecated.md
    └── 2026-07-21-reorganization.md
```

---

## Quick Reference

| Category | Key Files |
|----------|-----------|
| **Setup** | GETTING_STARTED.md |
| **API Reference** | api/ directory (7 comprehensive guides) |
| **Features** | features/ directory |
| **Auth** | auth/oauth-setup.md |
| **Deploy** | deployment/production-deployment.md |
| **Develop** | development/ directory |

---

## Documentation Features

### Comprehensive API Documentation
All API endpoints are now fully documented with:
- Request/response formats
- Authentication requirements
- Permission checks
- Error codes
- Complete code examples
- Best practices

### Consolidated Guides
- **OAuth:** Single README with navigation to detailed guides
- **RBAC:** Consolidated from 5+ files into one comprehensive guide
- **Clear archiving:** Deprecated docs marked and archived

### Developer-Friendly
- README files in every directory
- Clear navigation and cross-references
- Practical code examples
- Troubleshooting sections

---

**Need help?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md) for initial setup.

**API Development?** Check [api/README.md](./api/README.md) for API overview and [features/rbac.md](./features/rbac.md) for permissions.

**Deployment?** Follow [deployment/production-deployment.md](./deployment/production-deployment.md).

---

**Last Updated:** 2026-07-25  
**Total Documentation Files:** 40+  
**API Endpoints Documented:** 20+
