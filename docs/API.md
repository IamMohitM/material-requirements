# API Reference

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All endpoints except `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "meta": { "total": 100, "page": 1 }
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* validation errors */ }
  }
}
```

## Authentication Endpoints

### POST /auth/login
Login and get tokens

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "site_engineer"
  },
  "access_token": "token",
  "refresh_token": "token"
}
```

### POST /auth/refresh
Refresh access token

**Request:**
```json
{
  "refresh_token": "token"
}
```

### GET /auth/me
Get current user

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "site_engineer"
}
```

### POST /auth/logout
Logout (invalidates token)

### POST /auth/change-password
Change password

**Request:**
```json
{
  "oldPassword": "current",
  "newPassword": "new"
}
```

## Material Request Endpoints

### GET /requests
List all requests

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `project_id` (optional)
- `status` (optional: draft, submitted, approved, rejected, converted_to_po)
- `requester_id` (optional)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "request_number": "REQ-20240206-XXXXX",
      "status": "submitted",
      "description": "Material for Project X",
      "required_delivery_date": "2024-02-20",
      "line_items": [
        {
          "material_id": "uuid",
          "quantity": 100,
          "unit_price_estimate": 1000
        }
      ],
      "created_at": "2024-02-06T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

### POST /requests
Create new request

**Request:**
```json
{
  "project_id": "uuid",
  "description": "Building materials",
  "required_delivery_date": "2024-02-20",
  "line_items": [
    {
      "material_id": "uuid",
      "quantity": 100,
      "unit_price_estimate": 1000
    }
  ],
  "comments": "Urgent"
}
```

### GET /requests/:id
Get request details

### POST /requests/:id/approve
Approve request

**Request:**
```json
{
  "comments": "Approved for processing"
}
```

### POST /requests/:id/reject
Reject request

**Request:**
```json
{
  "reason": "Insufficient budget allocation"
}
```

### POST /requests/:id/submit
Submit request for approval

### POST /requests/:id/convert-to-po
Convert approved request to PO

### PUT /requests/:id
Update request (draft only)

## Project Endpoints (NEW)

### GET /projects
List all projects

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: active, on_hold, completed)
- `owner_id` (optional)

### POST /projects
Create new project

**Request:**
```json
{
  "name": "Office Building Renovation",
  "location": "Downtown - Block 5",
  "budget": 500000,
  "owner_id": "uuid",
  "start_date": "2024-02-01",
  "end_date": "2024-12-31"
}
```

### GET /projects/:id
Get project details

### PUT /projects/:id
Update project

**Request:**
```json
{
  "name": "Project updated",
  "budget": 550000,
  "status": "active"
}
```

### GET /projects/:id/budget-remaining
Get remaining budget

### GET /projects/:id/budget-utilization
Get budget utilization percentage

## Vendor Endpoints

### GET /vendors
List all vendors

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `is_active` (default: true)

### POST /vendors
Create new vendor

**Request:**
```json
{
  "vendor_code": "VENDOR-001",
  "name": "ABC Supplies Ltd",
  "contact_person": "John Smith",
  "email": "john@abcsupplies.com",
  "phone": "+1-234-567-8900",
  "address": "123 Main St, Industrial Zone",
  "payment_terms": "Net 30"
}
```

### GET /vendors/:id
Get vendor details

### PUT /vendors/:id
Update vendor

### DELETE /vendors/:id
Deactivate vendor

### GET /vendors/:id/rate-history
Get vendor's rate history

## Quote Endpoints

### GET /quotes
List all quotes

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: sent, received, accepted, rejected, expired)
- `vendor_id` (optional)

### POST /quotes
Create new quote from request

**Request:**
```json
{
  "request_id": "uuid",
  "vendor_id": "uuid",
  "line_items": [
    {
      "material_id": "uuid",
      "quantity": 100,
      "unit_price": 50.00,
      "total": 5000.00
    }
  ],
  "total_amount": 5000.00,
  "delivery_time_days": 14,
  "notes": "Best price available",
  "valid_days": 30
}
```

### GET /quotes/:id
Get quote details

### POST /quotes/:id/accept
Accept quote

### POST /quotes/:id/reject
Reject quote

