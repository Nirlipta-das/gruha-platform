/**
 * GRUHA JWT Service
 * Per PRD §9 - JWT-based authentication
 */

import jwt from 'jsonwebtoken';
import { config, UserRole } from './config';
import { logger } from './logger';

// Token payload structure
export interface TokenPayload {
  userId: string;
  phone: string;
  role: UserRole;
  walletAddress?: string;
  iat?: number;
  exp?: number;
}

// Refresh token payload
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

// In-memory token version store (use Redis in production)
const tokenVersions = new Map<string, number>();

// Parse expiry string to seconds (e.g., "7d" -> 604800)
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default 1 hour
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const expiresIn = parseExpiry(config.jwt.expiresIn);
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn });
  
  logger.debug(`Access token generated for user ${payload.userId}`);
  return token;
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  // Get or initialize token version
  let version = tokenVersions.get(userId) || 0;
  version++;
  tokenVersions.set(userId, version);
  
  const payload: RefreshTokenPayload = {
    userId,
    tokenVersion: version,
  };
  
  const expiresIn = parseExpiry(config.jwt.refreshExpiresIn);
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn });
  
  logger.debug(`Refresh token generated for user ${userId}`);
  return token;
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid access token');
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as RefreshTokenPayload;
    
    // Verify token version
    const currentVersion = tokenVersions.get(payload.userId) || 0;
    if (payload.tokenVersion !== currentVersion) {
      logger.warn(`Refresh token version mismatch for user ${payload.userId}`);
      return null;
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token');
    }
    return null;
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export function revokeRefreshTokens(userId: string): void {
  const currentVersion = tokenVersions.get(userId) || 0;
  tokenVersions.set(userId, currentVersion + 1);
  logger.info(`Revoked refresh tokens for user ${userId}`);
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
