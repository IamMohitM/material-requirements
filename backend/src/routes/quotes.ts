import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createQuoteSchema, paginationSchema } from '@utils/validators';
import { quoteService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/quotes
 * List all quotes with pagination and filtering
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, status, vendor_id } = req.query;

    const result = await quoteService.getQuotes({
      status: status as any | undefined,
      vendor_id: vendor_id as string | undefined,
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
 * POST /api/v1/quotes
 * Create a new quote from a request
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.FINANCE_OFFICER, UserRole.ADMIN, UserRole.APPROVER),
  validateBody(createQuoteSchema),
  asyncHandler(async (req, res) => {
    const { request_id, vendor_id, line_items, total_amount } = req.body;

    const quote = await quoteService.createQuote(
      request_id,
      vendor_id,
      line_items,
      total_amount,
      30
    );

    const response: ApiResponse = {
      success: true,
      data: quote,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/quotes/:id
 * Get a specific quote by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const quote = await quoteService.getQuoteById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: quote,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/quotes/request/:request_id
 * Get all quotes for a specific request - MUST BE BEFORE compare endpoint
 */
router.get(
  '/request/:request_id',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size } = req.query;

    const result = await quoteService.getQuotesByRequest(
      req.params.request_id,
      parseInt(page as string) || 1,
      parseInt(page_size as string) || 20
    );

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
    return;
  })
);

/**
 * POST /api/v1/quotes/:id/accept
 * Accept a quote
 */
router.post(
  '/:id/accept',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const quote = await quoteService.acceptQuote(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: quote,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/quotes/:id/reject
 * Reject a quote
 */
router.post(
  '/:id/reject',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const quote = await quoteService.rejectQuote(req.params.id, reason);

    const response: ApiResponse = {
      success: true,
      data: quote,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/quotes/:id/mark-received
 * Mark quote as received from vendor
 */
router.post(
  '/:id/mark-received',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.FINANCE_OFFICER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const quote = await quoteService.markQuoteReceived(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: quote,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/quotes/request/:request_id/compare
 * Compare quotes for a request - MUST BE AFTER /request/:request_id
 */
router.get(
  '/request/:request_id/compare',
  requireAuth,
  asyncHandler(async (req, res) => {
    const quotes = await quoteService.getActiveQuotesForRequest(req.params.request_id);

    // Sort quotes by total amount (lowest first)
    const sortedQuotes = quotes.sort((a, b) => a.total_amount - b.total_amount);

    // Build comparison data
    const comparison = {
      request_id: req.params.request_id,
      total_quotes: quotes.length,
      quotes: sortedQuotes.map((q) => ({
        id: q.id,
        quote_number: q.quote_number,
        vendor_id: q.vendor_id,
        total_amount: q.total_amount,
        status: q.status,
        valid_until: q.valid_until,
        line_items: q.line_items,
      })),
      lowest_price: sortedQuotes.length > 0 ? sortedQuotes[0].total_amount : null,
      highest_price: sortedQuotes.length > 0 ? sortedQuotes[sortedQuotes.length - 1].total_amount : null,
      price_range: sortedQuotes.length > 0 ? sortedQuotes[sortedQuotes.length - 1].total_amount - sortedQuotes[0].total_amount : null,
    };

    const response: ApiResponse = {
      success: true,
      data: comparison,
      error: null,
    };

    res.json(response);
  })
);

export default router;
