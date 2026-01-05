# GRUHA Platform - Complete Implementation Blueprint

> **For AI Coding Agents** | No Docker | Free Tier Stack | Production-Ready

---

## 🎯 Project Identity

**GRUHA** = Climate Resilience Infrastructure for MSMEs (Micro, Small, Medium Enterprises)

**Core Function:** Protect small businesses from disaster losses through:
1. **Pre-Disaster:** Preventive warehouse/transport booking using Resilience Credits
2. **During-Disaster:** Offline-capable transactions, SMS fallback
3. **Post-Disaster:** Relief Tokens for recovery marketplace (repairs, wages, materials)

**NOT:** Crypto speculation, payment gateway, charity platform, or mobile app store download

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (PWA)                            │
│  Next.js 14 + Tailwind CSS + Framer Motion + shadcn/ui      │
│                                                              │
│  4 Portals:                                                  │
│  • /public     → Transparency Dashboard (no login)          │
│  • /msme       → MSME Mobile-First Portal                   │
│  • /vendor     → Vendor Service Provider Portal             │
│  • /authority  → Government Admin Dashboard                 │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 3001)                   │
│  Express.js + TypeScript + JWT Auth                         │
│  Routes: /auth, /msme, /vendor, /bookings, /wallet, /admin  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  LowDB (JSON file) for development                          │
│  SQLite for production-lite                                 │
│  Supabase (PostgreSQL) for production                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
│  Hyperledger Fabric Chaincode (Go) - Simulated in Dev       │
│  Functions: MintTokens, SpendTokens, TransferTokens         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack (100% Free Tier)

| Layer | Technology | Free Tier |
|-------|------------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui | Vercel (100GB bandwidth) |
| Backend | Node.js + Express + TypeScript | Railway/Render (500hrs/month) |
| Database | Supabase PostgreSQL | 500MB + 2GB bandwidth |
| Auth | Custom JWT + OTP | Built-in |
| Storage | Supabase Storage / Cloudinary | 1GB free |
| SMS | Twilio (dev) / MSG91 | 1000 free SMS |
| Maps | Mapbox GL JS | 50k loads/month |
| Blockchain | Simulated Hyperledger | Local JSON ledger |
| Cache | In-memory (dev) / Upstash Redis | 10k commands/day |
| Hosting | Vercel + Railway | Free tiers |

---

## 📁 Project Structure

```
gruha/
├── apps/
│   └── web/                      # Next.js 14 PWA
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   │   ├── (public)/     # Public portal (no auth)
│       │   │   ├── msme/         # MSME portal
│       │   │   ├── vendor/       # Vendor portal
│       │   │   ├── authority/    # Authority dashboard
│       │   │   └── auth/         # Login/Register
│       │   ├── components/       # UI components
│       │   ├── lib/              # API client, utils
│       │   └── stores/           # Zustand stores
│       └── public/               # Static assets, PWA manifest
│
├── services/
│   └── api-gateway/              # Main Express API
│       ├── src/
│       │   ├── controllers/      # Route handlers
│       │   ├── middleware/       # Auth, validation
│       │   ├── routes/           # API routes
│       │   ├── config/           # DB config
│       │   └── utils/            # Helpers
│       └── data/                 # LowDB JSON file
│
├── packages/
│   ├── shared-types/             # TypeScript interfaces
│   ├── shared-utils/             # Validation, formatters
│   └── ui-components/            # Reusable UI
│
└── blockchain/
    └── hyperledger/
        └── chaincode/gruha/      # Go smart contracts
```

---

## 🔐 Authentication System

### Flow
```
1. User enters phone number
2. OTP sent via SMS gateway (or dev mode: accept 123456)
3. OTP verified → JWT token pair generated
4. Access token (1h) + Refresh token (7d) returned
5. Protected routes check Authorization header
```

### JWT Payload
```typescript
interface TokenPayload {
  userId: string;
  role: 'ROLE_MSME' | 'ROLE_VENDOR' | 'ROLE_AUTHORITY' | 'ROLE_PUBLIC';
  mobile: string;
  isEmergencyMode?: boolean;
}
```

