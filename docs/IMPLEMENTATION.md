# MRMS Implementation Phases

## Foundation Phase Overview

**Duration:** 8 weeks
**Goal:** Complete, functional procurement system with delivery tracking, invoice matching, material consumption analytics, and mobile approvals

**Status:** ✅ Infrastructure complete, ready for Tier 1 implementation

---

## Tier 1: Core Procurement (Weeks 1-2)

**Goal:** Complete procurement pipeline (Request → Quote → PO)

### Phase 1.1: Request & Approval Workflow
**Status:** ✅ RequestService scaffolded, routes enhanced
**Duration:** 2 days

**Deliverables:**
- [ ] RequestService: All CRUD operations + approval workflow
- [ ] Routes: GET/POST/PUT/DELETE /api/v1/requests
- [ ] Routes: POST /api/v1/requests/:id/approve
- [ ] Routes: POST /api/v1/requests/:id/reject
- [ ] Unit tests: RequestService (80%+ coverage)
- [ ] Integration tests: Full request lifecycle

**Key Methods:**
```
RequestService:
- getRequests(projectId, skip, take)
- getRequestById(id)
- createRequest(projectId, userId, lineItems)
- updateRequest(id, updates)
- approveRequest(id, approverId)
- rejectRequest(id, approverId, reason)
- getRequestHistory(id)
```

**Acceptance Criteria:**
- ✅ Create request with line items
- ✅ Submit request for approval
- ✅ Multiple approver support (2-level approval)
- ✅ Reject with reason tracking
- ✅ Full audit trail of changes
- ✅ Status transitions validated

### Phase 1.2: Material Management
**Status:** 🔲 MaterialService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] MaterialService: Full CRUD + catalog features
- [ ] Routes: GET/POST/PUT/DELETE /api/v1/materials
- [ ] Routes: GET /api/v1/materials/search?q=steel
- [ ] Routes: GET /api/v1/materials/categories
- [ ] Unit tests: MaterialService (80%+ coverage)
- [ ] Integration tests: Material operations

**Key Methods:**
```
MaterialService:
- getMaterials(skip, take, filters)
- getMaterialById(id)
- createMaterial(name, unit, category, specs)
- updateMaterial(id, updates)
- searchMaterials(query, category)
- getCategories()
- deleteMaterial(id)  // Soft delete
```

**Acceptance Criteria:**
- ✅ Create materials with specifications
- ✅ Search by name and category
- ✅ Filter by unit of measure
- ✅ View material specifications
- ✅ Update material details
- ✅ Soft delete support

### Phase 1.3: Vendor Management
**Status:** 🔲 VendorService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] VendorService: Full CRUD + rate history tracking
- [ ] Routes: GET/POST/PUT/DELETE /api/v1/vendors
- [ ] Routes: GET /api/v1/vendors/:id/rates
- [ ] Routes: GET /api/v1/vendors/:id/performance
- [ ] VendorRateHistory tracking (automatic)
- [ ] Unit tests: VendorService (80%+ coverage)
- [ ] Integration tests: Vendor operations

**Key Methods:**
```
VendorService:
- getVendors(skip, take)
- getVendorById(id)
- createVendor(name, contact, address)
- updateVendor(id, updates)
- getRateHistory(vendorId, materialId)
- detectRateChanges(threshold = 5%)
- getPerformanceMetrics(vendorId)
- deleteVendor(id)  // Soft delete
```

**Acceptance Criteria:**
- ✅ Create vendor profiles
- ✅ Track vendor contact info
- ✅ Record price history for each material
- ✅ Detect price increases > 5%
- ✅ Calculate vendor performance score
- ✅ View rate trends over time

### Phase 1.4: Quote Management
**Status:** 🔲 QuoteService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] QuoteService: Full lifecycle + comparison logic
- [ ] Routes: GET/POST/PUT/DELETE /api/v1/quotes
- [ ] Routes: POST /api/v1/quotes/:id/accept
- [ ] Routes: POST /api/v1/quotes/:id/reject
- [ ] Routes: GET /api/v1/quotes/:requestId/compare
- [ ] Unit tests: QuoteService (80%+ coverage)
- [ ] Integration tests: Quote operations

**Key Methods:**
```
QuoteService:
- getQuotes(requestId)
- getQuoteById(id)
- sendQuoteRequest(requestId, vendorIds)
- submitQuote(requestId, vendorId, lineItems, total)
- acceptQuote(id, approverId)
- rejectQuote(id, reason)
- compareQuotes(requestId)  // Side-by-side comparison
- getQuoteHistory(requestId)
```

