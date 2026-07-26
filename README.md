# Alif Pustaka

**Enterprise-grade Content Management System with Role-Based Access Control**

Alif Pustaka is a modern, full-stack CMS built with Next.js, featuring a sophisticated 8-tier role system, comprehensive blog management with editorial workflows, real-time notifications, and enterprise-level audit logging.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **8-Tier Role System**: Super Admin, Content Admin, User Admin, Sales Admin, Support Admin, Editor, Author, User
- **18 Granular Permissions** with role hierarchy (10-100 scale)
- **OAuth Integration**: Google and GitHub authentication with auto-username generation
- **Email/Password Authentication** with verification and password reset
- **Session Management**: 30-day session expiration with 24-hour updates
- **User Status Management**: Active, Inactive, Banned, Deleted

### 📝 Blog Management
- **Complete Editorial Workflow**: Draft → Submit → Review → Publish
- **Advanced Search & Filtering**: Debounced search, status filtering, sorting
- **Bulk Operations**: Status changes, tag management, soft delete
- **Post Review System**: Approve/reject with footnotes and notifications
- **Rich Markdown Editor**: Live preview, toolbar, image integration, auto-save
- **Permission-Based Publishing**: Editors cannot review Content Admin posts

### 🖼️ Gallery & Media Management
- **Cloudflare R2 Storage**: Scalable image storage with pre-signed URLs
- **Image Metadata**: Title, slug, tags, visibility controls
- **Public/Private Images**: Role-based access control
- **Featured Images**: Mark images as featured
- **Grid & List Views**: Flexible browsing options

### 👥 User Management
- **User Directory**: Search by name, username, email (debounced 500ms)
- **Bulk Operations**: Activate, deactivate, ban multiple users
- **Role Assignment**: Permission-based role assignment with hierarchy
- **Auto-refresh**: Real-time updates every 60 seconds
- **Status Indicators**: Visual feedback for user status

### 🔔 Notification System
- **Real-time Notifications**: In-app notification center
- **Notification Types**: Role changes, status changes, post approvals/rejections
- **Unread Badge**: Visual indicator for unread notifications
- **Mark as Read**: Individual and bulk mark as read
- **Deep Linking**: Click to navigate to related entities

### 📊 Audit Logging
- **Comprehensive Tracking**: All user, post, and gallery changes logged
- **Detailed Metadata**: Action type, performer, old/new values, IP, user agent
- **1-Year Retention**: Configurable retention policy
- **Role-Based Access**: View logs based on permissions
- **Async Logging**: Non-blocking performance

### 🎨 Modern UI/UX
- **Dark Mode Support**: Theme switcher with system preference detection
- **Responsive Design**: Mobile-first approach
- **Toast Notifications**: User-friendly feedback system
- **Accessible Components**: WCAG-compliant UI elements

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.2.9** - React framework with App Router
- **React 19.2.4** - UI library with React Compiler
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Markdown** - Markdown rendering with syntax highlighting

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Better Auth** - Authentication library with OAuth support
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database (Supabase)

### External Services
- **Supabase** - PostgreSQL database hosting
- **Cloudflare R2** - S3-compatible image storage
- **Brevo** - Email service (SMTP + API)
- **Nodemailer** - Email sending

### Development & Testing
- **Jest** - Testing framework
- **Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database (Supabase recommended)
- Cloudflare R2 account (for gallery features)
- Google/GitHub OAuth apps (optional, for social login)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/alifpustaka-next-v1.git
cd alifpustaka-next-v1

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma migrate deploy

# Create Super Admin user
# See docs/GETTING_STARTED.md for detailed instructions

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Default Super Admin Credentials
```
Email: superadmin@alifpustaka.web.id
Password: [Set in environment variable]
```

See [Getting Started Guide](./docs/GETTING_STARTED.md) for detailed setup instructions.

---

## 📚 Documentation

### Essential Guides
- **[Getting Started](./docs/GETTING_STARTED.md)** - Complete setup and installation guide
- **[System Architecture](./docs/ARCHITECTURE.md)** - Architecture overview and design decisions
- **[CHANGELOG](./CHANGELOG.md)** - Version history and release notes

### Feature Documentation
- **[Authentication System](./docs/features/authentication.md)** - Auth flows, OAuth, email verification
- **[RBAC Implementation](./docs/features/rbac-implementation.md)** - Roles, permissions, and access control
- **[User Management](./docs/features/user-management.md)** - User directory and management interface
- **[Blog Management](./docs/features/blog-management.md)** - Blog CMS and editorial workflow
- **[Post Review System](./docs/features/post-review.md)** - Editorial review and approval process
- **[Gallery Management](./docs/features/gallery-management.md)** - Image upload and management
- **[Notification System](./docs/features/notification-system.md)** - Real-time notifications
- **[Audit Logging](./docs/features/audit-logging.md)** - Activity tracking and compliance

### API Reference
- **[Blog API](./docs/api/blog-api-reference.md)** - Blog and post endpoints
- **[User API](./docs/api/user-api-reference.md)** - User management endpoints
- **[Gallery API](./docs/api/gallery-api-reference.md)** - Image and gallery endpoints
- **[Notification API](./docs/api/notification-api-reference.md)** - Notification endpoints

### Development Guides
- **[Local Development Setup](./docs/development/setup.md)** - Development environment setup
- **[Testing Guide](./docs/development/testing.md)** - Testing strategies and conventions
- **[Error Codes Reference](./docs/development/error-codes.md)** - API error codes
- **[Commit Message Guidelines](./docs/development/commit-message.md)** - Git commit conventions

