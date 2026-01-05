/**
 * GRUHA User Service
 * Per PRD §8 - User management for MSMEs and Vendors
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './logger';
import { msmeRouter, vendorRouter } from './routes';
import { initializeDatabase } from './database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    version: '1.0.0',
  });
});

// Routes
app.use('/api/users/msme', msmeRouter);
app.use('/api/users/vendor', vendorRouter);

// Service info
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    name: 'GRUHA User Service',
    version: '1.0.0',
    description: 'MSME and Vendor registration with KYC',
    endpoints: {
      msme: {
        register: 'POST /api/users/msme/register',
        profile: 'GET /api/users/msme/profile/:id',
        update: 'PUT /api/users/msme/profile/:id',
        kycSubmit: 'POST /api/users/msme/kyc/submit/:id',
        list: 'GET /api/users/msme/list',
      },
      vendor: {
        register: 'POST /api/users/vendor/register',
        profile: 'GET /api/users/vendor/profile/:id',
        update: 'PUT /api/users/vendor/profile/:id',
        verify: 'POST /api/users/vendor/verify/:id',
        addWarehouse: 'POST /api/users/vendor/warehouse',
        searchWarehouses: 'GET /api/users/vendor/warehouses/search',
        list: 'GET /api/users/vendor/list',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
    },
  });
});

// Initialize and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    const server = app.listen(config.port, () => {
      logger.info(`🚀 User Service started on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
      logger.info(`📚 API Info: http://localhost:${config.port}/api/users`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();

export default app;
