/**
 * GRUHA API Gateway
 * Central entry point for all API requests
 * Per PRD §9 - API Gateway with JWT authentication
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './logger';
import { 
  requestIdMiddleware, 
  authMiddleware,
  errorHandler, 
  notFoundHandler 
} from './middleware';
import { authRouter, healthRouter } from './routes';

const app = express();

// Trust proxy (for rate limiting behind load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID and logging
app.use(requestIdMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: config.rateLimit.otpWindowMs,
  max: config.rateLimit.otpMaxRequests,
  message: {
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests, please wait',
    },
  },
});
app.use('/api/v1/auth/otp', otpLimiter);

// Health routes (no auth required)
app.use('/health', healthRouter);

// Auth routes
app.use('/api/v1/auth', authRouter);

// Protected route placeholder for downstream services
// These will forward to microservices once they're running
app.use('/api/v1/users', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'User service endpoint',
    info: 'User service is being developed',
    user: (req as any).user,
  });
});

app.use('/api/v1/wallet', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Wallet service endpoint',
    info: 'Wallet service is being developed',
    user: (req as any).user,
  });
});

app.use('/api/v1/bookings', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Booking service endpoint',
    info: 'Booking service is being developed',
    user: (req as any).user,
  });
});

app.use('/api/v1/blockchain', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Blockchain service endpoint',
    info: 'Connect to blockchain service on port 3005',
    user: (req as any).user,
    blockchainServiceUrl: config.services.blockchainService,
  });
});

// API info route
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    name: 'GRUHA API Gateway',
    version: '1.0.0',
    description: 'Climate Resilience & Blockchain Recovery Ecosystem',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      wallet: '/api/v1/wallet',
      bookings: '/api/v1/bookings',
      blockchain: '/api/v1/blockchain',
    },
    documentation: 'https://docs.gruha.gov.in',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 API Gateway started on port ${config.port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
  logger.info(`📚 API Info: http://localhost:${config.port}/api/v1`);
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

export default app;
