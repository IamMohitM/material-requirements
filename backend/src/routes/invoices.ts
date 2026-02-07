import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { paginationSchema } from '@utils/validators';
import { invoiceService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * Validation schemas for invoice endpoints
 */
const createInvoiceSchema = Joi.object({
  po_id: Joi.string().uuid().required().messages({
    'string.uuid': 'PO ID must be a valid UUID',
    'any.required': 'PO ID is required',
  }),
  vendor_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Vendor ID must be a valid UUID',
    'any.required': 'Vendor ID is required',
  }),
  invoice_number: Joi.string().max(100).required().messages({
    'string.max': 'Invoice number must be at most 100 characters',
    'any.required': 'Invoice number is required',
  }),
  invoice_date: Joi.date().required().messages({
    'date.base': 'Invoice date must be a valid date',
    'any.required': 'Invoice date is required',
  }),
  due_date: Joi.date().min(Joi.ref('invoice_date')).required().messages({
    'date.base': 'Due date must be a valid date',
    'date.min': 'Due date cannot be before invoice date',
    'any.required': 'Due date is required',
  }),
  line_items: Joi.array()
    .items(
      Joi.object({
        material_id: Joi.string().uuid().required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required(),
        total_amount: Joi.number().positive().required(),
        brand_invoiced: Joi.string().max(255).optional(),
        brand_received: Joi.string().max(255).optional(),
        brand_ordered: Joi.string().max(255).optional(),
        variance_info: Joi.object().optional(),
      }).required()
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'Line items are required',
      'array.min': 'At least one line item is required',
    }),
  total_amount: Joi.number().positive().required().messages({
    'number.positive': 'Total amount must be greater than 0',
    'any.required': 'Total amount is required',
  }),
  notes: Joi.string().max(1000).optional(),
});

const updateInvoiceSchema = Joi.object({
  invoice_number: Joi.string().max(100).optional(),
  due_date: Joi.date().optional(),
  line_items: Joi.array()
    .items(
      Joi.object({
        material_id: Joi.string().uuid().required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required(),
        total_amount: Joi.number().positive().required(),
        brand_invoiced: Joi.string().max(255).optional(),
        variance_info: Joi.object().optional(),
      }).required()
    )
    .optional(),
  total_amount: Joi.number().positive().optional(),
  notes: Joi.string().max(1000).optional(),
});

const approveInvoiceSchema = Joi.object({
  approval_notes: Joi.string().max(1000).optional(),
});

const rejectInvoiceSchema = Joi.object({
  rejection_reason: Joi.string().max(1000).required().messages({
    'any.required': 'Rejection reason is required',
  }),
});

/**
 * GET /api/v1/invoices
 * List all invoices with filtering and pagination
 */
router.get(
  '/',
  requireAuth,
  validateQuery(
    paginationSchema.keys({
      po_id: Joi.string().uuid().optional(),
      vendor_id: Joi.string().uuid().optional(),
      status: Joi.string()
        .valid('SUBMITTED', 'APPROVED', 'REJECTED')
        .optional(),
      matching_status: Joi.string()
        .valid('UNMATCHED', 'PARTIAL_MATCHED', 'FULLY_MATCHED', 'MISMATCHED')
        .optional(),
      invoice_date_from: Joi.date().optional(),
      invoice_date_to: Joi.date().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const {
      page,
      page_size,
      vendor_id,
      status,
      matching_status,
    } = req.query;

    const result = await invoiceService.getInvoices({
      vendor_id: vendor_id as string | undefined,
      status: status as any | undefined,
      matching_status: matching_status as any | undefined,
      page: parseInt(page as string) || 1,
      pageSize: parseInt(page_size as string) || 20,
    });

    const response: ApiResponse = {
      success: true,
      data: result.items,
      error: null,
      meta: {
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: result.total_pages,
      },
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/invoices
 * Create (submit) a new invoice
 */
router.post(
  '/',
  requireAuth,
  requireRole(
    UserRole.FINANCE_OFFICER,
    UserRole.APPROVER,
    UserRole.ADMIN
  ),
  validateBody(createInvoiceSchema),
  asyncHandler(async (req, res) => {
    const {
      po_id,
      vendor_id,
      invoice_number,
      invoice_date,
      due_date,
      line_items,
      total_amount,
      notes,
    } = req.body;

    const invoice = await invoiceService.createInvoice(
      po_id,
      vendor_id,
      invoice_number,
      new Date(invoice_date),
      new Date(due_date),
      line_items,
      total_amount,
      req.user!.id,
      notes
    );

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/invoices/:id
 * Get a specific invoice by ID (includes match analysis)
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/invoices/:id
 * Update an invoice (only in SUBMITTED or REJECTED status)
 */
router.put(
  '/:id',
  requireAuth,
  validateBody(updateInvoiceSchema),
  asyncHandler(async (req, res) => {
    const {
      invoice_number,
      due_date,
      line_items,
      total_amount,
      notes,
    } = req.body;

    const invoice = await invoiceService.updateInvoice(req.params.id, {
      notes,
      line_items,
      total_amount,
    });

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/invoices/:id
 * Delete an invoice (only in SUBMITTED status)
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await invoiceService.deleteInvoice(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: null,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/invoices/:id/match
 * Trigger matching of invoice against PO and deliveries
 */
router.post(
  '/:id/match',
  requireAuth,
  requireRole(
    UserRole.FINANCE_OFFICER,
    UserRole.APPROVER,
    UserRole.ADMIN
  ),
  asyncHandler(async (req, res) => {
    const invoice = await invoiceService.performThreeWayMatch(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/invoices/:id/approve
 * Approve an invoice for payment
 */
router.post(
  '/:id/approve',
  requireAuth,
  requireRole(UserRole.FINANCE_OFFICER, UserRole.APPROVER, UserRole.ADMIN),
  validateBody(approveInvoiceSchema),
  asyncHandler(async (req, res) => {
    const { approval_notes } = req.body;

    const invoice = await invoiceService.approveInvoice(
      req.params.id,
      req.user!.id,
      approval_notes
    );

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/invoices/:id/reject
 * Reject an invoice
 */
router.post(
  '/:id/reject',
  requireAuth,
  requireRole(UserRole.FINANCE_OFFICER, UserRole.APPROVER, UserRole.ADMIN),
  validateBody(rejectInvoiceSchema),
  asyncHandler(async (req, res) => {
    const { rejection_reason } = req.body;

    const invoice = await invoiceService.rejectInvoice(
      req.params.id,
      req.user!.id,
      rejection_reason
    );

    const response: ApiResponse = {
      success: true,
      data: invoice,
      error: null,
    };

    res.json(response);
  })
);

export default router;
