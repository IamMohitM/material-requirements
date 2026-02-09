import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createRequestSchema, paginationSchema } from '@utils/validators';
import { requestService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/requests
 * List all material requests with filtering and pagination
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, project_id, status, submitted_by_id } = req.query;

    const result = await requestService.getRequests({
      projectId: project_id as string | undefined,
      status: status as any | undefined,
      submittedById: submitted_by_id as string | undefined,
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
 * POST /api/v1/requests
 * Create a new material request
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.SITE_ENGINEER, UserRole.APPROVER, UserRole.ADMIN),
  validateBody(createRequestSchema),
  asyncHandler(async (req, res) => {
    const { project_id, materials, approval_notes } = req.body;

    const request = await requestService.createRequest(
      project_id,
      req.user!.id,
      materials,
      approval_notes
    );

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/requests/:id
 * Get a specific request by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const request = await requestService.getRequestById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/requests/:id
 * Update a request (draft only)
 */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { materials } = req.body;

    const request = await requestService.updateRequest(req.params.id, materials);

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/requests/:id/submit
 * Submit request for approval
 */
router.post(
  '/:id/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const request = await requestService.submitRequest(req.params.id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/requests/:id/approve
 * Approve a request
 */
router.post(
  '/:id/approve',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { comments } = req.body;

    const request = await requestService.approveRequest(
      req.params.id,
      req.user!.id,
      comments
    );

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/requests/:id/reject
 * Reject a request
 */
router.post(
  '/:id/reject',
  requireAuth,
  requireRole(UserRole.APPROVER, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const request = await requestService.rejectRequest(
      req.params.id,
      req.user!.id,
      reason
    );

    const response: ApiResponse = {
      success: true,
      data: request,
      error: null,
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/projects/:projectId/requests
 * Get requests for a specific project
 */
router.get(
  '/project/:projectId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page = '1', page_size = '20' } = req.query;

    const result = await requestService.getRequestsByProject(
      req.params.projectId,
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
