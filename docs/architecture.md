# Material Requirements Management System - Architecture

## System Overview

The MRMS is a comprehensive material procurement platform that manages the complete lifecycle from request creation through delivery, invoice matching, and analytics. The architecture is designed to handle flexible batch deliveries, multi-level approvals, brand variant selection, and complete discrepancy tracking.

### High-Level Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                             │
│  Dashboard | Requests | Quotes | POs | Deliveries | Invoices   │
│              Analytics | Mobile Approvals                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  API Gateway (Express)                           │
│  Auth Middleware | Validation | Error Handling | Audit Logging  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              Service Layer (TypeScript/TypeORM)                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Procurement │  │  Fulfillment │  │  Analytics   │           │
│  │  Services    │  │  Services    │  │  Services    │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ ProjectSvc  │  │ DeliverySvc  │  │ AnalyticsSvc │           │
│  │ MaterialSvc │  │ InvoiceSvc   │  │              │           │
│  │ VendorSvc   │  │ Discrepancy  │  │              │           │
│  │ QuoteSvc    │  │ Svc          │  │              │           │
│  │ POSvc       │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Cross-Cutting Services                                  │   │
│  │  AuditService | AuthService | BrandService              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│           Data & Infrastructure Layer                            │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   PostgreSQL    │  │    Redis     │  │  File Storage   │    │
│  │   (Persistent)  │  │   (Cache)    │  │   (S3/MinIO)    │    │
│  └─────────────────┘  └──────────────┘  └─────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

## Database Design

### Entity Relationship Diagram (ERD)

```
User ─────┐
          │
          ├─→ Project
          │      ├─→ Request
          │      │      ├─→ Quote
          │      │      │   └─→ PurchaseOrder
          │      │      │       └─→ Delivery
          │      │      │           └─→ DeliveryLineItem
          │      │      │
          │      │      └─→ MaterialConsumption
          │      │
          │      └─→ Material
          │              ├─→ Brand
          │              └─→ VendorRateHistory
          │
          ├─→ Vendor
          │   └─→ VendorRateHistory
          │
          └─→ AuditLog

Invoice ─→ PurchaseOrder
        ├─→ Delivery
        └─→ DiscrepancyLog

POLineItemBrand ─→ PurchaseOrder (brand selection per PO)
```

### Core Entities

#### 1. **User**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique
- `password_hash` (VARCHAR)
- `first_name`, `last_name` (VARCHAR)
- `role` (ENUM) - site_engineer, approver, finance_officer, admin
- `project_id` (UUID, FK) - Project assignment
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)
- `last_login` (TIMESTAMP)

#### 2. **Project**
- `id` (UUID) - Primary key
- `project_number` (VARCHAR) - Unique
- `name` (VARCHAR)
- `location` (VARCHAR)
- `budget` (NUMERIC) - Total project budget
- `spent_amount` (NUMERIC) - Calculated from POs
- `status` (ENUM) - active, on_hold, completed
- `start_date`, `end_date` (DATE)
- `owner_id` (UUID, FK) - User
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** project_number, status, owner_id

#### 3. **Material**
- `id` (UUID) - Primary key
- `material_code` (VARCHAR) - Unique
- `name` (VARCHAR)
- `category` (VARCHAR)
- `unit_of_measure` (VARCHAR) - kg, liter, piece, etc.
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** material_code, category

#### 4. **Vendor**
- `id` (UUID) - Primary key
- `vendor_code` (VARCHAR) - Unique
- `name` (VARCHAR)
- `contact_person` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `payment_terms` (VARCHAR) - Net 30, 2/10, etc.
- `rating` (NUMERIC) - 1-5 average from transactions
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** vendor_code, is_active

