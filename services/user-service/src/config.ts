/**
 * GRUHA User Service Configuration
 * Per PRD §8 - Data Models for MSMEs and Vendors
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.USER_SERVICE_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    path: process.env.DATABASE_PATH || './data/gruha.db',
  },
  
  // KYC Configuration
  kyc: {
    // Udyam Aadhaar validation (mock in dev)
    mockValidation: process.env.NODE_ENV === 'development',
    // Document upload limits
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  
  // Blockchain Integration
  blockchain: {
    serviceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3005',
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  },
};

// User roles per PRD §4
export enum UserRole {
  MSME = 'ROLE_MSME',
  VENDOR = 'ROLE_VENDOR',
  AUTHORITY_DISTRICT = 'ROLE_AUTHORITY_DISTRICT',
  AUTHORITY_STATE = 'ROLE_AUTHORITY_STATE',
  PUBLIC = 'ROLE_PUBLIC',
  SUPER_ADMIN = 'ROLE_SUPER_ADMIN',
}

// KYC status
export enum KycStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// Vendor categories per PRD
export enum VendorCategory {
  WAREHOUSE = 'warehouse',
  TRANSPORT = 'transport',
  REPAIR_SHOP = 'repair_shop',
  ELECTRICAL = 'electrical',
  MACHINERY = 'machinery',
  RAW_MATERIAL = 'raw_material',
  EQUIPMENT = 'equipment',
  POWER_GENERATOR = 'power_generator',
  TEMPORARY_SHOP = 'temporary_shop',
}
