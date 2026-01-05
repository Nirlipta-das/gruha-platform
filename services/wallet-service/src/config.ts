/**
 * GRUHA Wallet Service Configuration
 * Per PRD §7 - Dual Token Logic
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.WALLET_SERVICE_PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Blockchain Service
  blockchain: {
    serviceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3005',
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  },
  
  // User Service
  userService: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  },
};

// Token types per PRD §7
export enum TokenType {
  RESILIENCE_CREDIT = 0, // Pre-disaster: STORAGE/TRANSPORT only
  RELIEF_TOKEN = 1,       // Post-disaster: All recovery categories
}

// Spending categories per PRD
export enum SpendingCategory {
  STORAGE = 0,
  TRANSPORT = 1,
  REPAIRS = 2,
  RAW_MATERIALS = 3,
  EQUIPMENT = 4,
  WAGES = 5,       // Max 30% of allocation for wages
  UTILITIES = 6,
}

// Category labels
export const CategoryLabels: Record<SpendingCategory, string> = {
  [SpendingCategory.STORAGE]: 'Storage',
  [SpendingCategory.TRANSPORT]: 'Transport',
  [SpendingCategory.REPAIRS]: 'Repairs',
  [SpendingCategory.RAW_MATERIALS]: 'Raw Materials',
  [SpendingCategory.EQUIPMENT]: 'Equipment',
  [SpendingCategory.WAGES]: 'Wages',
  [SpendingCategory.UTILITIES]: 'Utilities',
};
