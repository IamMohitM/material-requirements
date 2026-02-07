# Tier 2 Requirements - Delivery Tracking & Invoice Matching

**Foundation Phase | Tier 2 | Implementation Weeks 3-4**

## Overview

Tier 2 implements the critical fulfillment and invoice validation workflows that connect procurement (Tier 1) to payment and consumption (Tiers 3-4). This tier enables:

- **Delivery Receipt & Batch Tracking** (Story 8): Record physical material receipt with quality tracking
- **Invoice Matching & 3-Way Reconciliation** (Story 9): Automatic matching of PO → Delivery → Invoice with discrepancy detection
- **Discrepancy Management**: Auto-logging and resolution of mismatches

## User Stories with Acceptance Criteria

### Story 8: Delivery Receipt & Batch Tracking

**As a** site engineer / logistics coordinator
**I want to** record physical receipt of materials with quality and condition tracking
**So that** we have proof of delivery and can identify issues immediately

#### Delivery Creation
- [ ] Create delivery record linked to specific PO (required field)
- [ ] Specify: delivery date, received quantity per material, condition (good/damaged), receiving person, location
- [ ] System validates: received qty ≤ ordered qty per material
- [ ] System generates unique delivery number (format: DL-YYYY-MM-DDNNN)
- [ ] Delivery date cannot be before PO order date
- [ ] Mark delivery as PARTIAL (more expected) or COMPLETE (final)
- [ ] Completed delivery updates PO status to DELIVERED (if all items received)

#### Batch/Multiple Deliveries
- [ ] Support multiple deliveries per PO (cumulative tracking)
- [ ] System tracks cumulative quantities: cannot exceed PO quantity
- [ ] View delivery history for any PO (list with dates, quantities, status)
- [ ] PO delivery status progression: Pending → Partially Received → Fully Received
- [ ] Error if user attempts over-receipt (clear message with quantities)

#### Quality & Condition Tracking
- [ ] For each material, specify condition: "good" or "damaged"
- [ ] Specify quantity for each condition (e.g., 95 good, 5 damaged from 100 units)
- [ ] Calculate quality score: good_units / total_units (e.g., 95%)
- [ ] Damaged items tracked separately (key for discrepancy detection)
- [ ] Can add damage notes per material (e.g., "Corner damage on 5 units")

#### Brand/Specification Capture
- [ ] Can record actual brand received (vs. ordered brand)
- [ ] Optional field: received brand vs. ordered brand
- [ ] If brand differs, system flags for discrepancy logging
- [ ] Can capture variant/SKU received (for substitution tracking)
- [ ] Notes field for supply chain observations

#### Location & Receipt Documentation
- [ ] Specify delivery location: site address or coordinates
- [ ] Receiving person name/ID captured (linked to User for audit)
- [ ] Can attach photos/documentation
- [ ] Receipt notes: transport condition, packaging, special handling
- [ ] Records exact receipt timestamp (not just date)

#### Delivery Status Workflow
- [ ] Statuses: PENDING → PARTIAL → COMPLETE
- [ ] Can edit delivery in PENDING status only
- [ ] Cannot edit after PARTIAL/COMPLETE (audit lock)
- [ ] Transition confirmation prevents accidental status changes
- [ ] Auto-triggers matching with pending invoices

#### Discrepancy Detection (Integration)
- [ ] Auto-flags quantity mismatches: delivered < ordered
- [ ] Auto-flags quality issues: damaged_qty > 0 (INFO discrepancy)
- [ ] Auto-flags brand mismatches: received_brand ≠ ordered_brand
- [ ] Critical discrepancies block invoice approval

### Story 9: Invoice Submission & Three-Way Matching

**As a** finance officer / accounts payable specialist
**I want to** receive and validate vendor invoices against PO and Delivery records
**So that** we can approve payments confidently and detect errors/fraud

#### Invoice Submission
- [ ] Create invoice with: number, date, due date, vendor, total amount
- [ ] Invoice number must be unique (prevents duplicates)
- [ ] Link to PO (required)
- [ ] Line items: material_id, quantity, unit_price, total_amount
- [ ] Total auto-calculated from line items (with validation)
- [ ] Can attach invoice document (PDF/image)
- [ ] Records submission date/time and submitting user
- [ ] Due date ≥ invoice date (validation)

