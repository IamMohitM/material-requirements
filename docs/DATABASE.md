# MRMS Database Schema

## Overview

Material Requirements Management System uses PostgreSQL 15 with TypeORM for database access. All database changes are managed through migrations.

## Core Entities (8)

### 1. User
Represents system users with roles and project permissions
- `id`: UUID (PK)
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String
- `role`: Enum (site_engineer, approver, finance_officer, admin)
- `is_active`: Boolean
- `created_at`, `updated_at`: Timestamps

### 2. Project
Construction projects that require material management
- `id`: UUID (PK)
- `name`: String
- `description`: String
- `status`: Enum (active, paused, completed, archived)
- `budget`: Decimal
- `company_id`: String
- `created_by`: UUID (FK to User)
- `created_at`, `updated_at`: Timestamps

### 3. Material
Materials that can be requested for projects
- `id`: UUID (PK)
- `name`: String
- `unit_of_measure`: String (m, kg, nos, etc.)
- `category`: String
- `description`: String
- `specifications`: JSONB
- `is_active`: Boolean
- `created_at`, `updated_at`: Timestamps

### 4. Vendor
Suppliers of materials
- `id`: UUID (PK)
- `name`: String
- `contact_person`: String
- `email`: String
- `phone`: String
- `address`: JSONB
- `verification_status`: Enum (pending, verified, rejected)
- `is_active`: Boolean
- `created_at`, `updated_at`: Timestamps

### 5. Request
Material requests created by site engineers
- `id`: UUID (PK)
- `project_id`: UUID (FK)
- `requested_by`: UUID (FK to User)
- `status`: Enum (draft, submitted, approved, rejected)
- `line_items`: JSONB (array of material quantities)
- `notes`: String
- `created_at`, `updated_at`: Timestamps

### 6. Quote
Vendor quotes in response to material requests
- `id`: UUID (PK)
- `request_id`: UUID (FK)
- `vendor_id`: UUID (FK)
- `status`: Enum (sent, received, accepted, rejected)
- `validity_date`: Date
- `line_items`: JSONB (array with prices)
- `total_amount`: Decimal
- `created_at`, `updated_at`: Timestamps

### 7. PurchaseOrder
Official purchase orders sent to vendors
- `id`: UUID (PK)
- `quote_id`: UUID (FK)
- `vendor_id`: UUID (FK)
- `project_id`: UUID (FK)
- `po_number`: String (unique)
- `status`: Enum (draft, approved, sent, received, cancelled)
- `line_items`: JSONB
- `total_amount`: Decimal
- `approval_status`: Enum (pending, approved_level1, approved_level2, approved_final)
- `created_at`, `updated_at`: Timestamps

### 8. AuditLog
Immutable record of all system actions for compliance
- `id`: UUID (PK)
- `aggregate_id`: UUID
- `aggregate_type`: String (entity type)
- `event_type`: String (created, updated, deleted, etc.)
- `actor_id`: UUID (FK to User)
- `actor_role`: String
- `old_state`: JSONB
- `new_state`: JSONB
- `timestamp`: Timestamp
- `status`: Enum (success, failure)

## Foundation Phase Entities (8 new)

### 9. Delivery
Tracks batch deliveries of materials from vendors
- `id`: UUID (PK)
- `po_id`: UUID (FK)
- `delivery_number`: String
- `delivery_date`: Date
- `status`: Enum (partial, complete, pending)
- `received_by`: String
- `received_at`: Timestamp
- `location`: JSONB (GPS, address)
- `notes`: String

### 10. DeliveryLineItem
Individual items within a delivery
- `id`: UUID (PK)
- `delivery_id`: UUID (FK)
- `po_line_item_id`: UUID (references PO line items)
- `quantity_received`: Decimal
- `condition`: String (good, damaged)
- `brand_received`: String

### 11. Invoice
Vendor invoices for 3-way matching
- `id`: UUID (PK)
- `po_id`: UUID (FK)
- `vendor_id`: UUID (FK)
- `invoice_number`: String (unique)
- `invoice_date`: Date
- `due_date`: Date
- `total_amount`: Decimal
- `line_items`: JSONB
- `status`: Enum (submitted, matched, approved, rejected, paid)
- `matching_status`: Enum (unmatched, partial, fully_matched)

### 12. DiscrepancyLog
Tracks mismatches between PO, Delivery, and Invoice
- `id`: UUID (PK)
- `po_id`: UUID (FK)
- `delivery_id`: UUID (FK, nullable)
- `invoice_id`: UUID (FK, nullable)
- `type`: Enum (quantity_mismatch, price_mismatch, brand_mismatch, timing_mismatch)
- `severity`: Enum (critical, warning, info)
- `flagged_by`: UUID
- `flagged_at`: Timestamp
- `status`: Enum (open, reviewed, resolved, waived)

