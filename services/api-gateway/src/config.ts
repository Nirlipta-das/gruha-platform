/**
 * GRUHA API Gateway Configuration
 * Per PRD §13 - Environment configuration
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'gruha-development-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // OTP Configuration
  otp: {
    length: 6,
    expiresInMinutes: 10,
    maxAttempts: 3,
    // In production, integrate with SMS gateway
    mockOtp: process.env.NODE_ENV === 'development' ? '123456' : null,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    otpWindowMs: 60 * 1000, // 1 minute
    otpMaxRequests: 5,
  },
  
  // Service URLs
  services: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    walletService: process.env.WALLET_SERVICE_URL || 'http://localhost:3002',
    bookingService: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
    blockchainService: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

// User Roles per PRD §4
export enum UserRole {
  MSME = 'ROLE_MSME',
  VENDOR = 'ROLE_VENDOR',
  AUTHORITY_DISTRICT = 'ROLE_AUTHORITY_DISTRICT',
  AUTHORITY_STATE = 'ROLE_AUTHORITY_STATE',
  AUTHORITY_NATIONAL = 'ROLE_AUTHORITY_NATIONAL',
  PUBLIC = 'ROLE_PUBLIC',
  SUPER_ADMIN = 'ROLE_SUPER_ADMIN',
}

// Role permissions mapping
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.MSME]: [
    'msme:read',
    'msme:update',
    'wallet:read',
    'booking:create',
    'booking:read',
    'booking:cancel',
    'transaction:read',
  ],
  [UserRole.VENDOR]: [
    'vendor:read',
    'vendor:update',
    'booking:read',
    'booking:accept',
    'booking:reject',
    'booking:complete',
    'settlement:read',
  ],
  [UserRole.AUTHORITY_DISTRICT]: [
    'disaster:declare',
    'disaster:update',
    'allocation:create',
    'allocation:read',
    'analytics:read',
    'msme:read',
    'vendor:read',
  ],
  [UserRole.AUTHORITY_STATE]: [
    'disaster:declare',
    'disaster:update',
    'allocation:create',
    'allocation:read',
    'allocation:approve',
    'analytics:read',
    'msme:read',
    'vendor:read',
  ],
  [UserRole.AUTHORITY_NATIONAL]: [
    'disaster:declare',
    'disaster:update',
    'allocation:create',
    'allocation:read',
    'allocation:approve',
    'analytics:read',
    'config:update',
    'msme:read',
    'vendor:read',
  ],
  [UserRole.PUBLIC]: [
    'public:read',
    'analytics:public',
  ],
  [UserRole.SUPER_ADMIN]: [
    '*', // All permissions
  ],
};
