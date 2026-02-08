# MRMS Demo Accounts for Testing

## Overview

Demo user accounts have been created for testing the MRMS application with different user roles. All accounts share the same password for simplicity during development/testing.

## Demo Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@demo.com | demo123456 | Full system access, user management, all features |
| **Site Engineer** | engineer@demo.com | demo123456 | Create material requests, view quotes and POs |
| **Approver** | approver@demo.com | demo123456 | Review and approve material requests |
| **Finance Officer** | finance@demo.com | demo123456 | Manage vendors, invoices, procurement oversight |

## How to Test

### Step 1: Start the Application
```bash
docker-compose up -d
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
```

### Step 2: Login with Demo Credentials
1. Go to http://localhost:3001 (frontend)
2. You should be redirected to login page
3. Use any of the demo credentials above
4. Click "Login"

### Step 3: Test Role-Based Workflows

#### Admin (admin@demo.com)
- Access all features
- User management (when implemented)
- System configuration
- Full procurement oversight

#### Site Engineer (engineer@demo.com)
- Create material requests
- View and submit requests
- Monitor request status
- View quotes and POs
- **Primary workflow:** Request Creation → Quote → PO

#### Approver (approver@demo.com)
- Review pending requests
- Approve or reject requests
- View approval history
- **Primary workflow:** Request Approval

#### Finance Officer (finance@demo.com)
- Manage vendor database
- View vendor rates and history
- Manage invoices
- Oversight of procurement
- **Primary workflow:** Vendor Management → Invoice Matching

## Known Issues

### Authentication Flow Issue
**Problem:** Login endpoint currently returns internal server error
**Root Cause:** Database driver connection timing issue
**Status:** Under investigation
**Workaround:** Will be resolved in next update

**Debugging Steps Being Taken:**
1. Verified demo users are in database ✓
2. Verified bcrypt password hashing ✓
3. Investigating database connection pooling
4. Checking TypeORM entity/database schema alignment

## Database Schema

Demo users are stored in the `users` table with the following key columns:
- `id` (UUID) - Unique identifier
- `email` (VARCHAR) - Login email
- `name` (VARCHAR) - Display name
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `role` (user_role enum) - Site role
- `is_active` (BOOLEAN) - Active status (all are true)
- `project_ids` (UUID[]) - Associated projects

## Resetting Demo Accounts

To reset the demo accounts (if needed):

```bash
# Connect to the database
docker exec -it mrms-db psql -U app -d mrms

# Delete all users
DELETE FROM users;

# Run the seed script again
docker exec mrms-api npm run seed
```

## Future Enhancements

When the authentication issue is resolved:
1. Test complete workflows for each role
2. Verify permission-based feature access
3. Create real test data (projects, materials, vendors)
4. Document specific role workflows
5. Create role-based UI behavior tests

## Frontend Status

**Current Implementation:** Phase 1 Complete
- ✅ Request management (create, list, view)
- ✅ Vendor management (create, list, view)
- ✅ Dashboard with navigation
- ⚠️ Login/authentication (pending fix)
- 🔄 Role-based access control (pending)
- 🔄 Approval workflows (pending)

## API Endpoints for Testing

### Authentication
- `POST /api/v1/auth/login` - Login (currently broken)
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/change-password` - Change password

### Requests
- `GET /api/v1/requests` - List all requests
- `POST /api/v1/requests` - Create request
- `GET /api/v1/requests/:id` - Get request details
- `PUT /api/v1/requests/:id` - Update request
- `POST /api/v1/requests/:id/approve` - Approve request
- `POST /api/v1/requests/:id/reject` - Reject request

### Vendors
- `GET /api/v1/vendors` - List all vendors
- `POST /api/v1/vendors` - Create vendor
- `GET /api/v1/vendors/:id` - Get vendor details
- `PUT /api/v1/vendors/:id` - Update vendor
- `GET /api/v1/vendors/:id/rate-history` - Get rate history

## Contact & Support

For authentication issues or test account problems, document the issue and current status in artifacts folder for coordination between team members.

---

**Created:** February 8, 2026
**Status:** Demo accounts ready, auth flow pending fix
**Next Steps:** Resolve login endpoint, complete role-based access testing
