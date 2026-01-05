/**
 * GRUHA Blockchain Service Configuration
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
dotenvConfig({ path: resolve(__dirname, '../../../.env') });

export interface BlockchainConfig {
  network: 'mumbai' | 'amoy' | 'localhost';
  rpcUrl: string;
  contractAddress: string;
  chainId: number;
  privateKey?: string;
  alchemyApiKey?: string;
}

function getNetworkConfig(): BlockchainConfig {
  const network = (process.env.BLOCKCHAIN_NETWORK || 'localhost') as BlockchainConfig['network'];
  const alchemyApiKey = process.env.ALCHEMY_API_KEY || '';
  const contractAddress = process.env.GRUHA_CONTRACT_ADDRESS || '';
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  const networks: Record<string, Omit<BlockchainConfig, 'privateKey' | 'contractAddress' | 'alchemyApiKey'>> = {
    localhost: {
      network: 'localhost',
      rpcUrl: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    mumbai: {
      network: 'mumbai',
      rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`,
      chainId: 80001
    },
    amoy: {
      network: 'amoy',
      rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${alchemyApiKey}`,
      chainId: 80002
    }
  };

  const selectedNetwork = networks[network] || networks.localhost;

  return {
    ...selectedNetwork,
    contractAddress,
    privateKey,
    alchemyApiKey
  };
}

export const blockchainConfig = getNetworkConfig();

export const serverConfig = {
  port: parseInt(process.env.API_PORT || '3002', 10),
  host: process.env.API_HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default {
  blockchain: blockchainConfig,
  server: serverConfig
};
