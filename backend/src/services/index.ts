// Core services
export { AuthService, default as authService } from './AuthService';
export { RequestService, default as requestService } from './RequestService';

// Procurement services
export { ProjectService, default as projectService } from './ProjectService';
export { MaterialService, default as materialService } from './MaterialService';
export { VendorService, default as vendorService } from './VendorService';
export { QuoteService, default as quoteService } from './QuoteService';
export { POService, default as poService } from './POService';

// Fulfillment services
export { DeliveryService, default as deliveryService } from './DeliveryService';
export { InvoiceService, default as invoiceService } from './InvoiceService';
export { DiscrepancyService, default as discrepancyService } from './DiscrepancyService';

// Analytics and audit services
export { AnalyticsService, default as analyticsService } from './AnalyticsService';
export { AuditService, default as auditService } from './AuditService';

// Brand management service
export { BrandService, default as brandService } from './BrandService';
