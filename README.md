# Material Requirements Management System

A digital procurement platform for real estate construction companies to streamline material requests, vendor quotes, and purchase order management.

## 📚 Documentation

**START HERE:** Read the [documentation index](./docs/INDEX.md) to navigate all project information.

### Key Documents:
- **[docs/INDEX.md](./docs/INDEX.md)** - Documentation navigation guide
- **[docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)** - Project phases and roadmap
- **[docs/requirements.md](./docs/requirements.md)** - User stories and acceptance criteria
- **[docs/architecture.md](./docs/architecture.md)** - System design and architecture
- **[docs/API.md](./docs/API.md)** - Complete API endpoint documentation
- **[docs/DATABASE.md](./docs/DATABASE.md)** - Database schema reference
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guidelines and patterns
- **[docs/ARTIFACTS.md](./docs/ARTIFACTS.md)** - Implementation artifacts registry

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup (5 minutes)

```bash
# 1. Clone the repository
git clone <repo>
cd material-requirements

# 2. Create environment file
cp .env.example .env

# 3. Start services (PostgreSQL, Redis)
docker-compose up -d

# 4. Install and run backend
cd backend
npm install
npm run migrate
npm run seed
npm run dev

# 5. In another terminal, run frontend
cd frontend
npm install
npm start
```

**Access the application:**
- 🌐 Frontend: http://localhost:3001
- 📡 API: http://localhost:3000
- 📊 API Docs: http://localhost:3000/api-docs

**Test credentials:**
- Email: `admin@company.com`
- Password: `password123`

## 📋 Features (Foundation Phase MVP)

### ✅ Core Workflows
- **Material Requests:** Site engineers create structured material requests with quantities and specifications
- **Vendor Management:** Centralized vendor database with contact details and historical rates
- **Quote Comparison:** Compare rates from multiple vendors side-by-side
- **Purchase Orders:** Generate formal POs from approved vendor quotes with approval workflow
- **Audit Trail:** Complete history of who did what and when

### 🎯 User Roles
- **Site Engineer:** Create requests, view PO status (mobile-ready)
- **Office Team:** Manage requests, compare quotes, send to vendors
- **Approver/Manager:** Approve requests and POs based on authority limits
- **Finance:** View all data, prepare for invoice matching (Phase 2)
- **Admin:** Manage system, users, vendors

## 🏗️ Project Structure

```
material-requirements/
├── CLAUDE.md                    # Project context (for Claude Code)
├── README.md                    # This file
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Local development environment
│
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── middleware/          # Express middleware
│   │   ├── entities/            # Database entities
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Utilities & validators
│   │   └── migrations/          # Database migrations
│   └── tests/                   # Test files
│
├── frontend/                    # React web dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API integration
│   │   ├── store/               # Redux state management
│   │   └── utils/               # Utilities
│   └── tests/                   # Test files
│
└── docs/                        # Documentation
    ├── requirements.md          # Product requirements
    ├── architecture.md          # System design
    ├── API.md                   # API reference
    └── SETUP.md                 # Detailed setup guide
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js, TypeScript |
| **Frontend** | React, Redux Toolkit, TypeScript |
| **Database** | PostgreSQL 14+ |
| **Cache** | Redis |
| **Authentication** | JWT (jsonwebtoken) |
| **ORM** | TypeORM |
| **DevOps** | Docker, Docker Compose |

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Project context and Claude Code guidelines
- **[docs/SETUP.md](./docs/SETUP.md)** - Detailed installation and setup
- **[docs/requirements.md](./docs/requirements.md)** - Product requirements & user stories
- **[docs/architecture.md](./docs/architecture.md)** - System architecture & design
- **[docs/API.md](./docs/API.md)** - API reference & endpoints
- **[docs/DATABASE.md](./docs/DATABASE.md)** - Database schema documentation
- **[backend/README.md](./backend/README.md)** - Backend development guide
- **[frontend/README.md](./frontend/README.md)** - Frontend development guide

## 🔧 Common Commands

### Backend
```bash
cd backend

npm run dev              # Start development server
npm test                # Run tests
npm run migrate         # Run database migrations
npm run seed            # Seed test data
npm run lint            # Check code style
npm run build           # Build for production
```

### Frontend
```bash
cd frontend

npm start               # Start development server
npm test                # Run tests
npm run build           # Build for production
npm run format          # Format code
```

### Docker
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove all data (careful!)
docker-compose down -v
```

## 🗄️ Database

### Local Database Access
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U app -d mrms

# Connect to Redis
docker-compose exec redis redis-cli

# Run migrations
cd backend && npm run migrate