#### Initial Validation
- [ ] Cannot create invoice for CANCELLED PO
- [ ] Cannot create invoice for incomplete PO (status < DELIVERED)
- [ ] Validates invoice total = sum of line items
- [ ] Detects duplicate invoice numbers
- [ ] Validates line items match materials on PO

#### Three-Way Matching (4 Dimensions)

**Dimension 1: Quantity Match**
- [ ] Compare: PO qty vs. Delivery qty vs. Invoice qty (per material)
- [ ] FULL MATCH: Delivered = Invoiced
- [ ] PARTIAL MATCH: Invoiced < Delivered (early invoice for partial delivery)
- [ ] UNDER-RECEIPT: Invoiced > Delivered (error: invoiced before receiving)
- [ ] Tolerance: default 0% (no variance allowed for quantity)

**Dimension 2: Price Match**
- [ ] Compare: Invoice unit price vs. PO unit price
- [ ] Calculate variance: ((invoice_price - po_price) / po_price) * 100
- [ ] Tolerance: default 5% (allow minor price adjustments)
- [ ] Price variance display: "Expected: $100, Invoice: $105, Variance: +5%"

**Dimension 3: Brand/Specification Match**
- [ ] Compare: Received brand vs. Ordered brand vs. Invoiced brand
- [ ] If PO brand = "unbranded" and delivery has brand: No discrepancy
- [ ] If brands differ: WARNING discrepancy (substitution noted)
- [ ] Invoice must show brand used (audit trail)

**Dimension 4: Timing Match**
- [ ] Check: Invoice date vs. Delivery date
- [ ] NORMAL: Invoice date ≥ delivery date
- [ ] EARLY INVOICE: Invoice before delivery = CRITICAL (blocks payment)
- [ ] LATE INVOICE: > 60 days after delivery = INFO (flag for review)

#### Match Status Determination
- [ ] **UNMATCHED**: Just created, no matching performed yet
- [ ] **PARTIAL_MATCHED**: Some materials/deliveries matched, others pending
- [ ] **FULLY_MATCHED**: All dimensions within tolerance, timing valid
- [ ] **MISMATCHED**: Critical discrepancies exist (payment blocked)

#### Discrepancy Auto-Logging
System automatically logs:

| Type | Condition | Severity |
|------|-----------|----------|
| QUANTITY_MISMATCH | qty_invoiced > qty_delivered | CRITICAL |
| QUANTITY_MISMATCH | qty_invoiced < qty_delivered | WARNING |
| QUALITY_ISSUE | damaged_qty > 0 in delivery | INFO |
| BRAND_MISMATCH | received_brand ≠ ordered_brand | WARNING |
| PRICE_MISMATCH | price variance > tolerance | WARNING |
| TIMING_MISMATCH | invoice before delivery | CRITICAL |

Each discrepancy includes:
- Type, Severity, Description (auto-generated)
- PO ID, Delivery ID, Invoice ID (for context)
- Flagged timestamp and source (System vs. User)

#### Invoice Approval Workflow
- [ ] Finance reviews matched invoice with discrepancies
- [ ] Critical discrepancies must be resolved before approval
- [ ] Warning discrepancies approved with acknowledgment
- [ ] Can add approval comments
- [ ] Can APPROVE (forward to payment) or REJECT (return to vendor)
- [ ] Approval captures: timestamp, approver

**Approval Rules:**
- [ ] CRITICAL discrepancies = Block approval
- [ ] WARNING discrepancies = Allow with comment (acknowledge risk)
- [ ] INFO discrepancies = No block

#### Rejection & Re-matching
- [ ] Can reject with reason (Quantity, Price, Damage, Other)
- [ ] Rejected invoices available for vendor resubmission
- [ ] New deliveries trigger re-matching on all related invoices
- [ ] Manual re-matching option available
- [ ] Maintains audit trail: "Invoice matched 3 times, results updated"

#### Discrepancy Management
- [ ] Can mark discrepancy REVIEWED (acknowledged)
- [ ] Can RESOLVE (correction made) or WAIVE (approved as-is)
- [ ] Resolution includes notes
- [ ] Waiver requires approver signature (audit trail)