### Deployment
- **[Production Deployment](./docs/deployment/production-deployment.md)** - Production deployment checklist

### Sprint History
- **[Blog Editor Sprints](./docs/sprints/blog-editor/)** - Sprint 1 & 2 documentation

---

## 📁 Project Structure

```
alifpustaka-next-v1/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (admin)/             # Protected admin routes
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── blog/            # Blog management
│   │   │   ├── gallery/         # Gallery management
│   │   │   └── p/               # User profiles
│   │   ├── api/                 # API routes (21 endpoints)
│   │   └── ...                  # Public routes
│   ├── components/              # React components (93 components)
│   │   ├── admin/               # Admin UI components
│   │   ├── blog/                # Blog components
│   │   ├── gallery/             # Gallery components
│   │   ├── ui/                  # Reusable UI primitives
│   │   └── ...
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── NotificationContext.tsx
│   │   └── ...
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # Better Auth configuration
│   │   ├── permissions.ts       # Permission utilities
│   │   ├── audit-log.ts         # Audit logging
│   │   └── ...
│   ├── types/                   # TypeScript type definitions
│   └── constants/               # Constants and configurations
├── prisma/
│   └── schema.prisma            # Database schema (10 models)
├── docs/                        # Documentation
├── scripts/                     # Utility scripts
├── public/                      # Static assets
└── __tests__/                   # Test suites

Key Metrics:
- 21 API endpoints
- 93 UI components
- 10 database models
- 8 user roles
- 18 permissions
- 270+ test assertions (92.4% pass rate)
```

---

## 🧪 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev # Create and apply migration
```

---

## 🔑 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=                    # PostgreSQL connection string

# Authentication
BETTER_AUTH_SECRET=              # Auth secret key
BETTER_AUTH_URL=                 # Application URL
BASE_URL=                        # Base URL for redirects

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email Service
BREVO_API_KEY=                   # Brevo API key
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Super Admin
SUPERADMIN_PASSWORD=             # Initial super admin password
```

---

## 🎯 Role & Permission Matrix

| Role          | Manage Users | Assign Roles | Publish Posts | Review Posts | Manage Gallery |
|---------------|--------------|--------------|---------------|--------------|----------------|
| Super Admin   | ✅           | All roles    | ✅            | ✅           | ✅             |
| Content Admin | ❌           | ❌           | ✅            | ✅           | ✅             |
| User Admin    | ✅           | Limited*     | ❌            | ❌           | ❌             |
| Sales Admin   | ❌           | ❌           | ❌            | ❌           | ❌             |
| Support Admin | ❌           | ❌           | ❌            | ❌           | ❌             |
| Editor        | ❌           | ❌           | ✅            | ✅**         | ❌             |
| Author        | ❌           | ❌           | ❌            | ❌           | Own images     |
| User          | ❌           | ❌           | ❌            | ❌           | ❌             |

\* User Admin can assign: User, Author, Editor roles only  
\** Editor cannot review Content Admin posts

See [RBAC Implementation](./docs/features/rbac-implementation.md) for complete permission details.

---

## 🧩 Key Features by Role

### For Content Creators (Authors)
- Create and edit blog posts with markdown editor
- Upload and manage images
- Submit posts for review
- Receive notifications on post approval/rejection

### For Editors
- Review and approve submitted posts
- Publish posts from Authors and other Editors
- Manage blog content and tags
- Cannot review Content Admin posts (permission hierarchy)

### For Administrators
- **Super Admin**: Full system access, all role assignments
- **Content Admin**: Manage all content, publish any post, control gallery visibility
- **User Admin**: Manage users, assign limited roles, ban/unban users
- **Sales Admin**: Access to sales management features
- **Support Admin**: Access to support management features

---

## 🔒 Security Features

- **Bcrypt Password Hashing**: Industry-standard password security
- **Session Token Management**: Secure session handling with expiration
- **CSRF Protection**: Built-in with Better Auth
- **IP & User Agent Tracking**: All actions logged with metadata
- **Permission-Based Access Control**: Every API endpoint validates permissions
- **Active Status Requirement**: Inactive/banned users cannot perform sensitive operations
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Audit Trail**: Complete activity logging for compliance

---

## 📊 Performance & Quality Metrics

- **Test Coverage**: 92.4% pass rate (270+ assertions)
- **TypeScript Errors**: 0
- **Build Status**: Production-ready
- **Code Quality**: ESLint + Prettier enforced
- **Components**: 93 reusable components
- **API Response Time**: Optimized with async operations
- **Database Queries**: Indexed and optimized

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Review [Commit Message Guidelines](./docs/development/commit-message.md)
2. Write tests for new features
3. Follow TypeScript and ESLint conventions
4. Update documentation for significant changes
5. Create a pull request with clear description

---

## 📝 License

[Add your license here]

---

## 👥 Team & Support

**Developed by:** Alif Pustaka Development Team  
**Last Updated:** July 24, 2026  
**Version:** 2.0.0 (unreleased)

For questions or support:
- Check [Documentation](./docs/)
- Review [Error Codes](./docs/development/error-codes.md)
- Contact development team

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Better Auth](https://github.com/better-auth/better-auth) - Authentication library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Supabase](https://supabase.com/) - Database hosting
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Object storage
