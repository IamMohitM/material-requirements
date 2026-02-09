# MRMS Documentation Index

Welcome to the Material Requirements Management System documentation. Use this index to navigate to the documentation you need.

## 🚀 Quick Start

**New to MRMS?**
1. Read [SETUP.md](./SETUP.md) - Get your development environment running
2. Read [requirements.md](./requirements.md) - Understand what you're building
3. Read [architecture.md](./architecture.md) - How the system is designed

**Ready to code?**
1. Review [DEVELOPMENT.md](./DEVELOPMENT.md) - Development standards and patterns
2. Check [DATABASE.md](./DATABASE.md) - Database schema reference
3. Review [API.md](./API.md) - API endpoint documentation
4. Check [SEED_DATA.md](./SEED_DATA.md) - Manage test data and seeding

**Managing the project?**
1. Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Phase breakdown and roadmap
2. Review [requirements.md](./requirements.md) - User stories and acceptance criteria

---

## 📚 Documentation Files

### [requirements.md](./requirements.md)
**What:** Product requirements and user stories
**Who needs this:** Product managers, QA, developers
**Contains:**
- Foundation Phase scope (15 user stories)
- Out of scope features
- Acceptance criteria for each story
- Business rules and constraints
- Success metrics

**Read this when:**
- Starting a new feature
- Writing acceptance tests
- Planning implementation
- Understanding business value

---

### [architecture.md](./architecture.md)
**What:** System design and architecture
**Who needs this:** Architects, senior engineers, tech leads
**Contains:**
- System overview diagram
- Database design with relationships
- Service architecture and dependencies
- Key algorithms (3-way matching, rate detection, etc.)
- API design principles
- Mobile approval flow
- Analytics data model
- Audit trail design

**Read this when:**
- Making architectural decisions
- Designing new features
- Understanding system flow
- Troubleshooting complex interactions

---

### [API.md](./API.md)
**What:** Complete API endpoint documentation
**Who needs this:** Frontend developers, API consumers
**Contains:**
- All endpoints organized by feature
- Request/response formats
- Authentication requirements
- Error codes and messages
- Rate limiting
- Pagination
- Code examples

**Read this when:**
- Building frontend
- Integrating with external system
- Testing API manually
- Understanding data contracts

---

### [DATABASE.md](./DATABASE.md)
**What:** Database schema reference
**Who needs this:** Database engineers, backend developers
**Contains:**
- Entity definitions (all 16 tables)
- Field descriptions and types
- Relationships and foreign keys
- Indexes for performance
- JSONB column structures
- Migration instructions
- Environment variables

**Read this when:**
- Creating migrations
- Designing queries
- Troubleshooting data issues
- Understanding data relationships

---

### [DEVELOPMENT.md](./DEVELOPMENT.md)
**What:** Development guidelines and best practices
**Who needs this:** All developers
**Contains:**
- Code standards (TypeScript, style)
- File organization
- Git workflow and commit messages
- Database development patterns
- Service layer pattern
- API route pattern
- Testing standards and examples
- Docker development
- Debugging techniques
- Performance tips
- Security practices
- Deployment checklist

**Read this when:**
- Writing new code
- Setting up development environment
- Need coding examples
- Following project standards
- Debugging issues

---

### [IMPLEMENTATION.md](./IMPLEMENTATION.md)
**What:** Implementation roadmap and phase breakdown
**Who needs this:** Project managers, team leads, developers
**Contains:**
- 4 implementation tiers (8 weeks total)
- Phase-by-phase breakdown
- Deliverables for each phase
- Key methods and acceptance criteria
- Phase interdependencies
- Rollout strategy
- Success metrics
- Risk mitigation

**Read this when:**
- Planning sprint work
- Understanding project timeline
- Checking implementation status
- Prioritizing features
- Managing dependencies

---

### [SETUP.md](./SETUP.md)
**What:** Development environment setup
**Who needs this:** New developers
**Contains:**
- Prerequisites and system requirements
- Installation steps
- Environment configuration
- Database initialization
- Docker setup
- Verification steps
- Troubleshooting common issues

**Read this when:**
- Setting up development environment
- Getting the project running locally
- Configuring database
- Running Docker

---

### [SEED_DATA.md](./SEED_DATA.md)
**What:** Test data management and seeding guide
**Who needs this:** Developers, QA, product managers
**Contains:**
- Quick start (running default seed data)
- Default login credentials
- How seed data works (idempotent, auto-retry, organized output)
- Creating custom seed data (modifying seed script, creating custom seeds)
- Available roles, categories, statuses
- Tips for effective test data
- Resetting seed data
- Debugging seed issues

**Read this when:**
- Need test data for development
- Want to customize seed data
- Creating reproducible test scenarios
- Testing request/quote/PO workflows
- Setting up for QA testing

---

## 🗂️ At a Glance