### API Endpoints
```
POST /v1/auth/otp/send      → Send OTP to phone
POST /v1/auth/otp/verify    → Verify OTP, return tokens
POST /v1/auth/refresh       → Refresh access token
POST /v1/auth/logout        → Invalidate session
```

---

## 👤 User Roles & Permissions

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **MSME** | Book services, spend tokens, view wallet | Withdraw cash, access admin |
| **Vendor** | Accept bookings, upload proof, view settlements | See MSME balances |
| **Authority** | Declare disasters, allocate tokens, view analytics | Delete blockchain logs |
| **Public** | View anonymized dashboard | Access personal data |

---

## 💰 Dual Token System

### 1. Resilience Credits (Pre-Disaster)
- **Purpose:** Preventive services (warehouse storage, transport)
- **Allocation:** Before disaster warning
- **Validity:** 7-30 days
- **Spending:** ONLY on storage/transport categories

### 2. Relief Tokens (Post-Disaster)
- **Purpose:** Recovery services (repairs, wages, materials, utilities)
- **Allocation:** After disaster declaration
- **Validity:** 30-90 days
- **Spending:** Whitelisted recovery categories

### Token Rules (Smart Contract Logic)
```go
func SpendTokens(msmeID, vendorID, amount, category, bookingID string) error {
    // 1. Verify MSME has sufficient balance
    // 2. Verify vendor is whitelisted
    // 3. Verify category is allowed for token type
    // 4. Verify amount doesn't exceed daily limit
    // 5. Deduct from MSME wallet
    // 6. Credit to vendor (instant INR settlement)
    // 7. Log to blockchain
}
```

---

## 📱 Portal Features

### Public Portal (`/public`)
| Feature | Description |
|---------|-------------|
| Live Transaction Feed | Real-time anonymized spending stream |
| Fund Flow Visualization | Sankey diagram: Treasury → Districts → MSMEs → Vendors |
| Blockchain Explorer | View blocks, transactions, verify integrity |
| Analytics Dashboard | Spending by category, region, timeline |
| Report Downloads | PDF/CSV export of fund utilization |

### MSME Portal (`/msme`)
| Feature | Description |
|---------|-------------|
| Dashboard | Wallet balance, active bookings, alerts |
| Wallet | Token balances, allocations, transaction history |
| Warehouse Booking | Search, filter, book safe storage |
| Transport Booking | Book goods transport to safety |
| QR Payment | Generate offline-capable payment QR |
| Bookings | Track all bookings and status |
| Recovery Marketplace | Post-disaster services (repairs, wages) |
| Notifications | Push/SMS alerts |

### Vendor Portal (`/vendor`)
| Feature | Description |
|---------|-------------|
| Dashboard | Pending bookings, earnings summary |
| Bookings | Accept/reject, upload proof photos |
| QR Scanner | Scan MSME payment QR codes |
| Settlements | Track INR settlements to bank |
| Profile | Business info, pricing, availability |

### Authority Portal (`/authority`)
| Feature | Description |
|---------|-------------|
| Disaster Declaration | Create disaster events |
| Token Allocation | Mint and allocate to MSMEs |
| Analytics | Real-time spending dashboards |
| Audit Logs | Immutable blockchain event viewer |
| Vendor Management | Approve/suspend vendors |

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users (base for all user types)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MSMEs (business owners)
CREATE TABLE msmes (
  id UUID PRIMARY KEY REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  udyam_number VARCHAR(50),
  business_category VARCHAR(50),
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  kyc_status VARCHAR(20) DEFAULT 'PENDING',
  risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  blockchain_wallet_address VARCHAR(100)
);

-- Vendors (service providers)
CREATE TABLE vendors (
  id UUID PRIMARY KEY REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(50) NOT NULL, -- WAREHOUSE, TRANSPORT, REPAIR, etc.
  service_categories TEXT[], -- Array of categories
  emergency_pricing JSONB, -- {perSqftPerDay: 5, perKm: 15}
  compliance_score INTEGER DEFAULT 100,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE
);

