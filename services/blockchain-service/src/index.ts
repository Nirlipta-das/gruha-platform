/**
 * GRUHA Blockchain Service - Entry Point
 */

import { startServer } from './api';
import { logger } from './logger';
import { getBlockchainClient } from './blockchain-client';
import config from './config';

async function main() {
  logger.info('==========================================');
  logger.info('  GRUHA Blockchain Service Starting');
  logger.info('==========================================');
  
  // Log configuration
  logger.info('Configuration:', {
    network: config.blockchain.network,
    chainId: config.blockchain.chainId,
    contractAddress: config.blockchain.contractAddress || 'NOT SET',
    serverPort: config.server.port
  });
  
  // Initialize blockchain client and test connection
  try {
    const client = getBlockchainClient();
    
    if (client.isConfigured()) {
      const networkInfo = await client.getNetworkInfo();
      logger.info('Connected to blockchain:', networkInfo);
      
      const balance = await client.getSignerBalance();
      logger.info(`Signer balance: ${balance} MATIC`);
      
      // Get initial stats
      const stats = await client.getStats();
      logger.info('Current platform stats:', {
        totalMinted: stats.totalMinted.toString(),
        totalMSMEs: stats.totalMSMEs.toString(),
        totalVendors: stats.totalVendors.toString()
      });
    } else {
      logger.warn('⚠️  Contract not configured. Set GRUHA_CONTRACT_ADDRESS in .env');
      logger.warn('   Run: npx hardhat run scripts/deploy.ts --network <network>');
    }
  } catch (error: any) {
    logger.error('Failed to connect to blockchain:', { error: error.message });
    logger.warn('Service will start but blockchain operations will fail');
  }
  
  // Start HTTP server
  startServer();
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
