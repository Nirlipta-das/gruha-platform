/**
 * GRUHA Blockchain Service - Express API
 * Provides REST endpoints for blockchain operations
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getBlockchainClient, TokenType, Category } from './blockchain-client';
import { serverConfig } from './config';
import { logger } from './logger';
import { formatEther } from 'ethers';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'blockchain-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/blockchain/status', async (_req: Request, res: Response) => {
  try {
    const client = getBlockchainClient();
    const networkInfo = await client.getNetworkInfo();
    const balance = await client.getSignerBalance();
    
    res.json({
      success: true,
      data: {
        configured: client.isConfigured(),
        signerAddress: client.getSignerAddress(),
        signerBalance: balance + ' MATIC',
        network: networkInfo
      }
    });
  } catch (error: any) {
    logger.error('Failed to get blockchain status', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/stats', async (_req: Request, res: Response) => {
  try {
    const client = getBlockchainClient();
    const stats = await client.getStats();
    
    res.json({
      success: true,
      data: {
        totalMinted: formatEther(stats.totalMinted),
        totalSpent: formatEther(stats.totalSpent),
        totalMSMEs: stats.totalMSMEs.toString(),
        totalVendors: stats.totalVendors.toString(),
        totalTransactions: stats.totalTransactions.toString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// MSME ENDPOINTS
// ============================================

app.post('/api/blockchain/msme/register', async (req: Request, res: Response) => {
  try {
    const { wallet, businessName, udyamNumber } = req.body;
    
    if (!wallet || !businessName || !udyamNumber) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing required fields' }
      });
      return;
    }
    
    const client = getBlockchainClient();
    const result = await client.registerMSME(wallet, businessName, udyamNumber);
    
    res.json({
      success: true,
      data: {
        txHash: result.hash,
        blockNumber: result.blockNumber
      }
    });
  } catch (error: any) {
    logger.error('Failed to register MSME', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/msme/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const client = getBlockchainClient();
    
    const msme = await client.getMSME(wallet);
    const balance = await client.getMSMEBalance(wallet);
    const allocations = await client.getMSMEAllocations(wallet);
    
    res.json({
      success: true,
      data: {
        ...msme,
        balance: formatEther(balance),
        allocationIds: allocations.map(a => a.toString())
      }
    });
  } catch (error: any) {
    logger.error('Failed to get MSME', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/msme/:wallet/balance', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const client = getBlockchainClient();
    
    const balance = await client.getMSMEBalance(wallet);
    
    res.json({
      success: true,
      data: {
        wallet,
        balance: formatEther(balance),
        balanceRaw: balance.toString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get MSME balance', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// VENDOR ENDPOINTS
// ============================================

app.post('/api/blockchain/vendor/register', async (req: Request, res: Response) => {
  try {
    const { wallet, businessName, categories } = req.body;
    
    if (!wallet || !businessName || !categories || !Array.isArray(categories)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing required fields' }
      });
      return;
    }
    
    // Convert category strings to enum values
    const categoryValues = categories.map((c: string) => {
      const value = Category[c as keyof typeof Category];
      if (value === undefined) {
        throw new Error(`Invalid category: ${c}`);
      }
      return value;
    });
    
    const client = getBlockchainClient();
    const result = await client.registerVendor(wallet, businessName, categoryValues);
    
    res.json({
      success: true,
      data: {
        txHash: result.hash,
        blockNumber: result.blockNumber
      }
    });
  } catch (error: any) {
    logger.error('Failed to register vendor', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/vendor/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const client = getBlockchainClient();
    
    const vendor = await client.getVendor(wallet);
    const transactions = await client.getVendorTransactions(wallet);
    
    res.json({
      success: true,
      data: {
        ...vendor,
        totalEarnings: formatEther(vendor.totalEarnings),
        complianceScore: vendor.complianceScore.toString(),
        transactionIds: transactions.map(t => t.toString())
      }
    });
  } catch (error: any) {
    logger.error('Failed to get vendor', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// DISASTER ENDPOINTS
// ============================================

app.post('/api/blockchain/disaster/declare', async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing required fields' }
      });
      return;
    }
    
    const client = getBlockchainClient();
    const result = await client.declareDisaster(name, type);
    
    res.json({
      success: true,
      data: {
        disasterId: result.disasterId,
        txHash: result.hash,
        blockNumber: result.blockNumber
      }
    });
  } catch (error: any) {
    logger.error('Failed to declare disaster', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/disaster/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getBlockchainClient();
    
    const disaster = await client.getDisaster(id);
    
    res.json({
      success: true,
      data: {
        ...disaster,
        totalAllocated: formatEther(disaster.totalAllocated),
        totalSpent: formatEther(disaster.totalSpent),
        declaredAt: new Date(Number(disaster.declaredAt) * 1000).toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get disaster', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// TOKEN ALLOCATION ENDPOINTS
// ============================================

app.post('/api/blockchain/tokens/allocate', async (req: Request, res: Response) => {
  try {
    const { msmeWallet, tokenType, amount, validityDays, disasterId } = req.body;
    
    if (!msmeWallet || tokenType === undefined || !amount || !validityDays) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing required fields' }
      });
      return;
    }
    
    // Convert token type string to enum
    const tokenTypeValue = typeof tokenType === 'string' 
      ? TokenType[tokenType as keyof typeof TokenType]
      : tokenType;
      
    if (tokenTypeValue === undefined) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid token type' }
      });
      return;
    }
    
    const client = getBlockchainClient();
    const result = await client.allocateTokens(
      msmeWallet,
      tokenTypeValue,
      amount.toString(),
      validityDays,
      disasterId
    );
    
    res.json({
      success: true,
      data: {
        allocationId: result.allocationId,
        txHash: result.hash,
        blockNumber: result.blockNumber
      }
    });
  } catch (error: any) {
    logger.error('Failed to allocate tokens', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

app.get('/api/blockchain/allocation/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getBlockchainClient();
    
    const allocation = await client.getAllocation(parseInt(id));
    
    res.json({
      success: true,
      data: {
        id: allocation.id.toString(),
        msme: allocation.msme,
        tokenType: TokenType[allocation.tokenType],
        totalAmount: formatEther(allocation.totalAmount),
        remainingAmount: formatEther(allocation.remainingAmount),
        validUntil: new Date(Number(allocation.validUntil) * 1000).toISOString(),
        disasterId: allocation.disasterId,
        isActive: allocation.isActive,
        createdAt: new Date(Number(allocation.createdAt) * 1000).toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get allocation', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// TRANSACTION ENDPOINTS
// ============================================

app.get('/api/blockchain/transaction/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = getBlockchainClient();
    
    const tx = await client.getTransaction(parseInt(id));
    
    res.json({
      success: true,
      data: {
        id: tx.id.toString(),
        msme: tx.msme,
        vendor: tx.vendor,
        allocationId: tx.allocationId.toString(),
        amount: formatEther(tx.amount),
        category: Category[tx.category],
        bookingId: tx.bookingId,
        timestamp: new Date(Number(tx.timestamp) * 1000).toISOString(),
        proofHash: tx.proofHash
      }
    });
  } catch (error: any) {
    logger.error('Failed to get transaction', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

app.get('/api/blockchain/category-check', async (req: Request, res: Response) => {
  try {
    const { tokenType, category } = req.query;
    
    if (!tokenType || !category) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Missing tokenType or category' }
      });
      return;
    }
    
    const tokenTypeValue = TokenType[tokenType as keyof typeof TokenType];
    const categoryValue = Category[category as keyof typeof Category];
    
    if (tokenTypeValue === undefined || categoryValue === undefined) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid tokenType or category' }
      });
      return;
    }
    
    const client = getBlockchainClient();
    const allowed = await client.isCategoryAllowed(tokenTypeValue, categoryValue);
    
    res.json({
      success: true,
      data: {
        tokenType,
        category,
        allowed
      }
    });
  } catch (error: any) {
    logger.error('Failed to check category', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'BLOCKCHAIN_ERROR', message: error.message }
    });
  }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  });
});

// Start server
export function startServer() {
  const { port, host } = serverConfig;
  
  app.listen(port, host, () => {
    logger.info(`🚀 Blockchain Service running at http://${host}:${port}`);
    logger.info(`   Network: ${getBlockchainClient().isConfigured() ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  });
}

export default app;
