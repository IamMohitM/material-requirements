# Test Plan: Tier 2 - Delivery Tracking & Invoice Matching

**Date Created:** 2026-02-07
**Iteration:** 1
**Scope:** DeliveryService, InvoiceService, DiscrepancyService, Database Migration
**Approach:** Unit + Integration Testing with Edge Case Validation
**Total Test Cases:** 32 core + 15 edge cases = 47 scenarios

## Test Strategy

### Scope
- Database migration (Tier 2 schema)
- DeliveryService: CRUD operations, quantity validation, quality calculation
- InvoiceService: CRUD operations, 3-way matching algorithm, approval workflow
- DiscrepancyService: Auto-logging, resolution workflows, querying
- Status workflows and state transitions
- Edge cases: Over-receipt, partial deliveries, quality issues, price variance, timing

### Approach
1. **Unit Tests** - Service method isolation, input validation, error handling
2. **Integration Tests** - End-to-end flows (Delivery → Invoice → Matching)
3. **Edge Case Tests** - Boundary conditions, unusual scenarios
4. **Performance Tests** - Matching algorithm timing (target: < 5 sec for 100-item PO)
5. **Type Safety** - TypeScript compilation, no runtime type errors

### Environment
- Local development environment with PostgreSQL
- Node.js 18+
- TypeORM migrations
- Seed data with sample POs, vendors, materials

---

## Delivery Tests (Story 8)

### Creation & Validation

| ID | Test Case | Given | When | Then | Type |
|---|---|---|---|---|---|
| 1.1 | Create Valid Delivery | Valid PO, line items | createDelivery() | Delivery created, PARTIAL status, DL-number generated, quality score calculated | Happy path |
| 1.2 | Delivery Date Before PO | PO date=Jan20, delivery_date=Jan10 | createDelivery() | ValidationError: date before PO | Error |
| 1.3 | PO Not Found | Non-existent PO ID | createDelivery() | NotFoundError for PurchaseOrder | Error |
| 1.4 | Over-Receipt Single | PO=100, trying to deliver 105 | createDelivery() | ValidationError: exceeds PO quantity | Edge case |
| 1.5 | Over-Receipt Cumulative | PO=100, existing 60, add 45 | createDelivery() | ValidationError: cumulative exceeds | Edge case |
| 1.6 | Quality Score (95/100) | 95 good + 5 damaged units | createDelivery() | quality_score = 95.0 | Business logic |
| 1.7 | Cancelled PO | PO status=CANCELLED | createDelivery() | BadRequestError: cannot create for cancelled | Business logic |
| 1.8 | Material Not in PO | Unknown material_id | createDelivery() | BadRequestError: material not in PO | Error |
| 1.9 | Get Delivery by ID | Existing delivery | getDeliveryById() | Delivery returned intact | Happy path |
| 1.10 | Get by PO Paginated | PO with 5 deliveries | getDeliveriesByPO(page=1,size=2) | 2 items, total=5, pages=3 | Happy path |
| 1.11 | Update PENDING | Delivery in PENDING status | updateDelivery(notes) | Notes updated | Happy path |
| 1.12 | Cannot Update Complete | Delivery in COMPLETE | updateDelivery() | BadRequestError: cannot update | Business logic |
| 1.13 | Delete PENDING | Delivery in PENDING | deleteDelivery() | Delivery deleted, PO updated | Happy path |
| 1.14 | Cannot Delete Partial | Delivery in PARTIAL | deleteDelivery() | BadRequestError: cannot delete | Business logic |

### Status Workflow

| ID | Test Case | Scenario | Expected | Type |
|---|---|---|---|---|
| 1.15 | Complete Delivery - All Items | 2 deliveries (60+40=100 units) | PO status = DELIVERED, delivery_status = FULLY_RECEIVED | Happy path |
| 1.16 | Complete Delivery - Partial | 1 delivery of 60/100 units | PO delivery_status = PARTIALLY_RECEIVED | Business logic |

---

## Invoice Tests (Story 9)

### Creation & Validation

