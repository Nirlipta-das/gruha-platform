/**
 * GRUHA Wallet Service
 * Per PRD §7 - Token balance and allocation management
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult, query, param } from 'express-validator';
import { config, TokenType, SpendingCategory, CategoryLabels } from './config';
import { logger } from './logger';
import { 
  walletDb, 
  allocationDb, 
  transactionDb, 
  WalletBalance, 
  TokenAllocation 
} from './wallet-store';
import { checkForFraud, validateCategory, getAllowedCategories } from './fraud-detection';

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
    service: 'wallet-service',
    version: '1.0.0',
  });
});

/**
 * GET /api/wallet/flagged
 * Get flagged transactions for review (Authority only)
 * NOTE: This route must be before :msmeId route to avoid conflicts
 */
app.get('/api/wallet/flagged', async (req: Request, res: Response) => {
  try {
    const flagged = transactionDb.findFlagged();
    
    res.json({
      success: true,
      data: {
        transactions: flagged.map(t => ({
          id: t.id,
          msmeId: t.msmeId,
          vendorId: t.vendorId,
          tokenType: TokenType[t.tokenType],
          category: CategoryLabels[t.category],
          amount: t.amount.toString(),
          fraudScore: t.fraudScore,
          fraudFlags: t.fraudFlags,
          createdAt: t.createdAt,
        })),
        total: flagged.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get flagged transactions', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch flagged transactions',
      },
    });
  }
});

/**
 * GET /api/wallet/allocations/:disasterId
 * Get all allocations for a disaster (Authority view)
 * NOTE: This route must be before :msmeId route
 */
app.get('/api/wallet/allocations/:disasterId', async (req: Request, res: Response) => {
  try {
    const { disasterId } = req.params;
    
    const allocations = allocationDb.findByDisaster(disasterId);
    
    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, BigInt(0));
    const totalRemaining = allocations.reduce((sum, a) => sum + a.remainingAmount, BigInt(0));
    
    res.json({
      success: true,
      data: {
        disasterId,
        summary: {
          totalAllocations: allocations.length,
          totalAllocated: totalAllocated.toString(),
          totalRemaining: totalRemaining.toString(),
          totalSpent: (totalAllocated - totalRemaining).toString(),
        },
        allocations: allocations.map(a => ({
          id: a.id,
          msmeId: a.msmeId,
          tokenType: TokenType[a.tokenType],
          amount: a.amount.toString(),
          remaining: a.remainingAmount.toString(),
          validUntil: a.validUntil,
          allocatedAt: a.allocatedAt,
        })),
      },
    });
  } catch (error) {
    logger.error('Failed to get allocations', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch allocations',
      },
    });
  }
});

/**
 * GET /api/wallet/:msmeId
 * Get wallet balance for an MSME
 */
app.get('/api/wallet/:msmeId', async (req: Request, res: Response) => {
  try {
    const { msmeId } = req.params;
    
    const wallet = walletDb.getOrCreate(msmeId);
    const allocations = allocationDb.findActiveByMsme(msmeId);
    
    res.json({
      success: true,
      data: {
        msmeId: wallet.msmeId,
        walletAddress: wallet.walletAddress,
        balance: {
          resilienceCredits: wallet.resilienceCredits.toString(),
          reliefTokens: wallet.reliefTokens.toString(),
          total: wallet.totalBalance.toString(),
        },
        activeAllocations: allocations.map(a => ({
          id: a.id,
          tokenType: TokenType[a.tokenType],
          amount: a.amount.toString(),
          remaining: a.remainingAmount.toString(),
          validUntil: a.validUntil,
          categories: a.categories.map(c => CategoryLabels[c]),
        })),
        updatedAt: wallet.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Failed to get wallet', { error });
    res.status(500).json({
      error: {
        code: 'WALLET_FETCH_FAILED',
        message: 'Failed to fetch wallet',
      },
    });
  }
});

/**
 * POST /api/wallet/allocate
 * Allocate tokens to an MSME (Authority only)
 */
app.post(
  '/api/wallet/allocate',
  [
    body('msmeId').notEmpty().withMessage('MSME ID required'),
    body('disasterId').notEmpty().withMessage('Disaster ID required'),
    body('tokenType').isIn([0, 1]).withMessage('Invalid token type (0=Resilience, 1=Relief)'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be positive integer'),
    body('validityDays').isInt({ min: 1, max: 365 }).withMessage('Validity must be 1-365 days'),
    body('categories').isArray({ min: 1 }).withMessage('At least one category required'),
    body('allocatedBy').notEmpty().withMessage('Authority ID required'),
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

      const { msmeId, disasterId, tokenType, amount, validityDays, categories, allocatedBy } = req.body;
      
      // Validate categories for token type
      const allowedCategories = getAllowedCategories(tokenType);
      const invalidCategories = categories.filter((c: number) => !allowedCategories.includes(c));
      
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CATEGORIES',
            message: `Categories ${invalidCategories.join(', ')} not allowed for ${TokenType[tokenType]}`,
            allowedCategories: allowedCategories.map(c => ({ id: c, name: CategoryLabels[c] })),
          },
        });
      }
      
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);
      
      const allocation = allocationDb.create({
        id: `alloc_${Date.now()}_${uuidv4().slice(0, 8)}`,
        msmeId,
        disasterId,
        tokenType,
        amount: BigInt(amount),
        remainingAmount: BigInt(amount),
        validUntil: validUntil.toISOString(),
        categories,
        allocatedBy,
      });
      
      logger.info(`Tokens allocated: ${amount} ${TokenType[tokenType]} to ${msmeId}`);
      
      res.status(201).json({
        success: true,
        data: {
          allocationId: allocation.id,
          msmeId: allocation.msmeId,
          tokenType: TokenType[allocation.tokenType],
          amount: allocation.amount.toString(),
          validUntil: allocation.validUntil,
          categories: allocation.categories.map(c => CategoryLabels[c]),
          message: `Successfully allocated ${amount} ${TokenType[tokenType]} tokens`,
        },
      });
    } catch (error) {
      logger.error('Token allocation failed', { error });
      res.status(500).json({
        error: {
          code: 'ALLOCATION_FAILED',
          message: 'Failed to allocate tokens',
        },
      });
    }
  }
);