**Acceptance Criteria:**
- ✅ Send quote requests to multiple vendors
- ✅ Receive and store vendor quotes
- ✅ Compare quotes side-by-side (price, delivery time)
- ✅ Accept winning quote
- ✅ Track quote validity period
- ✅ Auto-reject expired quotes

### Phase 1.5: PO Generation & Approval
**Status:** 🔲 POService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] POService: Full workflow + approval routing
- [ ] Routes: GET/POST/PUT/DELETE /api/v1/pos
- [ ] Routes: POST /api/v1/pos/:id/approve-level1
- [ ] Routes: POST /api/v1/pos/:id/approve-level2
- [ ] Routes: POST /api/v1/pos/:id/send-to-vendor
- [ ] Routes: GET /api/v1/pos/:id/pdf (PDF generation)
- [ ] Brand selection support (POLineItemBrand)
- [ ] Unit tests: POService (80%+ coverage)
- [ ] Integration tests: PO workflow

**Key Methods:**
```
POService:
- createPOFromQuote(quoteId)
- getPOs(filters)
- getPOById(id)
- selectBrand(poId, materialId, brandId)
- submitForApproval(id, approverId)
- approveLevel1(id, approverId)
- approveLevel2(id, approverId)
- sendToVendor(id)
- generatePDF(id)
- getPOHistory(id)
```

**Acceptance Criteria:**
- ✅ Auto-generate PO from accepted quote
- ✅ Multi-level approval (2 approvers)
- ✅ Brand selection before sending
- ✅ PO document generation (PDF)
- ✅ Vendor notification on send
- ✅ Status tracking (draft→approved→sent)
- ✅ Approval routing based on PO value

### Phase 1.6: Integration & Testing
**Status:** 🔲 Not started
**Duration:** 3 days

**Deliverables:**
- [ ] End-to-end test: Request → Quote → PO
- [ ] Error handling test suite
- [ ] Validation test suite
- [ ] Authentication & authorization tests
- [ ] API documentation verification
- [ ] Docker environment validation
- [ ] Performance testing (>1000 requests/min)
- [ ] Load testing with concurrent users

**Test Scenarios:**
1. Single request → Single vendor → PO creation
2. Single request → Multiple vendors → Compare → Select → PO
3. Invalid approvers → Rejection workflow
4. Expired quotes → Auto-rejection
5. Brand changes → Tracking and notification
6. Concurrent requests → No race conditions

**Success Criteria:**
- [ ] 80%+ test coverage on services
- [ ] All endpoints responding correctly
- [ ] Authentication/auth working
- [ ] Error messages consistent
- [ ] Database constraints enforced
- [ ] Audit trail complete
- [ ] Performance targets met

---

## Tier 2: Delivery & Validation (Weeks 3-4)

**Goal:** Complete fulfillment tracking and invoice validation with 3-way matching

### Phase 2.1: Delivery Tracking
**Status:** 🔲 DeliveryService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] DeliveryService: Batch/partial delivery tracking
- [ ] Routes: GET/POST/PUT /api/v1/deliveries
- [ ] Routes: POST /api/v1/deliveries/:id/receive
- [ ] Flexible batch delivery support
- [ ] Delivery receipt generation

**Key Features:**
- ✅ Create multiple deliveries per PO
- ✅ Track partial deliveries (any combination of items)
- ✅ Record condition (good/damaged)
- ✅ GPS location tracking
- ✅ Photo attachments
- ✅ Signature/receiver tracking

### Phase 2.2: Invoice Submission
**Status:** 🔲 InvoiceService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] InvoiceService: Full invoice lifecycle
- [ ] Routes: GET/POST/PUT /api/v1/invoices
- [ ] Routes: POST /api/v1/invoices/:id/match
- [ ] 3-way matching logic (PO-Delivery-Invoice)

### Phase 2.3: Discrepancy Detection & Tracking
**Status:** 🔲 DiscrepancyService scaffolded
**Duration:** 2 days

**Deliverables:**
- [ ] DiscrepancyService: All 4 discrepancy types
- [ ] Routes: GET/POST/PUT /api/v1/discrepancies
- [ ] Automatic detection on matching
- [ ] Alert generation for critical issues

**Discrepancy Types:**
- Quantity mismatch
- Price changes (>5%)
- Brand/specification mismatch
- Timing issues (delivery before PO, invoice before delivery)

---

## Tier 3: Consumption & Analytics (Weeks 5-6)