**Request:**
```json
{
  "reason": "Too expensive"
}
```

### GET /requests/:request_id/quotes
List quotes for a request

### GET /requests/:request_id/quotes/compare
Compare all quotes for a request

## Purchase Order Endpoints

### GET /pos
List all POs

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: draft, sent, acknowledged, partially_received, fully_received)
- `approval_status` (optional: pending, approved, rejected)
- `project_id` (optional)
- `vendor_id` (optional)

### POST /pos
Create new PO from quote

**Request:**
```json
{
  "project_id": "uuid",
  "request_id": "uuid",
  "vendor_id": "uuid",
  "quote_id": "uuid",
  "line_items": [
    {
      "material_id": "uuid",
      "quantity": 100,
      "unit_price": 50.00,
      "total": 5000.00,
      "brand_id": null
    }
  ],
  "total_amount": 5000.00,
  "required_delivery_date": "2024-03-01",
  "delivery_address": {
    "address": "Site location",
    "city": "City",
    "state": "State"
  },
  "special_instructions": "Handle with care"
}
```

### GET /pos/:id
Get PO details

### PUT /pos/:id
Update PO (draft only)

### POST /pos/:id/submit
Submit PO for approval

### POST /pos/:id/approve
Approve PO

**Request:**
```json
{
  "comments": "Approved for processing"
}
```

### POST /pos/:id/reject
Reject PO

**Request:**
```json
{
  "reason": "Vendor not approved"
}
```

### GET /projects/:project_id/pos
Get all POs for a project

### GET /pos/:id/pdf
Export PO as PDF

### GET /pos/:id/pending-approvals
Get pending approvals for PO

## Material Endpoints

### GET /materials
List all materials

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `category` (optional)
- `is_active` (default: true)

### POST /materials
Create new material

**Request:**
```json
{
  "material_code": "STEEL-001",
  "name": "Steel Reinforcement Bar",
  "category": "Steel",
  "unit_of_measure": "kg",
  "description": "Grade 60 Steel bars"
}
```

### GET /materials/:id
Get material details

### PUT /materials/:id
Update material

## Delivery Endpoints (NEW)

### GET /deliveries
List all deliveries

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: partial, complete)

### POST /deliveries
Create new delivery record

**Request:**
```json
{
  "po_id": "uuid",
  "delivery_date": "2024-02-20",
  "received_by_id": "uuid",
  "location": "Site A - Foundation Zone",
  "line_items": [
    {
      "po_line_item_id": "line-1",
      "material_id": "uuid",
      "quantity_ordered": 100,
      "quantity_received": 75,
      "condition": "good",
      "brand_received": "Brand X"
    }
  ],
  "notes": "Partial delivery due to supply constraints",
  "photos": []
}
```

### GET /deliveries/:id
Get delivery details

### GET /pos/:po_id/deliveries
Get all deliveries for a PO

### GET /deliveries/:id/receipt
Export delivery receipt as PDF

## Invoice Endpoints (NEW)

### GET /invoices
List all invoices

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: submitted, matched, approved, rejected, paid)
- `matching_status` (optional: unmatched, partial_matched, fully_matched)

### POST /invoices
Submit vendor invoice

**Request:**
```json
{
  "po_id": "uuid",
  "vendor_id": "uuid",
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-02-15",
  "due_date": "2024-03-15",
  "line_items": [
    {
      "material_code": "STEEL-001",
      "quantity": 75,
      "unit_price": 50.00,
      "total": 3750.00
    }
  ],
  "total_amount": 3750.00,
  "notes": "Invoice for partial delivery"
}
```

### GET /invoices/:id
Get invoice details

### POST /invoices/:id/match
Trigger 3-way matching (PO-Delivery-Invoice)

**Response:**
```json
{
  "matched": true,
  "discrepancies": [],
  "status": "matched"
}
```

### POST /invoices/:id/approve
Approve matched invoice

### POST /invoices/:id/reject
Reject invoice

**Request:**
```json
{
  "reason": "Price discrepancy detected"
}
```

### GET /pos/:po_id/invoices
Get all invoices for a PO

## Discrepancy Endpoints (NEW)

