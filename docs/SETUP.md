# Development Setup Guide

## System Requirements

- **Node.js:** 18+ (LTS recommended)
- **npm:** 9+ or yarn
- **Docker & Docker Compose:** For local PostgreSQL, Redis, and MinIO
- **Git:** For version control

## Initial Setup (First Time)

### 1. Clone Repository
```bash
git clone <repository-url>
cd material-requirements
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Setup Environment Files

**Create `.env` file in project root:**
```bash
cp .env.example .env
```

Edit `.env` with your local settings (defaults work for Docker setup):
```
NODE_ENV=development
API_PORT=3000
DB_HOST=localhost  # or 'db' if running in Docker
DB_PORT=5432
DB_USER=app
DB_PASSWORD=password
DB_NAME=mrms
REDIS_HOST=localhost  # or 'redis' if running in Docker
REDIS_PORT=6379
JWT_SECRET=dev-secret-key-change-in-production
```

### 4. Start Services with Docker

```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Services:**
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`
- **MinIO:** `localhost:9000` (admin/admin)

### 5. Run Database Migrations

```bash
cd backend
npm run migrate
```

This creates all database tables based on TypeORM entities.

### 6. Seed Test Data (Optional)

```bash
npm run seed
```

This creates:
- Admin user (`admin@company.com` / `password123`)
- Sample project
- Materials and vendors for testing

### 7. Start Applications

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

Expected output:
```
✓ Database connection established
╔════════════════════════════════════╗
║   API Server Started               ║
║   Port: 3000                       ║
║   URL: http://localhost:3000       ║
╚════════════════════════════════════╝
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

Opens automatically at `http://localhost:3001`

### 8. Login

- **URL:** http://localhost:3001
- **Email:** admin@company.com
- **Password:** password123

## Docker Compose Detailed Setup

### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Database Management

**Connect to PostgreSQL:**
```bash
docker-compose exec db psql -U app -d mrms
```

Useful commands:
```sql
-- List all tables
\dt

-- View users table
SELECT * FROM users;

-- Reset database (careful!)
DROP DATABASE mrms;
CREATE DATABASE mrms;
```

**Connect to Redis:**
```bash
docker-compose exec redis redis-cli

# View all keys
KEYS *

# Clear all data (development only!)
FLUSHALL
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart db
docker-compose restart backend

# Stop all
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes (nuclear option)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If you get "Address already in use" error:

**Kill process on port:**
```bash
# MacOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Or change ports in .env:**
```
API_PORT=3001
```

### Database Connection Error

```bash
# Verify database is running
docker-compose ps

# Check if PostgreSQL is healthy
docker-compose logs db

# Restart database
docker-compose restart db

# Check connection string in .env
# Should be: DB_HOST=localhost (if local) or DB_HOST=db (if Docker)
```

### Dependencies Not Installed

```bash
# Clear node_modules
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# Or with Docker
docker-compose down
docker system prune -a
docker-compose up --build
```

### Migration Issues

```bash
# View migrations
npm run migrate:list

# Revert last migration
npm run migrate:revert

# Generate migration from entities
npm run migrate:create

# Run migrations manually
npm run migrate
```

### React App Won't Start

```bash
# Clear React cache
cd frontend
rm -rf node_modules .cache
npm install
npm start
```

## Development Workflow

### Making Code Changes

1. **Backend Changes:**
   - Edit files in `backend/src/`
   - App auto-reloads (npm run dev)
   - Check console for errors

2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - App auto-reloads (npm start)
   - Check browser console for errors

3. **Database Schema Changes:**
   - Modify entity file in `backend/src/entities/`
   - Create migration: `npm run migrate:create`
   - Edit migration file with SQL
   - Run: `npm run migrate`

### Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Frontend tests
cd ../frontend
npm test
```

### Code Quality

```bash
# Backend
cd backend
npm run lint          # Check code style
npm run lint:fix      # Fix issues automatically
npm run format        # Format code

# Frontend
cd frontend
npm run lint
npm run format
npm run typecheck     # Check TypeScript
```

## Database Backup/Restore

### Backup Database

```bash
# Dump database
docker-compose exec db pg_dump -U app -d mrms > backup.sql

# Backup to file
pg_dump -h localhost -U app -d mrms > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# From dump
docker-compose exec -T db psql -U app -d mrms < backup.sql
```

## Useful Resources

- **Node.js Docs:** https://nodejs.org/en/docs/
- **Express:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **React:** https://react.dev
- **Redux:** https://redux.js.org/
- **Docker:** https://docs.docker.com/

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Check CLAUDE.md for project guidelines
3. Check existing code for patterns
4. Review API documentation
5. Ask team members

## Next Steps

1. Understand the codebase:
   - Read CLAUDE.md
   - Review docs/requirements.md
   - Review docs/architecture.md

2. Make your first change:
   - Pick a simple feature
   - Write tests
   - Implement feature
   - Verify tests pass

3. Create pull request:
   - Clear commit messages
   - Tests passing
   - Code formatted
   - Documentation updated