#### 5. **Request**
- `id` (UUID) - Primary key
- `request_number` (VARCHAR) - Unique
- `project_id` (UUID, FK)
- `requester_id` (UUID, FK) - User
- `description` (TEXT)
- `required_delivery_date` (DATE)
- `line_items` (JSONB) - [{material_id, quantity, specifications}]
- `status` (ENUM) - draft, submitted, approved, rejected, converted_to_po, cancelled
- `approval_chain` (JSONB) - [{approver_id, action, timestamp, comments}]
- `comments` (TEXT)
- `requested_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** project_id, status, requester_id, created_at

#### 6. **Quote**
- `id` (UUID) - Primary key
- `quote_number` (VARCHAR) - Unique
- `request_id` (UUID, FK)
- `vendor_id` (UUID, FK)
- `quote_date` (DATE)
- `valid_until` (DATE)
- `line_items` (JSONB) - [{material_id, quantity, unit_price, total}]
- `total_amount` (NUMERIC)
- `delivery_time_days` (INTEGER)
- `status` (ENUM) - sent, received, accepted, rejected, expired
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** request_id, vendor_id, status

#### 7. **PurchaseOrder**
- `id` (UUID) - Primary key
- `po_number` (VARCHAR) - Unique
- `project_id` (UUID, FK)
- `request_id` (UUID, FK)
- `vendor_id` (UUID, FK)
- `quote_id` (UUID, FK)
- `order_date` (DATE)
- `required_delivery_date` (DATE)
- `status` (ENUM) - draft, sent, acknowledged, partially_received, fully_received, cancelled
- `total_amount` (NUMERIC)
- `line_items` (JSONB) - [{material_id, quantity, unit_price, total, brand_id (nullable)}]
- `approval_status` (ENUM) - pending, approved, rejected
- `approval_chain` (JSONB) - [{approver_id, approval_limit, action, timestamp}]
- `delivery_address` (JSONB)
- `special_instructions` (TEXT)
- `is_signed` (BOOLEAN)
- `signature_url` (VARCHAR)
- `created_by` (UUID, FK) - User
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** po_number, project_id, vendor_id, status, approval_status, created_at

#### 8. **Delivery** (NEW)
- `id` (UUID) - Primary key
- `delivery_number` (VARCHAR) - Unique per PO
- `po_id` (UUID, FK)
- `delivery_date` (DATE)
- `received_by_id` (UUID, FK) - User
- `received_at` (TIMESTAMP)
- `status` (ENUM) - partial, complete
- `delivery_location` (JSONB) - {address, gps_coords, site_location}
- `notes` (TEXT)
- `photos` (JSONB) - [{url, description, uploaded_at}]
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** po_id, delivery_date, status

#### 9. **DeliveryLineItem** (NEW)
- `id` (UUID) - Primary key
- `delivery_id` (UUID, FK)
- `po_line_item_id` (VARCHAR) - Reference to line in PO
- `material_id` (UUID, FK)
- `quantity_ordered` (NUMERIC)
- `quantity_received` (NUMERIC)
- `condition` (ENUM) - good, damaged, partial_damage
- `brand_received` (VARCHAR) - Actual brand/variant delivered
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- **Index:** delivery_id, material_id

#### 10. **Invoice** (NEW)
- `id` (UUID) - Primary key
- `invoice_number` (VARCHAR) - Unique
- `po_id` (UUID, FK)
- `vendor_id` (UUID, FK)
- `invoice_date` (DATE)
- `due_date` (DATE)
- `total_amount` (NUMERIC)
- `line_items` (JSONB) - [{material_code, quantity, unit_price, total}]
- `status` (ENUM) - submitted, matched, approved, rejected, paid
- `matching_status` (ENUM) - unmatched, partial_matched, fully_matched
- `matched_delivery_id` (UUID, FK, nullable)
- `notes` (TEXT)
- `submitted_by_id` (UUID, FK) - User
- `submitted_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** po_id, vendor_id, invoice_number, status, matching_status

