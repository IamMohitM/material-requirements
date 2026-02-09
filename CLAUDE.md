# Material Requirements Management System - Project Context

## Project Overview

**Material Requirements Management System (MRMS)** is a digital procurement platform for real estate construction companies. It streamlines the process of requesting materials, comparing vendor quotes, generating purchase orders, tracking deliveries, and managing payments.

**Current Phase:** Foundation Phase MVP (Corrected Scope)

**Foundation Phase Includes:**
- Material request creation and management (Stories 1-2)
- Vendor database and rate comparison (Stories 3-4)
- Purchase Order (PO) generation with approval workflow (Stories 5-6)
- Delivery receipt & batch tracking (Story 8)
- Invoice submission & 3-way matching (Story 9)
- Material consumption tracking (Story 10)
- Mobile approval interface (Story 11)
- Vendor rate history & change detection (Story 12)
- Brand/variant selection & management (Story 13)
- Per-project cost analytics (Story 14)
- Cross-project analytics & insights (Story 15)
- Complete audit trail for compliance (Story 7)

**Future Phases:**
- Phase 2: Payment processing, advanced approval workflows, vendor portal
- Phase 3: Mobile native apps, ML-based analytics, EDI integration

**Scope Correction Note:**
Original documentation incorrectly classified delivery tracking, 3-way matching, material consumption tracking, and analytics as Phase 2/3 features. Based on business requirements clarification, these are **essential Foundation Phase features** that provide complete end-to-end procurement visibility. See `/docs/requirements.md` and `/docs/architecture.md` for detailed Foundation Phase scope.

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Language:** TypeScript (strict mode)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Cache/Queue:** Redis
- **ORM:** TypeORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** joi
- **Testing:** Jest, Supertest

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **UI Library:** React Bootstrap / Tailwind CSS
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Testing:** Jest, React Testing Library

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Version Control:** Git

## Project Structure

