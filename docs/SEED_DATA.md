# Seed Data Management Guide

This guide explains how to manage, create, and customize seed data for the Material Requirements Management System.

## Quick Start

### Running the Default Seed Data

Load the pre-configured demo data:

```bash
cd backend
npm run seed
```

This creates:
- **4 Demo Users** (Admin, Site Engineer, Approver, Finance Officer)
- **3 Demo Projects** (Downtown Plaza, Riverside Apartments, Tech Park Office)
- **11 Demo Materials** (Cement, Steel, Aggregates, Masonry, Electrical)
- **5 Demo Vendors** (BuildRight Supplies, ConcreteMaster India, Steel Solutions, Premium Materials, QuickDeliver)
- **3 Demo Requests** (Draft, Submitted, Approved statuses)

### Default Login Credentials

```
Email: admin@demo.com
Password: demo123456

Other Demo Users:
- engineer@demo.com (Site Engineer)
- approver@demo.com (Approver)
- finance@demo.com (Finance Officer)
```

## How Seed Data Works

### File Location
```
backend/src/seeds/seed.ts
```

### Key Features
✅ **Idempotent** - Safe to run multiple times (checks for existing data)
✅ **Auto-retry** - Handles connection issues automatically
✅ **Organized Output** - Clear console logging of what was created
✅ **No Duplicates** - Skips data that already exists

## Creating Custom Seed Data

### Option 1: Modify the Existing Seed Script

Edit `backend/src/seeds/seed.ts` to customize data:

#### Add More Demo Users

Find the `demoUsers` array (around line 26) and add new users:

```typescript
const demoUsers = [
  {
    email: 'admin@demo.com',
    name: 'Admin Demo',
    role: UserRole.ADMIN,
    description: 'Full system access, user management, all features',
  },
  // Add your custom user here:
  {
    email: 'myuser@demo.com',
    name: 'My Custom User',
    role: UserRole.SITE_ENGINEER,
    description: 'Custom user for testing',
  },
];
```

#### Add More Projects

Find the `demoProjects` array (around line 90) and add new projects:

```typescript
const demoProjects = [
  {
    name: 'Downtown Plaza',
    description: 'Modern commercial development in downtown area',
    start_date: new Date('2026-01-15'),
    end_date: new Date('2026-12-31'),
    budget: 500000,
    status: ProjectStatus.ACTIVE,
  },
  // Add your custom project:
  {
    name: 'My Custom Project',
    description: 'Testing a new construction project',
    start_date: new Date('2026-03-01'),
    end_date: new Date('2026-09-30'),
    budget: 300000,
    status: ProjectStatus.ACTIVE,
  },
];
```

#### Add More Materials

Find the `demoMaterials` array (around line 140) and add new materials:

```typescript
const demoMaterials = [
  {
    material_code: 'MAT-CEMENT-001',
    name: 'Portland Cement 50kg',
    unit: 'bag',
    category: 'Concrete Materials',
    description: 'Standard Portland cement for concrete work',
  },
  // Add your custom material:
  {
    material_code: 'MAT-CUSTOM-001',
    name: 'My Custom Material',
    unit: 'piece',
    category: 'Custom Category',
    description: 'A custom material for testing',
  },
];
```

#### Add More Vendors

Find the `demoVendors` array (around line 249) and add new vendors:

```typescript
const demoVendors = [
  {
    name: 'BuildRight Supplies',
    contact_person: 'Rajesh Kumar',
    email: 'rajesh@buildright.com',
    phone: '+91-9876543210',
    address: JSON.stringify({
      street: '123 Industrial Area',
      city: 'Delhi',
      state: 'Delhi',
      zip: '110001',
    }),
  },
  // Add your custom vendor:
  {
    name: 'My Vendor Company',
    contact_person: 'John Doe',
    email: 'john@myvendor.com',
    phone: '+1-555-1234',
    address: JSON.stringify({
      street: '999 Business Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    }),
  },
];
```

#### Add More Requests

Find the `demoRequests` array (around line 342) and add new requests:

```typescript
const demoRequests = [
  {
    request_number: 'REQ-2026-001',
    project_id: projects[0].id,
    status: RequestStatus.DRAFT,
    materials: [
      { material_id: materialMap.get('MAT-CEMENT-001') || '', quantity: 100 },
      { material_id: materialMap.get('MAT-SAND-001') || '', quantity: 50 },
    ],
    submitted_by_id: engineerUser.id,
  },
  // Add your custom request:
  {
    request_number: 'REQ-2026-CUSTOM',
    project_id: projects[0].id,
    status: RequestStatus.DRAFT,
    materials: [
      { material_id: materialMap.get('MAT-CUSTOM-001') || '', quantity: 100 },
    ],
    submitted_by_id: engineerUser.id,
  },
];
```

### Option 2: Create a Custom Seed Script

Create a new seed file for specialized scenarios:

```bash
# Create a new seed script
touch backend/src/seeds/custom-seed.ts
```

Example template:

```typescript
import bcrypt from 'bcrypt';
import { AppDataSource, withDatabaseConnection } from '../config/database';
import { User, Project, Material, Vendor } from '../entities/index';
import { generateId } from '../utils/helpers';
import { UserRole, ProjectStatus } from '../types/index';

async function customSeed() {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database...');
      await AppDataSource.initialize();
    }

    await withDatabaseConnection(async () => {
      const userRepo = AppDataSource.getRepository(User);
      const projectRepo = AppDataSource.getRepository(Project);

      // Your custom seeding logic here
      const user = userRepo.create({
        id: generateId(),
        email: 'custom@test.com',
        name: 'Custom User',
        password_hash: await bcrypt.hash('password123', 10),
        role: UserRole.SITE_ENGINEER,
        is_active: true,
      });

      await userRepo.save(user);
      console.log('✓ Custom user created');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

customSeed();
```

