/**
 * GRUHA Booking Service - In-Memory Storage
 * Per PRD - Booking data structures
 */

import { BookingStatus, ServiceType } from './config';
import { logger } from './logger';

// Booking record structure
export interface Booking {
  id: string;
  msmeId: string;
  vendorId: string;
  warehouseId?: string;
  
  // Service details
  serviceType: ServiceType;
  description: string;
  
  // Location
  pickupLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  deliveryLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  
  // Timing
  startDate: string;
  endDate?: string;
  duration?: number; // In days for storage, hours for transport
  
  // Pricing
  quotedAmount: bigint;
  finalAmount?: bigint;
  tokenType: number; // 0 = Resilience Credit, 1 = Relief Token
  
  // Payment
  paymentStatus: 'unpaid' | 'authorized' | 'paid' | 'refunded';
  paymentTransactionId?: string;
  
  // Status
  status: BookingStatus;
  statusHistory: Array<{
    status: BookingStatus;
    timestamp: string;
    note?: string;
  }>;
  
  // Evidence
  proofs: Array<{
    type: 'photo' | 'signature' | 'document';
    url: string;
    uploadedAt: string;
    uploadedBy: 'msme' | 'vendor';
  }>;
  
  // Blockchain
  blockchainTxHash?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
const bookings = new Map<string, Booking>();
const bookingsByMsme = new Map<string, string[]>();
const bookingsByVendor = new Map<string, string[]>();
const bookingsByWarehouse = new Map<string, string[]>();

/**
 * Booking Operations
 */
export const bookingDb = {
  create(data: Omit<Booking, 'createdAt' | 'updatedAt' | 'statusHistory'>): Booking {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...data,
      statusHistory: [
        { status: data.status, timestamp: now }
      ],
      createdAt: now,
      updatedAt: now,
    };
    
    bookings.set(data.id, booking);
    
    // Index by MSME
    const msmeBookings = bookingsByMsme.get(data.msmeId) || [];
    msmeBookings.push(data.id);
    bookingsByMsme.set(data.msmeId, msmeBookings);
    
    // Index by vendor
    const vendorBookings = bookingsByVendor.get(data.vendorId) || [];
    vendorBookings.push(data.id);
    bookingsByVendor.set(data.vendorId, vendorBookings);
    
    // Index by warehouse if applicable
    if (data.warehouseId) {
      const warehouseBookings = bookingsByWarehouse.get(data.warehouseId) || [];
      warehouseBookings.push(data.id);
      bookingsByWarehouse.set(data.warehouseId, warehouseBookings);
    }
    
    logger.info(`Booking created: ${data.id} for MSME ${data.msmeId}`);
    return booking;
  },
  
  findById(id: string): Booking | null {
    return bookings.get(id) || null;
  },
  
  findByMsme(msmeId: string, limit = 50): Booking[] {
    const ids = bookingsByMsme.get(msmeId) || [];
    return ids.slice(-limit).map(id => bookings.get(id)!).filter(Boolean).reverse();
  },
  
  findByVendor(vendorId: string, limit = 50): Booking[] {
    const ids = bookingsByVendor.get(vendorId) || [];
    return ids.slice(-limit).map(id => bookings.get(id)!).filter(Boolean).reverse();
  },
  
  findByWarehouse(warehouseId: string): Booking[] {
    const ids = bookingsByWarehouse.get(warehouseId) || [];
    return ids.map(id => bookings.get(id)!).filter(Boolean);
  },
  
  findPendingByVendor(vendorId: string): Booking[] {
    return this.findByVendor(vendorId).filter(b => b.status === BookingStatus.PENDING);
  },
  
  findActiveByWarehouse(warehouseId: string): Booking[] {
    return this.findByWarehouse(warehouseId).filter(b => 
      b.status === BookingStatus.ACCEPTED || 
      b.status === BookingStatus.IN_PROGRESS
    );
  },
  
  updateStatus(id: string, status: BookingStatus, note?: string): Booking | null {
    const booking = bookings.get(id);
    if (!booking) return null;
    
    booking.status = status;
    booking.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
    });
    booking.updatedAt = new Date().toISOString();
    
    bookings.set(id, booking);
    logger.info(`Booking ${id} status updated to ${status}`);
    return booking;
  },
  
  setPayment(id: string, transactionId: string, paymentStatus: Booking['paymentStatus']): Booking | null {
    const booking = bookings.get(id);
    if (!booking) return null;
    
    booking.paymentTransactionId = transactionId;
    booking.paymentStatus = paymentStatus;
    booking.updatedAt = new Date().toISOString();
    
    bookings.set(id, booking);
    return booking;
  },
  
  addProof(id: string, proof: Booking['proofs'][0]): Booking | null {
    const booking = bookings.get(id);
    if (!booking) return null;
    
    booking.proofs.push(proof);
    booking.updatedAt = new Date().toISOString();
    
    bookings.set(id, booking);
    return booking;
  },
  
  setBlockchainTxHash(id: string, txHash: string): Booking | null {
    const booking = bookings.get(id);
    if (!booking) return null;
    
    booking.blockchainTxHash = txHash;
    booking.updatedAt = new Date().toISOString();
    
    bookings.set(id, booking);
    return booking;
  },
  
  // Calculate warehouse availability
  getWarehouseOccupancy(warehouseId: string, capacitySqft: number): { occupied: number; available: number } {
    const activeBookings = this.findActiveByWarehouse(warehouseId);
    // For simplicity, assume each booking takes 100 sqft
    const occupiedSqft = activeBookings.length * 100;
    return {
      occupied: occupiedSqft,
      available: Math.max(0, capacitySqft - occupiedSqft),
    };
  },
  
  // Get booking statistics
  getStats(): { total: number; pending: number; active: number; completed: number } {
    const all = Array.from(bookings.values());
    return {
      total: all.length,
      pending: all.filter(b => b.status === BookingStatus.PENDING).length,
      active: all.filter(b => b.status === BookingStatus.ACCEPTED || b.status === BookingStatus.IN_PROGRESS).length,
      completed: all.filter(b => b.status === BookingStatus.COMPLETED).length,
    };
  },
};