# Seed test data
npm run seed
```

### Schema Overview
- **Users:** System users with roles and permissions
- **Projects:** Construction projects for material tracking
- **Materials:** Material catalog with specifications
- **Vendors:** Supplier information and ratings
- **Requests:** Material requests from site engineers
- **Quotes:** Vendor quotes with pricing
- **PurchaseOrders:** Formal POs with approval tracking
- **AuditLogs:** Immutable audit trail of all changes

## 🔐 Authentication

### Login Flow
1. User logs in with email/password
2. Backend validates credentials and issues JWT token
3. Frontend stores token and includes in API requests
4. Backend validates token on every request
5. User can logout (token becomes invalid)

### Default Credentials
```
Email: admin@company.com
Password: password123
```

## 📊 API Overview

### Authentication
- `POST /api/v1/auth/login` - Login and get token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details

### Material Requests
- `GET /api/v1/requests` - List all requests
- `POST /api/v1/requests` - Create new request
- `GET /api/v1/requests/:id` - Get request details
- `POST /api/v1/requests/:id/approve` - Approve request
- `POST /api/v1/requests/:id/reject` - Reject request

### Vendor Quotes
- `GET /api/v1/quotes` - List all quotes
- `POST /api/v1/quotes` - Create quote
- `GET /api/v1/quotes/:id` - Get quote details

### Purchase Orders
- `GET /api/v1/pos` - List all POs
- `POST /api/v1/pos` - Create PO from quote
- `GET /api/v1/pos/:id` - Get PO details
- `POST /api/v1/pos/:id/approve` - Approve PO
- `POST /api/v1/pos/:id/reject` - Reject PO

See [docs/API.md](./docs/API.md) for complete API documentation.

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Test Specific File
```bash
npm test -- RequestService.test.ts
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the build/ directory with a web server
```

### Docker Deployment
```bash
docker build -f backend/Dockerfile -t mrms-api .
docker build -f frontend/Dockerfile -t mrms-web .

docker run -e DB_HOST=db mrms-api
docker run mrms-web
```

For detailed deployment instructions, see the DevOps documentation.

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Ensure services are running
docker-compose ps

# If not running:
docker-compose up -d

# Check logs
docker-compose logs db
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change ports in .env
```

### Module Not Found
```bash
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

## 📋 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Create or modify code files
- Follow project conventions (see CLAUDE.md)
- Add/update tests

### 3. Test Locally
```bash
npm test
npm run lint
npm run format
```

### 4. Commit Changes
```bash
git add .
git commit -m "Clear description of what changed"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
# Then create a Pull Request on GitHub
```

## 🎓 Learning Resources

### Backend Development
- Express.js: https://expressjs.com
- TypeORM: https://typeorm.io
- TypeScript: https://www.typescriptlang.org

### Frontend Development
- React: https://react.dev
- Redux: https://redux.js.org
- TypeScript: https://www.typescriptlang.org

### Database
- PostgreSQL: https://www.postgresql.org
- Redis: https://redis.io

## 🤝 Contributing

### Before Starting
1. Read [CLAUDE.md](./CLAUDE.md) for project context
2. Read [docs/requirements.md](./docs/requirements.md) for what to build
3. Read [docs/architecture.md](./docs/architecture.md) for how to build it
4. Check existing code to follow patterns

### Code Standards
- Use TypeScript (strict mode)
- Write tests for new features
- Follow naming conventions
- Add comments for non-obvious logic
- Keep functions focused and small

### Submit Changes
1. Ensure tests pass: `npm test`
2. Ensure code is formatted: `npm run format`
3. Create descriptive commit messages
4. Create Pull Request with clear description

## 📞 Support

### Issues
- **Bug Report:** Create issue with error details and steps to reproduce
- **Feature Request:** Create issue describing the desired feature
- **Question:** Check documentation first, then ask in discussions

### Documentation
- All documentation in `/docs` directory
- API documentation in [docs/API.md](./docs/API.md)
- Setup guide in [docs/SETUP.md](./docs/SETUP.md)

## 📄 License

This project is proprietary software for [Company Name].

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Current)
- Material requests
- Vendor management
- Quote comparison
- PO generation & approval
- Basic audit trail

### 🔮 Phase 2: Tracking & Financial
- Delivery receipt verification
- Invoice matching (PO vs Delivery vs Invoice)
- Payment tracking and approval
- Advanced audit trail with document comparison

### 🔮 Phase 3: Analytics & Mobile
- Project-based cost analytics
- Vendor performance reporting
- Mobile app for site engineers (React Native)
- Real-time notifications
- Advanced search and filtering

## 📊 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ In Development | Core endpoints implemented |
| Frontend Dashboard | ✅ In Development | Request/Quote/PO pages |
| Database | ✅ Schema Ready | Migrations prepared |
| Authentication | ✅ JWT Ready | Login/logout implemented |
| Testing | 🔄 In Progress | Unit & integration tests |
| Documentation | ✅ Complete | Full API docs |
| Docker Setup | ✅ Ready | Local dev environment |

---

**Current Phase:** Foundation Phase MVP
**Last Updated:** 2026-02-06
**Version:** 0.1.0 (Development)

For detailed information, see [CLAUDE.md](./CLAUDE.md) and documentation in `/docs`.