#### 11. **DiscrepancyLog** (NEW)
- `id` (UUID) - Primary key
- `po_id` (UUID, FK)
- `delivery_id` (UUID, FK, nullable)
- `invoice_id` (UUID, FK, nullable)
- `type` (ENUM) - quantity_mismatch, price_mismatch, brand_mismatch, timing_mismatch
- `severity` (ENUM) - critical, warning, info
- `description` (TEXT)
- `flagged_by_id` (UUID, FK) - User who discovered it
- `flagged_at` (TIMESTAMP)
- `status` (ENUM) - open, reviewed, resolved, waived
- `resolution_notes` (TEXT)
- `resolved_by_id` (UUID, FK, nullable)
- `resolved_at` (TIMESTAMP, nullable)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** po_id, status, severity, type

#### 12. **VendorRateHistory** (NEW)
- `id` (UUID) - Primary key
- `vendor_id` (UUID, FK)
- `material_id` (UUID, FK)
- `price_per_unit` (NUMERIC)
- `effective_date` (DATE)
- `valid_until` (DATE, nullable)
- `change_from_previous` (NUMERIC)
- `percent_change` (NUMERIC)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- **Index:** vendor_id, material_id, effective_date

#### 13. **MaterialConsumption** (NEW)
- `id` (UUID) - Primary key
- `project_id` (UUID, FK)
- `material_id` (UUID, FK)
- `delivery_id` (UUID, FK) - Which delivery this was consumed from
- `consumed_quantity` (NUMERIC)
- `consumption_date` (DATE)
- `consumed_by_id` (UUID, FK) - User/team that consumed
- `location` (VARCHAR) - Site location reference
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- **Index:** project_id, material_id, consumption_date

#### 14. **Brand** (NEW)
- `id` (UUID) - Primary key
- `material_id` (UUID, FK)
- `vendor_id` (UUID, FK)
- `brand_name` (VARCHAR)
- `specifications` (JSONB) - Brand-specific details
- `cost_impact` (NUMERIC) - Price difference from base material
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** material_id, vendor_id

#### 15. **POLineItemBrand** (NEW)
- `id` (UUID) - Primary key
- `po_id` (UUID, FK)
- `material_id` (UUID, FK)
- `brand_id` (UUID, FK, nullable) - NULL = unbranded/TBD
- `selected_date` (TIMESTAMP, nullable)
- `selected_by_id` (UUID, FK, nullable)
- `confirmed_delivery_date` (DATE, nullable) - When brand locked in
- `created_at`, `updated_at` (TIMESTAMP)
- **Index:** po_id, material_id

#### 16. **AuditLog**
- `id` (UUID) - Primary key
- `user_id` (UUID, FK)
- `action` (VARCHAR) - create, update, delete, approve, reject
- `entity_type` (VARCHAR) - Request, Quote, PO, Delivery, Invoice, etc.
- `entity_id` (UUID)
- `changes` (JSONB) - {before: {}, after: {}}
- `ip_address` (VARCHAR)
- `user_agent` (VARCHAR)
- `timestamp` (TIMESTAMP)
- **Index:** entity_id, entity_type, user_id, timestamp

## Service Architecture

### Service Layer Organization

```
┌─────────────────────────────────────────────────────────────┐
│                   Request/API Layer                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐  ┌───▼──────┐  ┌───▼───────┐
│ Procurement  │  │Fulfillment│  │ Analytics │
│  Services    │  │ Services  │  │ Services  │
└───────┬──────┘  └───┬──────┘  └───┬───────┘
        │             │             │
        │             │             │
┌───────┴─────────────┼─────────────┴────────┐
│                     │                      │
│   Core Services (Cross-cutting)            │
│   • AuditService      • AuthService        │
│   • BrandService      • ValidationService  │
└──────────────────────┴──────────────────────┘
```

### Service Responsibilities

#### Procurement Services

**ProjectService**
- CRUD for projects
- Budget tracking (total vs spent)
- Project status management
- Material catalog per project

**MaterialService**
- CRUD for materials
- Category management
- Material search and filtering
- Historical cost tracking
- Consumption aggregation

