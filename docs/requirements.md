# Material Requirements Management System - Requirements

## Foundation Phase MVP

This document outlines the requirements for the Foundation Phase of the Material Requirements Management System.

## User Stories

### Story 1: Material Request Creation
**As a** site engineer
**I want to** create structured material requests with specifications
**So that** office team can process requests consistently

**Acceptance Criteria:**
- [ ] Can create request with project, materials, quantities, delivery date
- [ ] Can attach descriptions and comments
- [ ] Request gets unique request number
- [ ] Requests saved as DRAFT until submitted
- [ ] Can edit/delete requests in DRAFT status

### Story 2: Request Approval Workflow
**As a** manager/approver
**I want to** review and approve/reject material requests
**So that** unauthorized requests don't proceed to quotes

**Acceptance Criteria:**
- [ ] Can view list of submitted requests
- [ ] Can approve request with comments
- [ ] Can reject request with reason
- [ ] Approval history is logged
- [ ] Requester gets notification of decision
- [ ] Only approved requests can proceed to quotes

### Story 3: Vendor Database
**As a** office team member
**I want to** maintain a centralized vendor database
**So that** we have consistent vendor information for quotes

**Acceptance Criteria:**
- [ ] Can add new vendor with contact details
- [ ] Can view all vendors with status
- [ ] Can mark vendor as active/inactive
- [ ] Can store vendor communication preferences
- [ ] Can track vendor rating/performance
- [ ] Vendors can be filtered and searched

### Story 4: Vendor Quote Management
**As a** office team member
**I want to** submit requests to vendors and manage quotes
**So that** I can compare prices and select best vendor

**Acceptance Criteria:**
- [ ] Can send request to single or multiple vendors
- [ ] Vendors can submit quotes with pricing details
- [ ] Can compare quotes side-by-side (unit price, total, delivery time)
- [ ] Can highlight lowest cost option
- [ ] Quote shows vendor's historical rates
- [ ] Can accept or reject quotes

### Story 5: Purchase Order Generation
**As a** office team member
**I want to** generate formal PO from approved quote
**So that** vendor receives official order

**Acceptance Criteria:**
- [ ] PO auto-generates from selected quote with all details
- [ ] PO has unique PO number
- [ ] PO includes payment terms, delivery address
- [ ] PO can be saved as DRAFT before approval
- [ ] PO supports multiple approval levels based on amount
- [ ] PO can be sent to vendor (email/manual)
- [ ] Approval chain is logged with signatures

### Story 6: PO Approval Workflow
**As a** manager/director
**I want to** approve POs within my authority limit
**So that** spending is controlled and authorized

**Acceptance Criteria:**
- [ ] Can see pending POs needing approval
- [ ] Can approve/reject POs
- [ ] Authority limits enforced by role (e.g., Site Engineer <50k, Manager <500k)
- [ ] POs route to next approver automatically
- [ ] Final approval sends PO to vendor
- [ ] Approval history fully logged

### Story 7: Audit Trail
**As a** director/compliance officer
**I want to** see complete history of all procurement actions
**So that** we maintain audit trail for compliance

**Acceptance Criteria:**
- [ ] Every action logged (who, what, when)
- [ ] Can view audit trail for any request/PO/quote
- [ ] Can filter audit logs by date, user, action type
- [ ] Cannot delete or edit audit logs
- [ ] Shows before/after state for changes
- [ ] Can detect unusual patterns

### Story 8: Delivery Receipt & Batch Tracking
**As a** site engineer
**I want to** record partial and batch deliveries against a PO
**So that** we can track flexible delivery schedules and partial fulfillment

**Acceptance Criteria:**
- [ ] Can create delivery record with received items and quantities
- [ ] Can record multiple deliveries against single PO
- [ ] Can track partial deliveries (partial, complete status)
- [ ] Can specify received quantity per material
- [ ] Can record delivery condition (good, damaged, partial_damage)
- [ ] Can attach delivery location (GPS coordinates, site location)
- [ ] Can add notes and photos to delivery
- [ ] System validates received quantity doesn't exceed PO quantity
- [ ] Can generate delivery receipt document
- [ ] Delivery completion triggers PO status update

