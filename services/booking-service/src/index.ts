/**
 * GRUHA Booking Service - Main Application
 * Per PRD - Warehouse and Transport Booking Management
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult, param, query } from 'express-validator';
import axios from 'axios';
import { config, BookingStatus, ServiceType, ServiceToCategory } from './config';
import { logger } from './logger';
import { bookingDb, Booking } from './booking-store';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'booking-service',
    version: '1.0.0',
  });
});

// Service info
app.get('/api/bookings', (req: Request, res: Response) => {
  const stats = bookingDb.getStats();
  res.json({
    name: 'GRUHA Booking Service',
    version: '1.0.0',
    description: 'Warehouse and Transport Booking Management',
    serviceTypes: Object.values(ServiceType),
    statusFlow: Object.values(BookingStatus),
    stats,
    endpoints: {
      create: 'POST /api/bookings',
      getById: 'GET /api/bookings/:bookingId',
      getByMsme: 'GET /api/bookings/msme/:msmeId',
      getByVendor: 'GET /api/bookings/vendor/:vendorId',
      pendingForVendor: 'GET /api/bookings/vendor/:vendorId/pending',
      accept: 'POST /api/bookings/:bookingId/accept',
      reject: 'POST /api/bookings/:bookingId/reject',
      startService: 'POST /api/bookings/:bookingId/start',
      complete: 'POST /api/bookings/:bookingId/complete',
      uploadProof: 'POST /api/bookings/:bookingId/proof',
    },
  });
});

/**
 * POST /api/bookings
 * Create a new booking (MSME initiates)
 */