**VendorService**
- CRUD for vendors
- Vendor profile management
- Performance rating calculation
- Rate history queries
- Active/inactive management

**QuoteService**
- Send quote requests to vendors
- Receive and store quotes
- Quote comparison (side-by-side, with historical rates)
- Quote status tracking (sent, received, accepted, rejected, expired)
- Auto-expiration handling

**POService**
- Generate PO from quote
- PO number generation
- Multi-level approval routing
- Brand selection/change tracking
- PO document generation (PDF export)
- PO status transitions
- Vendor communication (email templates)

#### Fulfillment Services

**DeliveryService**
- Create delivery records
- Batch/partial delivery handling
- Validate delivery against PO
- Track delivery location (GPS)
- Receipt document generation
- Multi-item delivery coordination
- Status tracking (partial, complete)

**InvoiceService**
- Create invoice from vendor submission
- Parse invoice line items
- 3-way matching logic (PO-Delivery-Invoice)
- Match quantities, prices, brands
- Detect discrepancies
- Invoice status workflow
- Payment integration (Phase 2)

**DiscrepancyService**
- Log discrepancies with categorization
- Type detection (quantity, price, brand, timing)
- Severity assignment
- Discrepancy resolution tracking
- Alert generation for critical issues
- Discrepancy reporting and analytics

#### Analytics Services

**AnalyticsService**
- Per-project cost analysis
  - Budget vs Actual spend
  - Cost trends over time
  - Material consumption by type
  - Vendor breakdown and performance
- Cross-project analytics
  - Company-wide spending trends
  - Vendor performance comparisons
  - Cost per material across projects
  - Budget utilization rates
- Aggregation queries with caching
- Report generation

#### Cross-Cutting Services

**AuditService**
- Log all CRUD operations
- Track approval workflows
- Generate audit reports
- Compliance reporting
- Change history queries

**AuthService**
- JWT token generation/validation
- Role-based access control (RBAC)
- Permission checking
- Login/logout
- Token refresh

**BrandService** (NEW)
- Brand CRUD
- Brand assignment to materials
- Brand cost impact calculations
- Variant tracking
- Brand change management in POs

## Key Algorithms

### 1. Three-Way Matching (PO-Delivery-Invoice)

```typescript
async function performThreeWayMatch(
  poId: string,
  deliveryId: string,
  invoiceId: string
): Promise<MatchResult> {
  const po = await POService.getPO(poId);
  const delivery = await DeliveryService.getDelivery(deliveryId);
  const invoice = await InvoiceService.getInvoice(invoiceId);

  const discrepancies: Discrepancy[] = [];

  // 1. Check PO line items exist
  for (const lineItem of po.line_items) {
    // Check delivery has this item
    const deliveryItem = delivery.items.find(
      (d) => d.material_id === lineItem.material_id
    );

    if (!deliveryItem) {
      discrepancies.push({
        type: 'quantity_mismatch',
        severity: 'critical',
        description: `Material ${lineItem.material_id} ordered but not delivered`,
      });
      continue;
    }

    // Check invoice has this item
    const invoiceItem = invoice.line_items.find(
      (i) => i.material_code === lineItem.material_code
    );

    if (!invoiceItem) {
      discrepancies.push({
        type: 'quantity_mismatch',
        severity: 'warning',
        description: `Material ${lineItem.material_id} delivered but not invoiced`,
      });
      continue;
    }

    // 2. Quantity Match
    if (deliveryItem.quantity_received !== invoiceItem.quantity) {
      discrepancies.push({
        type: 'quantity_mismatch',
        severity: invoiceItem.quantity > deliveryItem.quantity_received
          ? 'critical'
          : 'warning',
        description: `Quantity mismatch: Ordered ${lineItem.quantity},
          Delivered ${deliveryItem.quantity_received},
          Invoiced ${invoiceItem.quantity}`,
      });
    }

    // 3. Price Match
    const priceVariance = Math.abs(
      invoiceItem.unit_price - lineItem.unit_price
    ) / lineItem.unit_price;

    if (priceVariance > PRICE_VARIANCE_THRESHOLD) {
      discrepancies.push({
        type: 'price_mismatch',
        severity: 'warning',
        description: `Price variance ${(priceVariance * 100).toFixed(2)}%
          Quoted ${lineItem.unit_price}, Invoiced ${invoiceItem.unit_price}`,
      });
    }

    // 4. Brand Match
    if (deliveryItem.brand_received !== lineItem.brand_id) {
      discrepancies.push({
        type: 'brand_mismatch',
        severity: 'info', // Brands can change post-PO
        description: `Brand mismatch: Ordered ${lineItem.brand_id},
          Received ${deliveryItem.brand_received}`,
      });
    }
  }

  // 5. Timing Checks
  if (invoice.invoice_date < delivery.delivery_date) {
    discrepancies.push({
      type: 'timing_mismatch',
      severity: 'critical',
      description: 'Invoice dated before delivery',
    });
  }

  // Log all discrepancies
  for (const discrepancy of discrepancies) {
    await DiscrepancyService.logDiscrepancy({
      po_id: poId,
      delivery_id: deliveryId,
      invoice_id: invoiceId,
      ...discrepancy,
    });
  }

  return {
    matched: discrepancies.length === 0,
    discrepancies,
    invoice_status: discrepancies.some((d) => d.severity === 'critical')
      ? InvoiceStatus.REJECTED
      : InvoiceStatus.MATCHED,
  };
}
```