**Goal:** Material consumption tracking and multi-level analytics

### Phase 3.1: Material Consumption
**Status:** 🔲 MaterialConsumption entity created
**Duration:** 1 day

### Phase 3.2: Analytics & Reporting
**Status:** 🔲 AnalyticsService scaffolded
**Duration:** 3 days

**Per-Project Dashboard:**
- Budget vs Actual Spend
- Material Consumption by Type
- Vendor Performance Breakdown
- Cost Trends (weekly/monthly)

**Cross-Project Analytics:**
- Spending trends across projects
- Vendor performance ratings
- Material utilization analysis
- Cost forecasting

### Phase 3.3: Mobile Approval Interface
**Status:** 🔲 Frontend not started
**Duration:** 2 days

**Features:**
- Mobile-responsive web app
- Approve/reject with comments
- View discrepancies visually
- Signature capture
- Works on iPhone/Android browsers

---

## Tier 4: Quality & Deployment (Weeks 7-8)

### Phase 4.1: Comprehensive Testing
- [ ] Unit test coverage >80%
- [ ] Integration test suite
- [ ] E2E testing (Request→Quote→PO→Delivery→Invoice)
- [ ] Load testing
- [ ] Security testing

### Phase 4.2: Optimization
- [ ] Query performance optimization
- [ ] Caching strategy implementation
- [ ] Database indexing review
- [ ] API response time optimization

### Phase 4.3: Documentation & Training
- [ ] API documentation complete
- [ ] User manual
- [ ] Administrator guide
- [ ] Developer onboarding guide

### Phase 4.4: Production Preparation
- [ ] Security audit
- [ ] Performance validation
- [ ] Backup/recovery testing
- [ ] Monitoring setup
- [ ] Logging aggregation

---

## Phase Interdependencies

```
Tier 1 (Complete)
├── Phase 1.1 (Request)
│   ├── → Phase 2.1 (Delivery)
│   ├── → Phase 2.2 (Invoice)
│   └── → Phase 2.3 (Discrepancy)
│
├── Phase 1.2 (Material)
│   └── → Phase 3.1 (Consumption)
│   └── → Phase 3.2 (Analytics)
│
├── Phase 1.3 (Vendor)
│   └── → Phase 2.3 (Discrepancy - price tracking)
│   └── → Phase 3.2 (Analytics - performance)
│
├── Phase 1.4 (Quote)
│   └── → Phase 1.5 (PO)
│   └── → Phase 2.2 (Invoice)
│   └── → Phase 2.3 (Discrepancy)
│
└── Phase 1.5 (PO)
    ├── → Phase 2.1 (Delivery)
    ├── → Phase 2.2 (Invoice)
    └── → Phase 2.3 (Discrepancy)
```

---

## Rollout Strategy

### Week 1-2: Core Procurement (Tier 1)
- Internal testing only
- Focus: Request, Quote, PO workflows
- Test users: Engineering team

### Week 3-4: Delivery & Validation (Tier 2)
- Limited pilot rollout
- Focus: Delivery tracking, invoice matching
- Test users: Site managers + Finance

### Week 5-6: Consumption & Analytics (Tier 3)
- Wider rollout
- Focus: Cost tracking and insights
- All test users

### Week 7-8: Production & Optimization
- Performance testing and hardening
- Security audit and fixes
- Final documentation and training
- **Go-live with full system**

---

## Success Metrics

### Tier 1
- ✅ Request approval time < 2 hours
- ✅ PO generation < 5 minutes
- ✅ 100% quote tracking
- ✅ 99.9% system uptime

### Tier 2
- ✅ Delivery receipt < 1 hour
- ✅ Invoice matching 95%+ automated
- ✅ Discrepancy alerts within 1 hour

### Tier 3
- ✅ Cost analytics real-time
- ✅ Material consumption accuracy 99%
- ✅ Performance insights 24/7

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Scope creep | High | High | Strict phase gates |
| Data migration | Medium | High | Comprehensive testing |
| User adoption | Medium | Medium | Training & documentation |
| Performance issues | Low | High | Load testing early |
| Security vulnerabilities | Low | Critical | Regular audits |

---

## Next Step

**Start Phase 1.1: Request Service Enhancement**

```bash
# 1. Review RequestService interface
# 2. Implement all methods
# 3. Write unit tests
# 4. Create/enhance routes
# 5. Write integration tests
# 6. Verify with docker-compose
```

See [requirements.md](./requirements.md) for detailed user stories and acceptance criteria.
