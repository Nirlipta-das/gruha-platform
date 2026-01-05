# GRUHA Platform - Blockchain Development Guide

## 🚀 Real Blockchain (Not Simulation!)

This project uses **real blockchain** technology via Hardhat/Polygon testnets.

### Prerequisites

- Node.js 18+ installed
- npm 10+ installed
- (Optional) Alchemy API key for testnet deployment

---

## 📦 Installation

```bash
# From project root
npm install

# The contracts package is already installed
```

---

## 🔧 Smart Contract Development

### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### Run All Tests (28 Tests)

```bash
cd contracts
npx hardhat test
```

Expected output: **28 passing tests** ✅

---

## 🔗 Local Development Workflow

### Option A: In-Memory Network (Quick Testing)

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network hardhat
```

Deploys to Hardhat's in-memory network. Great for testing, but state resets on exit.

### Option B: Persistent Local Node

**Terminal 1 - Start Hardhat Node:**
```bash
cd contracts
npx hardhat node
```
Keep running! Provides local blockchain at `http://127.0.0.1:8545`

**Terminal 2 - Deploy Contract:**
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

**Terminal 3 - Start Blockchain Service:**
```bash
cd services/blockchain-service
npm run dev
```

---

## 🌐 Testnet Deployment (Polygon)

### Get Testnet Tokens

1. Get free MATIC: https://faucet.polygon.technology/
2. Create Alchemy account: https://dashboard.alchemy.com (free)

### Configure .env

```env
ALCHEMY_API_KEY=your_alchemy_key
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
BLOCKCHAIN_NETWORK=amoy
GRUHA_CONTRACT_ADDRESS=<deployed_address>
```

### Deploy to Polygon Amoy Testnet

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network amoy
```

---

## 📡 Blockchain Service API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/blockchain/status` | Network info |
| GET | `/api/blockchain/stats` | Platform statistics |
| POST | `/api/blockchain/msme/register` | Register MSME |
| GET | `/api/blockchain/msme/:wallet` | Get MSME details |
| GET | `/api/blockchain/msme/:wallet/balance` | Get token balance |
| POST | `/api/blockchain/vendor/register` | Register Vendor |
| GET | `/api/blockchain/vendor/:wallet` | Get Vendor details |
| POST | `/api/blockchain/disaster/declare` | Declare disaster |
| POST | `/api/blockchain/tokens/allocate` | Allocate tokens |
| GET | `/api/blockchain/allocation/:id` | Get allocation |
| GET | `/api/blockchain/transaction/:id` | Get transaction |

### Example Requests

```bash
# Register MSME
curl -X POST http://localhost:3002/api/blockchain/msme/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "businessName": "Test MSME",
    "udyamNumber": "UDYAM-XX-00-0000001"
  }'

# Allocate Tokens
curl -X POST http://localhost:3002/api/blockchain/tokens/allocate \
  -H "Content-Type: application/json" \
  -d '{
    "msmeWallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "tokenType": "RESILIENCE_CREDIT",
    "amount": 10000,
    "validityDays": 30
  }'
```

---

## 🔐 Smart Contract Features

### Dual Token System

| Token Type | Usage | Allowed Categories |
|------------|-------|-------------------|
| Resilience Credit | Pre-disaster prevention | STORAGE, TRANSPORT |
| Relief Token | Post-disaster recovery | ALL categories |

### Key Contract Functions

- `registerMSME(wallet, name, udyam)` - Register business
- `registerVendor(wallet, name, categories)` - Register service provider  
- `declareDisaster(id, name, type)` - Authority declares emergency
- `allocateTokens(msme, type, amount, days, disaster)` - Mint tokens
- `spendTokens(allocation, vendor, amount, category, booking, proof)` - Pay vendor

### Category Enforcement

Resilience Credits can ONLY be spent on:
- ✅ STORAGE
- ✅ TRANSPORT

Relief Tokens can be spent on:
- ✅ STORAGE
- ✅ TRANSPORT
- ✅ REPAIRS
- ✅ WAGES
- ✅ MATERIALS
- ✅ UTILITIES
- ✅ EQUIPMENT

---

## 📁 Project Structure

```
contracts/
├── src/
│   └── GRUHAToken.sol      # Main dual-token smart contract
├── test/
│   └── GRUHAToken.test.ts  # 28 comprehensive tests
├── scripts/
│   └── deploy.ts           # Deployment script
├── hardhat.config.ts       # Network configuration
└── package.json

services/blockchain-service/
├── src/
│   ├── index.ts           # Entry point
│   ├── api.ts             # Express REST API
│   ├── blockchain-client.ts # Ethers.js contract interaction
│   ├── config.ts          # Configuration
│   └── abi/GRUHAToken.ts  # Contract ABI
└── package.json
```

---

## 🧪 Test Coverage

All 28 tests passing:

- **Deployment** - Admin/Authority roles, category rules
- **MSME Registration** - Validation, duplicates, events
- **Vendor Registration** - Categories, role grants
- **Disaster Declaration** - Events, duplicate prevention
- **Token Allocation** - Minting, validity, balance tracking
- **Token Spending** - Category enforcement, fraud prevention
- **Full Workflow** - Complete recovery scenario
- **Admin Functions** - Compliance, suspension
