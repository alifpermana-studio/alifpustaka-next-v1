# Architecture Documentation

Understanding Alif Pustaka's system design, data flow, and technical decisions.

---

## Overview

This section explains the technical architecture, design patterns, and technology choices that power Alif Pustaka.

---

## Available Documentation

### [System Overview](./system-overview.md)
High-level architecture and system design.

**What's covered:**
- Architecture diagram
- Technology stack
- Core components
- Data models
- Request flow
- Security architecture
- Performance considerations

**Use this to understand:** The big picture of how Alif Pustaka is built.

---

### Data Flow
How data moves through the system (to be created).

**What would be covered:**
- Request/response cycle
- Database transactions
- File upload flow
- Authentication flow
- API data flow

---

### Technology Stack
Why we chose these technologies (to be created).

**What would be covered:**
- Next.js rationale
- PostgreSQL benefits
- Prisma advantages
- Better Auth selection
- Cloudflare R2 choice

---

## Key Architectural Decisions

### 1. Next.js App Router
**Decision:** Use Next.js 16 with App Router

**Benefits:**
- Server-side rendering for SEO
- API routes for backend logic
- File-based routing
- Built-in optimization
- Type-safe development

**Trade-offs:**
- Learning curve for App Router
- Server components complexity

---

### 2. PostgreSQL + Prisma
**Decision:** Use PostgreSQL with Prisma ORM

**Benefits:**
- Type-safe database access
- Migration management
- Excellent performance
- ACID compliance
- Rich ecosystem

**Trade-offs:**
- Requires database setup
- Migration complexity

---

### 3. Better Auth
**Decision:** Use Better Auth for authentication

**Benefits:**
- Modern authentication library
- OAuth support built-in
- Database hooks for customization
- Type-safe configuration
- Session management

**Trade-offs:**
- Newer library (less mature than NextAuth)
- Smaller community

---

### 4. Cloudflare R2
**Decision:** Use R2 for image storage

**Benefits:**
- S3-compatible API
- No egress fees
- Cost-effective
- Global distribution
- Simple integration

**Trade-offs:**
- Requires Cloudflare account
- Not as feature-rich as AWS S3

---

### 5. Monolithic Architecture
**Decision:** Single Next.js application (not microservices)

**Benefits:**
- Simpler deployment
- Easier development
- Lower overhead
- Faster initial development
- Single codebase

**Trade-offs:**
- Harder to scale individual features
- All-or-nothing deployments

---

## System Layers

### Presentation Layer
- React components
- Next.js pages
- Client-side state management
- UI/UX implementation

### Application Layer
- API routes
- Business logic
- Permission checks
- Data validation

### Data Layer
- Prisma ORM
- Database queries
- Transaction management
- Data modeling

### Integration Layer
- OAuth providers
- Email service
- File storage
- External APIs

---

## Data Architecture

### Database Schema

**Core Tables:**
- `user` - User accounts and authentication
- `account` - OAuth provider credentials
- `session` - Active user sessions
- `post` - Blog post content
- `tag` - Post tags
- `post_tag` - Many-to-many relationship
- `gallery` - Image metadata
- `other_discussion` - Comments and discussions
- `notification` - User notifications
- `audit_log` - Activity tracking

**Key Relationships:**
- User → Posts (one-to-many)
- User → Comments (one-to-many)
- Post → Tags (many-to-many via post_tag)
- Post → Comments (one-to-many)
- User → Notifications (one-to-many)

---

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS in production
- CORS configuration
- Rate limiting (future)

**Layer 2: Authentication**
- Bcrypt password hashing
- Session token management
- OAuth 2.0 integration

**Layer 3: Authorization**
- Role-based access control
- Permission checks on every endpoint
- Active status requirement

**Layer 4: Data**
- SQL injection prevention (Prisma)
- XSS protection (React)
- Input validation
- Output encoding

**Layer 5: Audit**
- Complete activity logging
- IP and user agent tracking
- Compliance reporting

---

## Performance Architecture

### Optimization Strategies

**Frontend:**
- Server-side rendering
- Static optimization
- Code splitting
- Image optimization (Next.js Image)
- Font optimization

**Backend:**
- Database query optimization
- Connection pooling (Prisma)
- Index optimization
- Async operations
- Caching strategies

**Storage:**
- CDN for media (Cloudflare)
- Presigned URLs for uploads
- Lazy loading
- Progressive image loading

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in database
- Load balancer support
- Multiple Next.js instances

### Vertical Scaling
- Database connection pooling
- Query optimization
- Caching layers
- Resource allocation

### Storage Scaling
- External storage (R2)
- CDN distribution
- Image optimization
- Blob storage for large files

---

## Development Patterns

### Code Organization
```
src/
├── app/              # Next.js routes (App Router)
├── components/       # React components
├── lib/              # Utilities and helpers
├── types/            # TypeScript type definitions
├── constants/        # Constants and config
└── context/          # React Context providers
```

### Component Patterns
- Functional components with hooks
- Server components by default
- Client components when needed
- Compound components for complex UI
- Custom hooks for reusable logic

### API Patterns
- RESTful endpoints
- Consistent response format
- Permission middleware
- Error handling
- Audit logging integration

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Next.js Dev Server (localhost:3000)
├── PostgreSQL (local or SSH tunnel to VPS)
├── Prisma Studio (localhost:5555)
└── Mock Email (Mailtrap)
```

### Production Environment
```
Production Server
├── Next.js (PM2 or Vercel)
├── PostgreSQL (VPS or Supabase)
├── Nginx (Reverse Proxy)
├── SSL/TLS (Let's Encrypt)
├── Cloudflare R2 (Images)
└── Brevo (Email)
```

---

## Future Architecture Considerations

### Potential Enhancements
- Redis for caching
- WebSocket for real-time features
- Elasticsearch for full-text search
- Queue system for async tasks
- CDN for static assets

### Scalability Path
1. Optimize current architecture
2. Add caching layer (Redis)
3. Separate read/write databases
4. Implement CDN for all assets
5. Consider microservices if needed

---

## Related Documentation

- **[System Overview](./system-overview.md)** - Detailed architecture
- **[RBAC System](../features/rbac.md)** - Authorization architecture
- **[API Reference](../../reference/api/)** - API design
- **[Deployment Guides](../../guides/deployment/)** - Deployment architecture

---

**Last Updated:** 2026-08-01
