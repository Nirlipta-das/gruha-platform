/**
 * GRUHA Blockchain Client
 * Real blockchain interaction with Polygon testnet using ethers.js
 */

import { ethers, Contract, Wallet, JsonRpcProvider, formatEther, parseEther, id as keccakId } from 'ethers';
import { GRUHA_TOKEN_ABI } from './abi/GRUHAToken';
import { blockchainConfig } from './config';
import { logger } from './logger';

// Token types enum (matches Solidity)
export enum TokenType {
  RESILIENCE_CREDIT = 0,
  RELIEF_TOKEN = 1
}

// Category enum (matches Solidity)
export enum Category {
  STORAGE = 0,
  TRANSPORT = 1,
  REPAIRS = 2,
  WAGES = 3,
  MATERIALS = 4,
  UTILITIES = 5,
  EQUIPMENT = 6
}

export interface MSMEData {
  wallet: string;
  businessName: string;
  udyamNumber: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface VendorData {
  wallet: string;
  businessName: string;
  totalEarnings: bigint;
  complianceScore: bigint;
  isVerified: boolean;
  isActive: boolean;
}

export interface AllocationData {
  id: bigint;
  msme: string;
  tokenType: number;
  totalAmount: bigint;
  remainingAmount: bigint;
  validUntil: bigint;
  disasterId: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface TransactionData {
  id: bigint;
  msme: string;
  vendor: string;
  allocationId: bigint;
  amount: bigint;
  category: number;
  bookingId: string;
  timestamp: bigint;
  proofHash: string;
}

export interface DisasterData {
  id: string;
  name: string;
  disasterType: string;
  declaredAt: bigint;
  totalAllocated: bigint;
  totalSpent: bigint;
  isActive: boolean;
}

export interface PlatformStats {
  totalMinted: bigint;
  totalSpent: bigint;
  totalMSMEs: bigint;
  totalVendors: bigint;
  totalTransactions: bigint;
}

/**
 * BlockchainClient - Handles all interactions with the GRUHA smart contract
 */
export class BlockchainClient {
  private provider: JsonRpcProvider;
  private signer: Wallet | null = null;
  private contract: Contract;
  private readOnlyContract: Contract;

  constructor() {
    logger.info('Initializing BlockchainClient', {
      network: blockchainConfig.network,
      chainId: blockchainConfig.chainId,
      contractAddress: blockchainConfig.contractAddress || 'NOT_SET'
    });

    // Initialize provider
    this.provider = new JsonRpcProvider(blockchainConfig.rpcUrl, {
      chainId: blockchainConfig.chainId,
      name: blockchainConfig.network
    });

    // Initialize signer if private key is provided
    if (blockchainConfig.privateKey) {
      this.signer = new Wallet(blockchainConfig.privateKey, this.provider);
      logger.info('Signer initialized', { address: this.signer.address });
    }

    // Initialize contracts
    if (!blockchainConfig.contractAddress) {
      logger.warn('Contract address not set - some operations will fail');
    }

    this.readOnlyContract = new Contract(
      blockchainConfig.contractAddress || ethers.ZeroAddress,
      GRUHA_TOKEN_ABI,
      this.provider
    );

    this.contract = this.signer
      ? new Contract(blockchainConfig.contractAddress || ethers.ZeroAddress, GRUHA_TOKEN_ABI, this.signer)
      : this.readOnlyContract;
  }

  /**
   * Check if client is properly configured
   */
  isConfigured(): boolean {
    return !!blockchainConfig.contractAddress && blockchainConfig.contractAddress !== '';
  }

  /**
   * Get the signer's address
   */
  getSignerAddress(): string | null {
    return this.signer?.address || null;
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    
    return {
      name: blockchainConfig.network,
      chainId: Number(network.chainId),
      blockNumber,
      rpcUrl: blockchainConfig.rpcUrl.replace(/\/[^/]+$/, '/***') // Hide API key
    };
  }

  /**
   * Get signer's MATIC balance
   */
  async getSignerBalance(): Promise<string> {
    if (!this.signer) return '0';
    const balance = await this.provider.getBalance(this.signer.address);
    return formatEther(balance);
  }

  // ============================================
  // READ FUNCTIONS
  // ============================================