### Story 9: Invoice Submission & Three-Way Matching
**As a** finance officer
**I want to** receive vendor invoices and automatically match them against PO and Delivery records
**So that** we can detect discrepancies and approve payments with confidence

**Acceptance Criteria:**
- [ ] Can submit invoice with line items and totals
- [ ] System performs automatic 3-way match (PO vs Delivery vs Invoice)
- [ ] Can detect and log discrepancies:
  - [ ] Quantity mismatches (ordered vs delivered vs invoiced)
  - [ ] Price mismatches (quoted vs invoiced, with threshold alert)
  - [ ] Brand/specification mismatches (ordered vs received)
  - [ ] Timing mismatches (invoice before delivery, etc.)
- [ ] Critical discrepancies block invoice approval
- [ ] Warning discrepancies flag for review
- [ ] Invoice shows matched/unmatched status
- [ ] Can view all discrepancies for invoice
- [ ] Can approve matched invoices
- [ ] Can reject invoices with reason

### Story 10: Material Consumption Tracking
**As a** project manager
**I want to** track which materials have been consumed on the project
**So that** we know actual usage vs. purchased quantities

**Acceptance Criteria:**
- [ ] Can record material consumption with date and quantity
- [ ] Can link consumption to delivery record
- [ ] Can track consumption location (site zone)
- [ ] Can view per-project consumption summary by material
- [ ] Can compare consumed vs. purchased quantities
- [ ] Can see material consumption trends over time
- [ ] Consumption records are immutable (audit trail)
- [ ] Can export consumption reports

### Story 11: Mobile Approval Interface
**As a** manager/director
**I want to** approve POs and invoices from mobile phone
**So that** I can authorize purchases even when off-site

**Acceptance Criteria:**
- [ ] Mobile interface (responsive design) for pending approvals
- [ ] Can view approval details (amounts, vendors, line items)
- [ ] Can see discrepancies highlighted in approval view
- [ ] Can approve with signature or PIN verification
- [ ] Can reject with reason
- [ ] Can add approval comments
- [ ] Push notifications for new approvals
- [ ] Offline support (draft approvals sync when online)
- [ ] Approval limits enforced on mobile same as desktop

### Story 12: Vendor Rate History & Change Detection
**As a** procurement manager
**I want to** see vendor price changes over time
**So that** I can negotiate and detect suspicious pricing

**Acceptance Criteria:**
- [ ] System tracks historical prices per vendor-material
- [ ] Can view price trend chart
- [ ] Alerts when price changes >5% (configurable threshold)
- [ ] Can compare current vendor rates vs. historical averages
- [ ] Can tag suspicious price changes for review
- [ ] Can export rate history for negotiation
- [ ] Rate history shows effective dates
- [ ] Can see which POs used which rates

### Story 13: Brand/Variant Selection & Changes
**As a** site engineer / procurement officer
**I want to** manage brand/variant selection for materials
**So that** we can handle brand changes and substitutions

**Acceptance Criteria:**
- [ ] Can create brands/variants for materials
- [ ] Can assign brands to vendors
- [ ] Can select brand when creating PO (initially unbranded/TBD)
- [ ] Can change brand selection before delivery
- [ ] Changing brand post-delivery is flagged as discrepancy
- [ ] Brand changes are tracked in audit trail
- [ ] Can see brand cost impact vs. base material
- [ ] Delivery receipt captures actual brand received
- [ ] Can flag brand substitutions for approval

### Story 14: Per-Project Cost Analytics
**As a** project manager
**I want to** see cost analysis for my project
**So that** I can monitor budget and make spending decisions

