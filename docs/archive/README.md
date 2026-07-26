# Archive

Historical and deprecated documentation files.

---

## Overview

This directory contains documentation that is no longer current but preserved for historical reference. All files in this directory have deprecation notices indicating where to find the current documentation.

---

## Archived Files

### RBAC Documentation

- **[rbac-implementation-original.md](./rbac-implementation-original.md)** - Original RBAC implementation guide
  - **Replaced by:** [/docs/features/rbac.md](../features/rbac.md)
  - **Archived:** July 25, 2026

- **[summary.md](./summary.md)** - RBAC implementation summary
  - **Replaced by:** [/docs/features/rbac.md](../features/rbac.md)
  - **Archived:** July 20, 2026

- **[final-status.md](./final-status.md)** - RBAC implementation final status
  - **Replaced by:** [/docs/features/rbac.md](../features/rbac.md)
  - **Archived:** July 20, 2026

### OAuth Documentation

- **[oauth-username-fix-deprecated.md](./oauth-username-fix-deprecated.md)** - Deprecated OAuth approach
  - **Replaced by:** [/docs/auth/oauth-implementation.md](../auth/oauth-implementation.md)
  - **Status:** Deprecated approach (nullable username)
  - **Current approach:** Database hooks
  - **Archived:** July 21, 2026

### Organization History

- **[2026-07-21-reorganization.md](./2026-07-21-reorganization.md)** - Documentation reorganization record
  - **Purpose:** Historical record of July 21, 2026 docs reorganization
  - **Archived:** July 21, 2026

---

## Why Keep Archives?

Archived documentation is kept for:

1. **Historical Reference** - Understanding past implementation decisions
2. **Troubleshooting** - Debugging legacy issues
3. **Migration Context** - Understanding why current approach was chosen
4. **Audit Trail** - Tracking project evolution

---

## Reading Archived Files

All archived files have clear deprecation headers at the top:

```markdown
> **⚠️ DEPRECATED/HISTORICAL DOCUMENT**  
> This document is kept for historical reference. For current documentation, see [link]
```

Always check the deprecation header for links to current documentation.

---

## Archive Policy

Documents are archived when:
- A new consolidated version replaces multiple documents
- An implementation approach is superseded
- Documentation is reorganized
- Content becomes outdated but has historical value

Documents are NOT archived when:
- They contain current, accurate information
- They are actively referenced by other docs
- They serve as unique reference material

---

## Related Documentation

For current documentation, see:
- [/docs/features/](../features/) - Feature documentation
- [/docs/auth/](../auth/) - Authentication documentation
- [/docs/README.md](../README.md) - Documentation index

---

**Last Updated:** 2026-07-25
