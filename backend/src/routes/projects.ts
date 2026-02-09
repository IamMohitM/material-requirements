import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody, validateQuery } from '@middleware/validation';
import { requireAuth, requireRole } from '@middleware/auth';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '@utils/validators';
import { projectService } from '@services/index';
import { ApiResponse, UserRole } from '../types/index';

const router = Router();

/**
 * GET /api/v1/projects
 * List all projects with pagination and filtering
 */
router.get(
  '/',
  requireAuth,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, page_size, status, created_by_id } = req.query;

    const result = await projectService.getProjects({
      status: status as any | undefined,
      created_by_id: created_by_id as string | undefined,
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
 * POST /api/v1/projects
 * Create a new project
 */
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.APPROVER),
  validateBody(createProjectSchema),
  asyncHandler(async (req, res) => {
    const { name, budget, start_date, end_date, description, status } = req.body;

    const project = await projectService.createProject(
      name,
      budget,
      req.user!.id,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined,
      description,
      status
    );

    const response: ApiResponse = {
      success: true,
      data: project,
      error: null,
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/projects/:id
 * Get a specific project by ID
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: project,
      error: null,
    };

    res.json(response);
  })
);

/**
 * PUT /api/v1/projects/:id
 * Update a project
 */
router.put(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.APPROVER),
  validateBody(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const { name, budget, status, end_date, description } = req.body;

    const project = await projectService.updateProject(req.params.id, {
      name,
      budget,
      status,
      end_date: end_date ? new Date(end_date) : undefined,
      description,
    });

    const response: ApiResponse = {
      success: true,
      data: project,
      error: null,
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/projects/:id
 * Delete a project (soft delete - pause)
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.params.id);

    const response: ApiResponse = {
      success: true,
      data: null,
      error: null,
    };

    res.json(response);
  })
);

export default router;
