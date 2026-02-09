import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createVendorSchema, updateVendorSchema, paginationSchema } from '@utils/validators';
import { vendorService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/vendors
 * List all vendors with pagination
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, is_active } = req.query;

    const result = await vendorService.getVendors({
      isActive: is_active ? is_active === 'true' : true,
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
 * POST /api/v1/vendors
 * Create a new vendor
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.FINANCE_OFFICER),
  validateBody(createVendorSchema),
  asyncHandler(async (req, res) => {
    const { name, contact_person, email, phone, address, payment_terms } = req.body;

    const vendor = await vendorService.createVendor(
      name,
      contact_person,
      email,
      phone,
      address,
      payment_terms
    );

    const response: ApiResponse = {
      success: true,
      data: vendor,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/vendors/:id
 * Get a specific vendor by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: vendor,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/vendors/:id
 * Update a vendor
 */
router.put(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.FINANCE_OFFICER),
  validateBody(updateVendorSchema),
  asyncHandler(async (req, res) => {
    const { name, contact_person, email, phone, address, rating, is_active } =
      req.body;

    const vendor = await vendorService.updateVendor(req.params.id, {
      name,
      contact_person,
      email,
      phone,
      address,
      rating,
      is_active,
    });

    const response: ApiResponse = {
      success: true,
      data: vendor,
      error: null,
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/vendors/:id
 * Delete a vendor (soft delete)
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    await vendorService.updateVendor(req.params.id, { is_active: false });

    const response: ApiResponse = {
      success: true,
      data: null,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/vendors/:id/rates
 * Get vendor's rate history for a material
 */
router.get(
  '/:id/rates',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { material_id, limit } = req.query;

    if (!material_id) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Material ID (material_id) is required',
        },
      });
      return;
    }

    const rates = await vendorService.getRateHistory(
      req.params.id,
      material_id as string,
      { limit: limit ? parseInt(limit as string) : 10 }
    );

    const response: ApiResponse = {
      success: true,
      data: rates,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/vendors/:id/performance
 * Get vendor performance metrics
 */
router.get(
  '/:id/performance',
  requireAuth,
  asyncHandler(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);

    // Return vendor performance data
    const performance = {
      vendor_id: vendor.id,
      name: vendor.name,
      rating: vendor.rating,
      is_active: vendor.is_active,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at,
    };

    const response: ApiResponse = {
      success: true,
      data: performance,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/vendors/search
 * Search vendors by name
 */
router.get(
  '/search',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { q, page, page_size } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Search query (q) is required',
        },
      });
      return;
    }

    const result = await vendorService.searchVendors(
      q as string,
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
  })
);

export default router;