Then add it to `package.json`:

```json
{
  "scripts": {
    "seed:custom": "ts-node src/seeds/custom-seed.ts"
  }
}
```

Run it:

```bash
npm run seed:custom
```

## Available Roles and Permissions

When creating users in seed data, use these roles:

| Role | Email Pattern | Permissions |
|------|---------------|-------------|
| `ADMIN` | `*@demo.com` | All features, user management |
| `SITE_ENGINEER` | `*@demo.com` | Create requests, view quotes/POs |
| `APPROVER` | `*@demo.com` | Approve requests and POs |
| `FINANCE_OFFICER` | `*@demo.com` | Manage vendors, invoices |

## Material Categories

Pre-defined categories for organizing materials:

- **Concrete Materials** - Cement, concrete mixes
- **Steel** - Rebar, steel plates, structural steel
- **Aggregates** - Sand, gravel, stone
- **Masonry** - Bricks, tiles, blocks
- **Finishing** - Paint, tiles, finishes
- **Electrical** - Wiring, cables, electrical materials
- **Plumbing** - Pipes, fittings, fixtures
- **Custom** - Your custom category

## Request Statuses

Available statuses for seeding requests:

- `DRAFT` - Not yet submitted
- `SUBMITTED` - Waiting for approval
- `APPROVED` - Approved by management
- `REJECTED` - Not approved
- `COMPLETED` - Delivery completed

## Project Statuses

Available statuses for seeding projects:

- `PLANNING` - In planning phase
- `ACTIVE` - Currently active
- `ON_HOLD` - Paused
- `COMPLETED` - Finished
- `CANCELLED` - Cancelled

## Tips for Effective Seed Data

### 1. Realistic Quantities
```typescript
// Good - realistic construction quantities
{ material_id: 'mat-1', quantity: 500 }  // kg
{ material_id: 'mat-2', quantity: 100 }  // bags
{ material_id: 'mat-3', quantity: 50 }   // cubic meters

// Avoid - unrealistic
{ material_id: 'mat-1', quantity: 1 }
```

### 2. Consistent Status Flow
```typescript
// Good workflow
REQ-001: DRAFT      (new request)
REQ-002: SUBMITTED  (waiting approval)
REQ-003: APPROVED   (ready for quotes)
REQ-004: COMPLETED  (delivered)

// Avoid - random status
REQ-001: APPROVED (no draft/submitted)
```

### 3. Realistic Project Dates
```typescript
// Good
start_date: new Date('2026-01-15')
end_date: new Date('2026-12-31')  // ~12 months

// Avoid
start_date: new Date('2026-01-01')
end_date: new Date('2026-01-02')  // too short
```

### 4. Material Codes Should Be Unique
```typescript
// Generate codes systematically
MAT-CEMENT-001    // Format: MAT-CATEGORY-NUMBER
MAT-CEMENT-002
MAT-STEEL-001
MAT-STEEL-002

// Auto-generation also works
// System generates MAT-xxxxx if you don't specify
```

## Resetting Seed Data

If you need to start fresh:

```bash
# Stop Docker
docker-compose down -v

# Start Docker fresh
docker-compose up

# Run seed again
npm run seed
```

This deletes all data and volumes, then re-seeds from scratch.

## Debugging Seed Issues

### Check Database Connection
```bash
# Connect to PostgreSQL directly
psql -h localhost -U app -d mrms

# List all tables
\dt

# Query a table
SELECT * FROM users;
```

### View Seed Logs
The seed script outputs progress. Check for:
- `(Already exists)` - Data wasn't created (already present)
- `✓` - Data was created successfully
- Error messages indicate connection issues

### Common Issues

**"role 'app' does not exist"**
```bash
# Make sure Docker is running
docker-compose up -d db

# Verify app user exists
docker-compose exec -T db psql -U postgres -d mrms -c "SELECT * FROM pg_user WHERE usename='app';"
```

**"Database connection error"**
```bash
# The seed script will auto-retry (up to 3 times)
# If it keeps failing, check Docker logs
docker-compose logs db
```

## Customizing for Your Needs

### For Testing Request Creation
Ensure you have:
- ✓ At least 1 project
- ✓ At least 5 materials
- ✓ At least 2 vendors
- ✓ 1 site engineer user (to submit requests)
- ✓ 1 approver user (to approve requests)

### For Testing Full Workflow
You need:
- ✓ Projects (ACTIVE status)
- ✓ Materials with realistic quantities
- ✓ Vendors with contact info
- ✓ Requests in all statuses (DRAFT → SUBMITTED → APPROVED)
- ✓ All user roles (Engineer → Approver → Finance)

### For Performance Testing
Create large datasets:

```typescript
// Generate 100 materials
const materials = [];
for (let i = 1; i <= 100; i++) {
  materials.push({
    material_code: `MAT-PERF-${String(i).padStart(3, '0')}`,
    name: `Performance Test Material ${i}`,
    unit: 'piece',
    category: 'Testing',
    description: `Material for performance testing`,
  });
}
```

## Next Steps

1. **Run the default seed**: `npm run seed`
2. **Test request creation** in the frontend
3. **Customize the data** for your scenarios
4. **Create specialized seeds** for different test cases
5. **Document your seed patterns** for your team

## Questions?

Refer to:
- `/docs/API.md` - API documentation
- `/docs/DATABASE.md` - Database schema
- `/docs/DEVELOPMENT.md` - Development guidelines

---

**Last Updated:** 2026-02-09
**Version:** 1.0.0