-- Token Allocations
CREATE TABLE token_allocations (
  id UUID PRIMARY KEY,
  disaster_id UUID REFERENCES disasters(id),
  msme_id UUID REFERENCES msmes(id),
  token_type VARCHAR(30), -- RESILIENCE_CREDIT or RELIEF_TOKEN
  total_amount DECIMAL(12, 2),
  remaining_amount DECIMAL(12, 2),
  allowed_categories TEXT[],
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  msme_id UUID REFERENCES msmes(id),
  vendor_id UUID REFERENCES vendors(id),
  service_type VARCHAR(50),
  service_category VARCHAR(50),
  start_date DATE,
  end_date DATE,
  total_amount DECIMAL(12, 2),
  status VARCHAR(30) DEFAULT 'PENDING',
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  blockchain_txn_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions (blockchain mirror)
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  msme_id UUID REFERENCES msmes(id),
  vendor_id UUID REFERENCES vendors(id),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(12, 2),
  token_type VARCHAR(30),
  category VARCHAR(50),
  status VARCHAR(20),
  fraud_score INTEGER DEFAULT 0,
  blockchain_txn_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disasters
CREATE TABLE disasters (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- FLOOD, CYCLONE, EARTHQUAKE, etc.
  severity VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
  affected_districts TEXT[],
  declared_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  allocated_funds DECIMAL(15, 2)
);
```

---

## 🔌 API Endpoints

### Authentication
```
POST /v1/auth/otp/send
POST /v1/auth/otp/verify
POST /v1/auth/refresh
```

### MSME
```
POST /v1/msme/register
GET  /v1/msme/profile
PUT  /v1/msme/profile
GET  /v1/msme/wallet
GET  /v1/msme/bookings
GET  /v1/msme/transactions
```

### Bookings
```
GET  /v1/warehouses/search
GET  /v1/transport/search
POST /v1/bookings
GET  /v1/bookings/:id
POST /v1/bookings/:id/confirm
POST /v1/bookings/:id/cancel
```

### Vendor
```
POST /v1/vendor/register
GET  /v1/vendor/bookings
POST /v1/vendor/bookings/:id/accept
POST /v1/vendor/bookings/:id/reject
POST /v1/vendor/proof/upload
GET  /v1/vendor/settlements
```

### Authority
```
POST /v1/authority/disaster/declare
POST /v1/authority/tokens/allocate
GET  /v1/authority/analytics
GET  /v1/authority/audit-logs
```

### Public
```
GET  /v1/public/stats
GET  /v1/public/transactions
GET  /v1/public/disasters
GET  /v1/public/blockchain/blocks
```

---

## 🎨 UI/UX Guidelines

### Design System
- **Primary:** Blue #2196F3 (Trust)
- **Secondary:** Green #4CAF50 (Recovery)
- **Alert:** Red #F44336 (Emergency)
- **Background:** #FAFAFA (Light) / #121212 (Dark)

### Typography
- **Headings:** Poppins (600, 700)
- **Body:** Inter (400, 500, 600)
- **Indic Scripts:** Noto Sans

### Emergency Mode (Auto-triggers on disaster)
- Red gradient background
- +20% larger fonts
- 60px minimum button height
- High contrast colors
- Simplified navigation

### Component Library: shadcn/ui
- Button, Card, Input, Select, Dialog, Sheet
- Toast notifications
- Data tables with sorting/filtering
- Charts (Recharts)

---

## 🔒 Security & Fraud Prevention

### Transaction Fraud Detection
```javascript
function calculateFraudScore(transaction) {
  let score = 0;
  
  // Rule 1: Round amount suspicion
  if (transaction.amount % 1000 === 0 && transaction.amount >= 10000) {
    score += 15;
  }
  
  // Rule 2: Rapid fire transactions
  if (recentTransactionsCount(1hr) > 5) {
    score += 20;
  }
  
  // Rule 3: Same vendor repeated
  if (sameVendorTransactionsToday >= 3) {
    score += 25;
  }
  
  // Rule 4: GPS mismatch
  if (distance(msmeLocation, vendorLocation) > 500m) {
    score += 30;
  }
  
  // Decision
  if (score >= 50) return 'BLOCK';
  if (score >= 30) return 'FLAG';
  return 'ALLOW';
}
```

### Vendor Collusion Prevention
- GPS proximity check (must be within 500m)
- Photo AI verification (before/after)
- Price cap enforcement
- Anomaly detection ML model

---

## 📴 Offline-First Design

### Service Worker Caching
```javascript
// Cache critical data
const CACHE_NAME = 'gruha-v1';
const CACHED_URLS = [
  '/',
  '/msme/dashboard',
  '/msme/wallet',
  '/offline.html',
  '/manifest.json'
];
```

### Offline Transaction Queue
```javascript
// Store transaction offline
function queueOfflineTransaction(txn) {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  queue.push({
    ...txn,
    id: generateUUID(),
    queuedAt: Date.now(),
    signature: signTransaction(txn)
  });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
}

// Sync when online
window.addEventListener('online', syncOfflineTransactions);
```

### SMS Fallback Commands
```
GRUHA BAL        → Check wallet balance
GRUHA BOOK <ID>  → Confirm booking
GRUHA PAY <AMT>  → Quick payment
GRUHA HELP       → Get support
```

---

## 🚀 Deployment (Free Tier)

### Frontend (Vercel)
```bash
cd apps/web
vercel deploy --prod
```

### Backend (Railway)
```bash
cd services/api-gateway
railway up
```

### Database (Supabase)
1. Create project at supabase.com
2. Run SQL migrations
3. Update connection string in .env

### Environment Variables
```env
# API Gateway
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...

# Frontend
NEXT_PUBLIC_API_URL=https://api.gruha.gov.in
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# SMS
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

---

## ✅ Feature Checklist

### Phase 1: Core Platform
- [ ] Phone OTP authentication
- [ ] MSME registration with KYC
- [ ] Vendor registration with verification
- [ ] Wallet balance display
- [ ] Token allocation by authority
- [ ] Basic warehouse search
- [ ] Booking creation flow
- [ ] Transaction history

### Phase 2: Marketplace
- [ ] Warehouse marketplace with filters
- [ ] Transport booking
- [ ] Vendor acceptance flow
- [ ] Photo proof upload
- [ ] QR payment generation
- [ ] Settlement tracking

### Phase 3: Recovery & Offline
- [ ] Recovery marketplace (repairs, wages)
- [ ] Offline transaction queue
- [ ] SMS fallback
- [ ] Push notifications
- [ ] Emergency mode UI

### Phase 4: Transparency
- [ ] Public dashboard
- [ ] Live transaction feed
- [ ] Blockchain explorer
- [ ] Analytics charts
- [ ] Report downloads

### Phase 5: Advanced
- [ ] Fraud detection ML
- [ ] Multi-language (10+ languages)
- [ ] Voice commands
- [ ] Authority multi-sig approval
- [ ] Audit log integrity verification

---

## 🧪 Test Credentials (Development)

| Role | Phone | OTP |
|------|-------|-----|
| MSME | 9876543210 | 123456 |
| Vendor | 9876543211 | 123456 |
| Authority | 9876543212 | 123456 |

---

## 📚 Key Implementation Notes

1. **No Docker Required:** Use LowDB (JSON file) for local development, SQLite for simple deployment, Supabase for production.

2. **Blockchain Simulation:** In development, blockchain is simulated with a JSON ledger. For production, integrate Hyperledger Fabric or a permissioned Polygon network.

3. **Mobile-First:** All MSME interactions designed for small screens, large touch targets, minimal data input.

4. **Instant Settlement:** Vendors receive INR via liquidity pool immediately after service confirmation, even if government treasury settlement is delayed.

5. **Token Programmability:** Smart contract enforces spending rules - wrong category = transaction rejected.

6. **Transparency by Default:** All transactions (anonymized) are publicly visible. Builds trust in relief systems.

---

*This document is the implementation blueprint for GRUHA. Follow the PRD for complete specifications.*
