# GRUHA Platform - AI Coding Agent Instructions

## 🚨 Critical Rules (Non-Negotiable)

**The PRD ([gruha_complete_prd (1).txt](../gruha_complete_prd%20(1).txt)) is the SINGLE source of truth.** Never invent features, simplify scope, or assume behavior. If unclear, ASK for clarification.

---

## Project Overview

GRUHA is a **mobile-first Progressive Web App (PWA)** protecting MSMEs through:
1. **Pre-Disaster** → Resilience Credits for preventive storage/transport
2. **During-Disaster** → Offline-first stability (SMS, USSD, queued transactions)
3. **Post-Disaster** → Relief Tokens with programmable spending rules via Recovery Marketplace

**NOT:** A cryptocurrency platform, app store download, payment gateway, or charity platform.  
**IS:** Climate resilience orchestrator + programmable relief finance + controlled marketplace + public trust engine.

---

## Architecture (4-Portal PWA Structure)

```
├── apps/
│   ├── web/                    # Next.js 14 PWA (all portals)
│   │   ├── public-portal/      # Transparency Dashboard (read-only)
│   │   ├── msme-portal/        # Mobile-first MSME interface
│   │   ├── vendor-portal/      # Vendor booking management
│   │   └── authority-dashboard/ # Disaster declaration, fund allocation
├── packages/
│   ├── shared-types/           # TypeScript types from PRD schemas
│   ├── shared-utils/           # Common utilities
│   └── ui-components/          # Design system components
├── services/
│   ├── api-gateway/            # Express + JWT auth
│   ├── user-service/           # MSME/Vendor CRUD, KYC
│   ├── wallet-service/         # Balance, transactions
│   ├── booking-service/        # Warehouse/transport bookings
│   ├── token-service/          # Allocation, spending rules
│   ├── settlement-service/     # Vendor INR payments
│   ├── notification-service/   # Push/SMS/Voice alerts
│   └── audit-service/          # Blockchain event logger
├── blockchain/
│   └── hyperledger/            # Fabric 2.5 chaincode (Go)
└── infra/
    └── docker/                 # PostgreSQL, MongoDB, Redis, MinIO
```

**Never merge portals.** Each has distinct roles per PRD §4-5.

---

## Tech Stack (Mandatory - PRD §13)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + Framer Motion + three.js + gsap |
| ui component library | shadcn UI |
| State | Zustand + React Query |
| Offline | Workbox + IndexedDB |
| Backend | Node.js + Express (TypeScript) |
| Database | PostgreSQL 15 + MongoDB + Redis 7 |
| Blockchain | Hyperledger Fabric 2.5 (Go chaincode) |
| Storage | AWS S3 / MinIO |
| Maps | Mapbox GL JS |
| i18n | react-i18next (10+ languages) |

---

## Data Models (Use Exactly As Defined - PRD §8)

Key tables with exact field names:
- `msmes` (with `blockchain_wallet_address`, `kyc_status`, risk levels)
- `vendors` (with `emergency_pricing`, `compliance_score`)
- `bookings` (with `blockchain_txn_hash`, status workflow)
- `transactions` (with `fraud_score`, `fraud_flags`, `fraud_status`)
- `disasters` (for token allocation context)

**Do NOT rename fields or alter schema structure.**

---

## API Patterns (PRD §9)

Base: `https://api.gruha.gov.in/v1`

Headers:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: <UUID>
```

Key endpoints:
- `POST /auth/otp/send` → `POST /auth/otp/verify`
- `POST /msme/register` → `GET /msme/wallet`
- `POST /warehouses/search` → `POST /bookings`
- `GET /vendor/bookings` → `POST /vendor/bookings/{id}/accept`

Error format:
```json
{"error": {"code": "INSUFFICIENT_BALANCE", "message": "...", "details": {...}}}
```

---

## Blockchain Rules (PRD §7)

1. **Dual Tokens (Go chaincode):**
   - `ResilienceCreditToken` → Pre-disaster (storage/transport ONLY)
   - `ReliefToken` → Post-disaster (repairs, materials, wages ≤30%)

2. **Smart Contract Functions:**
   - `MintTokens(msmeID, amount, disasterID, validityDays, categories)`
   - `SpendTokens(msmeID, vendorID, amount, category, bookingID)`

3. **Settlement:** Vendors ALWAYS receive INR via liquidity pool (T+0)

---

## Fraud Detection (PRD §11)

```python
# Rule-based detection
risk_score = 0
if amount % 1000 == 0 and amount >= 10000:
    risk_score += 15  # ROUND_AMOUNT
if len(recent_txns_1hr) > 5:
    risk_score += 20  # RAPID_FIRE
if vendor_txns_same_vendor >= 3:
    risk_score += 25  # VENDOR_COLLUSION_RISK

if risk_score >= 50: BLOCK
elif risk_score >= 30: FLAG
else: ALLOW
```

Also: GPS proximity check (500m), photo AI verification, ML anomaly detection.

---

## UI/UX Design System (PRD §6)

**Colors:**
- Primary Blue: `#2196F3` (trust)
- Secondary Green: `#4CAF50` (recovery)
- Alert Red: `#F44336` (emergency)
- Neutral: `#212121` to `#FAFAFA`

**Typography:**
- Primary: Inter, Display: Poppins
- Indic: Noto Sans (Devanagari, Gujarati, Tamil)
- Emergency mode: +20% font size, 60px min button height

**Emergency Mode Auto-Triggers:**
- Red gradient background
- AAA contrast
- 1.5x larger icons
- Pulsing alert banner

---

## Offline-First Protocol (PRD §12)

```javascript
// Generate offline transaction with QR
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
```

- Govt guarantees payments ≤₹5,000
- SMS fallback: `GRUHA BAL` → balance, `GRUHA BOOK <code>` → booking
- Sync within 1hr post-connectivity

---

## User Roles (PRD §4)

| Role | Key Permissions |
|------|-----------------|
| `ROLE_MSME` | Book services, spend tokens, view wallet |
| `ROLE_VENDOR` | Accept bookings, upload proofs, view settlements |
| `ROLE_AUTHORITY_DISTRICT` | Declare disasters, allocate tokens, view analytics |
| `ROLE_PUBLIC` | View anonymized dashboard, download reports |
| `ROLE_SUPER_ADMIN` | User verification, vendor approval, system config |

---

## Acceptance Criteria (PRD §15)

- MSME registration: 95% completion, <2 mins
- Disaster alert: 99% delivery, <5 mins
- Warehouse search: <3s, <5 clicks to book
- Vendor payment: 95% within 1 hour
- API p95: <500ms
- Page load (3G): <3s
- Uptime: 99.9% (99.99% in disaster mode)

---

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `WalletCard.tsx`)
- Services: `kebab-case.service.ts` (e.g., `booking.service.ts`)
- API routes: `route.ts` in Next.js app router
- Schemas: Match PRD table names (e.g., `msmes.schema.ts`)

---

## What NOT To Build

❌ Cash withdrawal features  
❌ Crypto trading/speculation  
❌ App store downloads (PWA only)  
❌ Vendor self-defined categories  
❌ Generic/template UI (must be premium quality)

---

## Quick Reference

| Need | Location |
|------|----------|
| Full PRD | [gruha_complete_prd (1).txt](../gruha_complete_prd%20(1).txt) |
| Feature Overview | [GRUHA-FEATURE.md](../GRUHA-FEATURE.md) |
| Hard Rules | [.github/instructions/rules.md.instructions.md](instructions/rules.md.instructions.md) |
