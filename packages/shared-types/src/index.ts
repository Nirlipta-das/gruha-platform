/**
 * GRUHA Platform - Shared Types
 * Following PRD specifications exactly
 */

// ============================================
// ENUMS
// ============================================

export enum TokenType {
  RESILIENCE_CREDIT = 'RESILIENCE_CREDIT',
  RELIEF_TOKEN = 'RELIEF_TOKEN'
}

export enum Category {
  STORAGE = 'STORAGE',
  TRANSPORT = 'TRANSPORT',
  REPAIRS = 'REPAIRS',
  WAGES = 'WAGES',
  MATERIALS = 'MATERIALS',
  UTILITIES = 'UTILITIES',
  EQUIPMENT = 'EQUIPMENT'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum DisasterType {
  FLOOD = 'FLOOD',
  CYCLONE = 'CYCLONE',
  EARTHQUAKE = 'EARTHQUAKE',
  DROUGHT = 'DROUGHT',
  HEATWAVE = 'HEATWAVE',
  TSUNAMI = 'TSUNAMI',
  LANDSLIDE = 'LANDSLIDE',
  OTHER = 'OTHER'
}

export enum DisasterSeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE',
  CATASTROPHIC = 'CATASTROPHIC'
}

export enum UserRole {
  MSME = 'ROLE_MSME',
  VENDOR = 'ROLE_VENDOR',
  AUTHORITY_DISTRICT = 'ROLE_AUTHORITY_DISTRICT',
  AUTHORITY_STATE = 'ROLE_AUTHORITY_STATE',
  AUTHORITY_CENTRAL = 'ROLE_AUTHORITY_CENTRAL',
  PUBLIC = 'ROLE_PUBLIC',
  SUPER_ADMIN = 'ROLE_SUPER_ADMIN'
}

export enum FraudStatus {
  CLEAN = 'CLEAN',
  FLAGGED = 'FLAGGED',
  BLOCKED = 'BLOCKED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

// ============================================
// CORE ENTITIES
// ============================================

export interface MSME {
  id: string;
  walletAddress: string;
  businessName: string;
  udyamNumber: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  
  // Location
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  
  // Business details
  businessType: string;
  annualTurnover?: number;
  employeeCount?: number;
  
  // Verification
  kycStatus: KYCStatus;
  isActive: boolean;
  
  // Risk assessment
  riskZone: 'HIGH' | 'MEDIUM' | 'LOW';
  floodRisk: number; // 0-100
  cycloneRisk: number; // 0-100
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  walletAddress: string;
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  
  // Location
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  
  // Services
  categories: Category[];
  emergencyPricing: Record<Category, number>; // Max prices during emergency
  
  // For warehouses
  warehouseCapacity?: number; // in sq ft
  warehouseAvailable?: number;
  warehouseFloorLevel?: number; // flood safety
  
  // For transport
  vehicleTypes?: string[];
  vehicleCount?: number;
  
  // Compliance
  complianceScore: number; // 0-100
  totalEarnings: number;
  isVerified: boolean;
  isActive: boolean;
  
  // Bank details for INR settlement
  bankAccountNumber: string;
  bankIFSC: string;
  bankName: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Disaster {
  id: string;
  name: string;
  type: DisasterType;
  severity: DisasterSeverity;
  
  // Location
  affectedDistricts: string[];
  affectedStates: string[];
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  
  // Status
  isActive: boolean;
  declaredAt: Date;
  endedAt?: Date;
  
  // Allocation tracking
  totalAllocated: number;
  totalSpent: number;
  totalMSMEsAffected: number;
  
  // Authority who declared
  declaredBy: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenAllocation {
  id: string;
  blockchainAllocationId: number;
  
  msmeId: string;
  msmeWallet: string;
  
  tokenType: TokenType;
  totalAmount: number;
  remainingAmount: number;
  
  // Validity
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  
  // Context
  disasterId?: string;
  allocatedBy: string; // Authority ID
  
  // Blockchain reference
  txHash: string;
  blockNumber: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  blockchainTxId: number;
  
  // Parties
  msmeId: string;
  msmeWallet: string;
  vendorId: string;
  vendorWallet: string;
  
  // Transaction details
  allocationId: string;
  amount: number;
  category: Category;
  
  // Booking reference
  bookingId: string;
  
  // Proof
  proofHash: string; // IPFS hash
  proofImages?: string[];
  
  // Fraud detection
  fraudScore: number;
  fraudFlags: string[];
  fraudStatus: FraudStatus;
  
  // Blockchain reference
  txHash: string;
  blockNumber: number;
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
}

export interface Booking {
  id: string;
  
  // Parties
  msmeId: string;
  vendorId: string;
  
  // Service details
  category: Category;
  description: string;
  
  // For warehouse bookings
  warehouseSpace?: number;
  storageDuration?: number; // days
  
  // For transport bookings
  pickupAddress?: string;
  dropoffAddress?: string;
  vehicleType?: string;
  estimatedWeight?: number;
  
  // Pricing
  amount: number;
  paidAmount: number;
  
  // Status
  status: BookingStatus;
  
  // Timeline
  scheduledDate: Date;
  completedDate?: Date;
  
  // Proof
  proofImages: string[];
  proofHash?: string;
  
  // Blockchain
  txHash?: string;
  
  // Location verification
  vendorLatitude?: number;
  vendorLongitude?: number;
  msmeLatitude?: number;
  msmeLongitude?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth
export interface SendOTPRequest {
  mobileNumber: string;
}

export interface VerifyOTPRequest {
  mobileNumber: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    role: UserRole;
    name: string;
    walletAddress?: string;
  };
}

// MSME Registration
export interface RegisterMSMERequest {
  businessName: string;
  udyamNumber: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  businessType: string;
}

// Wallet
export interface WalletBalance {
  totalBalance: number;
  resilienceCredits: number;
  reliefTokens: number;
  allocations: TokenAllocationSummary[];
}

export interface TokenAllocationSummary {
  id: string;
  tokenType: TokenType;
  remainingAmount: number;
  validUntil: Date;
  allowedCategories: Category[];
}

// Booking
export interface CreateBookingRequest {
  vendorId: string;
  category: Category;
  description: string;
  amount: number;
  scheduledDate: string;
  
  // Category-specific
  warehouseSpace?: number;
  storageDuration?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
}

export interface SpendTokensRequest {
  allocationId: string;
  bookingId: string;
  amount: number;
  proofHash?: string;
}

// Vendor
export interface VendorSearchRequest {
  category: Category;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  minCapacity?: number;
}

// ============================================
// BLOCKCHAIN TYPES
// ============================================

export interface BlockchainConfig {
  network: 'mumbai' | 'amoy' | 'mainnet' | 'localhost';
  rpcUrl: string;
  contractAddress: string;
  chainId: number;
}

export interface MintTokensParams {
  msmeWallet: string;
  tokenType: TokenType;
  amount: string; // BigNumber as string
  validityDays: number;
  disasterId?: string;
}

export interface SpendTokensParams {
  allocationId: number;
  vendorWallet: string;
  amount: string;
  category: Category;
  bookingId: string;
  proofHash: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  timestamp: Date;
}
