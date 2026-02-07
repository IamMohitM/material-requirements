import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createMaterialSchema, updateMaterialSchema, paginationSchema } from '@utils/validators';
import { materialService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/materials
 * List all materials with pagination and filtering
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, category, is_active } = req.query;

    const result = await materialService.getMaterials({
      category: category as string | undefined,
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
 * POST /api/v1/materials
 * Create a new material
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.FINANCE_OFFICER),
  validateBody(createMaterialSchema),
  asyncHandler(async (req, res) => {
    const { name, category, unit_of_measure, description } = req.body;

    const material = await materialService.createMaterial(
      name,
      category,
      unit_of_measure,
      description
    );

    const response: ApiResponse = {
      success: true,
      data: material,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/materials/:id
 * Get a specific material by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const material = await materialService.getMaterialById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: material,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/materials/:id
 * Update a material
 */
router.put(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.FINANCE_OFFICER),
  validateBody(updateMaterialSchema),
  asyncHandler(async (req, res) => {
    const { name, category, unit_of_measure, description, is_active } = req.body;

    const material = await materialService.updateMaterial(req.params.id, {
      name,
      category,
      unit_of_measure,
      description,
      is_active,
    });

    const response: ApiResponse = {
      success: true,
      data: material,
      error: null,
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/materials/:id
 * Delete a material (soft delete)
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    await materialService.updateMaterial(req.params.id, { is_active: false });

    const response: ApiResponse = {
      success: true,
      data: null,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/materials/search
 * Search materials by name or code
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

    const result = await materialService.searchMaterials(
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

/**
 * GET /api/v1/materials/categories
 * Get all material categories
 */
router.get(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Get all materials and extract unique categories
    const allMaterials = await materialService.getMaterials({
      isActive: true,
      pageSize: 1000,
    });

    const categories = [...new Set(allMaterials.items.map((m) => m.category))];

    const response: ApiResponse = {
      success: true,
      data: categories.sort(),
      error: null,
    };

    res.json(response);
    return;
  })
);

export default router;