#### Invoice Status & Transitions
```
SUBMITTED
    ↓
MATCHED/UNMATCHED/MISMATCHED
    ↓
APPROVED → PAID (Phase 2)
    OR
REJECTED → (Vendor corrects) → SUBMITTED
```

#### Reporting & Analytics
- [ ] View all open discrepancies across project
- [ ] Filter by: type, severity, status
- [ ] Dashboard: "Critical discrepancies requiring action"
- [ ] Metrics: Discrepancy rate by vendor, average resolution time
- [ ] Export discrepancy reports

#### Audit & Data Security
- [ ] All changes logged to AuditLog
- [ ] Cannot edit approved invoices (immutable)
- [ ] Can edit invoices in SUBMITTED/REJECTED status only
- [ ] Discrepancy resolution logged with: user, timestamp, change, reason

## Real-World Scenarios

### Scenario 1: Progressive Delivery
- PO: 500 units ordered
- Delivery 1: 200 units (Jan 20)
- Delivery 2: 150 units (Feb 3)
- Invoice 1: 200 units (Feb 1) → Invoices for Delivery 1 only
- Result: PARTIAL_MATCHED status, awaits Delivery 2 invoice

### Scenario 2: Quality Issue
- Delivery: 100 units, 12 damaged
- Quality score: 88%
- Invoice: 100 units (full)
- Result: INFO discrepancy logged, finance approves with credit for 12 units

### Scenario 3: Brand Substitution
- PO: Brand A (unavailable)
- Delivery: Brand B (approved substitute)
- Invoice: Brand B pricing (-$50/unit cost savings)
- Result: WARNING discrepancy, finance approves with variance noted

### Scenario 4: Invoice Before Delivery
- Invoice submitted Jan 10
- Delivery received Jan 20
- Result: CRITICAL discrepancy, invoice approval blocked until delivery confirmed

### Scenario 5: Price Variance
- PO: $100/unit
- Invoice: $105/unit (+5% variance)
- Result: WARNING discrepancy (within 5% tolerance), finance approves

## Data Models

### Delivery
```typescript
{
  id: UUID
  po_id: UUID (FK to PurchaseOrder)
  delivery_number: string (DL-YYYY-MM-DDNNN)
  delivery_date: Date
  received_timestamp: DateTime
  receiving_person_id: UUID (FK to User)
  location: string
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE'

  line_items: {
    material_id: UUID
    quantity_ordered: number
    quantity_good: number
    quantity_damaged: number
    damage_notes: string
    brand_received: string | null
    brand_ordered: string | null
  }[]

  notes: string
  attachments: {
    file_url: string
    file_type: 'photo' | 'document'
  }[]

  created_at: DateTime
  updated_at: DateTime
}
```

### Invoice
```typescript
{
  id: UUID
  invoice_number: string (unique)
  po_id: UUID (FK to PurchaseOrder)
  vendor_id: UUID (FK to Vendor)
  invoice_date: Date
  due_date: Date
  total_amount: Decimal
  status: 'SUBMITTED' | 'MATCHED' | 'UNMATCHED' | 'MISMATCHED' | 'APPROVED' | 'REJECTED' | 'PAID'

  line_items: {
    material_id: UUID
    quantity: number
    unit_price: Decimal
    amount: Decimal
    brand_invoiced: string | null
  }[]

  document_url: string | null
  submitted_by_id: UUID (FK to User)
  submitted_at: DateTime

  approved_by_id: UUID | null (FK to User)
  approved_at: DateTime | null
  approval_notes: string | null

  match_status: 'UNMATCHED' | 'PARTIAL_MATCHED' | 'FULLY_MATCHED' | 'MISMATCHED'
  match_analysis: {
    matched_deliveries: UUID[]
    unmatched_qty: number
    matched_qty: number
  }

  created_at: DateTime
  updated_at: DateTime
}
```

