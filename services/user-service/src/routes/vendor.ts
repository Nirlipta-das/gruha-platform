/**
 * GRUHA User Service - Vendor Routes
 * Per PRD §9 - Vendor registration and management
 */

import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { vendorDb, warehouseDb, Vendor, Warehouse } from '../database';
import { config, KycStatus, VendorCategory } from '../config';
import { logger } from '../logger';

const router = Router();

/**
 * POST /vendor/register
 * Register a new vendor
 */
router.post(
  '/register',
  [
    body('phone').notEmpty().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone required'),
    body('category').notEmpty().isIn(Object.values(VendorCategory)).withMessage('Invalid vendor category'),
    body('name').optional().isString().trim(),
    body('businessName').optional().isString().trim(),
    body('businessType').optional().isString().trim(),
    body('gstNumber').optional().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
    body('bankAccountNumber').optional().isString(),
    body('bankIfsc').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    body('bankName').optional().isString().trim(),
    body('upiId').optional().matches(/^[\w.-]+@[\w]+$/),
    body('address').optional().isString().trim(),
    body('district').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().matches(/^[0-9]{6}$/),
    body('geoLat').optional().isFloat({ min: -90, max: 90 }),
    body('geoLng').optional().isFloat({ min: -180, max: 180 }),
    body('serviceRadiusKm').optional().isInt({ min: 1, max: 500 }),
    body('emergencyPricingAgreed').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { phone, category, name, businessName, businessType, gstNumber,
              bankAccountNumber, bankIfsc, bankName, upiId, address,
              district, state, pincode, geoLat, geoLng, serviceRadiusKm,
              emergencyPricingAgreed } = req.body;
      
      // Check if vendor already exists
      const existing = vendorDb.findByPhone(phone);
      if (existing) {
        return res.status(409).json({
          error: {
            code: 'VENDOR_EXISTS',
            message: 'Vendor with this phone number already registered',
          },
        });
      }
      
      // Create vendor
      const vendorId = `vendor_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const vendor = vendorDb.create({
        id: vendorId,
        phone,
        category,
        name,
        business_name: businessName,
        business_type: businessType,
        gst_number: gstNumber,
        bank_account_number: bankAccountNumber,
        bank_ifsc: bankIfsc,
        bank_name: bankName,
        upi_id: upiId,
        address,
        district,
        state,
        pincode,
        geo_lat: geoLat,
        geo_lng: geoLng,
        service_radius_km: serviceRadiusKm || 50,
        emergency_pricing_agreed: emergencyPricingAgreed || false,
        kyc_status: KycStatus.PENDING,
      });
      
      logger.info(`Vendor registered: ${vendorId}`, { 
        phone: phone.slice(-4).padStart(10, '*'),
        category,
      });
      
      res.status(201).json({
        success: true,
        data: {
          id: vendor.id,
          phone: vendor.phone,
          name: vendor.name,
          category: vendor.category,
          businessName: vendor.business_name,
          kycStatus: vendor.kyc_status,
          isVerified: vendor.is_verified,
          message: 'Vendor registered successfully. Awaiting verification.',
        },
      });
    } catch (error) {
      logger.error('Vendor registration failed', { error });
      res.status(500).json({
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to register vendor',
        },
      });
    }
  }
);

/**
 * GET /vendor/profile/:id
 * Get vendor profile
 */
router.get('/profile/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vendor = vendorDb.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }
    
    // Get vendor's warehouses if applicable
    const warehouses = vendor.category === VendorCategory.WAREHOUSE 
      ? warehouseDb.findByVendor(id) 
      : [];
    
    res.json({
      success: true,
      data: {
        id: vendor.id,
        phone: vendor.phone.slice(-4).padStart(10, '*'),
        name: vendor.name,
        category: vendor.category,
        businessName: vendor.business_name,
        district: vendor.district,
        state: vendor.state,
        serviceRadiusKm: vendor.service_radius_km,
        emergencyPricingAgreed: vendor.emergency_pricing_agreed,
        complianceScore: vendor.compliance_score,
        kycStatus: vendor.kyc_status,
        isVerified: vendor.is_verified,
        isActive: vendor.is_active,
        hasWallet: !!vendor.blockchain_wallet_address,
        warehouses: warehouses.map(w => ({
          id: w.id,
          name: w.name,
          totalCapacity: w.total_capacity_sqft,
          availableCapacity: w.available_capacity_sqft,
          pricePerSqftDay: w.price_per_sqft_day,
          floodZoneSafe: w.flood_zone_safe,
        })),
        createdAt: vendor.created_at,
      },
    });
  } catch (error) {
    logger.error('Failed to get vendor profile', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch vendor profile',
      },
    });
  }
});

/**
 * PUT /vendor/profile/:id
 * Update vendor profile
 */
router.put(
  '/profile/:id',
  [
    body('name').optional().isString().trim(),
    body('businessName').optional().isString().trim(),
    body('businessType').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('district').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().matches(/^[0-9]{6}$/),
    body('serviceRadiusKm').optional().isInt({ min: 1, max: 500 }),
    body('emergencyPricingAgreed').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { id } = req.params;
      
      const existing = vendorDb.findById(id);
      if (!existing) {
        return res.status(404).json({
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found',
          },
        });
      }
      
      const updateData: Partial<Vendor> = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.businessName) updateData.business_name = req.body.businessName;
      if (req.body.businessType) updateData.business_type = req.body.businessType;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.district) updateData.district = req.body.district;
      if (req.body.state) updateData.state = req.body.state;
      if (req.body.pincode) updateData.pincode = req.body.pincode;
      if (req.body.serviceRadiusKm) updateData.service_radius_km = req.body.serviceRadiusKm;
      if (req.body.emergencyPricingAgreed !== undefined) {
        updateData.emergency_pricing_agreed = req.body.emergencyPricingAgreed;
      }
      
      const vendor = vendorDb.update(id, updateData);
      
      logger.info(`Vendor profile updated: ${id}`);
      
      res.json({
        success: true,
        data: {
          id: vendor!.id,
          name: vendor!.name,
          businessName: vendor!.business_name,
          kycStatus: vendor!.kyc_status,
          isVerified: vendor!.is_verified,
          updatedAt: vendor!.updated_at,
        },
      });
    } catch (error) {
      logger.error('Vendor update failed', { error });
      res.status(500).json({
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update vendor profile',
        },
      });
    }
  }
);

/**
 * POST /vendor/warehouse
 * Add a warehouse (for warehouse vendors)
 */
router.post(
  '/warehouse',
  [
    body('vendorId').notEmpty().withMessage('Vendor ID required'),
    body('name').notEmpty().isString().trim(),
    body('totalCapacitySqft').notEmpty().isInt({ min: 100 }),
    body('pricePerSqftDay').notEmpty().isFloat({ min: 0.01 }),
    body('emergencyPricePerSqftDay').optional().isFloat({ min: 0.01 }),
    body('address').optional().isString().trim(),
    body('district').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().matches(/^[0-9]{6}$/),
    body('geoLat').optional().isFloat({ min: -90, max: 90 }),
    body('geoLng').optional().isFloat({ min: -180, max: 180 }),
    body('floodZoneSafe').optional().isBoolean(),
    body('elevationMeters').optional().isInt({ min: 0 }),
    body('amenities').optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array(),
          },
        });
      }

      const { vendorId, name, totalCapacitySqft, pricePerSqftDay, emergencyPricePerSqftDay,
              address, district, state, pincode, geoLat, geoLng, floodZoneSafe, 
              elevationMeters, amenities } = req.body;
      
      // Verify vendor exists and is warehouse type
      const vendor = vendorDb.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found',
          },
        });
      }
      
      if (vendor.category !== VendorCategory.WAREHOUSE) {
        return res.status(400).json({
          error: {
            code: 'INVALID_VENDOR_CATEGORY',
            message: 'Only warehouse vendors can add warehouses',
          },
        });
      }
      
      const warehouseId = `wh_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const warehouse = warehouseDb.create({
        id: warehouseId,
        vendor_id: vendorId,
        name,
        total_capacity_sqft: totalCapacitySqft,
        available_capacity_sqft: totalCapacitySqft,
        price_per_sqft_day: pricePerSqftDay,
        emergency_price_per_sqft_day: emergencyPricePerSqftDay,
        address,
        district: district || vendor.district,
        state: state || vendor.state,
        pincode,
        geo_lat: geoLat,
        geo_lng: geoLng,
        flood_zone_safe: floodZoneSafe !== false,
        elevation_meters: elevationMeters,
        amenities: amenities ? JSON.stringify(amenities) : undefined,
      });
      
      logger.info(`Warehouse added: ${warehouseId}`, { vendorId });
      
      res.status(201).json({
        success: true,
        data: {
          id: warehouse.id,
          name: warehouse.name,
          vendorId: warehouse.vendor_id,
          totalCapacity: warehouse.total_capacity_sqft,
          availableCapacity: warehouse.available_capacity_sqft,
          pricePerSqftDay: warehouse.price_per_sqft_day,
          floodZoneSafe: warehouse.flood_zone_safe,
          district: warehouse.district,
          message: 'Warehouse added successfully',
        },
      });
    } catch (error) {
      logger.error('Warehouse creation failed', { error });
      res.status(500).json({
        error: {
          code: 'CREATION_FAILED',
          message: 'Failed to add warehouse',
        },
      });
    }
  }
);