```
material-requirements/
├── claude.md                           # This file - project context and guidelines
├── README.md                           # Getting started guide
├── .gitignore                          # Git ignore file
├── .env.example                        # Environment variables template
│
├── backend/                            # Node.js/Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts            # Database connection
│   │   │   ├── auth.ts                # Authentication config
│   │   │   └── env.ts                 # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT verification
│   │   │   ├── errorHandler.ts        # Global error handling
│   │   │   ├── validation.ts          # Input validation
│   │   │   └── audit.ts               # Audit logging
│   │   ├── entities/                  # Database entities (TypeORM)
│   │   │   ├── User.ts
│   │   │   ├── Project.ts
│   │   │   ├── Material.ts
│   │   │   ├── Vendor.ts
│   │   │   ├── Request.ts
│   │   │   ├── Quote.ts
│   │   │   ├── PurchaseOrder.ts
│   │   │   ├── AuditLog.ts
│   │   │   ├── Delivery.ts              # (NEW) Batch/partial delivery tracking
│   │   │   ├── DeliveryLineItem.ts      # (NEW) Items within each delivery
│   │   │   ├── Invoice.ts               # (NEW) Vendor invoices for 3-way matching
│   │   │   ├── DiscrepancyLog.ts        # (NEW) PO-Delivery-Invoice mismatches
│   │   │   ├── VendorRateHistory.ts     # (NEW) Historical vendor pricing
│   │   │   ├── MaterialConsumption.ts   # (NEW) Material usage tracking
│   │   │   ├── Brand.ts                 # (NEW) Material variants/brands
│   │   │   ├── POLineItemBrand.ts       # (NEW) Brand selection per PO line
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts         # User authentication
│   │   │   ├── ProjectService.ts      # Project management
│   │   │   ├── MaterialService.ts     # Material catalog
│   │   │   ├── VendorService.ts       # Vendor management with rate history
│   │   │   ├── RequestService.ts      # Material requests
│   │   │   ├── QuoteService.ts        # Vendor quotes
│   │   │   ├── POService.ts           # Purchase orders
│   │   │   ├── DeliveryService.ts     # (NEW) Batch/partial delivery tracking
│   │   │   ├── InvoiceService.ts      # (NEW) Invoice submission & 3-way matching
│   │   │   ├── DiscrepancyService.ts  # (NEW) Discrepancy logging & resolution
│   │   │   ├── AnalyticsService.ts    # (NEW) Per-project & cross-project analytics
│   │   │   ├── BrandService.ts        # (NEW) Brand/variant management
│   │   │   ├── AuditService.ts        # Audit trail & compliance reporting
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts                # POST /auth/* endpoints
│   │   │   ├── projects.ts            # /projects/* endpoints
│   │   │   ├── materials.ts           # /materials/* endpoints
│   │   │   ├── vendors.ts             # /vendors/* endpoints
│   │   │   ├── requests.ts            # /requests/* endpoints
│   │   │   ├── quotes.ts              # /quotes/* endpoints
│   │   │   ├── pos.ts                 # /pos/* endpoints
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validators.ts          # Validation schemas
│   │   │   ├── errors.ts              # Custom error classes
│   │   │   └── helpers.ts             # Utility functions
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── migrations/
│   │   │   └── 1_initial_schema.ts    # Database schema
│   │   ├── seeds/
│   │   │   └── seed.ts                # Test data
│   │   ├── app.ts                     # Express app setup
│   │   └── index.ts                   # Server entry point
│   ├── tests/
│   │   ├── unit/
│   │   │   └── services/
│   │   │       ├── RequestService.test.ts
│   │   │       ├── POService.test.ts
│   │   │       └── QuoteService.test.ts
│   │   └── integration/
│   │       ├── auth.test.ts
│   │       ├── requests.test.ts
│   │       ├── quotes.test.ts
│   │       └── pos.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                           # React web dashboard
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Form.tsx
│   │   │   │   └── Alert.tsx
│   │   │   ├── requests/
│   │   │   │   ├── RequestList.tsx
│   │   │   │   ├── RequestForm.tsx
│   │   │   │   └── RequestDetail.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── QuoteComparison.tsx
│   │   │   │   └── QuoteList.tsx
│   │   │   └── pos/
│   │   │       ├── POList.tsx
│   │   │       ├── POForm.tsx
│   │   │       ├── PODetail.tsx
│   │   │       └── ApprovalForm.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RequestsPage.tsx
│   │   │   ├── QuotesPage.tsx
│   │   │   ├── POsPage.tsx
│   │   │   ├── VendorsPage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   ├── requests.ts            # Request API calls
│   │   │   ├── quotes.ts              # Quote API calls
│   │   │   └── pos.ts                 # PO API calls
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── projectSlice.ts
│   │   │   │   ├── requestsSlice.ts
│   │   │   │   ├── quotesSlice.ts
│   │   │   │   ├── posSlice.ts
│   │   │   │   └── uiSlice.ts
│   │   │   └── store.ts
│   │   ├── utils/
│   │   │   ├── api-client.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProject.ts
│   │   │   └── useApi.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.tsx
│   ├── tests/
│   │   ├── components/
│   │   │   ├── RequestForm.test.tsx
│   │   │   └── QuoteComparison.test.tsx
│   │   └── services/
│   │       └── api.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml                 # Local development environment
├── .dockerignore
│
└── docs/
    ├── requirements.md                # Product requirements
    ├── architecture.md                # System architecture
    ├── API.md                         # API documentation
    ├── DATABASE.md                    # Database schema
    ├── SETUP.md                       # Development setup guide
    └── DEVELOPMENT.md                 # Development guidelines
```

## Key Design Decisions

### Backend Architecture
- **Service Layer Pattern:** Separation of concerns - routes delegate to services which handle business logic
- **TypeORM:** Type-safe database access with migrations support
- **Middleware Chain:** Auth → Validation → Business Logic → Error Handling
- **Audit Trail:** Every data mutation logged with user, timestamp, and changes
- **Error Handling:** Custom error classes with HTTP status codes
- **Validation:** Input validation at route level using joi schemas

