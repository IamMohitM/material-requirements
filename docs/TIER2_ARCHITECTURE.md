# Tier 2 Technical Architecture - Delivery Tracking & Invoice Matching

**Date:** 2026-02-07
**Architect:** System Architecture Review
**Status:** Approved for Implementation

## Executive Summary

This document provides the comprehensive technical architecture for Tier 2 implementation, including:

1. **3-Way Matching Algorithm** - 4-dimensional validation (Quantity, Price, Brand, Timing)
2. **Database Optimization** - Strategic indexing and performance targeting
3. **Service Layer Design** - Three new services with 40+ methods
4. **API Structure** - 15 new REST endpoints
5. **Performance Requirements** - Sub-5-second matching for 100-item POs
6. **Production-Ready Patterns** - Audit integration, data integrity, error handling

## Key Architecture Decisions

### 1. Three-Way Matching (4 Dimensions)

The matching engine validates PO ↔ Delivery ↔ Invoice across:

| Dimension | Comparison | Tolerance | Severity Model |
|-----------|-----------|-----------|-----------------|
| **Quantity** | Invoiced vs. Delivered | 0% (exact) | CRITICAL if over-invoiced |
| **Price** | Invoice unit price vs. PO price | 5% (default) | WARNING if variance exceeds |
| **Brand/Spec** | Received vs. Ordered vs. Invoiced | 0% (exact) | WARNING if substitution |
| **Timing** | Invoice date vs. Delivery date | < 30 days normal | CRITICAL if invoice before delivery |

### 2. Discrepancy Auto-Logging

Five discrepancy types automatically logged:

```
QUANTITY_MISMATCH (CRITICAL if invoiced > delivered)
PRICE_MISMATCH (WARNING if variance > tolerance)
BRAND_MISMATCH (WARNING if substitution unplanned)
TIMING_MISMATCH (CRITICAL if invoice before delivery)
QUALITY_ISSUE (INFO if damaged units exist)
```

### 3. JSONB Storage for Flexibility

**Decision:** Store line_items as JSONB arrays in Delivery, Invoice, PurchaseOrder

**Rationale:**
- Line items structure varies across entities (delivery has quality, invoice has prices)
- No joins needed for line item queries (performance)
- PostgreSQL JSONB supports WHERE clauses on nested fields
- Trade-off: Not fully normalized but acceptable for construction domain

### 4. Materialized Views for Analytics

**Decision:** Use materialized views for delivery_summary and invoice_match_summary

**Rationale:**
- Matching algorithm requires fast aggregates (total delivered qty per material)
- Views refresh automatically after delivery/invoice changes
- Balances freshness with query performance

### 5. Service Layer Pattern (Singleton)

**Decision:** Three new services exported from services/index.ts

- **DeliveryService** - Delivery creation, quantity tracking, quality calculation
- **InvoiceService** - Invoice submission, approval workflow, matching orchestration
- **DiscrepancyService** - Auto-logging, resolution, reporting

All follow existing pattern: repository access → business logic → audit logging

## Database Schema Enhancements

### Delivery Entity - Enhanced Line Items

```typescript
line_items: [{
  po_line_item_id: string;
  material_id: string;
  quantity_ordered: number;        // From PO reference
  quantity_good: number;            // Good condition units
  quantity_damaged: number;         // Damaged condition units
  damage_notes?: string;            // Description of damage
  brand_received?: string;          // Actual brand delivered
  brand_ordered?: string;           // Expected brand (from PO)
  quality_score?: number;           // (good / total) * 100
}]
```

### Invoice Entity - Enhanced Line Items

```typescript
line_items: [{
  material_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  brand_invoiced?: string;          // Brand shown on invoice
  brand_received?: string;          // From matching delivery
  brand_ordered?: string;           // From PO
  variance_info?: {
    price_variance_pct: number;
    qty_variance: number;
    brand_match_status: string;
  }
}]

// New tracking fields
approved_by_id?: string;
approved_at?: Date;
approval_notes?: string;
match_analysis: {
  matched_deliveries: string[];
  matched_qty: number;
  unmatched_qty: number;
  discrepancy_count: number;
  critical_count: number;
  warning_count: number;
}
```

### Strategic Indexes

```sql
-- Critical for performance
CREATE INDEX idx_delivery_po_id_delivery_date
  ON deliveries(po_id, delivery_date DESC);

CREATE INDEX idx_invoice_po_id_status
  ON invoices(po_id, status, matching_status);

CREATE INDEX idx_discrepancy_po_id_invoice_id
  ON discrepancies(po_id, invoice_id, status, severity);

CREATE INDEX idx_po_line_items_material_id
  ON purchase_orders USING GIN (line_items -> 'material_id');
```

## Service Layer Signatures

### DeliveryService (8 public methods)