app.post(
  '/api/bookings',
  [
    body('msmeId').notEmpty().withMessage('MSME ID required'),
    body('vendorId').notEmpty().withMessage('Vendor ID required'),
    body('serviceType').isIn(Object.values(ServiceType)).withMessage('Invalid service type'),
    body('description').notEmpty().withMessage('Description required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('quotedAmount').isInt({ min: 1 }).withMessage('Amount must be positive'),
    body('tokenType').isIn([0, 1]).withMessage('Token type must be 0 or 1'),
    body('warehouseId').optional().isString(),
    body('duration').optional().isInt({ min: 1 }),
    body('pickupLocation').optional().isObject(),
    body('deliveryLocation').optional().isObject(),
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

      const {
        msmeId,
        vendorId,
        serviceType,
        description,
        startDate,
        endDate,
        duration,
        quotedAmount,
        tokenType,
        warehouseId,
        pickupLocation,
        deliveryLocation,
      } = req.body;

      // Verify MSME has sufficient balance by calling wallet service
      try {
        const walletResponse = await axios.get(`${config.services.walletService}/api/wallet/${msmeId}`);
        const balance = tokenType === 0 
          ? BigInt(walletResponse.data.data.balance.resilienceCredits)
          : BigInt(walletResponse.data.data.balance.reliefTokens);
        
        if (balance < BigInt(quotedAmount)) {
          return res.status(400).json({
            error: {
              code: 'INSUFFICIENT_BALANCE',
              message: 'Insufficient token balance for booking',
              required: quotedAmount,
              available: balance.toString(),
            },
          });
        }
      } catch (err) {
        logger.warn('Could not verify wallet balance, proceeding anyway', { msmeId });
        // In development, proceed even if wallet service is not available
      }

      const bookingId = `booking_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const booking = bookingDb.create({
        id: bookingId,
        msmeId,
        vendorId,
        warehouseId,
        serviceType,
        description,
        pickupLocation,
        deliveryLocation,
        startDate,
        endDate,
        duration,
        quotedAmount: BigInt(quotedAmount),
        tokenType,
        paymentStatus: 'unpaid',
        status: BookingStatus.PENDING,
        proofs: [],
      });

      logger.info(`Booking created: ${bookingId}`);

      res.status(201).json({
        success: true,
        data: {
          bookingId: booking.id,
          msmeId: booking.msmeId,
          vendorId: booking.vendorId,
          serviceType: booking.serviceType,
          quotedAmount: booking.quotedAmount.toString(),
          status: booking.status,
          createdAt: booking.createdAt,
          message: 'Booking created successfully. Awaiting vendor acceptance.',
        },
      });
    } catch (error) {
      logger.error('Failed to create booking', { error });
      res.status(500).json({
        error: {
          code: 'BOOKING_FAILED',
          message: 'Failed to create booking',
        },
      });
    }
  }
);

/**
 * GET /api/bookings/:bookingId
 * Get booking details
 */
app.get('/api/bookings/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    res.json({
      success: true,
      data: serializeBooking(booking),
    });
  } catch (error) {
    logger.error('Failed to get booking', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch booking',
      },
    });
  }
});

/**
 * GET /api/bookings/msme/:msmeId
 * Get bookings for an MSME
 */
app.get('/api/bookings/msme/:msmeId', [
  param('msmeId').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const { msmeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const bookings = bookingDb.findByMsme(msmeId, limit);

    res.json({
      success: true,
      data: {
        bookings: bookings.map(serializeBooking),
        total: bookings.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get MSME bookings', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch bookings',
      },
    });
  }
});

/**
 * GET /api/bookings/vendor/:vendorId
 * Get bookings for a vendor
 */
app.get('/api/bookings/vendor/:vendorId', [
  param('vendorId').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const bookings = bookingDb.findByVendor(vendorId, limit);

    res.json({
      success: true,
      data: {
        bookings: bookings.map(serializeBooking),
        total: bookings.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get vendor bookings', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch bookings',
      },
    });
  }
});

/**
 * GET /api/bookings/vendor/:vendorId/pending
 * Get pending bookings for a vendor to accept/reject
 */
app.get('/api/bookings/vendor/:vendorId/pending', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    
    const bookings = bookingDb.findPendingByVendor(vendorId);

    res.json({
      success: true,
      data: {
        bookings: bookings.map(serializeBooking),
        total: bookings.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get pending bookings', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch pending bookings',
      },
    });
  }
});

/**
 * POST /api/bookings/:bookingId/accept
 * Vendor accepts a booking
 */
app.post('/api/bookings/:bookingId/accept', [
  param('bookingId').notEmpty(),
  body('vendorId').notEmpty().withMessage('Vendor ID required for verification'),
], async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { vendorId } = req.body;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }
    
    if (booking.vendorId !== vendorId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to accept this booking',
        },
      });
    }
    
    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot accept booking with status: ${booking.status}`,
        },
      });
    }

    // Process payment by calling wallet service
    try {
      const category = ServiceToCategory[booking.serviceType as ServiceType];
      const paymentResponse = await axios.post(`${config.services.walletService}/api/wallet/spend`, {
        msmeId: booking.msmeId,
        vendorId: booking.vendorId,
        tokenType: booking.tokenType,
        category,
        amount: Number(booking.quotedAmount),
        bookingId: booking.id,
      });
      
      if (paymentResponse.data.success) {
        bookingDb.setPayment(bookingId, paymentResponse.data.data.transactionId, 'authorized');
      }
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'INSUFFICIENT_BALANCE') {
        return res.status(400).json({
          error: {
            code: 'PAYMENT_FAILED',
            message: 'MSME has insufficient balance',
          },
        });
      }
      logger.warn('Payment processing failed, proceeding without payment', { bookingId });
    }

    const updatedBooking = bookingDb.updateStatus(bookingId, BookingStatus.ACCEPTED, 'Vendor accepted booking');

    logger.info(`Booking ${bookingId} accepted by vendor ${vendorId}`);

    res.json({
      success: true,
      data: {
        bookingId,
        status: BookingStatus.ACCEPTED,
        message: 'Booking accepted successfully',
      },
    });
  } catch (error) {
    logger.error('Failed to accept booking', { error });
    res.status(500).json({
      error: {
        code: 'ACCEPT_FAILED',
        message: 'Failed to accept booking',
      },
    });
  }
});

/**
 * POST /api/bookings/:bookingId/reject
 * Vendor rejects a booking
 */
