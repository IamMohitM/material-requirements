import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import { config } from '@config/env';
import { errorHandler, asyncHandler } from '@middleware/errorHandler';
import { authMiddleware } from '@middleware/auth';
import logger from '@utils/logger';

// Routes
import authRoutes from '@routes/auth';
import projectRoutes from '@routes/projects';
import materialRoutes from '@routes/materials';
import vendorRoutes from '@routes/vendors';
import requestRoutes from '@routes/requests';
import quoteRoutes from '@routes/quotes';
import poRoutes from '@routes/pos';
import deliveryRoutes from '@routes/deliveries';
import invoiceRoutes from '@routes/invoices';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      userId: req.user?.id,
      ip: req.ip,
    });
    next();
  });

  // Health check endpoint
  app.get('/health', asyncHandler(async (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }));

  // API version
  app.get('/api/version', asyncHandler(async (req: Request, res: Response) => {
    res.json({
      version: '0.1.0',
      phase: 'foundation',
      name: 'Material Requirements Management System',
    });
  }));

  // Public Routes (no auth required)
  app.use('/api/v1/auth', authRoutes);

  // Protected Routes (auth required)
  app.use('/api/v1/projects', authMiddleware, projectRoutes);
  app.use('/api/v1/materials', authMiddleware, materialRoutes);
  app.use('/api/v1/vendors', authMiddleware, vendorRoutes);
  app.use('/api/v1/requests', authMiddleware, requestRoutes);
  app.use('/api/v1/quotes', authMiddleware, quoteRoutes);
  app.use('/api/v1/pos', authMiddleware, poRoutes);
  app.use('/api/v1/deliveries', authMiddleware, deliveryRoutes);
  app.use('/api/v1/invoices', authMiddleware, invoiceRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export async function startServer(app: Express): Promise<void> {
  app.listen(config.API_PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   Material Requirements Management System ║
║          API Server Started              ║
╠════════════════════════════════════════════╣
║  Environment: ${config.NODE_ENV.padEnd(30)} ║
║  Port:       ${config.API_PORT.toString().padEnd(30)} ║
║  URL:        http://localhost:${config.API_PORT.toString().padEnd(28)} ║
╚════════════════════════════════════════════╝
    `);
  });
}

export default createApp;