### 2. Batch/Partial Delivery Handling

```typescript
async function createDelivery(
  poId: string,
  deliveryItems: DeliveryLineItemInput[],
  receivedBy: string,
  location: DeliveryLocation
): Promise<Delivery> {
  const po = await POService.getPO(poId);

  // Validate each item against PO
  const deliveryRecords: DeliveryLineItem[] = [];

  for (const item of deliveryItems) {
    const poLineItem = po.line_items.find(
      (l) => l.material_id === item.material_id
    );

    if (!poLineItem) {
      throw new ValidationError(
        `Material ${item.material_id} not in PO`
      );
    }

    // Get previously delivered quantity
    const previousDeliveries = await getDeliveries(poId);
    const previousQuantity = previousDeliveries.reduce(
      (sum, d) => sum + (d.items.find(
        (i) => i.material_id === item.material_id
      )?.quantity_received || 0),
      0
    );

    const newTotalQuantity = previousQuantity + item.quantity_received;

    if (newTotalQuantity > poLineItem.quantity) {
      throw new ValidationError(
        `Cannot receive ${item.quantity_received} units of
         ${item.material_id}. Already received ${previousQuantity},
         PO total is ${poLineItem.quantity}`
      );
    }

    deliveryRecords.push({
      po_line_item_id: poLineItem.id,
      material_id: item.material_id,
      quantity_ordered: poLineItem.quantity,
      quantity_received: item.quantity_received,
      brand_received: item.brand_received,
      condition: item.condition,
    });
  }

  // Create delivery record
  const delivery = await AppDataSource.getRepository(Delivery).save({
    id: generateId(),
    po_id: poId,
    delivery_number: await generateDeliveryNumber(poId),
    received_by_id: receivedBy,
    received_at: new Date(),
    delivery_date: new Date(),
    status: isFullyReceived(deliveryRecords, po)
      ? DeliveryStatus.COMPLETE
      : DeliveryStatus.PARTIAL,
    delivery_location: location,
    line_items: deliveryRecords,
  });

  // Update PO status
  await updatePOStatus(poId);

  return delivery;
}

function isFullyReceived(
  deliveryRecords: DeliveryLineItem[],
  po: PurchaseOrder
): boolean {
  for (const poItem of po.line_items) {
    const deliveryItem = deliveryRecords.find(
      (d) => d.material_id === poItem.material_id
    );

    if (!deliveryItem || deliveryItem.quantity_received < poItem.quantity) {
      return false;
    }
  }
  return true;
}
```