/**
 * GET /vendor/warehouses/search
 * Search available warehouses
 */
router.get('/warehouses/search', [
  query('district').optional().isString(),
  query('minCapacity').optional().isInt({ min: 1 }),
  query('floodSafe').optional().isBoolean(),
], async (req: Request, res: Response) => {
  try {
    const district = req.query.district as string;
    const minCapacity = parseInt(req.query.minCapacity as string) || 0;
    
    let warehouses = warehouseDb.findAvailable(district, minCapacity);
    
    // Filter by flood safety if requested
    if (req.query.floodSafe === 'true') {
      warehouses = warehouses.filter(w => w.flood_zone_safe);
    }
    
    // Get vendor info for each warehouse
    const results = warehouses.map(w => {
      const vendor = vendorDb.findById(w.vendor_id);
      return {
        id: w.id,
        name: w.name,
        vendorId: w.vendor_id,
        vendorName: vendor?.business_name || vendor?.name,
        vendorVerified: vendor?.is_verified,
        address: w.address,
        district: w.district,
        state: w.state,
        totalCapacity: w.total_capacity_sqft,
        availableCapacity: w.available_capacity_sqft,
        pricePerSqftDay: w.price_per_sqft_day,
        emergencyPrice: w.emergency_price_per_sqft_day,
        floodZoneSafe: w.flood_zone_safe,
        elevation: w.elevation_meters,
        location: w.geo_lat && w.geo_lng ? { lat: w.geo_lat, lng: w.geo_lng } : null,
      };
    });
    
    res.json({
      success: true,
      data: {
        warehouses: results,
        total: results.length,
        filters: {
          district,
          minCapacity,
          floodSafe: req.query.floodSafe === 'true',
        },
      },
    });
  } catch (error) {
    logger.error('Warehouse search failed', { error });
    res.status(500).json({
      error: {
        code: 'SEARCH_FAILED',
        message: 'Failed to search warehouses',
      },
    });
  }
});