**Acceptance Criteria:**
- [ ] Can view project budget vs. actual spending
- [ ] Can see spending by vendor
- [ ] Can see spending by material category
- [ ] Can view cost trends over project timeline
- [ ] Can compare actual material consumption vs. costs
- [ ] Can see approval bottlenecks (pending approvals value)
- [ ] Can export budget reports
- [ ] Can set alerts for budget variance

### Story 15: Cross-Project Analytics & Insights
**As a** director
**I want to** see company-wide spending and vendor performance analytics
**So that** I can make strategic procurement decisions

**Acceptance Criteria:**
- [ ] Can view total spending across all projects
- [ ] Can compare vendor performance metrics (cost, delivery time, quality)
- [ ] Can identify most expensive materials across projects
- [ ] Can see spending trends by time period
- [ ] Can generate benchmarking reports
- [ ] Can identify cost reduction opportunities
- [ ] Can track approval efficiency by approver
- [ ] Can export comprehensive analytics reports

## Acceptance Criteria by Feature

### Authentication & Authorization
- [ ] Login with email/password
- [ ] JWT token-based authentication
- [ ] Role-based access control (site_engineer, approver, admin)
- [ ] Different dashboards per role
- [ ] Logout functionality

### Material Requests
- [ ] Create/edit/delete in DRAFT status
- [ ] Submit for approval
- [ ] Approve/reject workflow
- [ ] View request history
- [ ] Pagination and filtering
- [ ] Export requests (CSV/PDF)

### Vendors
- [ ] Full CRUD operations
- [ ] Contact management
- [ ] Rating system
- [ ] Active/inactive status
- [ ] Search and filter
- [ ] Rate history tracking

### Quotes
- [ ] Create quote from template
- [ ] Compare quotes side-by-side
- [ ] Track quote status (sent, received, accepted, rejected)
- [ ] Historical price comparison
- [ ] Auto-calculation of totals

### Purchase Orders
- [ ] Generate from approved quote
- [ ] Multi-level approval workflow
- [ ] Approval limits by role
- [ ] PO document generation
- [ ] Vendor communication integration
- [ ] Status tracking (draft, sent, acknowledged, etc.)

### Deliveries
- [ ] Create delivery records with partial fulfillment
- [ ] Track batch/multiple item deliveries
- [ ] Validate quantities against PO
- [ ] Record delivery condition and location
- [ ] Generate delivery receipts
- [ ] View delivery history per PO

### Invoices
- [ ] Submit vendor invoices
- [ ] Automatic 3-way matching (PO-Delivery-Invoice)
- [ ] Discrepancy detection and logging
- [ ] Invoice approval workflow
- [ ] Match status tracking

### Discrepancies
- [ ] Log all discrepancy types (quantity, price, brand, timing)
- [ ] Severity levels (critical, warning, info)
- [ ] Discrepancy resolution workflow
- [ ] Filter and search discrepancies
- [ ] Discrepancy reports

### Material Consumption
- [ ] Record material consumption
- [ ] Link consumption to deliveries
- [ ] Per-project consumption summary
- [ ] Material usage tracking
- [ ] Consumption history

### Brand Management
- [ ] Create and manage material brands
- [ ] Brand cost impact tracking
- [ ] Brand selection in POs
- [ ] Brand change management
- [ ] Brand mismatch detection

### Analytics & Reporting
- [ ] Per-project budget analysis
- [ ] Material cost analytics
- [ ] Vendor performance metrics
- [ ] Cost trends and forecasting
- [ ] Cross-project spending analysis
- [ ] Exportable reports and dashboards

## Non-Functional Requirements

### Performance
- [ ] API response time < 500ms for 95th percentile
- [ ] Support 1000+ concurrent users
- [ ] Database queries < 1 second

### Reliability
- [ ] 99.5% uptime SLA
- [ ] Automatic backups
- [ ] Disaster recovery plan
- [ ] No data loss

### Security
- [ ] Password hashing with bcrypt
- [ ] JWT token expiration (24h access, 30d refresh)
- [ ] HTTPS only in production
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (ORM)
- [ ] CORS configured properly

