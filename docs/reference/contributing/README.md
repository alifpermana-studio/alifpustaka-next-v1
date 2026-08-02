# Contributing to Alif Pustaka

Guidelines and resources for developers contributing to the project.

---

## Overview

This section contains development guidelines, verification commands, and checklists for contributing to Alif Pustaka.

---

## Documentation

### [Commit Guidelines](./commit-guidelines.md)
Standards for writing clear, consistent commit messages.

**Contents:**
- Commit message format
- Type prefixes (feat, fix, docs, etc.)
- Examples and best practices

**Use this when:** Writing commit messages for pull requests.

---

### [Verification Commands](./verification.md)
SQL queries and commands for verifying implementations.

**Contents:**
- Database verification queries
- Permission checks
- System status commands
- Testing procedures

**Use this when:** Verifying RBAC, testing features, or checking system state.

---

### [Implementation Checklist](./checklist.md)
Post-implementation verification checklist.

**Contents:**
- Feature completion criteria
- Testing requirements
- Documentation requirements
- Deployment readiness

**Use this when:** Completing features or preparing for deployment.

---

## Quick Start for Contributors

### 1. Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/alifpustaka-next-v1.git
cd alifpustaka-next-v1

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma migrate deploy

# Start development server
npm run dev
```

### 2. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 3. Make Changes

- Follow existing code style
- Write tests for new features
- Update documentation

### 4. Verify Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Check TypeScript
npm run build
```

### 5. Commit Your Changes

Follow [commit guidelines](./commit-guidelines.md):

```bash
git add .
git commit -m "feat: add new feature description"
```

### 6. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a pull request on GitHub.

---

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- API routes: `route.ts`

### Code Organization
```
src/
├── app/           # Next.js pages and routes
├── components/    # React components
├── lib/           # Utilities and helpers
├── types/         # TypeScript types
└── constants/     # Constants and config
```

---

## Testing Requirements

### Unit Tests
- Test individual functions and utilities
- Use Jest and Testing Library
- Aim for 80%+ coverage on critical paths

### Integration Tests
- Test API endpoints
- Test component interactions
- Verify database operations

### Manual Testing
- Test in multiple browsers
- Test responsive design
- Verify accessibility

---

## Documentation Requirements

When adding new features:

- ✅ Update API reference if adding endpoints
- ✅ Add tutorial if introducing new workflow
- ✅ Update relevant guides
- ✅ Add JSDoc comments to functions
- ✅ Update CHANGELOG.md

---

## Pull Request Process

1. **Before Submitting:**
   - Run all tests
   - Update documentation
   - Follow commit guidelines
   - Verify no TypeScript errors

2. **PR Description:**
   - Describe what changes were made
   - Explain why changes were needed
   - Link related issues
   - Add screenshots for UI changes

3. **Review Process:**
   - Address reviewer comments
   - Keep commits clean and logical
   - Rebase if needed

4. **After Approval:**
   - Squash commits if requested
   - Merge to main branch

---

## Database Changes

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name description-of-change
   ```
3. Verify migration works
4. Commit both schema and migration files

### Seed Data

- Add seed scripts to `prisma/seed.ts`
- Document seed data requirements
- Include in PR description

---

## Security Guidelines

- ✅ Never commit secrets or credentials
- ✅ Use environment variables for sensitive data
- ✅ Validate all user input
- ✅ Use parameterized queries (Prisma ORM)
- ✅ Check permissions on all API endpoints
- ✅ Sanitize data before rendering
- ❌ Don't log sensitive information
- ❌ Don't expose internal errors to users

---

## Performance Considerations

- Use React.memo() for expensive components
- Implement pagination for large datasets
- Optimize database queries (use indexes)
- Lazy load heavy components
- Debounce search inputs
- Cache API responses when appropriate

---

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios
- Add alt text to images

---

## Getting Help

- **Questions?** Open a discussion on GitHub
- **Bug found?** Create an issue with reproduction steps
- **Need clarification?** Ask in pull request comments

---

## Related Documentation

- **[Verification Commands](./verification.md)** - Testing and verification
- **[Commit Guidelines](./commit-guidelines.md)** - Writing commits
- **[Implementation Checklist](./checklist.md)** - Feature completion

---

**Last Updated:** 2026-08-01