| ID | Test Case | Given | When | Then | Type |
|---|---|---|---|---|---|
| 2.1 | Create Valid Invoice | PO DELIVERED, vendor, items | createInvoice() | Invoice SUBMITTED, auto-matched | Happy path |
| 2.2 | Due Date Before Invoice | invoice_date=Jan20, due=Jan15 | createInvoice() | ValidationError: due before invoice | Error |
| 2.3 | Duplicate Invoice Number | Existing INV-001 | createInvoice(INV-001) | ValidationError: duplicate | Error |
| 2.4 | PO Not Delivered | PO status=SENT | createInvoice() | BadRequestError: must be DELIVERED | Business logic |
| 2.5 | Cancelled PO | PO status=CANCELLED | createInvoice() | BadRequestError: cannot invoice cancelled | Business logic |
| 2.6 | Total Amount Mismatch | items=$500, total=$520 | createInvoice() | ValidationError: total mismatch | Error |
| 2.7 | Line Item Not in PO | Unknown material_id | createInvoice() | ValidationError: material not in PO | Error |
| 2.8 | Negative Quantity | quantity=-5 | createInvoice() | ValidationError: invalid quantity | Error |
| 2.9 | Get Invoice by ID | Existing invoice | getInvoiceById() | Invoice returned | Happy path |
| 2.10 | Get by PO Paginated | PO with 5 invoices | getInvoicesByPO(page=1) | Paginated results | Happy path |
| 2.11 | Update SUBMITTED | Invoice in SUBMITTED | updateInvoice(notes) | Notes updated | Happy path |
| 2.12 | Cannot Update APPROVED | Invoice in APPROVED | updateInvoice() | BadRequestError | Business logic |
| 2.13 | Delete SUBMITTED | Invoice in SUBMITTED | deleteInvoice() | Deleted | Happy path |
| 2.14 | Cannot Delete MATCHED | Invoice in MATCHED | deleteInvoice() | BadRequestError | Business logic |

### 3-Way Matching: Quantity

| ID | Test Case | PO Qty | Delivered | Invoiced | Expected | Type |
|---|---|---|---|---|---|---|
| 2.15 | Qty Match Exact | 100 | 100 | 100 | No mismatch, matched_qty=100 | Happy path |
| 2.16 | Over-Invoiced | 100 | 80 | 100 | CRITICAL discrepancy, matching=MISMATCHED | Edge case |
| 2.17 | Under-Invoiced | 100 | 100 | 80 | WARNING discrepancy, matching=PARTIAL_MATCHED | Edge case |
| 2.18 | Partial Delivery | 500 | 200 (Deliv1) | 200 (on Deliv1) | Matches current deliveries | Edge case |

### 3-Way Matching: Price

| ID | Test Case | PO Price | Invoice Price | Variance | Expected | Type |
|---|---|---|---|---|---|---|
| 2.19 | Price Match Within | $100 | $104 | 4% | No mismatch (within 5%) | Happy path |
| 2.20 | Price Mismatch | $100 | $106 | 6% | WARNING discrepancy | Edge case |
| 2.21 | Price Negative Variance | $100 | $95 | -5% | No mismatch (within 5%) | Edge case |

### 3-Way Matching: Brand

| ID | Test Case | Ordered | Received | Invoiced | Expected | Type |
|---|---|---|---|---|---|---|
| 2.22 | Brand Match | Brand A | Brand A | Brand A | No mismatch | Happy path |
| 2.23 | Brand Mismatch | Brand A | Brand B | Brand B | WARNING discrepancy | Edge case |
| 2.24 | Brand Not Specified | null | Brand A | Brand A | No mismatch | Edge case |

### 3-Way Matching: Timing

| ID | Test Case | Delivery Date | Invoice Date | Days Diff | Expected | Type |
|---|---|---|---|---|---|---|
| 2.25 | Timing Normal | Jan 20 | Jan 25 | +5 | No mismatch | Happy path |
| 2.26 | Timing - Early Invoice | Jan 20 | Jan 10 | -10 | CRITICAL discrepancy | Edge case |
| 2.27 | Late Invoice | Jan 1 | Mar 15 | +73 | No auto-log in v1 | Future |

### Quality Issues

| ID | Test Case | Good | Damaged | Expected | Type |
|---|---|---|---|---|---|
| 2.28 | Quality Issue | 100 | 5 | QUALITY_ISSUE INFO discrepancy | Edge case |
| 2.29 | No Quality Issues | 100 | 0 | No discrepancy | Happy path |

### Approval Workflow

| ID | Test Case | Given | When | Then | Type |
|---|---|---|---|---|---|
| 2.30 | Approve No Critical | matching_status=FULLY_MATCHED, no critical | approveInvoice() | Status=APPROVED, timestamp captured | Happy path |
| 2.31 | Cannot Approve Critical | critical_count > 0 | approveInvoice() | BadRequestError: critical discrepancies | Business logic |
| 2.32 | Cannot Approve Twice | status=APPROVED | approveInvoice() | BadRequestError: already approved | Business logic |
| 2.33 | Cannot Approve Rejected | status=REJECTED | approveInvoice() | BadRequestError: cannot approve rejected | Business logic |
| 2.34 | Reject with Reason | any status except PAID | rejectInvoice(reason) | Status=REJECTED, reason appended | Happy path |

---

## Discrepancy Tests (Integrated)