app.post('/api/bookings/:bookingId/reject', [
  param('bookingId').notEmpty(),
  body('vendorId').notEmpty(),
  body('reason').notEmpty().withMessage('Rejection reason required'),
], async (req: Request, res: Response) => {
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

    const { bookingId } = req.params;
    const { vendorId, reason } = req.body;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }
    
    if (booking.vendorId !== vendorId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to reject this booking',
        },
      });
    }
    
    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot reject booking with status: ${booking.status}`,
        },
      });
    }

    bookingDb.updateStatus(bookingId, BookingStatus.CANCELLED, `Rejected by vendor: ${reason}`);

    logger.info(`Booking ${bookingId} rejected by vendor ${vendorId}`);

    res.json({
      success: true,
      data: {
        bookingId,
        status: BookingStatus.CANCELLED,
        message: 'Booking rejected',
      },
    });
  } catch (error) {
    logger.error('Failed to reject booking', { error });
    res.status(500).json({
      error: {
        code: 'REJECT_FAILED',
        message: 'Failed to reject booking',
      },
    });
  }
});

/**
 * POST /api/bookings/:bookingId/start
 * Vendor starts service delivery
 */
app.post('/api/bookings/:bookingId/start', [
  param('bookingId').notEmpty(),
  body('vendorId').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { vendorId } = req.body;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }
    
    if (booking.vendorId !== vendorId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }
    
    if (booking.status !== BookingStatus.ACCEPTED) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot start service with status: ${booking.status}`,
        },
      });
    }

    bookingDb.updateStatus(bookingId, BookingStatus.IN_PROGRESS, 'Service started');

    res.json({
      success: true,
      data: {
        bookingId,
        status: BookingStatus.IN_PROGRESS,
        message: 'Service started',
      },
    });
  } catch (error) {
    logger.error('Failed to start service', { error });
    res.status(500).json({
      error: {
        code: 'START_FAILED',
        message: 'Failed to start service',
      },
    });
  }
});

/**
 * POST /api/bookings/:bookingId/complete
 * Complete a booking (requires proof upload)
 */
app.post('/api/bookings/:bookingId/complete', [
  param('bookingId').notEmpty(),
  body('vendorId').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { vendorId } = req.body;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }
    
    if (booking.vendorId !== vendorId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }
    
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot complete booking with status: ${booking.status}`,
        },
      });
    }

    // Check if at least one proof has been uploaded
    if (booking.proofs.length === 0) {
      return res.status(400).json({
        error: {
          code: 'PROOF_REQUIRED',
          message: 'At least one proof (photo/signature) must be uploaded before completion',
        },
      });
    }

    // Update payment status to paid
    bookingDb.setPayment(bookingId, booking.paymentTransactionId || '', 'paid');
    bookingDb.updateStatus(bookingId, BookingStatus.COMPLETED, 'Service completed and verified');

    res.json({
      success: true,
      data: {
        bookingId,
        status: BookingStatus.COMPLETED,
        paymentStatus: 'paid',
        message: 'Booking completed. Vendor will receive INR settlement.',
      },
    });
  } catch (error) {
    logger.error('Failed to complete booking', { error });
    res.status(500).json({
      error: {
        code: 'COMPLETE_FAILED',
        message: 'Failed to complete booking',
      },
    });
  }
});

/**
 * POST /api/bookings/:bookingId/proof
 * Upload proof of service (photo, signature, document)
 */
app.post('/api/bookings/:bookingId/proof', [
  param('bookingId').notEmpty(),
  body('uploadedBy').isIn(['msme', 'vendor']),
  body('type').isIn(['photo', 'signature', 'document']),
  body('url').isURL().withMessage('Valid URL required'),
], async (req: Request, res: Response) => {
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

    const { bookingId } = req.params;
    const { uploadedBy, type, url } = req.body;
    
    const booking = bookingDb.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    const proof = {
      type,
      url,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };

    bookingDb.addProof(bookingId, proof);

    res.json({
      success: true,
      data: {
        bookingId,
        proof,
        totalProofs: booking.proofs.length + 1,
        message: 'Proof uploaded successfully',
      },
    });
  } catch (error) {
    logger.error('Failed to upload proof', { error });
    res.status(500).json({
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload proof',
      },
    });
  }
});

// Helper function to serialize booking for JSON response
function serializeBooking(booking: Booking) {
  return {
    id: booking.id,
    msmeId: booking.msmeId,
    vendorId: booking.vendorId,
    warehouseId: booking.warehouseId,
    serviceType: booking.serviceType,
    description: booking.description,
    pickupLocation: booking.pickupLocation,
    deliveryLocation: booking.deliveryLocation,
    startDate: booking.startDate,
    endDate: booking.endDate,
    duration: booking.duration,
    quotedAmount: booking.quotedAmount.toString(),
    finalAmount: booking.finalAmount?.toString(),
    tokenType: booking.tokenType === 0 ? 'RESILIENCE_CREDIT' : 'RELIEF_TOKEN',
    paymentStatus: booking.paymentStatus,
    paymentTransactionId: booking.paymentTransactionId,
    status: booking.status,
    statusHistory: booking.statusHistory,
    proofsCount: booking.proofs.length,
    blockchainTxHash: booking.blockchainTxHash,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
    },
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Booking Service started on port ${config.port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
  logger.info(`📚 API Info: http://localhost:${config.port}/api/bookings`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