### Frontend Architecture
- **Redux Toolkit:** Simplified state management with slices
- **Service Layer:** Centralized API calls, easy to mock for testing
- **Component Organization:** Feature-based folder structure
- **TypeScript:** Strict mode for type safety
- **Responsive Design:** Mobile-first approach, works on tablets/desktop

### Database Design
- **Immutable Audit Trail:** AuditLog table captures every change
- **Soft Deletes:** `is_active` flag instead of DELETE (preserves audit trail)
- **Enums for Status:** State transitions validated at database level
- **Relationships:** Foreign keys with proper constraints
- **Indexes:** On frequently queried columns (project_id, status, vendor_id)

## Development Workflow

### Setting Up Locally
```bash
# 1. Clone and setup
git clone <repo>
cd material-requirements

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Create environment file
cp .env.example .env
# Edit .env with your settings

# 4. Start development environment
docker-compose up

# 5. Run migrations (in a new terminal)
cd backend
npm run migrate

# 6. Seed test data
npm run seed

# 7. Access applications
# Backend API: http://localhost:3000
# Frontend: http://localhost:3001
```

### Development Commands

**Backend:**
```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Run specific test
npm test -- RequestService.test.ts

# Database migrations
npm run migrate              # Run pending migrations
npm run migrate:revert       # Revert last migration
npm run migrate:create       # Create new migration

# Seed test data
npm run seed

# Linting and formatting
npm run lint
npm run format

# Build for production
npm run build
```

**Frontend:**
```bash
cd frontend

# Development mode
npm start

# Run tests
npm test

# Build for production
npm run build

# Format code
npm run format
```

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/description
   ```

2. **Write code following patterns:**
   - Backend: Service → Route → Test
   - Frontend: Component → Store → Test

3. **Test locally:**
   ```bash
   npm test              # Run tests
   npm run lint          # Check code quality
   ```

4. **Create commit:**
   ```bash
   git add .
   git commit -m "Clear description of changes"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/description
   # Then create PR on GitHub
   ```

## API Design Principles

### URL Structure
```
/api/v1/projects/:projectId/requests        # Resources
/api/v1/requests/:requestId                 # Single resource
/api/v1/requests/:requestId/approve         # Actions
```

### Response Format
```json
{
  "success": true,
  "data": { /* actual data */ },
  "error": null,
  "meta": { "total": 100, "page": 1 }
}
```

### Error Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": [/* field errors */]
  }
}
```

## Authentication & Authorization

### JWT Tokens
- **Access Token:** 24 hour expiration, used for API requests
- **Refresh Token:** 30 day expiration, used to get new access token
- **Structure:** Header: `Authorization: Bearer <token>`

### User Roles
- **site_engineer:** Create requests, view POs
- **approver:** Approve requests and POs
- **finance_officer:** Manage vendors, view all data
- **admin:** Full system access

### Permissions
- Checked at route level with middleware
- Database-backed, configurable per project
- Logged in audit trail when access denied

## Testing Strategy

### Unit Tests (Backend Services)
- Test business logic in isolation
- Mock database calls
- Test all happy paths and error cases
- Target: 80%+ coverage of services

### Integration Tests (API Endpoints)
- Test full request/response cycle
- Use test database
- Test approval workflows
- Test error handling and validation

### Frontend Component Tests
- Test component rendering
- Test user interactions
- Mock API calls
- Test Redux state changes

### Running Tests
```bash
# All tests
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test -- RequestService.test.ts
```

## Code Quality Standards

### TypeScript
- `strict: true` in tsconfig
- No `any` types without justification
- Proper error handling with typed errors

### Code Style
- 2 space indentation
- Clear variable names
- Comments for non-obvious logic
- Maximum line length: 100 characters

