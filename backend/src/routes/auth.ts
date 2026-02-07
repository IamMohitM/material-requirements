import { Router } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { validateBody } from '@middleware/validation';
import { authMiddleware, requireAuth } from '@middleware/auth';
import { loginSchema } from '@utils/validators';
import { AuthService } from '@services/AuthService';
import { ApiResponse } from '../types/index';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/v1/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
  // @ts-ignore - asyncHandler type compatibility
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    } else {
      const accessToken = await authService.refreshToken(refresh_token);

      const response: ApiResponse = {
        success: true,
        data: {
          access_token: accessToken,
        },
        error: null,
      };

      res.json(response);
    }
  })
);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: user,
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/auth/logout
 * Logout (in stateless JWT, this is mainly client-side)
 */
router.post(
  '/logout',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req, res) => {
    // In JWT-based auth, logout is handled by client discarding the token
    // Optionally, you can implement token blacklisting with Redis

    const response: ApiResponse = {
      success: true,
      data: { message: 'Logged out successfully' },
      error: null,
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/auth/change-password
 * Change password
 */
router.post(
  '/change-password',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req, res) => {
  // @ts-ignore - asyncHandler type compatibility
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Old and new passwords are required',
        },
      });
    } else {
      await authService.changePassword(req.user!.id, oldPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password changed successfully' },
        error: null,
      };

      res.json(response);
    }
  })
);

export default router;