| ID | Test Case | Given | When | Then | Type |
|---|---|---|---|---|---|
| 3.1 | Auto-Log on Match | performThreeWayMatch() detects mismatch | Auto-logging | Discrepancy created, OPEN | Happy path |
| 3.2 | Mark Reviewed | Open discrepancy | markReviewed() | Status=REVIEWED, timestamp | Happy path |
| 3.3 | Resolve | Open discrepancy | resolveDiscrepancy(notes) | Status=RESOLVED, notes captured | Happy path |
| 3.4 | Waive | Open discrepancy | waiveDiscrepancy(reason) | Status=WAIVED, reason stored | Happy path |
| 3.5 | Get Open Critical | 3 OPEN CRITICAL, 2 WARNING, 1 RESOLVED CRITICAL | getOpenCriticalDiscrepancies() | Returns 3 items | Happy path |
| 3.6 | Discrepancy Summary | Mixed types/statuses | getDiscrepancySummary() | Returns counts for all categories | Happy path |

---

## Edge Case Summary

### Delivery Scenarios
- Over-receipt single delivery
- Over-receipt cumulative (multiple deliveries)
- Quality score edge cases (all good 100%, all damaged 0%)
- Delivery date validation
- Material validation
- Status transition enforcement

### Invoice Scenarios
- Over-invoiced (critical blocking)
- Under-invoiced (partial matching)
- Price variance in/out of tolerance
- Brand substitution planned/unplanned
- Timing: invoice before delivery (critical)
- Quality issues: damaged units logged as INFO
- Multi-delivery partial invoicing
- Total amount mismatches

### Status Workflow Scenarios
- Cannot update/delete after status changes
- Cannot approve with critical discrepancies
- Immutability of approved invoices
- Delivery completion triggers PO updates

---

## Integration Test Scenarios

### Scenario A: Normal Flow (Happy Path)
1. Create PO for 100 units Material A @ $100/unit
2. Create Delivery: 100 good units
3. Complete Delivery
4. Create Invoice: 100 units @ $100/unit
5. Verify: matching_status = FULLY_MATCHED, no discrepancies
6. Approve Invoice: Success

### Scenario B: Partial Delivery with Quality Issue
1. Create PO for 100 units
2. Create Delivery 1: 95 good, 5 damaged units
3. Create Invoice 1: 95 units @ same price
4. Verify: 2 discrepancies logged:
   - QUALITY_ISSUE (INFO)
   - Possibly QUANTITY_MISMATCH (WARNING) if 95 < 100
5. Approve with warnings

### Scenario C: Over-Invoice Prevention
1. Create PO for 100 units
2. Create Delivery: 80 units
3. Attempt Invoice: 100 units
4. Verify: CRITICAL discrepancy (MISMATCHED status)
5. Verify: Approval blocked
6. Resolve discrepancy, retry

### Scenario D: Price Variance Approval
1. Create PO for 100 units @ $100/unit
2. Create Delivery: 100 units
3. Create Invoice: 100 units @ $106/unit (6% variance)
4. Verify: WARNING discrepancy logged
5. Approve with acknowledgment

---

## Performance Benchmarks

| Test | Target | Measurement |
|------|--------|-------------|
| Delivery Creation | < 1 sec | With validation and PO lookup |
| Invoice Creation | < 2 sec | With line item validation and 3-way matching |
| 3-Way Matching (100 items) | < 5 sec | Full algorithm execution |
| Discrepancy Logging | < 500 ms | Per discrepancy |
| Delivery List Query | < 2 sec | 1000 records with pagination |
| Discrepancy Summary | < 1 sec | Stats query |

---

## Type Safety Validation

- [ ] All DeliveryService methods have proper TypeScript types
- [ ] All InvoiceService methods have proper TypeScript types
- [ ] All DiscrepancyService methods have proper TypeScript types
- [ ] DeliveryLineItem interface matches implementation
- [ ] MatchResult interface complete
- [ ] No `any` types without justification
- [ ] Error handling typed (ValidationError, BadRequestError, etc.)
- [ ] Pagination types consistent

---

## Success Criteria

- [ ] All migration SQL executes without errors
- [ ] Database schema matches architecture (tables, indexes, enums)
- [ ] All 32 core test cases pass
- [ ] All 15 edge case tests pass
- [ ] All acceptance criteria from Story 8 & 9 validated
- [ ] No critical or major issues
- [ ] Over-receipt prevention working (Tests 1.4, 1.5)
- [ ] Quality score calculation accurate (Test 1.6)
- [ ] 3-way matching algorithm detects all 5 discrepancy types
- [ ] Approval workflow blocks on critical discrepancies (Test 2.31)
- [ ] Status transitions enforced correctly
- [ ] Error messages clear and actionable
- [ ] Performance targets met

---
