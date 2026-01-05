/**
 * GRUHA User Service - Database Layer
 * Per PRD §8 - Data Models
 * Uses in-memory storage for development (no native dependencies)
 */

import { config, KycStatus, VendorCategory } from './config';
import { logger } from './logger';

// MSME Interface
export interface MSME {
  id: string;
  phone: string;
  name?: string;
  udyam_number?: string;
  aadhaar_hash?: string;
  gst_number?: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  geo_lat?: number;
  geo_lng?: number;
  risk_level: string;
  flood_risk_score: number;
  cyclone_risk_score: number;
  drought_risk_score: number;
  kyc_status: KycStatus;
  kyc_documents?: string;
  blockchain_wallet_address?: string;
  created_at: string;
  updated_at: string;
}

// Vendor Interface
export interface Vendor {
  id: string;
  phone: string;
  name?: string;
  business_name?: string;
  business_type?: string;
  category: VendorCategory;
  gst_number?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  upi_id?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  geo_lat?: number;
  geo_lng?: number;
  service_radius_km: number;
  emergency_pricing_agreed: boolean;
  compliance_score: number;
  kyc_status: KycStatus;
  kyc_documents?: string;
  blockchain_wallet_address?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Warehouse Interface
export interface Warehouse {
  id: string;
  vendor_id: string;
  name: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  geo_lat?: number;
  geo_lng?: number;
  total_capacity_sqft: number;
  available_capacity_sqft: number;
  price_per_sqft_day: number;
  emergency_price_per_sqft_day?: number;
  flood_zone_safe: boolean;
  elevation_meters?: number;
  amenities?: string;
  photos?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory storage
const msmes = new Map<string, MSME>();
const msmesbyPhone = new Map<string, string>();
const vendors = new Map<string, Vendor>();
const vendorsByPhone = new Map<string, string>();
const warehouses = new Map<string, Warehouse>();

/**
 * Initialize database
 */
export function initializeDatabase(): void {
  logger.info('In-memory database initialized');
}

// MSME Operations
export const msmeDb = {
  create(data: Partial<MSME> & { id: string; phone: string }): MSME {
    const now = new Date().toISOString();
    const msme: MSME = {
      id: data.id,
      phone: data.phone,
      name: data.name,
      udyam_number: data.udyam_number,
      aadhaar_hash: data.aadhaar_hash,
      gst_number: data.gst_number,
      business_name: data.business_name,
      business_type: data.business_type,
      business_address: data.business_address,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      geo_lat: data.geo_lat,
      geo_lng: data.geo_lng,
      risk_level: data.risk_level || 'low',
      flood_risk_score: data.flood_risk_score || 0,
      cyclone_risk_score: data.cyclone_risk_score || 0,
      drought_risk_score: data.drought_risk_score || 0,
      kyc_status: data.kyc_status || KycStatus.PENDING,
      kyc_documents: data.kyc_documents,
      blockchain_wallet_address: data.blockchain_wallet_address,
      created_at: now,
      updated_at: now,
    };
    
    msmes.set(data.id, msme);
    msmesbyPhone.set(data.phone, data.id);
    
    return msme;
  },
  
  findById(id: string): MSME | null {
    return msmes.get(id) || null;
  },
  
  findByPhone(phone: string): MSME | null {
    const id = msmesbyPhone.get(phone);
    if (!id) return null;
    return msmes.get(id) || null;
  },
  
  update(id: string, data: Partial<MSME>): MSME | null {
    const existing = msmes.get(id);
    if (!existing) return null;
    
    const updated: MSME = {
      ...existing,
      ...data,
      id: existing.id,
      phone: existing.phone,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    
    msmes.set(id, updated);
    return updated;
  },
  
  updateKycStatus(id: string, status: KycStatus, walletAddress?: string): MSME | null {
    const existing = msmes.get(id);
    if (!existing) return null;
    
    const updated: MSME = {
      ...existing,
      kyc_status: status,
      blockchain_wallet_address: walletAddress || existing.blockchain_wallet_address,
      updated_at: new Date().toISOString(),
    };
    
    msmes.set(id, updated);
    return updated;
  },
  
  findByDistrict(district: string): MSME[] {
    return Array.from(msmes.values()).filter(m => m.district === district);
  },
  
  findAll(limit = 100, offset = 0): MSME[] {
    return Array.from(msmes.values()).slice(offset, offset + limit);
  },
};

// Vendor Operations
export const vendorDb = {
  create(data: Partial<Vendor> & { id: string; phone: string; category: VendorCategory }): Vendor {
    const now = new Date().toISOString();
    const vendor: Vendor = {
      id: data.id,
      phone: data.phone,
      name: data.name,
      business_name: data.business_name,
      business_type: data.business_type,
      category: data.category,
      gst_number: data.gst_number,
      bank_account_number: data.bank_account_number,
      bank_ifsc: data.bank_ifsc,
      bank_name: data.bank_name,
      upi_id: data.upi_id,
      address: data.address,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      geo_lat: data.geo_lat,
      geo_lng: data.geo_lng,
      service_radius_km: data.service_radius_km || 50,
      emergency_pricing_agreed: data.emergency_pricing_agreed || false,
      compliance_score: data.compliance_score || 100,
      kyc_status: data.kyc_status || KycStatus.PENDING,
      kyc_documents: data.kyc_documents,
      blockchain_wallet_address: data.blockchain_wallet_address,
      is_verified: data.is_verified || false,
      is_active: data.is_active !== false,
      created_at: now,
      updated_at: now,
    };
    
    vendors.set(data.id, vendor);
    vendorsByPhone.set(data.phone, data.id);
    
    return vendor;
  },
  
  findById(id: string): Vendor | null {
    return vendors.get(id) || null;
  },
  
  findByPhone(phone: string): Vendor | null {
    const id = vendorsByPhone.get(phone);
    if (!id) return null;
    return vendors.get(id) || null;
  },
  
  update(id: string, data: Partial<Vendor>): Vendor | null {
    const existing = vendors.get(id);
    if (!existing) return null;
    
    const updated: Vendor = {
      ...existing,
      ...data,
      id: existing.id,
      phone: existing.phone,
      category: existing.category,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    
    vendors.set(id, updated);
    return updated;
  },
  
  verify(id: string, walletAddress?: string): Vendor | null {
    const existing = vendors.get(id);
    if (!existing) return null;
    
    const updated: Vendor = {
      ...existing,
      is_verified: true,
      kyc_status: KycStatus.VERIFIED,
      blockchain_wallet_address: walletAddress || existing.blockchain_wallet_address,
      updated_at: new Date().toISOString(),
    };
    
    vendors.set(id, updated);
    return updated;
  },
  
  findByCategory(category: VendorCategory): Vendor[] {
    return Array.from(vendors.values()).filter(v => v.category === category && v.is_active);
  },
  
  findByDistrict(district: string): Vendor[] {
    return Array.from(vendors.values()).filter(v => v.district === district && v.is_active);
  },
  
  findAll(limit = 100, offset = 0): Vendor[] {
    return Array.from(vendors.values()).slice(offset, offset + limit);
  },
};

// Warehouse Operations
export const warehouseDb = {
  create(data: Partial<Warehouse> & { id: string; vendor_id: string; name: string; total_capacity_sqft: number; price_per_sqft_day: number }): Warehouse {
    const now = new Date().toISOString();
    const warehouse: Warehouse = {
      id: data.id,
      vendor_id: data.vendor_id,
      name: data.name,
      address: data.address,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      geo_lat: data.geo_lat,
      geo_lng: data.geo_lng,
      total_capacity_sqft: data.total_capacity_sqft,
      available_capacity_sqft: data.available_capacity_sqft || data.total_capacity_sqft,
      price_per_sqft_day: data.price_per_sqft_day,
      emergency_price_per_sqft_day: data.emergency_price_per_sqft_day,
      flood_zone_safe: data.flood_zone_safe !== false,
      elevation_meters: data.elevation_meters,
      amenities: data.amenities,
      photos: data.photos,
      is_active: data.is_active !== false,
      created_at: now,
      updated_at: now,
    };
    
    warehouses.set(data.id, warehouse);
    return warehouse;
  },
  
  findById(id: string): Warehouse | null {
    return warehouses.get(id) || null;
  },
  
  findByVendor(vendorId: string): Warehouse[] {
    return Array.from(warehouses.values()).filter(w => w.vendor_id === vendorId);
  },
  
  findAvailable(district?: string, minCapacity?: number): Warehouse[] {
    return Array.from(warehouses.values())
      .filter(w => {
        if (!w.is_active || w.available_capacity_sqft <= 0) return false;
        if (district && w.district !== district) return false;
        if (minCapacity && w.available_capacity_sqft < minCapacity) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.flood_zone_safe !== b.flood_zone_safe) {
          return a.flood_zone_safe ? -1 : 1;
        }
        return b.available_capacity_sqft - a.available_capacity_sqft;
      });
  },
  
  updateCapacity(id: string, availableCapacity: number): Warehouse | null {
    const existing = warehouses.get(id);
    if (!existing) return null;
    
    const updated: Warehouse = {
      ...existing,
      available_capacity_sqft: availableCapacity,
      updated_at: new Date().toISOString(),
    };
    
    warehouses.set(id, updated);
    return updated;
  },
};

// Initialize on module load
initializeDatabase();