### Error Handling
```typescript
// Always provide meaningful error messages
throw new ValidationError('Material quantity must be greater than 0');

// Log errors for debugging
logger.error('Failed to create request', { userId, error, context });

// Return appropriate HTTP status codes
res.status(400).json({ error: 'Bad request' });
```

### Input Validation
```typescript
// Validate all user inputs
const schema = joi.object({
  material_id: joi.string().uuid().required(),
  quantity: joi.number().positive().required(),
  delivery_date: joi.date().min('now').required(),
});
const { error, value } = schema.validate(req.body);
```

## Database Best Practices

### Migrations
- One migration per feature
- Include both up and down migrations
- Use meaningful names: `1_create_requests_table.ts`
- Test migrations on clean database

### Queries
- Use indexes for frequently queried columns
- Avoid N+1 problems (use joins or eager loading)
- Use transactions for multi-step operations
- Prefer service methods over raw queries

### Data Integrity
- Foreign key constraints for relationships
- Check constraints for valid states
- Unique constraints where appropriate
- NOT NULL constraints for required fields

## Debugging Tips

### Backend
```bash
# Debug with VS Code
# Add breakpoint and run:
npm run debug

# Check logs
docker logs material-requirements-api

# Database queries
npm run db:console   # Connect to PostgreSQL CLI
```

### Frontend
```bash
# React DevTools browser extension
# Redux DevTools browser extension
# Network tab in browser DevTools
# Console for errors

# Build analysis
npm run build:analyze
```

### Docker
```bash
# View container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Connect to PostgreSQL
docker-compose exec db psql -U app -d mrms

# Connect to Redis
docker-compose exec redis redis-cli
```

## Common Issues & Solutions

### Database Connection Issues
**Problem:** "Error: connect ECONNREFUSED"
**Solution:**
```bash
# Ensure PostgreSQL is running
docker-compose up -d db redis

# Check connection string in .env
# Default: postgresql://app:password@localhost:5432/mrms
```

### Port Already in Use
**Problem:** "Port 3000 already in use"
**Solution:**
```bash
# Kill process using port
lsof -i :3000
kill -9 <PID>

# Or change port in .env
API_PORT=3001
```

### Node Modules Issues
**Problem:** "Cannot find module"
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or in Docker
docker-compose down
docker system prune -a
docker-compose up --build
```

## Environment Variables

### Backend (.env)
```
# Server
NODE_ENV=development
API_PORT=3000
API_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASSWORD=password
DB_NAME=mrms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

## Performance Considerations

### Backend
- Database query optimization (use EXPLAIN ANALYZE)
- Caching frequently accessed data (vendor rates, materials)
- Pagination for large result sets
- Connection pooling for database

### Frontend
- Code splitting for faster initial load
- Lazy loading of routes
- Memoization of expensive components
- Redux selector optimization

### Database
- Indexes on foreign keys and frequently filtered columns
- Partitioning large tables by project_id
- Regular VACUUM to maintain performance
- Monitor slow queries with pg_stat_statements

## Security Practices

### Authentication
- Passwords hashed with bcrypt
- JWT tokens signed with secret
- Refresh tokens for longer sessions
- Logout by blacklisting tokens

### Authorization
- Check user permissions on every endpoint
- Project-level access control
- Role-based feature access
- Audit log of permission denials

### Data Protection
- Validate all user input
- Escape database queries (use ORM)
- HTTPS in production
- Secure headers (CORS, CSP, etc.)
- No sensitive data in logs

## Documentation

### Code Comments
- Explain WHY, not WHAT (code shows what)
- Comments for non-obvious logic
- Document complex algorithms
- Update comments when changing code

### API Documentation
- See `/docs/API.md` for full API reference
- Document request/response formats
- Document error codes
- Document authentication requirements

### Database Schema
- See `/docs/DATABASE.md` for schema diagram
- Document relationships
- Document constraints
- Document why data model is designed this way

## Contributing

