# 🌍 GRUHA - Climate Resilience Infrastructure for MSMEs

<div align="center">

![GRUHA Logo](https://img.shields.io/badge/GRUHA-Climate%20Resilience-2196F3?style=for-the-badge&logo=shield&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![PRD Version](https://img.shields.io/badge/PRD-v1.0-blue.svg)](./gruha_complete_prd%20(1).txt)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-8247E5?logo=ethereum)](https://polygon.technology/)

**Protecting India's MSMEs from Climate Disasters through Blockchain-Powered Relief Finance**

[🚀 Live Demo](#deployment) • [📖 Documentation](#features) • [🛠️ Setup](#quick-start) • [🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Executive Summary

**GRUHA** (Government Relief and Urban Hazard Assistance) is a **mobile-first Progressive Web Application (PWA)** designed to protect Micro, Small, and Medium Enterprises (MSMEs) from the economic devastation of climate disasters.

### What Makes GRUHA Unique?

| Traditional Relief | GRUHA Platform |
|-------------------|----------------|
| ❌ Funds arrive 3-6 months post-disaster | ✅ Instant token allocation (<24 hours) |
| ❌ 40-60% leakage via corruption | ✅ <2% leakage with blockchain audit |
| ❌ Cash-based, untraceable | ✅ Programmable tokens with spending rules |
| ❌ Reactive only | ✅ Proactive + Reactive protection |
| ❌ No transparency | ✅ Public audit dashboard |

### Core Value Proposition

```
┌─────────────────────────────────────────────────────────────────┐
│                         GRUHA PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│  🏢 FOR MSMEs          │  Survive disasters with dignity        │
│                        │  Access protection before disaster     │
│                        │  Get restart capital instantly         │
├────────────────────────┼────────────────────────────────────────┤
│  🏛️ FOR GOVERNMENT    │  Guarantee fund compliance             │
│                        │  Eliminate leakage                     │
│                        │  Demonstrate accountability            │
├────────────────────────┼────────────────────────────────────────┤
│  🏪 FOR VENDORS        │  T+0 instant INR settlement            │
│                        │  Verified demand aggregation           │
│                        │  Build trusted reputation              │
├────────────────────────┼────────────────────────────────────────┤
│  👥 FOR PUBLIC         │  See where every rupee goes            │
│                        │  Restore faith in relief systems       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 Problem Statement

MSMEs face catastrophic economic loss during climate disasters due to:

1. **Reactive Relief Systems** - Funds arrive 3-6 months post-disaster when businesses have already collapsed
2. **Opacity in Fund Distribution** - 40-60% of relief funds leak through corruption
3. **Lack of Preventive Infrastructure** - Inventory loss could be prevented with early action
4. **Cash-Based Systems** - Fungible, untraceable, easily misused

### The Human Cost

> *"I lost ₹3 lakh inventory in the 2023 Gujarat floods. I waited 8 months for ₹50,000 government relief. By then, my shop was already closed."*  
> — Rajesh Kumar, Textile Retailer, Surat

---

## 💡 Solution Overview

GRUHA operates on **Three Operational Phases**:

### Phase 1: 🟢 Pre-Disaster (Preparedness)

```
┌────────────────────────────────────────────────────────────┐
│                    PRE-DISASTER PHASE                       │
├────────────────────────────────────────────────────────────┤
│  1. Risk Assessment → MSME location analyzed for hazards   │
│  2. Alert Integration → IMD/Met weather API monitoring     │
│  3. Resilience Credits → Tokens for preventive services    │
│  4. Early Action → Book safe storage before disaster hits  │
└────────────────────────────────────────────────────────────┘
```

**Key Feature: Resilience Credits**
- Allocated to high-risk MSMEs before disaster
- Can ONLY be used for Storage and Transport
- Expire within 7-15 days
- Smart contract enforced spending rules

### Phase 2: 🔴 During-Disaster (Stability)

```
┌────────────────────────────────────────────────────────────┐
│                   DURING-DISASTER PHASE                     │
├────────────────────────────────────────────────────────────┤
│  1. Emergency Mode UI → High contrast, large buttons       │
│  2. Offline Support → Transactions queued locally          │
│  3. SMS Fallback → Works without internet                  │
│  4. Voice Alerts → Multi-lingual automated calls           │
└────────────────────────────────────────────────────────────┘
```

**Offline Transaction Protocol:**
```javascript
// Generate offline transaction with cryptographic signature
function generateOfflineTransaction(vendorId, amount) {
    const txn = {
        id: generateUUID(),
        msmeId: getCurrentUser().id,
        vendorId, amount,
        timestamp: Date.now(),
        nonce: generateNonce(),
        offline: true
    };
    const signature = signTransaction(txn, getLocalPrivateKey());
    return generateQRCode({...txn, signature});
}
// Vendor scans QR → Both parties sync when online
```

### Phase 3: 🟣 Post-Disaster (Recovery)

```
┌────────────────────────────────────────────────────────────┐
│                   POST-DISASTER PHASE                       │
├────────────────────────────────────────────────────────────┤
│  1. Relief Tokens → Allocated for recovery spending        │
│  2. Recovery Marketplace → Repairs, Materials, Equipment   │
│  3. Instant Settlement → Vendors paid T+0 in INR           │
│  4. Public Audit → Every rupee tracked on blockchain       │
└────────────────────────────────────────────────────────────┘
```

**Relief Token Categories:**
| Category | Example Uses |
|----------|--------------|
| 📦 Storage | Extended warehouse booking |
| 🚛 Transport | Return goods transport |
| 🔧 Repairs | Shop renovation, electrical |
| 🧱 Raw Materials | Inventory replacement |
| ⚙️ Equipment | Machinery, generators |
| 💰 Wages | Worker payments (≤30% cap) |
| 💡 Utilities | Electricity, water bills |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (PWA)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Public  │ │   MSME   │ │  Vendor  │ │    Authority     │   │
│  │  Portal  │ │  Portal  │ │  Portal  │ │    Dashboard     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ REST APIs (JWT Auth)
┌─────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION LAYER                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   API       │ │   Auth      │ │   Fraud     │               │
│  │   Gateway   │ │   Service   │ │   Detection │               │
│  │  (Port 3000)│ │   (JWT/OTP) │ │   Engine    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (Microservices)                │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐ ┌────────────┐  │
│  │    User    │ │   Wallet   │ │   Booking   │ │ Blockchain │  │
│  │  Service   │ │  Service   │ │   Service   │ │  Service   │  │
│  │ (Port 3001)│ │ (Port 3002)│ │ (Port 3003) │ │ (Port 3005)│  │
│  └────────────┘ └────────────┘ └─────────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER (Polygon)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Smart Contracts (Solidity)                              │   │
│  │  ├── GRUHAToken.sol (ERC-20 with restrictions)          │   │
│  │  ├── ResilienceCredits (Pre-disaster tokens)            │   │
│  │  ├── ReliefTokens (Post-disaster tokens)                │   │
│  │  └── SpendingRules (Category enforcement)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌────────────┐ ┌─────────────────────────────────────────────┐│
│  │ PostgreSQL │ │  In-Memory Data Stores (Development)       ││
│  │ (Production)│ │  JSON files for user, wallet, booking data ││
│  └────────────┘ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 📱 MSME Portal (Mobile-First)

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **OTP Authentication** | Secure phone-based login | Send OTP → Verify → Get JWT token |
| **KYC Verification** | Identity validation | Aadhaar e-KYC or document upload |
| **Digital Wallet** | Token balance display | Resilience Credits + Relief Tokens |
| **Warehouse Discovery** | Find safe storage | Search by location → Filter → Book |
| **Transport Booking** | Goods movement | Select vendor → Confirm → Track |
| **Transaction History** | Complete audit trail | Filterable list with blockchain proof |
| **Emergency Mode** | Disaster UI adaptation | Auto-triggers on alert, larger buttons |
| **Offline Support** | No-internet transactions | QR code generation, local queue |

**Wallet Balance Display:**
```
┌─────────────────────────────────────────┐
│         💰 Your GRUHA Wallet            │
├─────────────────────────────────────────┤
│  Resilience Credits    ₹ 25,000         │
│  (Expires: Jan 15)     [STORAGE/TRANSPORT]│
├─────────────────────────────────────────┤
│  Relief Tokens         ₹ 50,000         │
│  (Expires: Feb 28)     [ALL CATEGORIES]  │
├─────────────────────────────────────────┤
│  Total Available       ₹ 75,000         │
└─────────────────────────────────────────┘
```

### 🏪 Vendor Portal

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Registration** | Business onboarding | GST/PAN → KYC → Bank details |
| **Service Listing** | Publish services | Category → Pricing → Photos |
| **Booking Management** | Handle requests | View → Accept/Decline → Complete |
| **Proof Submission** | Service verification | Before/After photos + GPS |
| **Instant Settlement** | Get paid immediately | Token spend → INR to bank (T+0) |
| **Performance Dashboard** | Track metrics | Rating, compliance, earnings |

**Vendor Categories:**
- 📦 Warehouse (Cold storage, Dry storage)
- 🚛 Transport (Trucks, Tempos, Mini-vans)
- 🔧 Repair Services (Shop repair, Electrical)
- 🔌 Equipment (Machinery, Generators)
- 🧱 Raw Materials (Construction, Packaging)
- 🏪 Temporary Shops (Mobile kiosks)

### 🏛️ Authority Dashboard

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Disaster Declaration** | Mark affected areas | Draw polygon on map → Set severity |
| **Token Allocation** | Distribute funds | Select MSMEs → Amount → Categories → Mint |
| **Multi-Sig Approval** | Secure large transfers | 2-of-3 approvers required |
| **Real-Time Analytics** | Monitor spending | Live charts, fraud alerts |
| **Vendor Management** | Quality control | Approve/Suspend/Blacklist |
| **Audit Reports** | Compliance documentation | PDF/CSV export |

**Token Allocation Flow:**
```
Authority Action          Smart Contract          MSME Wallet
     │                         │                       │
     │   Create Allocation     │                       │
     ├────────────────────────►│                       │
     │                         │                       │
     │   Multi-Sig Approval    │                       │
     ├────────────────────────►│                       │
     │                         │   Mint Tokens         │
     │                         ├──────────────────────►│
     │                         │                       │
     │   Confirmation          │                       │
     │◄────────────────────────┤                       │
     │                         │   Balance Updated     │
     │                         │◄──────────────────────┤
```

### 🌐 Public Transparency Portal

| Feature | Description | Access |
|---------|-------------|--------|
| **Live Transaction Feed** | Anonymized real-time stream | Public |
| **Aggregate Statistics** | Category/State breakdown | Public |
| **Blockchain Explorer** | Verify transactions | Public |
| **Disaster Timeline** | Response history | Public |
| **Downloadable Reports** | CSV, PDF, JSON | Public |

**Public Dashboard Metrics:**
```
┌────────────────────────────────────────────────────────────┐
│            GRUHA Public Transparency Dashboard              │
├────────────────────────────────────────────────────────────┤
│  ₹ 45.2 Cr    │   12,847    │   98.3%    │   1.2 hrs     │
│  Funds        │   MSMEs     │   Spent    │   Avg         │
│  Deployed     │   Helped    │   Correctly│   Settlement  │
├────────────────────────────────────────────────────────────┤
│                   Spending by Category                      │
│  ████████████████████ Storage (42%)                        │
│  ██████████████ Transport (28%)                            │
│  ████████ Repairs (16%)                                    │
│  ████ Equipment (8%)                                       │
│  ██ Wages (4%)                                             │
│  █ Utilities (2%)                                          │
└────────────────────────────────────────────────────────────┘
```

---

## 🔗 Blockchain Implementation

### Smart Contract: GRUHAToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GRUHAToken {
    enum TokenType { RESILIENCE_CREDIT, RELIEF_TOKEN }
    
    struct Allocation {
        address msme;
        uint256 amount;
        TokenType tokenType;
        uint256 expiresAt;
        uint8[] allowedCategories;
        bool isActive;
    }
    
    // Category enforcement
    function spend(
        uint256 allocationId,
        address vendor,
        uint256 amount,
        uint8 category
    ) external {
        Allocation storage alloc = allocations[allocationId];
        
        require(alloc.isActive, "Allocation inactive");
        require(block.timestamp < alloc.expiresAt, "Tokens expired");
        require(isAllowedCategory(alloc, category), "Category not allowed");
        require(vendors[vendor].isVerified, "Vendor not verified");
        require(amount <= alloc.amount, "Insufficient balance");
        
        // Execute transfer
        alloc.amount -= amount;
        emit TokenSpent(msg.sender, vendor, amount, category);
    }
}
```

### Fraud Detection Rules

```python
class FraudDetector:
    def check_transaction(self, txn):
        risk_score = 0
        flags = []
        
        # Rule 1: Round numbers (suspicious)
        if txn.amount % 1000 == 0 and txn.amount >= 10000:
            risk_score += 15
            flags.append("ROUND_AMOUNT")
        
        # Rule 2: Rapid-fire transactions
        recent = get_recent_transactions(txn.msme_id, hours=1)
        if len(recent) > 5:
            risk_score += 20
            flags.append("RAPID_FIRE")
        
        # Rule 3: Same vendor repeatedly (collusion risk)
        vendor_txns = [t for t in recent if t.vendor_id == txn.vendor_id]
        if len(vendor_txns) >= 3:
            risk_score += 25
            flags.append("VENDOR_COLLUSION_RISK")
        
        # Rule 4: GPS mismatch
        if not verify_gps_proximity(txn.msme_location, txn.vendor_location, 500):
            risk_score += 30
            flags.append("GPS_MISMATCH")
        
        # Decision
        if risk_score >= 50:
            return {"action": "BLOCK", "score": risk_score, "flags": flags}
        elif risk_score >= 30:
            return {"action": "FLAG", "score": risk_score, "flags": flags}
        else:
            return {"action": "ALLOW", "score": risk_score}
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0.4 | React framework with App Router |
| **TypeScript** | 5.0+ | Type-safe development |
| **Tailwind CSS** | 3.3.6 | Utility-first styling |
| **Framer Motion** | 10.16 | Smooth animations |
| **Zustand** | 4.4.7 | Lightweight state management |
| **React Query** | 5.13.4 | Server state & caching |
| **React Icons** | 4.12 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.18 | Web framework |
| **TypeScript** | 5.0+ | Type-safe backend |
| **JWT** | - | Authentication tokens |
| **Winston** | 3.11 | Structured logging |
| **express-rate-limit** | - | API rate limiting |
| **uuid** | - | Unique ID generation |

### Blockchain
| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.19 | Smart contract language |
| **Hardhat** | 2.19 | Development framework |
| **Ethers.js** | 6.x | Blockchain interaction |
| **Polygon Amoy** | Testnet | Test deployment network |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
git --version   # Any recent version
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/gruha-platform.git
cd gruha-platform

# 2. Install all dependencies
npm install

# 3. Start backend services (in separate terminals)

# Terminal 1: API Gateway
cd services/api-gateway && npx ts-node src/index.ts
# Output: 🚀 API Gateway started on port 3000

# Terminal 2: User Service
cd services/user-service && npx ts-node src/index.ts
# Output: 🚀 User Service started on port 3001

# Terminal 3: Wallet Service
cd services/wallet-service && npx ts-node src/index.ts
# Output: 🚀 Wallet Service started on port 3002

# Terminal 4: Booking Service
cd services/booking-service && npx ts-node src/index.ts
# Output: 🚀 Booking Service started on port 3003

# Terminal 5: Frontend
cd apps/web
node ../../node_modules/next/dist/bin/next dev -p 3010
# Output: ▲ Next.js 14.0.4 - Local: http://localhost:3010
```

### Access URLs

| Portal | URL | Description |
|--------|-----|-------------|
| 🏠 **Home** | http://localhost:3010 | Landing page |
| 👤 **MSME Portal** | http://localhost:3010/msme | MSME dashboard |
| 💰 **Wallet** | http://localhost:3010/msme/wallet | Token balance |
| 📦 **Warehouse** | http://localhost:3010/msme/warehouse | Find storage |
| 🚛 **Transport** | http://localhost:3010/msme/transport | Book transport |
| 🏪 **Vendor Portal** | http://localhost:3010/vendor | Vendor dashboard |
| 🏛️ **Authority** | http://localhost:3010/authority | Admin dashboard |
| 🌐 **Public** | http://localhost:3010/public | Transparency |
| 🔧 **Debug** | http://localhost:3010/debug | API testing |

### Create Test Data

```powershell
# Create MSME
$headers = @{"Content-Type"="application/json"}
$body = '{"businessName":"Krishna Grocery Store","ownerName":"Krishna Kumar","phone":"9876543210","businessType":"Retail Trade","address":{"street":"123 Main Street","city":"Bhubaneswar","state":"Odisha","pincode":"751001"}}'
Invoke-WebRequest -Uri "http://localhost:3001/api/users/msme/register" -Method POST -Body $body -Headers $headers

# Create Vendor
$body = '{"phone":"9876543211","category":"warehouse","name":"SafeStore Warehouse","businessName":"SafeStore Pvt Ltd","emergencyPricingAgreed":true,"district":"Khordha","state":"Odisha","pincode":"751002"}'
Invoke-WebRequest -Uri "http://localhost:3001/api/users/vendor/register" -Method POST -Body $body -Headers $headers

# Allocate Tokens (need MSME ID from first response)
$body = '{"msmeId":"YOUR_MSME_ID","tokenType":1,"amount":"50000","disasterId":"disaster_001","categories":[0,1,2],"allocatedBy":"authority_001","validityDays":90}'
Invoke-WebRequest -Uri "http://localhost:3002/api/wallet/allocate" -Method POST -Body $body -Headers $headers
```

---

## 📡 API Documentation

### Base URLs

| Service | Port | Base URL |
|---------|------|----------|
| API Gateway | 3000 | `http://localhost:3000/api/v1` |
| User Service | 3001 | `http://localhost:3001/api/users` |
| Wallet Service | 3002 | `http://localhost:3002/api/wallet` |
| Booking Service | 3003 | `http://localhost:3003/api/bookings` |

### Authentication

```http
# Send OTP
POST /api/v1/auth/otp/send
Content-Type: application/json

{"phone": "9876543210"}

# Response
{"success": true, "data": {"sessionId": "sess_xxx", "message": "OTP sent"}}

# Verify OTP (Dev mode: use 123456)
POST /api/v1/auth/otp/verify
Content-Type: application/json

{"sessionId": "sess_xxx", "otp": "123456"}

# Response
{"success": true, "data": {"accessToken": "eyJhbG...", "user": {...}}}
```

### MSME APIs

```http
# Register MSME
POST /api/users/msme/register
Content-Type: application/json

{
  "businessName": "Krishna Grocery",
  "ownerName": "Krishna Kumar",
  "phone": "9876543210",
  "businessType": "Retail",
  "address": {
    "street": "123 Main St",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "pincode": "751001"
  }
}

# List MSMEs
GET /api/users/msme/list

# Get MSME Profile
GET /api/users/msme/profile/{id}
```

### Wallet APIs

```http
# Get Balance
GET /api/wallet/{msmeId}

# Response
{
  "success": true,
  "data": {
    "msmeId": "msme_xxx",
    "balance": {
      "resilienceCredits": "0",
      "reliefTokens": "50000",
      "total": "50000"
    },
    "activeAllocations": [...]
  }
}

# Allocate Tokens (Authority Only)
POST /api/wallet/allocate
{
  "msmeId": "msme_xxx",
  "tokenType": 1,
  "amount": "50000",
  "disasterId": "disaster_001",
  "categories": [0, 1, 2],
  "allocatedBy": "authority_001",
  "validityDays": 90
}

# Spend Tokens
POST /api/wallet/spend
{
  "msmeId": "msme_xxx",
  "vendorId": "vendor_xxx",
  "amount": 5000,
  "tokenType": 1,
  "category": 0,
  "bookingId": "booking_xxx"
}
```

### Vendor APIs

```http
# Register Vendor
POST /api/users/vendor/register
{
  "phone": "9876543211",
  "category": "warehouse",
  "name": "SafeStore",
  "businessName": "SafeStore Pvt Ltd",
  "emergencyPricingAgreed": true
}

# List Vendors
GET /api/users/vendor/list

# Search Warehouses
GET /api/users/vendor/warehouses/search?lat=20.29&lng=85.82&radius=50
```

### Booking APIs

```http
# Create Booking
POST /api/bookings
{
  "msmeId": "msme_xxx",
  "vendorId": "vendor_xxx",
  "serviceType": "warehouse_storage",
  "startDate": "2026-01-06",
  "endDate": "2026-01-13",
  "totalCost": 5000
}

# Get MSME Bookings
GET /api/bookings/msme/{msmeId}

# Update Booking Status
PUT /api/bookings/{bookingId}/status
{
  "status": "confirmed",
  "updatedBy": "vendor_xxx"
}
```

---

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Railway (Backend) - **FREE**

#### Step 1: Deploy Frontend to Vercel

1. Push code to GitHub (see below)
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Click "New Project" → Import your repository
4. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: .next
   ```
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_GATEWAY_URL=https://your-api.railway.app
   NEXT_PUBLIC_USER_SERVICE_URL=https://your-user.railway.app
   NEXT_PUBLIC_WALLET_SERVICE_URL=https://your-wallet.railway.app
   NEXT_PUBLIC_BOOKING_SERVICE_URL=https://your-booking.railway.app
   ```
6. Click "Deploy"

#### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. For each service, click "New Project" → "Deploy from GitHub"
3. Configure each service:

| Service | Root Directory | Start Command |
|---------|---------------|---------------|
| API Gateway | `services/api-gateway` | `npx ts-node src/index.ts` |
| User Service | `services/user-service` | `npx ts-node src/index.ts` |
| Wallet Service | `services/wallet-service` | `npx ts-node src/index.ts` |
| Booking Service | `services/booking-service` | `npx ts-node src/index.ts` |

4. Copy each service URL and update Vercel environment variables

### Option 2: Render - **FREE**

1. Go to [render.com](https://render.com) → Sign up
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. For each service:

**Frontend:**
```
Name: gruha-frontend
Root Directory: apps/web
Build Command: npm install && npm run build
Start Command: npm start
```

**Backend Services:**
```
Name: gruha-api-gateway
Root Directory: services/api-gateway
Build Command: npm install
Start Command: npx ts-node src/index.ts
```

### Option 3: Docker (Self-Hosted)

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web .
RUN npm run build
EXPOSE 3010
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3010:3010"
    environment:
      - NEXT_PUBLIC_API_GATEWAY_URL=http://api-gateway:3000
    depends_on:
      - api-gateway
      
  api-gateway:
    build:
      context: ./services/api-gateway
    ports:
      - "3000:3000"
      
  user-service:
    build:
      context: ./services/user-service
    ports:
      - "3001:3001"
      
  wallet-service:
    build:
      context: ./services/wallet-service
    ports:
      - "3002:3002"
      
  booking-service:
    build:
      context: ./services/booking-service
    ports:
      - "3003:3003"
```

```bash
# Run with Docker Compose
docker-compose up -d
```

---

## 📤 Push to GitHub

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) → Sign in
2. Click "+" → "New repository"
3. Configure:
   - Name: `gruha-platform`
   - Description: `Climate Resilience Infrastructure for MSMEs`
   - Public or Private
   - Do NOT initialize with README (we have one)
4. Click "Create repository"

### Step 2: Initialize Git & Push

```bash
# Navigate to project root
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)"

# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: Initial GRUHA platform implementation

- Complete MSME Portal with wallet, warehouse, transport
- Vendor Portal with booking management
- Authority Dashboard with token allocation
- Public Transparency Dashboard
- Blockchain integration (Polygon)
- Real-time API integration
- Offline support
- Emergency mode UI"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/gruha-platform.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Create .gitignore

```bash
# Already in your project, but verify it includes:
node_modules/
.next/
.env
.env.local
*.log
dist/
coverage/
.DS_Store
```

---

## 📁 Project Structure

```
gruha-platform/
│
├── 📁 apps/
│   └── 📁 web/                          # Next.js 14 PWA
│       ├── 📁 public/
│       │   ├── 📄 manifest.json         # PWA manifest
│       │   ├── 📄 sw.js                 # Service worker
│       │   └── 📄 offline.html          # Offline page
│       └── 📁 src/
│           ├── 📁 app/                  # App Router
│           │   ├── 📄 layout.tsx        # Root layout
│           │   ├── 📄 page.tsx          # Home page
│           │   ├── 📄 globals.css       # Global styles
│           │   ├── 📁 msme/             # MSME Portal
│           │   │   ├── 📄 page.tsx      # Dashboard
│           │   │   ├── 📁 wallet/       # Wallet page
│           │   │   ├── 📁 warehouse/    # Warehouse search
│           │   │   └── 📁 transport/    # Transport booking
│           │   ├── 📁 vendor/           # Vendor Portal
│           │   ├── 📁 authority/        # Authority Dashboard
│           │   ├── 📁 public/           # Transparency Portal
│           │   └── 📁 debug/            # API Debug Page
│           ├── 📁 components/           # Reusable UI
│           │   └── 📁 ui/               # Design system
│           ├── 📁 hooks/                # React hooks
│           │   └── 📄 useAPI.ts         # API hooks
│           └── 📁 lib/                  # Utilities
│               └── 📄 api.ts            # API client
│
├── 📁 services/
│   ├── 📁 api-gateway/                  # Port 3000
│   │   └── 📁 src/
│   │       ├── 📄 index.ts              # Express server
│   │       ├── 📄 middleware.ts         # Auth middleware
│   │       ├── 📄 jwt-service.ts        # JWT handling
│   │       └── 📄 otp-service.ts        # OTP management
│   │
│   ├── 📁 user-service/                 # Port 3001
│   │   └── 📁 src/
│   │       ├── 📄 index.ts              # Express server
│   │       ├── 📄 database.ts           # In-memory DB
│   │       └── 📁 routes/
│   │           ├── 📄 msme.ts           # MSME routes
│   │           └── 📄 vendor.ts         # Vendor routes
│   │
│   ├── 📁 wallet-service/               # Port 3002
│   │   └── 📁 src/
│   │       ├── 📄 index.ts              # Express server
│   │       ├── 📄 wallet-store.ts       # Wallet data
│   │       └── 📄 fraud-detection.ts    # Fraud rules
│   │
│   ├── 📁 booking-service/              # Port 3003
│   │   └── 📁 src/
│   │       ├── 📄 index.ts              # Express server
│   │       └── 📄 booking-store.ts      # Booking data
│   │
│   └── 📁 blockchain-service/           # Port 3005
│       └── 📁 src/
│           ├── 📄 index.ts              # Express server
│           └── 📄 blockchain-client.ts  # Ethers.js client
│
├── 📁 contracts/                         # Smart Contracts
│   ├── 📁 src/
│   │   └── 📄 GRUHAToken.sol            # Main token contract
│   ├── 📁 scripts/
│   │   └── 📄 deploy.ts                 # Deployment script
│   └── 📄 hardhat.config.ts             # Hardhat config
│
├── 📁 packages/
│   └── 📁 shared-types/                 # Shared TypeScript types
│
├── 📁 docs/                              # Documentation
│
├── 📄 package.json                       # Root package
├── 📄 turbo.json                         # Turborepo config
├── 📄 .gitignore                         # Git ignore
└── 📄 README.md                          # This file
```

---

## 📊 Success Metrics (Per PRD)

| Metric | Target | Description |
|--------|--------|-------------|
| **MSME Activation Rate** | 85% | % completing KYC |
| **Preparedness Action Rate** | 40% | % booking preventive services |
| **Fund Velocity** | <24 hrs | Time to first token spend |
| **Vendor Settlement** | <1 hr | Time to INR receipt |
| **Leakage Rate** | <2% | Tokens used outside rules |
| **System Uptime** | 99.9% | During non-disaster |
| **Disaster Uptime** | 99.99% | During active disaster |

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/gruha-platform.git
cd gruha-platform

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm install
npm test

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Commit Message Format

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style (formatting)
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 📜 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 GRUHA Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Acknowledgments

- **IIT Kharagpur** - Academic support and guidance
- **National Disaster Management Authority** - Domain expertise
- **Polygon Labs** - Blockchain infrastructure
- **All MSMEs** - Who shared their disaster experiences

---

## 📞 Contact & Support

| Resource | Link |
|----------|------|
| 📖 PRD Document | [gruha_complete_prd.txt](./gruha_complete_prd%20(1).txt) |
| 🐛 Report Issues | [GitHub Issues](https://github.com/YOUR_USERNAME/gruha-platform/issues) |
| 💬 Discussions | [GitHub Discussions](https://github.com/YOUR_USERNAME/gruha-platform/discussions) |

---

<div align="center">

## 🌟 Star this repo if you find it helpful!

**Built with ❤️ for India's MSMEs**

*Protecting livelihoods, one disaster at a time.*

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/gruha-platform&type=Date)](https://star-history.com/#YOUR_USERNAME/gruha-platform&Date)

</div>