/**
 * POST /api/wallet/spend
 * Spend tokens (MSME paying vendor)
 */
app.post(
  '/api/wallet/spend',
  [
    body('msmeId').notEmpty().withMessage('MSME ID required'),
    body('vendorId').notEmpty().withMessage('Vendor ID required'),
    body('tokenType').isIn([0, 1]).withMessage('Invalid token type'),
    body('category').isIn([0, 1, 2, 3, 4, 5, 6]).withMessage('Invalid category'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be positive'),
    body('bookingId').optional().isString(),
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

      const { msmeId, vendorId, tokenType, category, amount, bookingId } = req.body;
      const amountBigInt = BigInt(amount);
      const categoryEnum = category as SpendingCategory;
      
      // Validate category for token type
      if (!validateCategory(tokenType, categoryEnum)) {
        return res.status(400).json({
          error: {
            code: 'CATEGORY_NOT_ALLOWED',
            message: `Category ${CategoryLabels[categoryEnum]} not allowed for ${TokenType[tokenType]}`,
            allowedCategories: getAllowedCategories(tokenType).map(c => ({ id: c, name: CategoryLabels[c] })),
          },
        });
      }
      
      // Check wallet balance
      const wallet = walletDb.getBalance(msmeId);
      if (!wallet) {
        return res.status(404).json({
          error: {
            code: 'WALLET_NOT_FOUND',
            message: 'MSME wallet not found',
          },
        });
      }
      
      const balance = tokenType === TokenType.RESILIENCE_CREDIT 
        ? wallet.resilienceCredits 
        : wallet.reliefTokens;
      
      if (balance < amountBigInt) {
        return res.status(400).json({
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient ${TokenType[tokenType]} balance`,
            required: amount,
            available: balance.toString(),
          },
        });
      }
      
      // Fraud detection
      const fraudCheck = checkForFraud(msmeId, vendorId, amountBigInt, categoryEnum, tokenType);
      
      if (fraudCheck.action === 'BLOCK') {
        return res.status(403).json({
          error: {
            code: 'TRANSACTION_BLOCKED',
            message: 'Transaction blocked due to suspicious activity',
            fraudScore: fraudCheck.score,
            flags: fraudCheck.flags,
          },
        });
      }
      
      // Create transaction record
      const txnId = `txn_${Date.now()}_${uuidv4().slice(0, 8)}`;
      const status = fraudCheck.action === 'FLAG' ? 'flagged' : 'pending';
      
      const transaction = transactionDb.create({
        id: txnId,
        msmeId,
        vendorId,
        tokenType,
        category: categoryEnum,
        amount: amountBigInt,
        bookingId,
        fraudScore: fraudCheck.score,
        fraudFlags: fraudCheck.flags,
        status,
      });
      
      // If not flagged, debit immediately
      if (status === 'pending') {
        walletDb.debitTokens(msmeId, tokenType, amountBigInt);
        transactionDb.updateStatus(txnId, 'completed');
        transaction.status = 'completed';
      }
      
      logger.info(`Transaction ${txnId}: ${amount} ${TokenType[tokenType]} from ${msmeId} to ${vendorId}`);
      
      res.status(201).json({
        success: true,
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          msmeId: transaction.msmeId,
          vendorId: transaction.vendorId,
          tokenType: TokenType[transaction.tokenType],
          category: CategoryLabels[transaction.category],
          amount: transaction.amount.toString(),
          bookingId: transaction.bookingId,
          fraudCheck: {
            score: fraudCheck.score,
            flags: fraudCheck.flags,
            action: fraudCheck.action,
          },
          message: status === 'flagged' 
            ? 'Transaction flagged for review' 
            : 'Transaction completed successfully',
        },
      });
    } catch (error) {
      logger.error('Transaction failed', { error });
      res.status(500).json({
        error: {
          code: 'TRANSACTION_FAILED',
          message: 'Failed to process transaction',
        },
      });
    }
  }
);

/**
 * GET /api/wallet/:msmeId/transactions
 * Get transaction history for an MSME
 */
app.get('/api/wallet/:msmeId/transactions', [
  param('msmeId').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const { msmeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const transactions = transactionDb.findByMsme(msmeId, limit);
    
    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          vendorId: t.vendorId,
          tokenType: TokenType[t.tokenType],
          category: CategoryLabels[t.category],
          amount: t.amount.toString(),
          bookingId: t.bookingId,
          status: t.status,
          fraudScore: t.fraudScore,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
        total: transactions.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get transactions', { error });
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch transactions',
      },
    });
  }
});

/**
 * POST /api/wallet/flagged/:txnId/approve
 * Approve a flagged transaction (Authority only)
 */
app.post('/api/wallet/flagged/:txnId/approve', async (req: Request, res: Response) => {
  try {
    const { txnId } = req.params;
    
    const txn = transactionDb.findById(txnId);
    if (!txn) {
      return res.status(404).json({
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }
    
    if (txn.status !== 'flagged') {
      return res.status(400).json({
        error: {
          code: 'NOT_FLAGGED',
          message: 'Transaction is not flagged',
        },
      });
    }
    
    // Debit tokens and complete transaction
    walletDb.debitTokens(txn.msmeId, txn.tokenType, txn.amount);
    transactionDb.updateStatus(txnId, 'completed');
    
    logger.info(`Flagged transaction ${txnId} approved`);
    
    res.json({
      success: true,
      data: {
        transactionId: txnId,
        status: 'completed',
        message: 'Transaction approved and completed',
      },
    });
  } catch (error) {
    logger.error('Failed to approve transaction', { error });
    res.status(500).json({
      error: {
        code: 'APPROVAL_FAILED',
        message: 'Failed to approve transaction',
      },
    });
  }
});

/**
 * POST /api/wallet/flagged/:txnId/reject
 * Reject a flagged transaction (Authority only)
 */
app.post('/api/wallet/flagged/:txnId/reject', async (req: Request, res: Response) => {
  try {
    const { txnId } = req.params;
    
    const txn = transactionDb.findById(txnId);
    if (!txn) {
      return res.status(404).json({
        error: {
          code: 'TRANSACTION_NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }
    
    if (txn.status !== 'flagged') {
      return res.status(400).json({
        error: {
          code: 'NOT_FLAGGED',
          message: 'Transaction is not flagged',
        },
      });
    }
    
    transactionDb.updateStatus(txnId, 'failed');
    
    logger.info(`Flagged transaction ${txnId} rejected`);
    
    res.json({
      success: true,
      data: {
        transactionId: txnId,
        status: 'failed',
        message: 'Transaction rejected',
      },
    });
  } catch (error) {
    logger.error('Failed to reject transaction', { error });
    res.status(500).json({
      error: {
        code: 'REJECTION_FAILED',
        message: 'Failed to reject transaction',
      },
    });
  }
});

// Service info
app.get('/api/wallet', (req: Request, res: Response) => {
  res.json({
    name: 'GRUHA Wallet Service',
    version: '1.0.0',
    description: 'Token balance and allocation management',
    tokenTypes: {
      RESILIENCE_CREDIT: 'Pre-disaster (Storage/Transport only)',
      RELIEF_TOKEN: 'Post-disaster (All recovery categories)',
    },
    categories: Object.entries(CategoryLabels).map(([id, name]) => ({ id: parseInt(id), name })),
    endpoints: {
      getBalance: 'GET /api/wallet/:msmeId',
      allocate: 'POST /api/wallet/allocate',
      spend: 'POST /api/wallet/spend',
      transactions: 'GET /api/wallet/:msmeId/transactions',
      disasterAllocations: 'GET /api/wallet/allocations/:disasterId',
      flaggedTxns: 'GET /api/wallet/flagged',
      approveFlagged: 'POST /api/wallet/flagged/:txnId/approve',
      rejectFlagged: 'POST /api/wallet/flagged/:txnId/reject',
    },
  });
});

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
  logger.info(`🚀 Wallet Service started on port ${config.port}`);
  logger.info(`📍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
  logger.info(`📚 API Info: http://localhost:${config.port}/api/wallet`);
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