### Before Starting
1. Check `/docs/requirements.md` - what needs to be built?
2. Check `/docs/architecture.md` - how should it be built?
3. Check existing code - follow established patterns
4. Create feature branch from main

### Code Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] Input validation on all endpoints
- [ ] Error handling is proper
- [ ] Tests written and passing
- [ ] Database migrations included
- [ ] Documentation updated
- [ ] No console.logs in production code
- [ ] Commit message is clear
- [ ] No development-only files committed to main

### Development-Only Files Policy

**Files that should NOT be committed to the repository:**
- Setup instructions (GITHUB_SETUP.md, PUSH_TO_GITHUB.md, etc.)
- Session summaries and session notes
- Development guides specific to a session
- Temporary debugging files
- Internal process documentation

**Where to keep them:**
- **Artifacts folder** (`/artifacts/`) - For development reference only
- **Local machine** - If strictly personal notes
- **Internal wiki** - If team documentation needed

**Why this matters:**
- Keeps the repository clean and professional
- Reduces clutter for users and contributors
- Separates internal development process from product code
- Prevents confusion about what's actually part of the project

**Pattern:**
1. Create temporary files in `/artifacts/` during development
2. Never commit these files to main branch
3. Use `.gitignore` if they're generated files
4. Keep only production-ready documentation in `/docs/`
5. Never add these files in the project root folder unless explicitly specified

**Example Good Documentation:**
- `/docs/requirements.md` - User stories and features ✅
- `/docs/API.md` - API reference ✅
- `/README.md` - Getting started guide ✅
- `CLAUDE.md` - Project context and guidelines ✅