  /**
   * Get platform statistics
   */
  async getStats(): Promise<PlatformStats> {
    const result = await this.readOnlyContract.getStats();
    return {
      totalMinted: result[0],
      totalSpent: result[1],
      totalMSMEs: result[2],
      totalVendors: result[3],
      totalTransactions: result[4]
    };
  }

  /**
   * Get MSME data
   */
  async getMSME(wallet: string): Promise<MSMEData> {
    const result = await this.readOnlyContract.msmes(wallet);
    return {
      wallet: result[0],
      businessName: result[1],
      udyamNumber: result[2],
      isVerified: result[3],
      isActive: result[4]
    };
  }

  /**
   * Get Vendor data
   */
  async getVendor(wallet: string): Promise<VendorData> {
    const result = await this.readOnlyContract.vendors(wallet);
    return {
      wallet: result[0],
      businessName: result[1],
      totalEarnings: result[2],
      complianceScore: result[3],
      isVerified: result[4],
      isActive: result[5]
    };
  }

  /**
   * Get MSME's total balance
   */
  async getMSMEBalance(wallet: string): Promise<bigint> {
    return await this.readOnlyContract.getMSMEBalance(wallet);
  }

  /**
   * Get MSME's allocations
   */
  async getMSMEAllocations(wallet: string): Promise<bigint[]> {
    return await this.readOnlyContract.getMSMEAllocations(wallet);
  }

  /**
   * Get allocation details
   */
  async getAllocation(allocationId: number): Promise<AllocationData> {
    const result = await this.readOnlyContract.allocations(allocationId);
    return {
      id: result[0],
      msme: result[1],
      tokenType: result[2],
      totalAmount: result[3],
      remainingAmount: result[4],
      validUntil: result[5],
      disasterId: result[6],
      isActive: result[7],
      createdAt: result[8]
    };
  }

  /**
   * Get transaction details
   */
  async getTransaction(txId: number): Promise<TransactionData> {
    const result = await this.readOnlyContract.transactions(txId);
    return {
      id: result[0],
      msme: result[1],
      vendor: result[2],
      allocationId: result[3],
      amount: result[4],
      category: result[5],
      bookingId: result[6],
      timestamp: result[7],
      proofHash: result[8]
    };
  }

  /**
   * Get vendor's transactions
   */
  async getVendorTransactions(wallet: string): Promise<bigint[]> {
    return await this.readOnlyContract.getVendorTransactions(wallet);
  }

  /**
   * Get disaster details
   */
  async getDisaster(disasterId: string): Promise<DisasterData> {
    const result = await this.readOnlyContract.disasters(disasterId);
    return {
      id: result[0],
      name: result[1],
      disasterType: result[2],
      declaredAt: result[3],
      totalAllocated: result[4],
      totalSpent: result[5],
      isActive: result[6]
    };
  }

  /**
   * Check if category is allowed for token type
   */
  async isCategoryAllowed(tokenType: TokenType, category: Category): Promise<boolean> {
    return await this.readOnlyContract.isCategoryAllowed(tokenType, category);
  }

  // ============================================
  // WRITE FUNCTIONS (Require signer)
  // ============================================

  private ensureSigner() {
    if (!this.signer) {
      throw new Error('Signer not configured. Set DEPLOYER_PRIVATE_KEY in environment.');
    }
    if (!this.isConfigured()) {
      throw new Error('Contract address not configured. Set GRUHA_CONTRACT_ADDRESS in environment.');
    }
  }