### 13. VendorRateHistory
Historical pricing from vendors for rate change tracking
- `id`: UUID (PK)
- `vendor_id`: UUID (FK)
- `material_id`: UUID (FK)
- `price_per_unit`: Decimal
- `effective_date`: Date
- `valid_until`: Date (nullable)
- `change_from_previous`: Decimal
- `percent_change`: Decimal

### 14. MaterialConsumption
Tracks actual material usage on projects
- `id`: UUID (PK)
- `project_id`: UUID (FK)
- `material_id`: UUID (FK)
- `consumed_quantity`: Decimal
- `consumption_date`: Date
- `consumed_from_delivery_id`: UUID (FK to Delivery)
- `consumed_by`: String
- `location`: JSONB

### 15. Brand
Material variants/brands
- `id`: UUID (PK)
- `material_id`: UUID (FK)
- `vendor_id`: UUID (FK)
- `brand_name`: String
- `specifications`: JSONB
- `cost_impact`: Decimal

### 16. POLineItemBrand
Brand selection per PO line item
- `id`: UUID (PK)
- `po_id`: UUID (FK)
- `material_id`: UUID (FK)
- `brand_id`: UUID (FK, nullable - initially unbranded)
- `selected_date`: Timestamp
- `selected_by`: UUID
- `confirmed_delivery_date`: Timestamp (nullable)

## Relationships

```
User (1) ──┬──→ (N) Request
           ├──→ (N) AuditLog (as actor)
           └──→ (N) Project (created_by)

Project (1) ──┬──→ (N) Request
              ├──→ (N) Material (catalog)
              ├──→ (N) MaterialConsumption
              └──→ (N) PurchaseOrder

Material (1) ──┬──→ (N) Request (line_items)
               ├──→ (N) Quote (line_items)
               ├──→ (N) PurchaseOrder (line_items)
               ├──→ (N) VendorRateHistory
               ├──→ (N) Brand
               ├──→ (N) POLineItemBrand
               └──→ (N) MaterialConsumption

Vendor (1) ──┬──→ (N) Quote
             ├──→ (N) PurchaseOrder
             ├──→ (N) Invoice
             ├──→ (N) VendorRateHistory
             └──→ (N) Brand

Request (1) ──┬──→ (N) Quote
              └──→ (1) PurchaseOrder

Quote (1) ──→ (1) PurchaseOrder

PurchaseOrder (1) ──┬──→ (N) Delivery
                    ├──→ (N) Invoice
                    ├──→ (N) DiscrepancyLog
                    └──→ (N) POLineItemBrand

Delivery (1) ──┬──→ (N) DeliveryLineItem
               ├──→ (N) DiscrepancyLog
               └──→ (N) MaterialConsumption
```

## Key Design Decisions

### Soft Deletes
All entities use `is_active` flag instead of hard DELETE to preserve audit trail.

### Immutable Audit Trail
AuditLog captures every change with old_state and new_state JSONB for full traceability.

### JSONB for Flexibility
Line items stored as JSONB to allow different structures without schema migration:
- Request line_items: `[{material_id, quantity, required_by}]`
- Quote line_items: `[{material_id, quantity, unit_price, gst_amount}]`
- PO line_items: `[{material_id, quantity, unit_price, gst_amount, total}]`

### 3-Way Matching Support
DiscrepancyLog enables flexible matching of PO → Delivery → Invoice with automatic detection of:
- Quantity mismatches
- Price changes
- Brand/specification changes
- Timing issues

### Brand Management
POLineItemBrand allows brand selection post-PO but pre-delivery, enabling:
- Initial PO with generic materials (no brand)
- Brand selection after vendor confirmation
- Change tracking before delivery confirmed
- Locking brand at delivery receipt

## Indexes

Critical indexes for performance:
- `project_id` on all project-related tables
- `vendor_id` on Vendor-related tables
- `status` on Request, Quote, PurchaseOrder, Invoice
- `request_id` on Quote
- `po_id` on Delivery, Invoice, DiscrepancyLog
- `material_id` on MaterialConsumption, VendorRateHistory
- `timestamp` on AuditLog

## Migrations

All database changes are version-controlled in `/backend/src/migrations/`. To run migrations:

```bash
# Development
npm run migrate

# Production (in Docker)
npm run migrate  # or included in startup

# Create new migration
npm run migrate:create -- --name "description"
```

## Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASSWORD=password
DB_NAME=mrms
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_SSL=false  # Set to 'true' for production with SSL
```

## Testing Database

Use the same PostgreSQL instance with a separate test database:
```
DB_NAME=mrms_test
```

See [SETUP.md](./SETUP.md) for database setup instructions.