### Usability
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Clear error messages
- [ ] Intuitive navigation
- [ ] Fast load times
- [ ] Accessible to people with disabilities

### Maintainability
- [ ] TypeScript for type safety
- [ ] Clear code organization
- [ ] Comprehensive documentation
- [ ] Test coverage > 80%
- [ ] Easy to add new features

## Out of Scope (Future Phases)

### Phase 2 (Payment & Advanced Features)
- Payment processing and fund transfers
- Payment approval workflows
- Accounting system integration
- Vendor portal (vendors submit quotes directly)
- Advanced search and filtering (Elasticsearch)
- Real-time notifications (Socket.io)

### Phase 3 (Mobile Native & AI)
- Mobile native app (React Native for Android/iOS)
- Advanced analytics dashboard with ML predictions
- Bill of Materials import
- Automated vendor communication
- Multi-currency support
- Vendor performance scoring with ML
- Demand forecasting

### Future Enhancements
- EDI/API integration with vendor systems
- Blockchain for invoice/delivery verification
- Procurement card (P-card) integration
- Spend analysis AI
- Sustainability tracking
- Carbon footprint analytics

## Success Metrics

- 90%+ of requests processed through system within 30 days
- Zero duplicate orders
- 100% PO compliance with approval workflow
- All procurement decisions have audit trail
- 50% reduction in procurement time vs WhatsApp process
- 100% user adoption by office team
- Zero data loss or corruption

## Assumptions

- Users have basic email and web browser access
- Office team has Microsoft Office/Google Workspace
- Vendors responsive to quote requests
- Company has existing payment methods
- Vendors willing to use digital quotes

## Dependencies

- PostgreSQL database available
- Redis for caching/sessions
- SMTP for email (Phase 2)
- File storage (S3/MinIO)
- Docker for deployment

## Foundation Phase Implementation Roadmap (8 Weeks)

### Tier 1: Core Procurement (Weeks 1-2)
**Focus:** Stories 1-6 - Request, Quote, and PO workflows
- ProjectService & MaterialService
- VendorService with rate tracking
- QuoteService for quote management
- POService with approval workflow
- Multi-level approval routing
- Rate history tracking
- **Deliverable:** Complete procurement pipeline (Request → Quote → PO)

### Tier 2: Delivery & Validation (Weeks 3-4)
**Focus:** Stories 8-9 - Delivery receipt and invoice matching
- DeliveryService with batch/partial handling
- InvoiceService with 3-way matching
- DiscrepancyService for mismatch tracking
- All 4 discrepancy types (quantity, price, brand, timing)
- Delivery receipt generation
- Invoice matching workflow
- **Deliverable:** Complete fulfillment tracking and invoice validation

### Tier 3: Consumption & Analytics (Weeks 5-6)
**Focus:** Stories 10-15 - Tracking, analytics, and mobile
- MaterialConsumption entity and tracking
- AnalyticsService (per-project & cross-project)
- BrandService and brand selection logic
- VendorRateHistory and change detection
- Mobile approval responsive UI
- Per-project dashboards
- Cross-project analytics
- **Deliverable:** Complete visibility into spending, consumption, and vendor performance

### Tier 4: Quality & Deployment (Weeks 7-8)
**Focus:** Testing, optimization, and preparation
- Comprehensive unit test coverage (80%+)
- Integration tests for all workflows
- Performance optimization
- PO and receipt PDF generation
- Analytics dashboard UI
- Mobile UI refinement
- Documentation and training materials
- **Deliverable:** Production-ready Foundation Phase MVP

## Success Metrics for Foundation Phase

- 100% of procurement processes streamlined from WhatsApp to system
- Zero duplicate or out-of-process orders
- 100% PO compliance with approval workflow
- 100% discrepancy detection and logging
- 50%+ reduction in procurement time vs. manual process
- 80%+ test coverage of critical paths
- All 7 core user stories + 8 new stories implemented
- Complete audit trail for all transactions
- Mobile approvals fully functional
- All compliance requirements met
