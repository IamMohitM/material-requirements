# MRMS Development Guidelines

## Code Standards

### TypeScript
- `strict: false` (pragmatic approach for ORM compatibility)
- `experimentalDecorators: true` (required for TypeORM)
- `emitDecoratorMetadata: true` (required for TypeORM)
- No `any` types without justification
- All errors must be properly typed

### Code Style
- 2-space indentation
- Clear variable names describing purpose
- Comments for non-obvious logic
- Maximum line length: 100 characters
- Use const by default, let only when needed

### File Organization
```
src/
├── config/        # Environment and framework setup
├── entities/      # Database entity definitions
├── middleware/    # Express middleware (auth, validation, error handling)
├── services/      # Business logic layer
├── routes/        # API endpoint handlers
├── types/         # Shared TypeScript interfaces
├── utils/         # Helper functions
└── migrations/    # Database schema migrations

tests/
├── unit/          # Service/utility tests
└── integration/   # API endpoint tests
```

## Git Workflow

### Branch Naming
```
feature/description       # New feature
bugfix/description        # Bug fix
refactor/description      # Code refactoring
docs/description          # Documentation
test/description          # Test improvements
```

### Commit Messages
```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Example:
```
feat: Add material consumption tracking endpoint

- Implement MaterialConsumption entity operations
- Add POST /materials/:id/consume endpoint
- Update AnalyticsService consumption calculations
```

## Database Development

### Creating Migrations

1. Create migration file:
```bash
npm run migrate:create -- --name "add_delivery_tracking"
```

2. Implement in migration file:
```typescript
export class AddDeliveryTracking1707000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tables, add columns, etc.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse changes
  }
}
```

3. Run migration:
```bash
npm run migrate
```

### Entity Relationships

Use TypeORM decorators:
```typescript
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @ManyToOne(() => Customer)
  customer: Customer;
}
```

### JSONB Columns

For flexible data structures:
```typescript
@Column({ type: 'jsonb' })
line_items: Array<{
  material_id: string;
  quantity: number;
  unit_price: number;
}>;
```

## Service Layer Development

### Pattern

Each service follows this structure:
```typescript
import { AppDataSource } from '@config/database';

export class XyzService {
  private repository = AppDataSource.getRepository(XyzEntity);

  async getAll(skip: number, take: number) {
    return this.repository.find({ skip, take });
  }

  async getById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: CreateXyzDto) {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: UpdateXyzDto) {
    await this.repository.update(id, data);
    return this.getById(id);
  }

  async delete(id: string) {
    return this.repository.update(id, { is_active: false });
  }
}

export const xyzService = new XyzService();
```

### Error Handling

Create custom errors:
```typescript
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

Use in services:
```typescript
if (!material) {
  throw new ValidationError('Material not found');
}
```

### Logging

Use Winston logger:
```typescript
import logger from '@utils/logger';

logger.info('Material created', { material_id, name });
logger.error('Database error', { error, context });
logger.warn('Deprecated endpoint used', { endpoint, user_id });
```

## API Route Development

### Pattern

```typescript
import express from 'express';
import { requireAuth } from '@middleware/auth';
import { validateBody } from '@middleware/validation';
import { asyncHandler } from '@utils/errors';

const router = express.Router();

router.post(
  '/materials',
  requireAuth,
  validateBody(createMaterialSchema),
  asyncHandler(async (req, res) => {
    const material = await materialService.create(req.body);
    res.status(201).json({
      success: true,
      data: material,
      error: null,
    });
  })
);

export default router;
```

### Response Format

Success:
```json
{
  "success": true,
  "data": { /* actual data */ },
  "error": null,
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

Error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Validation

Use Joi schemas:
```typescript
const createMaterialSchema = joi.object({
  name: joi.string().required(),
  unit_of_measure: joi.string().required(),
  category: joi.string().required(),
  specifications: joi.object().optional(),
});
```

## Testing

### Unit Tests (Services)

```typescript
describe('MaterialService', () => {
  let service: MaterialService;

  beforeEach(() => {
    service = new MaterialService();
  });

  describe('create', () => {
    it('should create material with valid data', async () => {
      const data = { name: 'Steel', unit_of_measure: 'kg' };
      const result = await service.create(data);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Steel');
    });

    it('should throw error for duplicate name', async () => {
      await service.create({ name: 'Steel', unit_of_measure: 'kg' });
      await expect(
        service.create({ name: 'Steel', unit_of_measure: 'kg' })
      ).rejects.toThrow();
    });
  });
});
```

### Integration Tests (API)

```typescript
describe('GET /api/v1/materials', () => {
  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/v1/materials');
    expect(res.status).toBe(401);
  });

  it('should return materials with valid token', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/materials')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeArray();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:coverage

# Specific file
npm test -- MaterialService.test.ts
```

## Docker Development

### Local Testing

```bash
# Start services
docker-compose up

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild image
docker-compose build api
```

### Common Issues

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database connection issues:**
```bash
# Check PostgreSQL is running
docker-compose ps db

# Connect to database
docker-compose exec db psql -U app -d mrms
```

**Clear Docker state:**
```bash
docker-compose down -v  # Removes volumes
docker system prune -a  # Cleans up unused images
```

## Module Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@config/*": ["src/config/*"],
      "@services/*": ["src/services/*"],
      "@entities/*": ["src/entities/*"],
      "@middleware/*": ["src/middleware/*"],
      "@routes/*": ["src/routes/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

**Important:** In entity files, use relative imports:
```typescript
// ✅ Good
import { Status } from '../types/index';

// ❌ Bad - causes import errors
import { Status } from '@types/index';
```

## Debugging

### VS Code

1. Add launch config to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "restart": true,
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

2. Set breakpoint and press F5

### Logs

```bash
# Real-time logs
docker-compose logs -f api

# Error logs
LOG_LEVEL=error npm start

# Debug logs
LOG_LEVEL=debug npm start
```

## Performance Tips

1. **Pagination:** Always limit query results
```typescript
router.get('/materials', async (req, res) => {
  const skip = (req.query.page || 0) * 20;
  const materials = await materialService.getAll(skip, 20);
  // ...
});
```

2. **Eager Loading:** Prevent N+1 queries
```typescript
const repo = AppDataSource.getRepository(Material);
const materials = await repo.find({
  relations: ['vendors'],  // Eagerly load relations
});
```

3. **Caching:** Use Redis for frequently accessed data
```typescript
const cacheKey = `materials:${id}`;
const cached = await redisClient.get(cacheKey);
if (cached) return JSON.parse(cached);
```

4. **Indexes:** Add indexes on frequently queried columns
```typescript
@Entity()
export class Material {
  @Index()
  @Column()
  name: string;
}
```

## Security

### Input Validation
Always validate user input:
```typescript
const schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});
```

### Password Hashing
Use bcrypt:
```typescript
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);
```

### JWT Tokens
Set appropriate expiry:
```typescript
const token = jwt.sign(payload, secret, { expiresIn: '24h' });
```

### Environment Variables
Never commit secrets:
```bash
# .env
JWT_SECRET=your-secret-here
DB_PASSWORD=secure-password
```

## Performance Monitoring

### Query Analysis
```bash
# Enable query logging in development
NODE_ENV=development npm start
```

Check logs for slow queries (>1000ms):
```
query: "SELECT ..." (took 1234ms)
```

### Database Monitoring
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000;

-- Get table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables;
```

## Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Migrations tested on clean database
- [ ] Environment variables documented
- [ ] Security audit completed
- [ ] Performance tested under load
- [ ] Documentation updated
- [ ] Changelog entry added
