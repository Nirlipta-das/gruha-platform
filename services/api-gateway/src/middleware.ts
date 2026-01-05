/**
 * GRUHA API Gateway Middleware
 * Authentication, authorization, and request handling
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyAccessToken, TokenPayload } from './jwt-service';
import { config, UserRole, rolePermissions } from './config';
import { logger, logRequest, logResponse } from './logger';

// Extend Express Request to include user and requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: TokenPayload;
      startTime: number;
    }
  }
}

/**
 * Request ID and timing middleware
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  
  logRequest(req.requestId, req.method, req.path, req.user?.userId);
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logResponse(req.requestId, res.statusCode, duration);
  });
  
  next();
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header required',
      },
    });
  }
  
  const [bearer, token] = authHeader.split(' ');
  
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Invalid authorization header format. Use: Bearer <token>',
      },
    });
  }
  
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
  
  req.user = payload;
  next();
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const [bearer, token] = authHeader.split(' ');
    if (bearer === 'Bearer' && token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
      }
    }
  }
  
  next();
}

/**
 * Role-based authorization middleware
 * Checks if user has the required role
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.userId} to ${req.path}`, {
        userRole: req.user.role,
        requiredRoles: roles,
      });
      
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
    
    next();
  };
}

/**
 * Permission-based authorization middleware
 * Checks if user has the required permission
 */
export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }
    
    const userPermissions = rolePermissions[req.user.role] || [];
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) {
      return next();
    }
    
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      logger.warn(`Permission denied for user ${req.user.userId}`, {
        userPermissions,
        requiredPermissions: permissions,
      });
      
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
    
    next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled error: ${err.message}`, {
    requestId: req.requestId,
    stack: err.stack,
  });
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    },
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