  /**
   * Register a new MSME
   */
  async registerMSME(
    wallet: string,
    businessName: string,
    udyamNumber: string
  ): Promise<{ hash: string; blockNumber: number }> {
    this.ensureSigner();
    
    logger.info('Registering MSME', { wallet, businessName, udyamNumber });
    
    const tx = await this.contract.registerMSME(wallet, businessName, udyamNumber);
    const receipt = await tx.wait();
    
    logger.info('MSME registered', { 
      hash: receipt.hash, 
      blockNumber: receipt.blockNumber 
    });
    
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Register a new Vendor
   */
  async registerVendor(
    wallet: string,
    businessName: string,
    categories: Category[]
  ): Promise<{ hash: string; blockNumber: number }> {
    this.ensureSigner();
    
    logger.info('Registering Vendor', { wallet, businessName, categories });
    
    const tx = await this.contract.registerVendor(wallet, businessName, categories);
    const receipt = await tx.wait();
    
    logger.info('Vendor registered', { 
      hash: receipt.hash, 
      blockNumber: receipt.blockNumber 
    });
    
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Declare a disaster
   */
  async declareDisaster(
    disasterName: string,
    disasterType: string
  ): Promise<{ hash: string; blockNumber: number; disasterId: string }> {
    this.ensureSigner();
    
    // Generate unique disaster ID
    const disasterId = keccakId(`${disasterName}-${Date.now()}`);
    
    logger.info('Declaring disaster', { disasterId, disasterName, disasterType });
    
    const tx = await this.contract.declareDisaster(disasterId, disasterName, disasterType);
    const receipt = await tx.wait();
    
    logger.info('Disaster declared', { 
      hash: receipt.hash, 
      blockNumber: receipt.blockNumber,
      disasterId
    });
    
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      disasterId
    };
  }

  /**
   * Allocate tokens to an MSME
   */
  async allocateTokens(
    msmeWallet: string,
    tokenType: TokenType,
    amountInTokens: string, // Amount in human-readable format (e.g., "10000")
    validityDays: number,
    disasterId: string = ethers.ZeroHash
  ): Promise<{ hash: string; blockNumber: number; allocationId: number }> {
    this.ensureSigner();
    
    const amount = parseEther(amountInTokens);
    
    logger.info('Allocating tokens', { 
      msmeWallet, 
      tokenType: TokenType[tokenType], 
      amount: amountInTokens, 
      validityDays 
    });
    
    const tx = await this.contract.allocateTokens(
      msmeWallet,
      tokenType,
      amount,
      validityDays,
      disasterId
    );
    const receipt = await tx.wait();
    
    // Parse allocation ID from event
    let allocationId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = this.contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        if (parsed?.name === 'TokensAllocated') {
          allocationId = Number(parsed.args[0]);
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
    
    logger.info('Tokens allocated', { 
      hash: receipt.hash, 
      blockNumber: receipt.blockNumber,
      allocationId
    });
    
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      allocationId
    };
  }

  /**
   * Spend tokens (called by MSME)
   * Note: This requires the MSME's private key, not the authority's
   */
  async spendTokens(
    msmeSigner: Wallet,
    allocationId: number,
    vendorWallet: string,
    amountInTokens: string,
    category: Category,
    bookingId: string,
    proofHash: string = ''
  ): Promise<{ hash: string; blockNumber: number; transactionId: number }> {
    if (!this.isConfigured()) {
      throw new Error('Contract address not configured.');
    }
    
    const msmeContract = new Contract(
      blockchainConfig.contractAddress,
      GRUHA_TOKEN_ABI,
      msmeSigner
    );
    
    const amount = parseEther(amountInTokens);
    const bookingIdBytes = keccakId(bookingId);
    
    logger.info('Spending tokens', {
      msme: msmeSigner.address,
      allocationId,
      vendorWallet,
      amount: amountInTokens,
      category: Category[category]
    });
    
    const tx = await msmeContract.spendTokens(
      allocationId,
      vendorWallet,
      amount,
      category,
      bookingIdBytes,
      proofHash
    );
    const receipt = await tx.wait();
    
    // Parse transaction ID from event
    let transactionId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = this.contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        if (parsed?.name === 'TokensSpent') {
          transactionId = Number(parsed.args[0]);
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
    
    logger.info('Tokens spent', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      transactionId
    });
    
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      transactionId
    };
  }

  /**
   * Create a wallet from private key
   */
  createWallet(privateKey: string): Wallet {
    return new Wallet(privateKey, this.provider);
  }

  /**
   * Generate a new random wallet (for testing)
   */
  generateWallet(): Wallet {
    const wallet = Wallet.createRandom();
    return wallet.connect(this.provider);
  }
}

// Singleton instance
let clientInstance: BlockchainClient | null = null;

export function getBlockchainClient(): BlockchainClient {
  if (!clientInstance) {
    clientInstance = new BlockchainClient();
  }
  return clientInstance;
}

export default BlockchainClient;