### 3. Brand Selection & Change Management

**Pre-Delivery Brand Selection**:
- PO created with brand_id = null (unbranded/TBD)
- POLineItemBrand entity tracks which brand will be used
- Brand can be selected any time before delivery
- If brand changes after delivery confirmed, generates brand_mismatch discrepancy

```typescript
async function selectBrandForPOLineItem(
  poId: string,
  materialId: string,
  brandId: string,
  selectedBy: string
): Promise<POLineItemBrand> {
  const po = await POService.getPO(poId);

  // Check if PO already has partial/full delivery
  const deliveries = await getDeliveries(poId);
  const hasDelivery = deliveries.some(
    (d) => d.line_items.some((li) => li.material_id === materialId)
  );

  const poLineBrand = await AppDataSource.getRepository(POLineItemBrand).save({
    po_id: poId,
    material_id: materialId,
    brand_id: brandId,
    selected_date: new Date(),
    selected_by_id: selectedBy,
    confirmed_delivery_date: hasDelivery ? new Date() : null,
  });

  // Update PO line item with new brand
  po.line_items = po.line_items.map((item) =>
    item.material_id === materialId
      ? { ...item, brand_id: brandId }
      : item
  );

  await POService.updatePO(poId, { line_items: po.line_items });

  return poLineBrand;
}
```

### 4. Rate Change Detection & Alerts

```typescript
async function checkVendorRateChanges(
  vendorId: string,
  materialId: string,
  currentPrice: number
): Promise<RateChangeAlert | null> {
  const rateHistory = await VendorService.getRateHistory(
    vendorId,
    materialId,
    { limit: 2 }
  );

  if (rateHistory.length < 2) {
    return null; // First quote
  }

  const previousRate = rateHistory[1];
  const priceChange = currentPrice - previousRate.price_per_unit;
  const percentChange = (priceChange / previousRate.price_per_unit) * 100;

  if (Math.abs(percentChange) > RATE_CHANGE_THRESHOLD_PERCENT) {
    return {
      severity: percentChange > 0 ? 'warning' : 'info',
      message: `Vendor ${vendorId} changed price for ${materialId}
        by ${percentChange.toFixed(2)}% (was ${previousRate.price_per_unit},
        now ${currentPrice})`,
      previous_rate: previousRate.price_per_unit,
      current_rate: currentPrice,
      percent_change: percentChange,
    };
  }

  return null;
}
```

### 5. Material Consumption Aggregation

```typescript
async function getProjectMaterialConsumption(
  projectId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    materialId?: string;
  }
): Promise<MaterialConsumptionSummary[]> {
  const query = AppDataSource.getRepository(MaterialConsumption)
    .createQueryBuilder('consumption')
    .where('consumption.project_id = :projectId', { projectId })
    .leftJoinAndSelect(
      'consumption.material',
      'material'
    );

  if (filters?.startDate) {
    query.andWhere('consumption.consumption_date >= :startDate', {
      startDate: filters.startDate,
    });
  }

  if (filters?.endDate) {
    query.andWhere('consumption.consumption_date <= :endDate', {
      endDate: filters.endDate,
    });
  }

  if (filters?.materialId) {
    query.andWhere('consumption.material_id = :materialId', {
      materialId: filters.materialId,
    });
  }

  const consumptions = await query.getMany();

  // Aggregate by material
  const aggregated = new Map<string, MaterialConsumptionSummary>();

  for (const consumption of consumptions) {
    const key = consumption.material_id;
    const existing = aggregated.get(key) || {
      material_id: consumption.material_id,
      material_name: consumption.material.name,
      total_consumed: 0,
      unit_of_measure: consumption.material.unit_of_measure,
      consumption_records: [],
    };

    existing.total_consumed += consumption.consumed_quantity;
    existing.consumption_records.push(consumption);

    aggregated.set(key, existing);
  }

  return Array.from(aggregated.values());
}
```

