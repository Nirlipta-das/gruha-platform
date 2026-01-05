/**
 * GRUHA Booking Service Configuration
 * Per PRD - Warehouse and Transport Bookings
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.BOOKING_SERVICE_PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Related Services
  services: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    walletService: process.env.WALLET_SERVICE_URL || 'http://localhost:3002',
    blockchainService: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3005',
  },
};

// Booking status workflow
export enum BookingStatus {
  PENDING = 'pending',           // Created, awaiting vendor acceptance
  ACCEPTED = 'accepted',         // Vendor accepted
  IN_PROGRESS = 'in_progress',   // Service being delivered
  COMPLETED = 'completed',       // Service completed
  CANCELLED = 'cancelled',       // Cancelled by either party
  DISPUTED = 'disputed',         // Under dispute
}

// Service types per PRD
export enum ServiceType {
  WAREHOUSE_STORAGE = 'warehouse_storage',
  TRANSPORT = 'transport',
  WAREHOUSE_TRANSPORT_BUNDLE = 'warehouse_transport_bundle',
  REPAIR_SERVICE = 'repair_service',
  EQUIPMENT_RENTAL = 'equipment_rental',
  POWER_GENERATOR = 'power_generator',
  RAW_MATERIALS = 'raw_materials',
  TEMPORARY_SHOP = 'temporary_shop',
}

// Category mapping to wallet spending categories
export const ServiceToCategory: Record<ServiceType, number> = {
  [ServiceType.WAREHOUSE_STORAGE]: 0,        // Storage
  [ServiceType.TRANSPORT]: 1,                 // Transport
  [ServiceType.WAREHOUSE_TRANSPORT_BUNDLE]: 0, // Storage (bundled)
  [ServiceType.REPAIR_SERVICE]: 2,            // Repairs
  [ServiceType.EQUIPMENT_RENTAL]: 4,          // Equipment
  [ServiceType.POWER_GENERATOR]: 4,           // Equipment
  [ServiceType.RAW_MATERIALS]: 3,             // Raw Materials
  [ServiceType.TEMPORARY_SHOP]: 2,            // Repairs (infrastructure)
};
