import { Router } from 'express';
import Joi from 'joi';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { paginationSchema } from '@utils/validators';
import { deliveryService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * Validation schemas for delivery endpoints
 */
const createDeliverySchema = Joi.object({
  po_id: Joi.string().uuid().required().messages({
    'string.uuid': 'PO ID must be a valid UUID',
    'any.required': 'PO ID is required',
  }),
  line_items: Joi.array()
    .items(
      Joi.object({
        po_line_item_id: Joi.string().uuid().required(),
        material_id: Joi.string().uuid().required(),
        quantity_ordered: Joi.number().integer().positive().required(),
        quantity_good: Joi.number().integer().min(0).required(),
        quantity_damaged: Joi.number().integer().min(0).required(),
        damage_notes: Joi.string().max(500).optional(),
        brand_received: Joi.string().max(255).optional(),
        brand_ordered: Joi.string().max(255).optional(),
      }).required()
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'Line items are required',
      'array.min': 'At least one line item is required',
    }),
  received_by_id: Joi.string().uuid().required(),
  delivery_date: Joi.date().required().messages({
    'date.base': 'Delivery date must be a valid date',
    'any.required': 'Delivery date is required',
  }),
  location: Joi.string().max(500).optional(),
  location_details: Joi.string().max(1000).optional(),
  notes: Joi.string().max(1000).optional(),
  photos: Joi.array().items(Joi.object()).optional(),
});

const updateDeliverySchema = Joi.object({
  line_items: Joi.array()
    .items(
      Joi.object({
        po_line_item_id: Joi.string().uuid().required(),
        material_id: Joi.string().uuid().required(),
        quantity_ordered: Joi.number().integer().positive().required(),
        quantity_good: Joi.number().integer().min(0).required(),
        quantity_damaged: Joi.number().integer().min(0).required(),
        damage_notes: Joi.string().max(500).optional(),
        brand_received: Joi.string().max(255).optional(),
        brand_ordered: Joi.string().max(255).optional(),
      }).required()
    )
    .min(1)
    .optional(),
  location: Joi.string().max(500).optional(),
  location_details: Joi.string().max(1000).optional(),
  notes: Joi.string().max(1000).optional(),
  photos: Joi.array().items(Joi.object()).optional(),
});

/**
 * GET /api/v1/deliveries
 * List all deliveries with filtering and pagination
 */
router.get(
  '/',
  requireAuth,
  validateQuery(
    paginationSchema.keys({
      po_id: Joi.string().uuid().optional(),
      status: Joi.string().valid('PENDING', 'PARTIAL', 'COMPLETE').optional(),
      delivery_date_from: Joi.date().optional(),
      delivery_date_to: Joi.date().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const {
      page,
      page_size,
      status,
    } = req.query;

    const result = await deliveryService.getDeliveries({
      status: status as any | undefined,
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
 * POST /api/v1/deliveries
 * Create a new delivery record
 */
router.post(
  '/',
  requireAuth,
  requireRole(
    UserRole.SITE_ENGINEER,
    UserRole.APPROVER,
    UserRole.FINANCE_OFFICER,
    UserRole.ADMIN
  ),
  validateBody(createDeliverySchema),
  asyncHandler(async (req, res) => {
    const {
      po_id,
      line_items,
      received_by_id,
      delivery_date,
      location,
      location_details,
      notes,
      photos,
    } = req.body;

    const delivery = await deliveryService.createDelivery(
      po_id,
      line_items,
      received_by_id,
      new Date(delivery_date),
      location,
      notes,
      photos
    );

    const response: ApiResponse = {
      success: true,
      data: delivery,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/deliveries/:id
 * Get a specific delivery by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const delivery = await deliveryService.getDeliveryById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: delivery,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/deliveries/:id
 * Update a delivery (only in PENDING status)
 */
router.put(
  '/:id',
  requireAuth,
  validateBody(updateDeliverySchema),
  asyncHandler(async (req, res) => {
    const { line_items, location, notes, photos } = req.body;

    const delivery = await deliveryService.updateDelivery(req.params.id, {
      line_items,
      location,
      notes,
      photos,
    });

    const response: ApiResponse = {
      success: true,
      data: delivery,
      error: null,
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/deliveries/:id
 * Delete a delivery (only in PENDING status)
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await deliveryService.deleteDelivery(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: null,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/deliveries/:id/complete
 * Mark a delivery as COMPLETE
 */
router.post(
  '/:id/complete',
  requireAuth,
  requireRole(
    UserRole.SITE_ENGINEER,
    UserRole.APPROVER,
    UserRole.ADMIN
  ),
  asyncHandler(async (req, res) => {
    const { completed_by_id } = req.body;

    const delivery = await deliveryService.completeDelivery(
      req.params.id,
      completed_by_id || req.user!.id
    );

    const response: ApiResponse = {
      success: true,
      data: delivery,
      error: null,
    };

    res.json(response);
  })
);

export default router;