## API Design

### Resource Endpoints

#### Projects
```
GET    /api/v1/projects                    # List all projects
POST   /api/v1/projects                    # Create project
GET    /api/v1/projects/:projectId         # Get project
PUT    /api/v1/projects/:projectId         # Update project
DELETE /api/v1/projects/:projectId         # Soft delete project
```

#### Materials
```
GET    /api/v1/materials                   # List materials
POST   /api/v1/materials                   # Create material
GET    /api/v1/materials/:materialId       # Get material
PUT    /api/v1/materials/:materialId       # Update material
```

#### Vendors
```
GET    /api/v1/vendors                     # List vendors
POST   /api/v1/vendors                     # Create vendor
GET    /api/v1/vendors/:vendorId           # Get vendor
PUT    /api/v1/vendors/:vendorId           # Update vendor
GET    /api/v1/vendors/:vendorId/rate-history  # Get vendor rate history
```

#### Requests
```
GET    /api/v1/requests                    # List requests
POST   /api/v1/requests                    # Create request
GET    /api/v1/requests/:requestId         # Get request
PUT    /api/v1/requests/:requestId         # Update request
DELETE /api/v1/requests/:requestId         # Delete request (draft only)
POST   /api/v1/requests/:requestId/submit  # Submit for approval
POST   /api/v1/requests/:requestId/approve # Approve request
POST   /api/v1/requests/:requestId/reject  # Reject request
```

#### Quotes
```
GET    /api/v1/quotes                      # List quotes
POST   /api/v1/quotes                      # Create quote request
GET    /api/v1/quotes/:quoteId             # Get quote
PUT    /api/v1/quotes/:quoteId             # Update quote
POST   /api/v1/quotes/:quoteId/accept      # Accept quote
POST   /api/v1/quotes/:quoteId/reject      # Reject quote
```

#### Purchase Orders
```
GET    /api/v1/pos                         # List POs
POST   /api/v1/pos                         # Create PO
GET    /api/v1/pos/:poId                   # Get PO
PUT    /api/v1/pos/:poId                   # Update PO
POST   /api/v1/pos/:poId/submit            # Submit for approval
POST   /api/v1/pos/:poId/approve           # Approve PO
POST   /api/v1/pos/:poId/reject            # Reject PO
POST   /api/v1/pos/:poId/brands/:materialId  # Select brand for line item
PUT    /api/v1/pos/:poId/brands/:materialId  # Change brand for line item
GET    /api/v1/pos/:poId/pdf               # Export PO as PDF
```

#### Deliveries (NEW)
```
GET    /api/v1/deliveries                  # List deliveries
POST   /api/v1/deliveries                  # Create delivery
GET    /api/v1/deliveries/:deliveryId      # Get delivery
PUT    /api/v1/deliveries/:deliveryId      # Update delivery
GET    /api/v1/pos/:poId/deliveries        # Get deliveries for PO
GET    /api/v1/deliveries/:deliveryId/receipt  # Export receipt
```

#### Invoices (NEW)
```
GET    /api/v1/invoices                    # List invoices
POST   /api/v1/invoices                    # Submit invoice
GET    /api/v1/invoices/:invoiceId         # Get invoice
PUT    /api/v1/invoices/:invoiceId         # Update invoice
POST   /api/v1/invoices/:invoiceId/match   # Trigger 3-way match
POST   /api/v1/invoices/:invoiceId/approve # Approve matched invoice
POST   /api/v1/invoices/:invoiceId/reject  # Reject invoice
GET    /api/v1/pos/:poId/invoices          # Get invoices for PO
```

#### Discrepancies (NEW)
```
GET    /api/v1/discrepancies               # List discrepancies
GET    /api/v1/discrepancies/:discrepancyId  # Get discrepancy
PUT    /api/v1/discrepancies/:discrepancyId  # Update discrepancy
POST   /api/v1/discrepancies/:discrepancyId/resolve  # Mark as resolved
GET    /api/v1/pos/:poId/discrepancies     # Get discrepancies for PO
```

