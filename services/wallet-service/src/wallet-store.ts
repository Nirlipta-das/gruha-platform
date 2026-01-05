/**
 * GRUHA Wallet Service - In-Memory Wallet Storage
 * Per PRD §7 - Dual Token System
 * 
 * This provides a local cache of wallet data that syncs with blockchain
 */

import { TokenType, SpendingCategory } from './config';
import { logger } from './logger';

// Wallet balance structure
export interface WalletBalance {
  msmeId: string;
  walletAddress?: string;
  resilienceCredits: bigint;  // Pre-disaster tokens
  reliefTokens: bigint;        // Post-disaster tokens
  totalBalance: bigint;
  updatedAt: string;
}

// Token allocation record
export interface TokenAllocation {
  id: string;
  msmeId: string;
  disasterId: string;
  tokenType: TokenType;
  amount: bigint;
  remainingAmount: bigint;
  validUntil: string;
  categories: SpendingCategory[];
  allocatedAt: string;
  allocatedBy: string;  // Authority ID
}

// Transaction record
export interface WalletTransaction {
  id: string;
  msmeId: string;
  vendorId: string;
  tokenType: TokenType;
  category: SpendingCategory;
  amount: bigint;
  bookingId?: string;
  blockchainTxHash?: string;
  fraudScore: number;
  fraudFlags: string[];
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  createdAt: string;
  completedAt?: string;
}

// In-memory storage
const wallets = new Map<string, WalletBalance>();
const allocations = new Map<string, TokenAllocation>();
const allocationsByMsme = new Map<string, string[]>();
const transactions = new Map<string, WalletTransaction>();
const transactionsByMsme = new Map<string, string[]>();

/**
 * Wallet Operations
 */
export const walletDb = {
  // Get or create wallet for MSME
  getOrCreate(msmeId: string): WalletBalance {
    let wallet = wallets.get(msmeId);
    if (!wallet) {
      wallet = {
        msmeId,
        resilienceCredits: BigInt(0),
        reliefTokens: BigInt(0),
        totalBalance: BigInt(0),
        updatedAt: new Date().toISOString(),
      };
      wallets.set(msmeId, wallet);
    }
    return wallet;
  },
  
  // Get wallet balance
  getBalance(msmeId: string): WalletBalance | null {
    return wallets.get(msmeId) || null;
  },
  
  // Update balance (after blockchain sync)
  updateBalance(msmeId: string, resilienceCredits: bigint, reliefTokens: bigint): WalletBalance {
    const wallet = this.getOrCreate(msmeId);
    wallet.resilienceCredits = resilienceCredits;
    wallet.reliefTokens = reliefTokens;
    wallet.totalBalance = resilienceCredits + reliefTokens;
    wallet.updatedAt = new Date().toISOString();
    wallets.set(msmeId, wallet);
    return wallet;
  },
  
  // Credit tokens (from allocation)
  creditTokens(msmeId: string, tokenType: TokenType, amount: bigint): WalletBalance {
    const wallet = this.getOrCreate(msmeId);
    
    if (tokenType === TokenType.RESILIENCE_CREDIT) {
      wallet.resilienceCredits += amount;
    } else {
      wallet.reliefTokens += amount;
    }
    wallet.totalBalance = wallet.resilienceCredits + wallet.reliefTokens;
    wallet.updatedAt = new Date().toISOString();
    
    wallets.set(msmeId, wallet);
    logger.info(`Credited ${amount} ${TokenType[tokenType]} to ${msmeId}`);
    return wallet;
  },
  
  // Debit tokens (for spending)
  debitTokens(msmeId: string, tokenType: TokenType, amount: bigint): WalletBalance | null {
    const wallet = wallets.get(msmeId);
    if (!wallet) return null;
    
    if (tokenType === TokenType.RESILIENCE_CREDIT) {
      if (wallet.resilienceCredits < amount) return null;
      wallet.resilienceCredits -= amount;
    } else {
      if (wallet.reliefTokens < amount) return null;
      wallet.reliefTokens -= amount;
    }
    wallet.totalBalance = wallet.resilienceCredits + wallet.reliefTokens;
    wallet.updatedAt = new Date().toISOString();
    
    wallets.set(msmeId, wallet);
    logger.info(`Debited ${amount} ${TokenType[tokenType]} from ${msmeId}`);
    return wallet;
  },
  
  // Set wallet address
  setWalletAddress(msmeId: string, address: string): WalletBalance {
    const wallet = this.getOrCreate(msmeId);
    wallet.walletAddress = address;
    wallet.updatedAt = new Date().toISOString();
    wallets.set(msmeId, wallet);
    return wallet;
  },
};