### DiscrepancyLog
```typescript
{
  id: UUID
  type: 'QUANTITY_MISMATCH' | 'PRICE_MISMATCH' | 'BRAND_MISMATCH' | 'TIMING_MISMATCH' | 'QUALITY_ISSUE'
  severity: 'CRITICAL' | 'WARNING' | 'INFO'

  po_id: UUID (FK to PurchaseOrder)
  delivery_id: UUID | null (FK to Delivery)
  invoice_id: UUID | null (FK to Invoice)

  description: string
  details: {
    expected_value: any
    actual_value: any
    variance: number | null
    variance_percentage: number | null
  }

  status: 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'WAIVED'

  reviewed_by_id: UUID | null (FK to User)
  reviewed_at: DateTime | null

  resolved_by_id: UUID | null (FK to User)
  resolved_at: DateTime | null
  resolution_notes: string | null

  waived_by_id: UUID | null (FK to User)
  waived_at: DateTime | null
  waiver_notes: string | null

  flagged_by_id: UUID (FK to User) - who created/logged
  flagged_at: DateTime

  created_at: DateTime
  updated_at: DateTime
}
```

## API Endpoints (15 total)

### Delivery Endpoints (7)
- `POST /deliveries` - Create delivery
- `GET /deliveries` - List all deliveries (filterable)
- `GET /deliveries/:id` - Get delivery detail
- `PUT /deliveries/:id` - Update delivery (PENDING status only)
- `DELETE /deliveries/:id` - Delete delivery (PENDING status only)
- `POST /deliveries/:id/complete` - Mark delivery as COMPLETE
- `GET /pos/:poId/deliveries` - List deliveries for PO

### Invoice Endpoints (8)
- `POST /invoices` - Submit invoice
- `GET /invoices` - List all invoices (filterable)
- `GET /invoices/:id` - Get invoice detail
- `PUT /invoices/:id` - Update invoice (SUBMITTED/REJECTED status only)
- `DELETE /invoices/:id` - Delete invoice (SUBMITTED status only)
- `POST /invoices/:id/match` - Trigger 3-way matching analysis
- `POST /invoices/:id/approve` - Approve invoice for payment
- `POST /invoices/:id/reject` - Reject invoice (return to vendor)

### Discrepancy Endpoints (Leverages existing - no new routes)
- Uses existing DiscrepancyService endpoints (from architecture)
- `GET /discrepancies` - List all (filterable by project, status, severity)
- `POST /discrepancies/:id/resolve` - Resolve discrepancy
- `POST /discrepancies/:id/waive` - Waive discrepancy with approval

## Success Criteria

### Functional
- [ ] 100% of Story 8 & 9 acceptance criteria implemented
- [ ] All 4 discrepancy types detected automatically
- [ ] 3-way matching operational: PO vs Delivery vs Invoice
- [ ] Partial invoice matching works for multi-delivery scenarios
- [ ] Discrepancies auto-logged with correct severity levels

### Quality
- [ ] 80%+ test coverage of matching logic
- [ ] 50+ integration test cases (delivery + invoice workflows)
- [ ] All edge cases handled (see below)
- [ ] Audit trail captures all state changes

### Performance
- [ ] Matching analysis: < 5 seconds for 100-item PO
- [ ] Delivery creation: < 1 second
- [ ] Invoice submission: < 2 seconds
- [ ] List queries: < 2 seconds for 1000 records

### Integration
- [ ] Deliveries link correctly to POs
- [ ] Invoices link correctly to POs + Deliveries
- [ ] Discrepancies link correctly to all three
- [ ] Audit trail entries created for all changes

## Edge Cases

1. **Over-Receipt Attempt** → Block with error message
2. **Duplicate Invoice** → Reject with error
3. **Partial Invoice (Multi-Delivery)** → PARTIAL_MATCHED status, support
4. **Invoice Before Delivery** → CRITICAL discrepancy, block approval
5. **Missing Delivery Date** → Reject with validation error
6. **Brand Changed Post-Delivery** → Log discrepancy if invoice brand differs
7. **Invoice Amount ≠ Line Items Sum** → Flag with tolerance check
8. **Material on Invoice Not on PO** → Block, flag error
9. **Quality Score Calculation** → Handle 0/0 case (0 units delivered)
10. **Price Variance > Tolerance** → Log WARNING, allow approval with comment

## Out of Scope (Phase 2+)

- Vendor email notifications
- SMS alerts for discrepancies
- Electronic signature on receipts
- PDF generation (basic export for Tier 2)
- Machine learning for anomaly detection
- Vendor portal for invoice submission

---

**Status:** Requirements Approved by PM
**Next:** System Architect review and technical design
**Target Implementation:** Week 3-4 of Foundation Phase