/**
 * POST /vendor/verify/:id
 * Verify a vendor (admin only)
 */
router.post('/verify/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vendor = vendorDb.findById(id);
    if (!vendor) {
      return res.status(404).json({
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
        },
      });
    }
    
    const updated = vendorDb.verify(id);
    
    logger.info(`Vendor verified: ${id}`);
    
    res.json({
      success: true,
      data: {
        id: updated!.id,
        name: updated!.name,
        businessName: updated!.business_name,
        kycStatus: updated!.kyc_status,
        isVerified: updated!.is_verified,
        message: 'Vendor verified successfully',
      },
    });
  } catch (error) {
    logger.error('Vendor verification failed', { error });
    res.status(500).json({
      error: {
        code: 'VERIFICATION_FAILED',
        message: 'Failed to verify vendor',
      },
    });
  }
});

/**
 * GET /vendor/list
 * List vendors
 */
router.get('/list', [
  query('category').optional().isIn(Object.values(VendorCategory)),
  query('district').optional().isString(),
  query('verified').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
], async (req: Request, res: Response) => {
  try {
    const category = req.query.category as VendorCategory;
    const district = req.query.district as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    let vendors: Vendor[];
    
    if (category) {
      vendors = vendorDb.findByCategory(category);
    } else if (district) {
      vendors = vendorDb.findByDistrict(district);
    } else {
      vendors = vendorDb.findAll(limit, offset);
    }
    
    // Filter by verified status if specified
    if (req.query.verified !== undefined) {
      const verifiedOnly = req.query.verified === 'true';
      vendors = vendors.filter(v => v.is_verified === verifiedOnly);
    }
    
    res.json({
      success: true,
      data: {
        vendors: vendors.map(v => ({
          id: v.id,
          name: v.name,
          businessName: v.business_name,
          category: v.category,
          district: v.district,
          state: v.state,
          complianceScore: v.compliance_score,
          kycStatus: v.kyc_status,
          isVerified: v.is_verified,
          emergencyPricingAgreed: v.emergency_pricing_agreed,
        })),
        pagination: {
          limit,
          offset,
          total: vendors.length,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to list vendors', { error });
    res.status(500).json({
      error: {
        code: 'LIST_FAILED',
        message: 'Failed to list vendors',
      },
    });
  }
});

export default router;