#### Brands (NEW)
```
GET    /api/v1/brands                      # List brands
POST   /api/v1/brands                      # Create brand
GET    /api/v1/brands/:brandId             # Get brand
PUT    /api/v1/brands/:brandId             # Update brand
GET    /api/v1/materials/:materialId/brands  # Get brands for material
```

#### Material Consumption (NEW)
```
GET    /api/v1/material-consumption        # List consumption records
POST   /api/v1/material-consumption        # Record consumption
GET    /api/v1/projects/:projectId/consumption  # Get consumption for project
GET    /api/v1/projects/:projectId/consumption-summary  # Aggregated summary
```

#### Analytics (NEW)
```
GET    /api/v1/analytics/projects/:projectId/dashboard     # Project dashboard
GET    /api/v1/analytics/projects/:projectId/budget        # Budget analysis
GET    /api/v1/analytics/projects/:projectId/materials     # Material costs
GET    /api/v1/analytics/projects/:projectId/vendors       # Vendor performance
GET    /api/v1/analytics/cross-project/spending            # Company spending
GET    /api/v1/analytics/cross-project/vendor-performance  # Vendor comparisons
```

## Mobile Approval Flow

Mobile users (iOS/Android) access approvals through:
1. **Responsive Web Design**: React components work on mobile browsers
2. **Future Native App**: React Native (shares business logic with web)

**Mobile Approval Features**:
```
GET    /api/v1/approvals                   # Get pending approvals for user
GET    /api/v1/approvals/:itemId           # Get approval details
POST   /api/v1/approvals/:itemId/approve   # Submit approval with signature
POST   /api/v1/approvals/:itemId/reject    # Submit rejection with reason
```

**Mobile-Optimized Responses**:
- Compact JSON payloads
- Signature capture (canvas → base64)
- Offline-first data caching (IndexedDB)
- Push notifications for new approvals

## Audit Trail

Every mutation is logged:

```typescript
async function auditAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  before: any,
  after: any,
  context: RequestContext
) {
  await AuditService.log({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    changes: { before, after },
    ip_address: context.ip,
    user_agent: context.userAgent,
    timestamp: new Date(),
  });
}
```

**Audited Events**:
- Request created, updated, submitted, approved, rejected
- Quote received, accepted, rejected
- PO created, approved, rejected, sent
- Delivery received, partially received
- Invoice submitted, matched, approved, rejected
- Discrepancy logged, resolved
- Brand selected, changed
- Material consumed

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": [
      {
        "field": "quantity",
        "message": "Must be greater than 0"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Business logic conflict (e.g., PO already received)
- `INTERNAL_ERROR` - Server error

## Performance Considerations

### Database Indexes
- Foreign keys (project_id, vendor_id, user_id)
- Frequently filtered columns (status, created_at, is_active)
- Search columns (po_number, request_number, invoice_number)

### Caching Strategy
- Redis for:
  - User permissions (30 min TTL)
  - Material catalog (24h TTL)
  - Vendor rates (12h TTL)
  - Analytics aggregates (1h TTL)

### Query Optimization
- Use eager loading for related entities
- Paginate large result sets (default 20/page)
- Index on (project_id, status, created_at) for fast filtering
- Use database partitioning for large tables (by project_id)

## Security

### Authentication
- JWT tokens with 24h expiration
- Refresh tokens with 30d expiration
- Bcrypt password hashing

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions (user can only see own project)
- Approval limits by role

### Data Protection
- Validate all inputs with joi schemas
- Escape/parameterize all DB queries (TypeORM)
- No sensitive data in logs
- HTTPS in production
- CORS configured per environment

## Implementation Roadmap

See `/docs/requirements.md` for detailed 8-week Foundation Phase timeline with prioritized features across 4 tiers.

---

**Last Updated:** 2026-02-06
**Status:** Foundation Phase Architecture
**Maintainer:** Development Team
