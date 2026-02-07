import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, getErrorMessage } from '@utils/errors';
import { ApiResponse } from '../types/index';
import logger from '@utils/logger';

/**
 * Global error handling middleware
 * Catches errors from all routes and sends consistent error responses
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  const errorMessage = getErrorMessage(error);
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: errorMessage,
    userId: req.user?.id,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Handle app errors
  if (isAppError(error)) {
    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: (error as any).details,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle validation errors from joi
  if ((error as any).details && Array.isArray((error as any).details)) {
    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (error as any).details,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle JWT errors
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid token',
      },
    };
    res.status(401).json(response);
    return;
  }

  // Handle generic errors
  const response: ApiResponse = {
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : errorMessage,
    },
  };
  res.status(500).json(response);
}

/**
 * Async error wrapper for Express route handlers
 * Catches errors in async functions and passes them to the error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
