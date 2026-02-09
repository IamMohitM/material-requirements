import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createPOSchema, approvePOSchema, rejectPOSchema, paginationSchema } from '@utils/validators';
import { poService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/pos
 * List all purchase orders with pagination and filtering
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, status, project_id, vendor_id, approval_status } = req.query;

    const result = await poService.getPOs({
      status: status as any | undefined,
      project_id: project_id as string | undefined,
      vendor_id: vendor_id as string | undefined,
      approval_status: approval_status as any | undefined,
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
 * POST /api/v1/pos
 * Create a new purchase order from a quote
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  validateBody(createPOSchema),
  asyncHandler(async (req, res) => {
    const { request_id, quote_id, special_instructions, delivery_address } = req.body;

    // Get request and quote details to extract information
    const { requestService } = await import('@services/index');
    const { quoteService } = await import('@services/index');

    const request = await requestService.getRequestById(request_id);
    const quote = await quoteService.getQuoteById(quote_id);

    const po = await poService.createPO(
      request.project_id,
      request_id,
      quote.vendor_id,
      quote_id,
      quote.line_items,
      quote.total_amount,
      new Date(), // delivery date - use submitted_at from request
      req.user!.id,
      delivery_address,
      special_instructions
    );

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/pos/:id
 * Get a specific PO by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const po = await poService.getPOById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/pos/:id
 * Update a PO (draft only)
 */
router.put(
  '/:id',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { line_items, delivery_address, special_instructions, required_delivery_date } =
      req.body;

    const po = await poService.updatePO(req.params.id, {
      line_items,
      delivery_address,
      special_instructions,
      required_delivery_date: required_delivery_date ? new Date(required_delivery_date) : undefined,
    });

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/pos/:id/submit
 * Submit PO for approval
 */
router.post(
  '/:id/submit',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const po = await poService.submitPO(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/pos/:id/approve
 * Approve a PO
 */
router.post(
  '/:id/approve',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.ADMIN),
  validateBody(approvePOSchema),
  asyncHandler(async (req, res) => {
    const { approval_limit, comments } = req.body;

    // Validate approval limit
    if (!approval_limit || approval_limit <= 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Approval limit is required and must be greater than 0',
        },
      });
      return;
    }

    const po = await poService.approvePO(
      req.params.id,
      req.user!.id,
      approval_limit,
      comments
    );

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/pos/:id/reject
 * Reject a PO
 */
router.post(
  '/:id/reject',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.ADMIN),
  validateBody(rejectPOSchema),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Rejection reason is required',
        },
      });
      return;
    }

    const po = await poService.rejectPO(req.params.id, req.user!.id, reason);

    const response: ApiResponse = {
      success: true,
      data: po,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/pos/project/:project_id
 * Get all POs for a project
 */
router.get(
  '/project/:project_id',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size } = req.query;

    const result = await poService.getPOs({
      project_id: req.params.project_id,
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

export default router;
