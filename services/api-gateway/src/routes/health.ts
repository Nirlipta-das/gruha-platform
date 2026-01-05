/**
 * GRUHA Health Check Routes
 */

import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
  });
});

/**
 * GET /health/ready
 * Readiness check (for Kubernetes/load balancers)
 */
router.get('/ready', async (req: Request, res: Response) => {
  // In production, check database, cache, and service connections
  const checks = {
    gateway: true,
    // Add more checks here
  };
  
  const allHealthy = Object.values(checks).every(v => v === true);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks,
  });
});

/**
 * GET /health/live
 * Liveness check
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;