```
What do you need to do?
│
├─ I want to understand the project
│  └─→ Start with requirements.md, then architecture.md
│
├─ I want to set up my environment
│  └─→ Read SETUP.md
│
├─ I want to write code
│  ├─→ Check DEVELOPMENT.md for standards
│  ├─→ Check API.md for endpoint contracts
│  ├─→ Check DATABASE.md for schema
│  ├─→ Use SEED_DATA.md to set up test data
│  └─→ Use architecture.md for design guidance
│
├─ I want to test something
│  ├─→ Read SEED_DATA.md to set up test data
│  ├─→ Check API.md for endpoint behavior
│  └─→ Use requirements.md for acceptance criteria
│
├─ I want to implement a feature
│  ├─→ Find it in IMPLEMENTATION.md for timeline
│  ├─→ Find it in requirements.md for acceptance criteria
│  ├─→ Find endpoint in API.md
│  ├─→ Find database tables in DATABASE.md
│  └─→ Follow patterns in DEVELOPMENT.md
│
├─ I'm testing/QA
│  ├─→ Read requirements.md for acceptance criteria
│  ├─→ Check API.md for endpoint behavior
│  └─→ Use DEVELOPMENT.md for test patterns
│
├─ I'm managing the project
│  ├─→ Check IMPLEMENTATION.md for timeline
│  ├─→ Check requirements.md for scope
│  └─→ Use architecture.md to estimate impact
│
└─ I have a problem
   └─→ Check DEVELOPMENT.md troubleshooting section
```

## 📋 Project Status

**Current Phase:** Foundation Phase MVP
- ✅ Infrastructure: Docker environment operational
- ✅ Architecture: Design complete and documented
- ✅ Database: Schema designed with 16 entities
- 🔄 **Next:** Tier 1 implementation (Request → Quote → PO)

**Timeline:**
- Weeks 1-2: Core Procurement (Tier 1)
- Weeks 3-4: Delivery & Validation (Tier 2)
- Weeks 5-6: Consumption & Analytics (Tier 3)
- Weeks 7-8: Quality & Deployment (Tier 4)

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed phase breakdown.

## 🛠️ Technology Stack

**Backend:**
- Node.js 18+ with Express.js
- TypeScript with strict configuration
- PostgreSQL 15 with TypeORM
- Redis 7 for caching
- JWT authentication
- Joi validation

**Frontend:**
- React 18 with TypeScript
- Redux Toolkit for state
- React Bootstrap / Tailwind CSS

**DevOps:**
- Docker & Docker Compose
- PostgreSQL 15 Alpine
- Redis 7 Alpine

See [architecture.md](./architecture.md) for full tech stack details.

## 👥 Team Guidelines

### Code Review Checklist
- [ ] Code follows [DEVELOPMENT.md](./DEVELOPMENT.md) standards
- [ ] All inputs validated per [API.md](./API.md)
- [ ] Database changes in migrations (check [DATABASE.md](./DATABASE.md))
- [ ] Tests written (see patterns in [DEVELOPMENT.md](./DEVELOPMENT.md))
- [ ] No console.logs in production code
- [ ] Commit message is clear and references requirements
- [ ] Feature completes a requirement from [requirements.md](./requirements.md)

### Documentation Updates
When you modify functionality:
1. Update [API.md](./API.md) if endpoints changed
2. Update [DATABASE.md](./DATABASE.md) if schema changed
3. Update [architecture.md](./architecture.md) if design changed
4. Update [IMPLEMENTATION.md](./IMPLEMENTATION.md) if timeline changed

## 🔗 Related Files

**Project Context:**
- [/CLAUDE.md](/CLAUDE.md) - Main project instructions and context
- [/README.md](/README.md) - Project overview

**Code:**
- `/backend/src/` - TypeScript source code
- `/backend/tests/` - Test files
- `/docker-compose.yml` - Local development environment

**Configuration:**
- `/backend/tsconfig.json` - TypeScript configuration
- `/backend/package.json` - Dependencies and scripts
- `/Dockerfile` - Docker image definition

## 📞 Getting Help

**Questions about requirements?**
→ Check [requirements.md](./requirements.md)

**Confused about architecture?**
→ Review [architecture.md](./architecture.md)

**Not sure how to implement something?**
→ Look at [DEVELOPMENT.md](./DEVELOPMENT.md) for patterns

**Need to check an endpoint?**
→ Search [API.md](./API.md)

**Database schema question?**
→ See [DATABASE.md](./DATABASE.md)

**Project planning/timeline?**
→ Check [IMPLEMENTATION.md](./IMPLEMENTATION.md)

**Still stuck?**
→ Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section

## 📝 Last Updated

- **Created:** 2026-02-06
- **Foundation Phase Status:** Infrastructure operational, ready for Tier 1
- **API Server:** ✅ Running on port 3000
- **Database:** ✅ PostgreSQL 15 connected
- **Cache:** ✅ Redis 7 connected

---

**Tip:** Bookmark this page for quick navigation to other documentation!