```typescript
class DeliveryService {
  async createDelivery(params: DeliveryCreateParams): Promise<Delivery>
  async getDeliveryById(id: string): Promise<Delivery>
  async getDeliveriesByPO(po_id: string, options?: PaginationOptions): Promise<Paginated<Delivery>>
  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery>
  async deleteDelivery(id: string): Promise<void>
  async completeDelivery(id: string, completed_by_id: string): Promise<Delivery>
  async triggerInvoiceReMatching(po_id: string): Promise<void>
  private getCumulativeQtyDelivered(po_id: string, material_id: string): Promise<number>
  private updatePODeliveryStatus(po_id: string): Promise<void>
}
```

### InvoiceService (8 public methods)

```typescript
class InvoiceService {
  async createInvoice(params: InvoiceCreateParams): Promise<Invoice>
  async getInvoiceById(id: string): Promise<Invoice>
  async getInvoicesByPO(po_id: string, options?: PaginationOptions): Promise<Paginated<Invoice>>
  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>
  async deleteInvoice(id: string): Promise<void>
  async performThreeWayMatch(invoiceId: string): Promise<MatchResult>
  async approveInvoice(id: string, approved_by_id: string, notes?: string): Promise<Invoice>
  async rejectInvoice(id: string, rejected_by_id: string, reason: string): Promise<Invoice>
  private validateLineItems(poItems: any[], invoiceItems: any[]): ValidationError[]
}
```

### DiscrepancyService (6 public methods)

```typescript
class DiscrepancyService {
  async logDiscrepancy(params: DiscrepancyLogParams): Promise<DiscrepancyLog>
  async getDiscrepancyById(id: string): Promise<DiscrepancyLog>
  async getDiscrepancies(options: FilterOptions): Promise<Paginated<DiscrepancyLog>>
  async markReviewed(id: string, reviewed_by_id: string): Promise<DiscrepancyLog>
  async resolveDiscrepancy(id: string, resolved_by_id: string, notes: string): Promise<DiscrepancyLog>
  async waiveDiscrepancy(id: string, waived_by_id: string, notes: string): Promise<DiscrepancyLog>
  async getDiscrepancySummary(options: AnalyticsOptions): Promise<DiscrepancySummary>
  async getOpenCriticalDiscrepancies(project_id: string): Promise<DiscrepancyLog[]>
}
```

## Three-Way Matching Algorithm

### Pseudocode

```
For each invoice:
  1. Validate PO is delivered
  2. For each invoice line item:
     a. Quantity match: invoiced qty vs. cumulative delivered qty
     b. Price match: invoice unit price vs. PO unit price (within tolerance)
     c. Brand match: invoiced brand vs. received brand
     d. Timing match: invoice date vs. delivery date
  3. Determine overall status: FULLY_MATCHED | PARTIAL_MATCHED | MISMATCHED
  4. Log all discrepancies with severity levels
  5. Update invoice matching_status field
```

### Key Rules

**Quantity Matching:**
- If `invoiced_qty > delivered_qty`: CRITICAL discrepancy
- If `invoiced_qty < delivered_qty`: WARNING discrepancy (partial invoice)
- If `invoiced_qty == delivered_qty`: MATCH

**Price Matching:**
- Calculate variance: `((invoice_price - po_price) / po_price) * 100`
- If variance within tolerance (default 5%): MATCH
- If variance exceeds tolerance: WARNING discrepancy

**Brand Matching:**
- If PO brand unbranded: No discrepancy (flexible)
- If PO brand specified and received brand differs: WARNING (substitution)
- If invoiced brand ≠ received brand: CRITICAL (invoice error)

**Timing Matching:**
- If invoice date < delivery date: CRITICAL (payment blocked)
- If invoice date > delivery date + 60 days: INFO (late invoice)
- If invoice date within 30 days of delivery: NORMAL

## API Endpoints (15 Total)

### Delivery Endpoints (7)
1. `POST /api/v1/deliveries` - Create delivery
2. `GET /api/v1/deliveries` - List with filtering
3. `GET /api/v1/deliveries/:id` - Get detail
4. `PUT /api/v1/deliveries/:id` - Update (PENDING only)
5. `DELETE /api/v1/deliveries/:id` - Delete (PENDING only)
6. `POST /api/v1/deliveries/:id/complete` - Mark COMPLETE
7. `GET /api/v1/pos/:poId/deliveries` - List per PO

### Invoice Endpoints (8)
1. `POST /api/v1/invoices` - Submit invoice
2. `GET /api/v1/invoices` - List with filtering
3. `GET /api/v1/invoices/:id` - Get detail (includes match analysis)
4. `PUT /api/v1/invoices/:id` - Update (SUBMITTED/REJECTED only)
5. `DELETE /api/v1/invoices/:id` - Delete (SUBMITTED only)
6. `POST /api/v1/invoices/:id/match` - Trigger matching
7. `POST /api/v1/invoices/:id/approve` - Approve for payment
8. `POST /api/v1/invoices/:id/reject` - Reject invoice

