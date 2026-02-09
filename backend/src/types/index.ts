/**
 * Type definitions for the Material Requirements Management System
 */

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  project_ids: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: Date;
  end_date?: Date;
  budget: number;
  status: ProjectStatus;
  company_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface IMaterial {
  id: string;
  material_code: string;
  name: string;
  description?: string;
  unit?: string;
  category?: string;
  unit_price?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IVendor {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: Record<string, unknown>;
  gstin?: string;
  payment_terms: string;
  rating: number;
  total_transactions: number;
  is_active: boolean;
  verification_status: VerificationStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IRequest {
  id: string;
  project_id: string;
  requester_id: string;
  request_number: string;
  description: string;
  status: RequestStatus;
  requested_date: Date;
  required_delivery_date: Date;
  line_items: LineItem[];
  comments?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LineItem {
  material_id: string;
  quantity: number;
  unit_price_estimate?: number;
}

export interface DeliveryLineItem {
  po_line_item_id: string;
  material_id: string;
  quantity_received: number;
  condition: 'good' | 'damaged';
  brand_received?: string;
}

export interface DeliveryCondition {
  good: string;
  damaged: string;
}

export interface IQuote {
  id: string;
  request_id: string;
  vendor_id: string;
  quote_number: string;
  quote_date: Date;
  validity_date: Date;
  status: QuoteStatus;
  total_amount: number;
  line_items: QuoteLineItem[];
  payment_terms: string;
  delivery_location: string;
  created_at: Date;
  received_at?: Date;
}

export interface QuoteLineItem {
  material_id: string;
  quantity: number;
  unit_price: number;
  delivery_time: number;
}

export interface IPurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  request_id: string;
  vendor_id: string;
  quote_id: string;
  order_date: Date;
  required_delivery_date: Date;
  status: POStatus;
  total_amount: number;
  line_items: POLineItem[];
  approval_status: ApprovalStatus;
  is_signed: boolean;
  special_instructions?: string;
  delivery_address: Record<string, unknown>;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface POLineItem {
  material_id: string;
  quantity: number;
  unit_price: number;
  gst_amount: number;
  total: number;
}

export interface IAuditLog {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  actor_id: string;
  actor_role: string;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
  old_state?: Record<string, unknown>;
  new_state?: Record<string, unknown>;
  change_summary?: Record<string, unknown>;
  reason?: string;
  status: AuditStatus;
  error_message?: string;
}

// Enums
export enum UserRole {
  SITE_ENGINEER = 'site_engineer',
  APPROVER = 'approver',
  FINANCE_OFFICER = 'finance_officer',
  ADMIN = 'admin',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETE = 'complete',
  PAUSED = 'paused',
}

export enum RequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONVERTED_TO_PO = 'converted_to_po',
  CANCELLED = 'cancelled',
}

export enum QuoteStatus {
  SENT = 'sent',
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum POStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  IN_PRODUCTION = 'in_production',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum DeliveryStatus {
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  PENDING = 'pending',
}

export enum DiscrepancyType {
  QUANTITY_MISMATCH = 'quantity_mismatch',
  PRICE_MISMATCH = 'price_mismatch',
  BRAND_MISMATCH = 'brand_mismatch',
  TIMING_MISMATCH = 'timing_mismatch',
  QUALITY_ISSUE = 'quality_issue',
}

export enum DiscrepancySeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

export enum DiscrepancyStatus {
  OPEN = 'open',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  WAIVED = 'waived',
}

export enum InvoiceStatus {
  SUBMITTED = 'submitted',
  MATCHED = 'matched',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export enum InvoiceMatchingStatus {
  UNMATCHED = 'unmatched',
  PARTIAL_MATCHED = 'partial_matched',
  FULLY_MATCHED = 'fully_matched',
  MISMATCHED = 'mismatched',
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Partial<IUser>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