### GET /discrepancies
List all discrepancies

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `status` (optional: open, reviewed, resolved, waived)
- `severity` (optional: critical, warning, info)
- `type` (optional: quantity_mismatch, price_mismatch, brand_mismatch, timing_mismatch)

### GET /discrepancies/:id
Get discrepancy details

### PUT /discrepancies/:id
Update discrepancy

**Request:**
```json
{
  "status": "resolved",
  "resolution_notes": "Quantity corrected with vendor"
}
```

### POST /discrepancies/:id/resolve
Mark discrepancy as resolved

### GET /pos/:po_id/discrepancies
Get all discrepancies for a PO

## Brand Endpoints (NEW)

### GET /brands
List all brands

**Query Parameters:**
- `page` (default: 1)
- `page_size` (default: 20)
- `material_id` (optional)
- `vendor_id` (optional)

### POST /brands
Create new brand

**Request:**
```json
{
  "material_id": "uuid",
  "vendor_id": "uuid",
  "brand_name": "Brand X Premium",
  "specifications": {
    "grade": "60",
    "certification": "ISO 9001"
  },
  "cost_impact": 5.50
}
```

### GET /brands/:id
Get brand details

### GET /materials/:material_id/brands
Get all brands for a material

### POST /pos/:po_id/brands/:material_id
Select brand for PO line item

**Request:**
```json
{
  "brand_id": "uuid"
}
```

## Material Consumption Endpoints (NEW)

### GET /material-consumption
List consumption records

### POST /material-consumption
Record material consumption

**Request:**
```json
{
  "project_id": "uuid",
  "material_id": "uuid",
  "delivery_id": "uuid",
  "consumed_quantity": 50,
  "consumption_date": "2024-02-20",
  "consumed_by_id": "uuid",
  "location": "Foundation Zone A"
}
```

### GET /projects/:project_id/material-consumption
Get all consumption records for project

### GET /projects/:project_id/consumption-summary
Get aggregated consumption summary

## Analytics Endpoints (NEW)

### GET /analytics/projects/:project_id/dashboard
Get project dashboard metrics

**Response:**
```json
{
  "project_id": "uuid",
  "total_budget": 100000,
  "spent_amount": 45000,
  "remaining_budget": 55000,
  "utilization_percent": 45,
  "po_count": 12,
  "vendor_count": 5
}
```

### GET /analytics/projects/:project_id/budget
Get budget analysis

### GET /analytics/projects/:project_id/materials
Get material cost breakdown

### GET /analytics/projects/:project_id/vendors
Get vendor performance for project

### GET /analytics/cross-project/spending
Get company-wide spending summary

### GET /analytics/cross-project/vendor-performance
Get vendor comparisons across projects

### GET /analytics/cross-project/trends
Get spending trends over time

## Vendor Rate History Endpoints (NEW)

### GET /vendors/:vendor_id/rate-history
Get vendor's rate history for all materials

**Query Parameters:**
- `material_id` (optional - get history for specific material)
- `limit` (default: 10)

### GET /vendors/:vendor_id/materials/:material_id/rate-history
Get rate history for vendor-material combination

## Approval Endpoints (Mobile Support)

### GET /approvals
Get pending approvals for current user

### GET /approvals/:approval_id
Get approval details

### POST /approvals/:approval_id/approve
Submit approval

**Request:**
```json
{
  "signature": "base64_encoded_signature",
  "comments": "Approved as requested"
}
```

### POST /approvals/:approval_id/reject
Reject approval

**Request:**
```json
{
  "reason": "Budget exceeded authority limit"
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Request validation failed |
| AUTHENTICATION_ERROR | 401 | Invalid credentials or expired token |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_SERVER_ERROR | 500 | Server error |

## Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

## Pagination

Use `page` and `page_size` query parameters:
```
GET /requests?page=2&page_size=25
```

Response includes pagination metadata:
```json
{
  "meta": {
    "total": 100,
    "page": 2,
    "page_size": 25
  }
}
```

## Rate Limiting

Currently not implemented, but planned for future versions.

## Webhooks

Currently not implemented, but planned for Phase 2.

## API Versioning

API uses versioning in URL: `/api/v1/`

Breaking changes will use new version: `/api/v2/`
