/**
 * GRUHA User Service - MSME Routes
 * Per PRD §9 - POST /msme/register, GET /msme/profile
 */

import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { msmeDb, MSME } from '../database';
import { config, KycStatus } from '../config';
import { logger } from '../logger';

const router = Router();

/**
 * POST /msme/register
 * Register a new MSME
 */
router.post(
  '/register',
  [
    body('phone').notEmpty().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone required'),
    body('name').optional().isString().trim(),
    body('udyamNumber').optional().matches(/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/).withMessage('Invalid Udyam format'),
    body('businessName').optional().isString().trim(),
    body('businessType').optional().isString().trim(),
    body('businessAddress').optional().isString().trim(),
    body('district').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().matches(/^[0-9]{6}$/).withMessage('Invalid pincode'),
    body('geoLat').optional().isFloat({ min: -90, max: 90 }),
    body('geoLng').optional().isFloat({ min: -180, max: 180 }),
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

      const { phone, name, udyamNumber, businessName, businessType, businessAddress, 
              district, state, pincode, geoLat, geoLng } = req.body;
      
      // Check if MSME already exists
      const existing = msmeDb.findByPhone(phone);
      if (existing) {
        return res.status(409).json({
          error: {
            code: 'MSME_EXISTS',
            message: 'MSME with this phone number already registered',
          },
        });
      }
      
      // Create MSME
      const msmeId = `msme_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const msme = msmeDb.create({
        id: msmeId,
        phone,
        name,
        udyam_number: udyamNumber,
        business_name: businessName,
        business_type: businessType,
        business_address: businessAddress,
        district,
        state,
        pincode,
        geo_lat: geoLat,
        geo_lng: geoLng,
        kyc_status: KycStatus.PENDING,
      });
      
      logger.info(`MSME registered: ${msmeId}`, { phone: phone.slice(-4).padStart(10, '*') });
      
      res.status(201).json({
        success: true,
        data: {
          id: msme.id,
          phone: msme.phone,
          name: msme.name,
          businessName: msme.business_name,
          kycStatus: msme.kyc_status,
          message: 'MSME registered successfully. Please complete KYC verification.',
        },
      });
    } catch (error) {
      logger.error('MSME registration failed', { error });
      res.status(500).json({
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to register MSME',
        },
      });
    }
  }
);

/**
 * GET /msme/profile/:id
 * Get MSME profile
 */
router.get('/profile/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const msme = msmeDb.findById(id);
    if (!msme) {
      return res.status(404).json({
        error: {
          code: 'MSME_NOT_FOUND',
          message: 'MSME not found',
        },
      });
    }
    
    // Sanitize response (hide sensitive data)
    res.json({
      success: true,
      data: {
        id: msme.id,
        phone: msme.phone.slice(-4).padStart(10, '*'),
        name: msme.name,
        businessName: msme.business_name,
        businessType: msme.business_type,
        district: msme.district,
        state: msme.state,
        riskLevel: msme.risk_level,
        kycStatus: msme.kyc_status,
        hasWallet: !!msme.blockchain_wallet_address,
        createdAt: msme.created_at,
      },
    });
  } catch (error) {
    logger.error('Failed to get MSME profile', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch MSME profile',
      },
    });
  }
});

/**
 * GET /msme/by-phone/:phone
 * Get MSME by phone number
 */
router.get('/by-phone/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    
    const msme = msmeDb.findByPhone(phone);
    if (!msme) {
      return res.status(404).json({
        error: {
          code: 'MSME_NOT_FOUND',
          message: 'MSME not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: {
        id: msme.id,
        name: msme.name,
        businessName: msme.business_name,
        kycStatus: msme.kyc_status,
        hasWallet: !!msme.blockchain_wallet_address,
      },
    });
  } catch (error) {
    logger.error('Failed to get MSME by phone', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch MSME',
      },
    });
  }
});

/**
 * PUT /msme/profile/:id
 * Update MSME profile
 */
router.put(
  '/profile/:id',
  [
    body('name').optional().isString().trim(),
    body('udyamNumber').optional().matches(/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/),
    body('gstNumber').optional().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
    body('businessName').optional().isString().trim(),
    body('businessType').optional().isString().trim(),
    body('businessAddress').optional().isString().trim(),
    body('district').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('pincode').optional().matches(/^[0-9]{6}$/),
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
      
      // Check if MSME exists
      const existing = msmeDb.findById(id);
      if (!existing) {
        return res.status(404).json({
          error: {
            code: 'MSME_NOT_FOUND',
            message: 'MSME not found',
          },
        });
      }
      
      // Map request body to database fields
      const updateData: Partial<MSME> = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.udyamNumber) updateData.udyam_number = req.body.udyamNumber;
      if (req.body.gstNumber) updateData.gst_number = req.body.gstNumber;
      if (req.body.businessName) updateData.business_name = req.body.businessName;
      if (req.body.businessType) updateData.business_type = req.body.businessType;
      if (req.body.businessAddress) updateData.business_address = req.body.businessAddress;
      if (req.body.district) updateData.district = req.body.district;
      if (req.body.state) updateData.state = req.body.state;
      if (req.body.pincode) updateData.pincode = req.body.pincode;
      
      const msme = msmeDb.update(id, updateData);
      
      logger.info(`MSME profile updated: ${id}`);
      
      res.json({
        success: true,
        data: {
          id: msme!.id,
          name: msme!.name,
          businessName: msme!.business_name,
          kycStatus: msme!.kyc_status,
          updatedAt: msme!.updated_at,
        },
      });
    } catch (error) {
      logger.error('MSME update failed', { error });
      res.status(500).json({
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update MSME profile',
        },
      });
    }
  }
);

/**
 * POST /msme/kyc/submit/:id
 * Submit KYC documents
 */
router.post('/kyc/submit/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { udyamNumber, aadhaarLast4 } = req.body;
    
    const msme = msmeDb.findById(id);
    if (!msme) {
      return res.status(404).json({
        error: {
          code: 'MSME_NOT_FOUND',
          message: 'MSME not found',
        },
      });
    }
    
    // In development, auto-verify
    if (config.kyc.mockValidation) {
      const updated = msmeDb.updateKycStatus(id, KycStatus.VERIFIED);
      
      logger.info(`MSME KYC auto-verified (dev mode): ${id}`);
      
      return res.json({
        success: true,
        data: {
          id: updated!.id,
          kycStatus: updated!.kyc_status,
          message: 'KYC verified successfully (development mode)',
        },
      });
    }
    
    // In production, validate against government APIs
    // TODO: Integrate with Udyam verification API
    
    const updated = msmeDb.updateKycStatus(id, KycStatus.SUBMITTED);
    
    res.json({
      success: true,
      data: {
        id: updated!.id,
        kycStatus: updated!.kyc_status,
        message: 'KYC documents submitted for verification',
      },
    });
  } catch (error) {
    logger.error('KYC submission failed', { error });
    res.status(500).json({
      error: {
        code: 'KYC_SUBMISSION_FAILED',
        message: 'Failed to submit KYC documents',
      },
    });
  }
});

/**
 * GET /msme/list
 * List all MSMEs (admin only)
 */
router.get('/list', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('district').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const district = req.query.district as string;
    
    let msmes: MSME[];
    if (district) {
      msmes = msmeDb.findByDistrict(district);
    } else {
      msmes = msmeDb.findAll(limit, offset);
    }
    
    res.json({
      success: true,
      data: {
        msmes: msmes.map(m => ({
          id: m.id,
          name: m.name,
          businessName: m.business_name,
          district: m.district,
          state: m.state,
          kycStatus: m.kyc_status,
          riskLevel: m.risk_level,
          hasWallet: !!m.blockchain_wallet_address,
        })),
        pagination: {
          limit,
          offset,
          total: msmes.length,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to list MSMEs', { error });
    res.status(500).json({
      error: {
        code: 'LIST_FAILED',
        message: 'Failed to list MSMEs',
      },
    });
  }
});

export default router;