**Example Development-Only (Don't commit):**
- `SESSION_SUMMARY.md` - For this session only ❌
- `GITHUB_SETUP.md` - Temporary helper ❌
- `PUSH_TO_GITHUB.md` - Session-specific ❌

## Using Software Orchestrator Skill

For complex development tasks that require coordination between different experts, use the **Software Orchestrator** skill via Claude Code.

### When to Use Orchestrator

Use when you need multiple experts working together:
- **New features** that affect architecture and require planning
- **Large refactorings** that need architect review before engineering
- **Major bug fixes** that require QA validation after fix
- **Phase transitions** from foundation to delivery/payment features
- **Deployment decisions** after development is complete
- **Any significant change** that would benefit from expert coordination

### Orchestrator Workflow

```
Your Request
    ↓
Software Orchestrator
    ├─→ Product Manager (gather requirements)
    ├─→ System Architect (design approach)
    ├─→ Software Engineer (implement code)
    ├─→ QA Specialist (test and validate)
    └─→ DevOps Engineer (deployment)
```

### Example Usage

**For a new major feature:**
```
/software-orchestrator

"Add delivery tracking and invoice matching feature to Foundation Phase.
This involves creating new entities (Delivery, Invoice),
implementing complex 3-way matching logic, and creating new pages in the UI."
```

The orchestrator will:
1. Have PM gather detailed requirements
2. Have Architect review design approach
3. Have Engineer implement with tests
4. Have QA validate against requirements
5. Create final implementation documentation

**For completing Phase 2:**
```
/software-orchestrator

"Implement Phase 2: Delivery Tracking and Invoice Matching.
Create DeliveryService, InvoiceService, matching logic, frontend pages,
and ensure 3-way matching (PO-Delivery-Invoice) works correctly."
```

### Expert Roles in Orchestrator

| Role | Responsibilities |
|------|-----------------|
| **Product Manager** | Clarify requirements, define user stories, acceptance criteria |
| **System Architect** | Review design, suggest patterns, consider scalability |
| **Software Engineer** | Implement code, write components, follow best practices |
| **QA Specialist** | Create tests, validate requirements, identify issues |
| **DevOps Engineer** | Deployment strategy, infrastructure, CI/CD setup |

### Coordination Benefits

✅ **Ensures Quality**
- Requirements clearly defined
- Design reviewed before coding
- Tests validate acceptance criteria
- Multiple perspectives considered

✅ **Prevents Rework**
- Architecture issues caught early
- Bugs found and fixed during development
- Requirements understood before implementation

✅ **Maintains Standards**
- Consistent code quality
- All patterns followed
- Proper test coverage
- Complete documentation

### For This Project

Use orchestrator when implementing:
- **Foundation Phase Tier 3+** (Consumption, Analytics, Mobile approvals)
- **Phase 2 Features** (Payment processing, advanced workflows, vendor portal)
- **Phase 3 Features** (Mobile native app, ML-based analytics, EDI integration)
- **Major Refactorings** (Auth system, Approval workflow)
- **System-wide Changes** (Adding real-time, adding search, etc.)

### Quick Reference

**Simple change?** → Just code it (use Software Engineer skill)
**Feature addition?** → Use Orchestrator for coordination
**New phase?** → Definitely use Orchestrator
**Bug fix?** → Usually just code it
**Large feature?** → Use Orchestrator

---

**Tip:** Save time by being specific about what needs building. Reference:
- `/docs/requirements.md` for feature details
- `/docs/architecture.md` for design patterns
- This CLAUDE.md for project context

## Foundation Phase Implementation Roadmap (8 Weeks)

The Foundation Phase is structured into 4 implementation tiers to deliver a complete, functional procurement system:

### Tier 1: Core Procurement (Weeks 1-2)
- **Focus:** Stories 1-6 - Request, Quote, and PO workflows
- **Services:** ProjectService, MaterialService, VendorService, QuoteService, POService
- **Deliverable:** Complete procurement pipeline (Request → Quote → PO)

### Tier 2: Delivery & Validation (Weeks 3-4)
- **Focus:** Stories 8-9 - Delivery receipt and invoice matching
- **Services:** DeliveryService, InvoiceService, DiscrepancyService
- **Deliverable:** Complete fulfillment tracking and invoice validation with 3-way matching

### Tier 3: Consumption & Analytics (Weeks 5-6)
- **Focus:** Stories 10-15 - Material tracking, analytics, and mobile approvals
- **Services:** MaterialConsumption, AnalyticsService, BrandService
- **Deliverable:** Material consumption tracking, per-project & cross-project dashboards, mobile UI

### Tier 4: Quality & Deployment (Weeks 7-8)
- **Focus:** Testing, optimization, and preparation for production
- **Deliverable:** 80%+ test coverage, performance optimization, production-ready MVP

See `/docs/requirements.md` for detailed user stories and acceptance criteria.

## Phase 2 Features (Post-Foundation)

- Payment processing and fund transfers
- Accounting system integration
- Advanced approval workflows with multi-hierarchy support
- Vendor portal (vendors submit quotes directly)
- Email notifications and communication automation
- Advanced search and filtering (Elasticsearch)
- PDF generation for POs and reports
- Real-time notifications (Socket.io)

## Phase 3 Features (Future)

- Mobile native app (React Native for Android/iOS)
- ML-based spend analytics and predictions
- Bill of Materials (BOM) import
- EDI/API integration with vendor systems
- Multi-currency support
- Blockchain for invoice/delivery verification
- Sustainability and carbon footprint tracking

## Getting Help

### Documentation
- `/docs/SETUP.md` - Setup and installation
- `/docs/API.md` - API reference
- `/docs/DATABASE.md` - Database schema
- `/docs/DEVELOPMENT.md` - Development guidelines

### Common Questions
- **How do I add a new field to a model?** Create migration, update entity, update API
- **How do I add a new API endpoint?** Create route, create service method, add tests
- **How do I change the database?** Create migration, test locally, commit migration
- **How do I deploy changes?** Run tests, create PR, merge to main (CI/CD handles deployment)

## Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with clear description
4. Ask in development channel

---

**Last Updated:** 2026-02-06
**Version:** 1.0.0 (Foundation Phase MVP)
**Maintainer:** Development Team