/**
 * Allocation Operations
 */
export const allocationDb = {
  create(data: Omit<TokenAllocation, 'allocatedAt'>): TokenAllocation {
    const allocation: TokenAllocation = {
      ...data,
      allocatedAt: new Date().toISOString(),
    };
    
    allocations.set(data.id, allocation);
    
    // Track by MSME
    const msmeAllocations = allocationsByMsme.get(data.msmeId) || [];
    msmeAllocations.push(data.id);
    allocationsByMsme.set(data.msmeId, msmeAllocations);
    
    // Update wallet balance
    walletDb.creditTokens(data.msmeId, data.tokenType, data.amount);
    
    logger.info(`Allocation created: ${data.id} for MSME ${data.msmeId}`);
    return allocation;
  },
  
  findById(id: string): TokenAllocation | null {
    return allocations.get(id) || null;
  },
  
  findByMsme(msmeId: string): TokenAllocation[] {
    const ids = allocationsByMsme.get(msmeId) || [];
    return ids.map(id => allocations.get(id)!).filter(Boolean);
  },
  
  findActiveByMsme(msmeId: string): TokenAllocation[] {
    const now = new Date();
    return this.findByMsme(msmeId).filter(a => {
      return a.remainingAmount > 0 && new Date(a.validUntil) > now;
    });
  },
  
  updateRemaining(id: string, remainingAmount: bigint): TokenAllocation | null {
    const allocation = allocations.get(id);
    if (!allocation) return null;
    
    allocation.remainingAmount = remainingAmount;
    allocations.set(id, allocation);
    return allocation;
  },
  
  findByDisaster(disasterId: string): TokenAllocation[] {
    return Array.from(allocations.values()).filter(a => a.disasterId === disasterId);
  },
};

/**
 * Transaction Operations
 */
export const transactionDb = {
  create(data: Omit<WalletTransaction, 'createdAt'>): WalletTransaction {
    const transaction: WalletTransaction = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    transactions.set(data.id, transaction);
    
    // Track by MSME
    const msmeTxns = transactionsByMsme.get(data.msmeId) || [];
    msmeTxns.push(data.id);
    transactionsByMsme.set(data.msmeId, msmeTxns);
    
    logger.info(`Transaction created: ${data.id}`);
    return transaction;
  },
  
  findById(id: string): WalletTransaction | null {
    return transactions.get(id) || null;
  },
  
  findByMsme(msmeId: string, limit = 50): WalletTransaction[] {
    const ids = transactionsByMsme.get(msmeId) || [];
    return ids.slice(-limit).map(id => transactions.get(id)!).filter(Boolean).reverse();
  },
  
  updateStatus(id: string, status: WalletTransaction['status'], txHash?: string): WalletTransaction | null {
    const txn = transactions.get(id);
    if (!txn) return null;
    
    txn.status = status;
    if (txHash) txn.blockchainTxHash = txHash;
    if (status === 'completed' || status === 'failed') {
      txn.completedAt = new Date().toISOString();
    }
    
    transactions.set(id, txn);
    return txn;
  },
  
  findPending(): WalletTransaction[] {
    return Array.from(transactions.values()).filter(t => t.status === 'pending');
  },
  
  findFlagged(): WalletTransaction[] {
    return Array.from(transactions.values()).filter(t => t.status === 'flagged');
  },
};