### Discrepancy Endpoints (Leverage Existing)
- `GET /api/v1/discrepancies` - List with filtering
- `POST /api/v1/discrepancies/:id/resolve` - Mark resolved
- `POST /api/v1/discrepancies/:id/waive` - Waive with approval

## Performance Targets

| Operation | Target | Strategy |
|-----------|--------|----------|
| Invoice matching (100 items) | < 5 seconds | Single query with materialized views |
| Delivery creation | < 1 second | Cumulative qty cached, simple validation |
| Invoice submission | < 2 seconds | Duplicate check + line item validation |
| List queries (1000 records) | < 2 seconds | Pagination + strategic indexes |
| Discrepancy query | < 1 second | Indexed severity + status + type |

### Optimization Tactics

1. **Materialized Views** - delivery_summary, invoice_match_summary (refresh via triggers)
2. **Strategic Indexes** - Composite indexes on frequently queried columns
3. **Query Optimization** - Use JSONB operators, window functions, batch processing
4. **Caching** - Redis for PO details (1 hour TTL, invalidate on update)
5. **Connection Pooling** - 20 max, 5 min connections

## Error Handling & Validation

### Validation Errors (400)
- Duplicate invoice number
- Missing required fields
- Invoice total ≠ line items sum
- Material on invoice not on PO
- Delivery qty > PO qty (over-receipt)
- Due date before invoice date

### Business Logic Errors (422)
- Cannot invoice PO not fully received
- Cannot approve invoice with CRITICAL discrepancies
- Cannot delete non-PENDING delivery
- Cannot complete delivery for cancelled PO

### Specific Edge Cases Handled

1. **Partial Delivery Scenario** - PARTIAL_MATCHED status, await next invoice
2. **Quality Issues** - Auto-log INFO discrepancy, allow partial credit
3. **Brand Substitution** - WARNING discrepancy, approval allowed
4. **Price Variance** - WARNING if > tolerance, approval allowed with comment
5. **Concurrent Updates** - SKIP LOCKED or optimistic locking

## Audit Trail Integration

Every operation logged to AuditLog:

```
CREATE: Delivery, Invoice, DiscrepancyLog
UPDATE: Status changes, approval, rejection
APPROVE: Invoice approval with timestamp, user, notes
RESOLVE: Discrepancy resolution with notes
WAIVE: Discrepancy waiver with signature

Captures: user_id, timestamp, action, changes (before/after), ip_address
```

## Data Integrity Constraints

- **Immutable:** Approved invoices, completed deliveries, resolved discrepancies
- **Unique:** Invoice number per system (not per PO)
- **Foreign Keys:** Delivery → PO, Invoice → PO, Discrepancy → PO/Delivery/Invoice
- **Check Constraints:** Quantity ≥ 0, good + damaged = total, price > 0
- **Status Transitions:** Enforced (PENDING → PARTIAL → COMPLETE)

## Testing Strategy

### Unit Tests (50+ total)
- DeliveryService: 15 tests (creation, validation, quality calculation)
- InvoiceService: 20 tests (submission, matching, approval, rejection)
- DiscrepancyService: 15 tests (logging, resolution, queries)

### Integration Tests (5+ scenarios)
- Normal flow: Delivery → Invoice → Matching → Approval
- Price variance: Exceed tolerance, approve with comment
- Critical issues: Over-invoice, block approval, resolve, retry
- Partial deliveries: Multi-delivery, multi-invoice scenario
- Quality issues: Damaged units, auto-log, partial credit

### Performance Tests
- 100-item PO matching < 5 seconds
- 1000 concurrent invoice creations < 30 seconds
- List 1000 discrepancies < 2 seconds

## Critical Implementation Files

1. **DeliveryService.ts** - Delivery CRUD + quantity validation + quality tracking
2. **InvoiceService.ts** - Invoice CRUD + 3-way matching algorithm + approval workflow
3. **DiscrepancyService.ts** - Auto-logging + resolution + reporting
4. **routes/deliveries.ts** - 7 delivery endpoints
5. **routes/invoices.ts** - 8 invoice endpoints
6. **migrations/2_tier2_schema.ts** - Entity updates + indexes + materialized views

## Implementation Roadmap

**Week 1:**
- Day 1-2: Database schema updates, entity enhancements
- Day 3-4: Core services (CRUD operations)
- Day 5: Matching algorithm

**Week 2:**
- Day 6: Approval workflow, discrepancy auto-logging
- Day 7: Route handlers, error handling
- Day 8: Testing, performance optimization, bug fixes

## Success Criteria

- [ ] 100% of acceptance criteria implemented
- [ ] All 4 discrepancy types auto-detected
- [ ] Matching < 5 seconds for 100-item PO
- [ ] 80%+ test coverage of critical logic
- [ ] 50+ integration test cases passing
- [ ] All edge cases handled
- [ ] Audit trail captures all changes
- [ ] Zero data integrity issues

---

**Status:** Architecture approved and ready for implementation
**Next Phase:** Software Engineer + QA Specialist (Development Process)
**Target:** 10-12 business days for complete Tier 2 implementation

