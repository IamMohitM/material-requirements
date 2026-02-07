# MRMS Backend API

Material Requirements Management System - Node.js/Express REST API

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example ../.env

# Run migrations
npm run migrate

# Seed test data
npm run seed

# Start development
npm run dev
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm test` | Run test suite |
| `npm run lint` | Check code style |
| `npm run format` | Format code with Prettier |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed test data |

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── entities/        # TypeORM entities
├── services/        # Business logic
├── routes/          # API routes
├── utils/           # Utilities & helpers
├── types/           # TypeScript types
├── migrations/      # Database migrations
├── seeds/           # Test data
└── app.ts           # Express app setup
```

## Database

- **Type:** PostgreSQL
- **ORM:** TypeORM
- **Migrations:** Located in `src/migrations/`

### Useful Commands

```bash
# Connect to database
docker-compose exec db psql -U app -d mrms

# List tables
\dt

# Exit
\q
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Debugging

```bash
# Debug with Node inspector
npm run debug

# Then open chrome://inspect in Chrome
```

## API Documentation

See `docs/API.md` for complete API reference.

## Key Features

- ✅ JWT authentication
- ✅ Role-based access control
- ✅ TypeORM with migrations
- ✅ Error handling
- ✅ Input validation
- ✅ Audit logging
- ✅ CORS support
- ✅ Async error handling

## Adding New Endpoints

1. **Create entity** in `src/entities/`
2. **Create service** in `src/services/`
3. **Create routes** in `src/routes/`
4. **Create migration** for database schema
5. **Write tests** in `tests/`
6. **Add to app.ts** in routes registration

## Environment Variables

See `.env.example` for all available variables.

Key ones:
- `NODE_ENV` - development/production
- `API_PORT` - Port to run on
- `DB_*` - Database connection
- `JWT_SECRET` - Secret for token signing
- `REDIS_*` - Redis connection

## Dependencies

- **express** - Web framework
- **typeorm** - ORM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT tokens
- **joi** - Input validation
- **winston** - Logging
- **redis** - Caching/sessions

## Development Tips

- Check logs: `docker-compose logs -f backend`
- Test endpoint: Use REST Client VS Code extension
- Database: pgAdmin at http://localhost:5050 (if setup)
- API docs: Swagger/OpenAPI coming in Phase 2

## Common Issues

**"Port 3000 already in use"**
- Change `API_PORT` in `.env`
- Or kill process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill`

**"Database connection refused"**
- Ensure PostgreSQL is running: `docker-compose up -d db`
- Check connection string in `.env`

**"Cannot find module"**
- Reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. Read CLAUDE.md for project guidelines
2. Check docs/requirements.md for what needs building
3. Check docs/architecture.md for design patterns
4. Implement additional services (Vendor, Quote, PO)
5. Add comprehensive tests
6. Add API documentation (Swagger)

## Support

- Check CLAUDE.md for project context
- Check docs/ for documentation
- Review existing code for patterns
- Check logs for errors

---

**Phase:** Foundation MVP
**Status:** In Development
**Last Updated:** 2026-02-06
