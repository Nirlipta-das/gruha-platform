# GRUHA Implementation Plan - Making Everything Real

## Overview
This document provides the step-by-step plan to transform GRUHA from frontend simulation to a fully functional platform using FREE, no-Docker tech stack.

---

## Phase 1: Database Foundation (Days 1-3)

### Step 1.1: Create Shared Database Package

```bash
# Create shared-db package
mkdir -p packages/shared-db/src
```

### Step 1.2: Install Dependencies (All Packages)

```bash
pnpm add better-sqlite3 -w
pnpm add -D @types/better-sqlite3 -w
```

### Step 1.3: Database Schema (per PRD §8)

Create `packages/shared-db/src/schema.sql`:

```sql
-- GRUHA Database Schema
-- Per PRD §8 Data Models

-- MSMEs (Small Business Owners)
CREATE TABLE IF NOT EXISTS msmes (
    id TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    udyam_aadhaar TEXT UNIQUE,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    business_category TEXT NOT NULL,
    address_line1 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_pincode TEXT,
    latitude REAL,
    longitude REAL,
    blockchain_wallet_address TEXT,
    kyc_status TEXT DEFAULT 'PENDING',
    risk_level TEXT DEFAULT 'MEDIUM',
    resilience_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Vendors (Service Providers)
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    category TEXT NOT NULL,
    service_types TEXT, -- JSON array
    address_line1 TEXT,
    address_city TEXT,
    address_state TEXT,
    address_pincode TEXT,
    latitude REAL,
    longitude REAL,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_name TEXT,
    verified INTEGER DEFAULT 0,
    compliance_score INTEGER DEFAULT 100,
    emergency_pricing INTEGER DEFAULT 1,
    total_earnings REAL DEFAULT 0,
    pending_settlement REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    latitude REAL,
    longitude REAL,
    total_capacity_sqft INTEGER,
    available_capacity_sqft INTEGER,
    price_per_sqft_day REAL,
    safety_rating REAL DEFAULT 4.0,
    is_flood_safe INTEGER DEFAULT 1,
    features TEXT, -- JSON array
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Disasters
CREATE TABLE IF NOT EXISTS disasters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    affected_states TEXT, -- JSON array
    affected_districts TEXT, -- JSON array
    declared_at TEXT,
    ended_at TEXT,
    status TEXT DEFAULT 'ACTIVE',
    total_fund_allocated REAL DEFAULT 0,
    total_msmes_affected INTEGER DEFAULT 0,
    declared_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Token Allocations
CREATE TABLE IF NOT EXISTS token_allocations (
    id TEXT PRIMARY KEY,
    msme_id TEXT NOT NULL,
    disaster_id TEXT,
    token_type TEXT NOT NULL, -- RESILIENCE_CREDIT or RELIEF_TOKEN
    amount REAL NOT NULL,
    spent_amount REAL DEFAULT 0,
    allowed_categories TEXT, -- JSON array
    valid_from TEXT,
    valid_until TEXT,
    status TEXT DEFAULT 'ACTIVE',
    allocated_by TEXT,
    blockchain_txn_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (msme_id) REFERENCES msmes(id),
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT UNIQUE NOT NULL,
    msme_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    warehouse_id TEXT,
    service_type TEXT NOT NULL,
    service_category TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    quantity REAL,
    unit TEXT,
    unit_price REAL,
    total_cost REAL NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING_VENDOR_CONFIRMATION',
    vendor_notes TEXT,
    msme_notes TEXT,
    proof_photo_url TEXT,
    completion_photo_url TEXT,
    completed_at TEXT,
    blockchain_txn_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (msme_id) REFERENCES msmes(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    msme_id TEXT NOT NULL,
    vendor_id TEXT,
    booking_id TEXT,
    allocation_id TEXT,
    transaction_type TEXT NOT NULL, -- CREDIT, DEBIT, REFUND
    token_type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'COMPLETED',
    fraud_score INTEGER DEFAULT 0,
    fraud_flags TEXT, -- JSON array
    fraud_status TEXT DEFAULT 'CLEAR',
    blockchain_txn_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (msme_id) REFERENCES msmes(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (allocation_id) REFERENCES token_allocations(id)
);

-- Settlements (Vendor Payments)
CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    booking_id TEXT,
    amount REAL NOT NULL,
    inr_amount REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    bank_reference TEXT,
    settled_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    disaster_id TEXT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    affected_areas TEXT, -- JSON array
    sent_to_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disasters(id)
);

-- OTP Store (for authentication)
CREATE TABLE IF NOT EXISTS otps (
    mobile TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_type TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    device_info TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_msmes_mobile ON msmes(mobile);
CREATE INDEX IF NOT EXISTS idx_vendors_mobile ON vendors(mobile);
CREATE INDEX IF NOT EXISTS idx_bookings_msme ON bookings(msme_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_msme ON transactions(msme_id);
CREATE INDEX IF NOT EXISTS idx_allocations_msme ON token_allocations(msme_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON token_allocations(status);
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(latitude, longitude);
```

---

## Phase 2: Seed Data (Day 3-4)

### Step 2.1: Create Realistic Test Data

```typescript
// packages/shared-db/src/seed.ts

export const seedData = {
  // 10 MSMEs across different states
  msmes: [
    {
      id: 'MSME-001',
      owner_name: 'Rajesh Kumar Patel',
      business_name: 'Rajesh Textiles',
      udyam_aadhaar: 'UDYAM-GJ-12-0012345',
      mobile: '9876543210',
      business_category: 'MANUFACTURING',
      address_city: 'Surat',
      address_state: 'Gujarat',
      latitude: 21.1702,
      longitude: 72.8311,
      kyc_status: 'VERIFIED',
      risk_level: 'LOW',
      resilience_score: 85,
    },
    {
      id: 'MSME-002',
      owner_name: 'Priya Sharma',
      business_name: 'Sharma Electronics',
      udyam_aadhaar: 'UDYAM-MH-23-0045678',
      mobile: '9876543211',
      business_category: 'RETAIL',
      address_city: 'Mumbai',
      address_state: 'Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      kyc_status: 'VERIFIED',
      risk_level: 'MEDIUM',
      resilience_score: 70,
    },
    // ... 8 more MSMEs
  ],

  // 5 Verified Vendors
  vendors: [
    {
      id: 'VENDOR-001',
      business_name: 'SafeKeep Warehousing Pvt Ltd',
      owner_name: 'Amit Gupta',
      mobile: '9988776655',
      category: 'WAREHOUSE',
      service_types: JSON.stringify(['STORAGE', 'COLD_STORAGE']),
      address_city: 'Mumbai',
      address_state: 'Maharashtra',
      bank_account_number: '1234567890',
      bank_ifsc: 'HDFC0001234',
      verified: 1,
      compliance_score: 98,
      emergency_pricing: 1,
    },
    {
      id: 'VENDOR-002',
      business_name: 'FastTrack Logistics',
      owner_name: 'Suresh Reddy',
      mobile: '9988776656',
      category: 'TRANSPORT',
      service_types: JSON.stringify(['TRANSPORT', 'PICKUP']),
      address_city: 'Hyderabad',
      address_state: 'Telangana',
      verified: 1,
      compliance_score: 95,
    },
    // ... more vendors
  ],

  // 10 Warehouses
  warehouses: [
    {
      id: 'WH-001',
      vendor_id: 'VENDOR-001',
      name: 'SafeKeep Mumbai Central',
      address: 'Industrial Area, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.1136,
      longitude: 72.8697,
      total_capacity_sqft: 10000,
      available_capacity_sqft: 7500,
      price_per_sqft_day: 2.5,
      safety_rating: 4.8,
      is_flood_safe: 1,
      features: JSON.stringify(['COLD_STORAGE', 'SECURITY', 'LOADING_DOCK']),
      status: 'ACTIVE',
    },
    // ... more warehouses
  ],

  // Sample disaster
  disasters: [
    {
      id: 'DISASTER-001',
      name: 'Cyclone Biparjoy',
      type: 'CYCLONE',
      severity: 'SEVERE',
      affected_states: JSON.stringify(['Gujarat', 'Rajasthan']),
      affected_districts: JSON.stringify(['Kutch', 'Jamnagar', 'Porbandar']),
      declared_at: new Date().toISOString(),
      status: 'ACTIVE',
      total_fund_allocated: 50000000,
      total_msmes_affected: 2500,
      declared_by: 'AUTHORITY-001',
    },
  ],

  // Token allocations for MSMEs
  token_allocations: [
    {
      id: 'ALLOC-001',
      msme_id: 'MSME-001',
      disaster_id: 'DISASTER-001',
      token_type: 'RESILIENCE_CREDIT',
      amount: 75000,
      spent_amount: 0,
      allowed_categories: JSON.stringify(['STORAGE', 'TRANSPORT']),
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      allocated_by: 'AUTHORITY-001',
    },
    {
      id: 'ALLOC-002',
      msme_id: 'MSME-001',
      disaster_id: 'DISASTER-001',
      token_type: 'RELIEF_TOKEN',
      amount: 50000,
      spent_amount: 0,
      allowed_categories: JSON.stringify(['REPAIRS', 'MATERIALS', 'WAGES', 'EQUIPMENT']),
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      allocated_by: 'AUTHORITY-001',
    },
  ],
};
```

---

## Phase 3: Service Integration (Days 5-10)

### Step 3.1: Update Wallet Service

Replace mock data with real DB queries:
- GET /api/wallet/:msmeId → Query token_allocations table
- Calculate real balances from allocations
- Return actual transaction history

### Step 3.2: Update Booking Service

Real booking flow:
1. POST /api/warehouses/search → Query warehouses table with geo filter
2. POST /api/bookings → Insert booking, call wallet for payment
3. PATCH /api/bookings/:id/status → Update status, trigger notifications

### Step 3.3: Token Economy Flow

```
Authority Dashboard
        ↓
    [Declare Disaster]
        ↓
    [Allocate Tokens] → token_allocations table + blockchain
        ↓
    [MSME Gets Credits] → visible in wallet
        ↓
    [MSME Books Warehouse] → booking created
        ↓
    [Vendor Accepts] → status updated
        ↓
    [Payment Processed] → 
        - Deduct from allocation (spent_amount++)
        - Create transaction record
        - Log to blockchain
        - Create settlement record
        ↓
    [Vendor Gets INR] → settlement status = COMPLETED
```

### Step 3.4: Blockchain Integration

Update blockchain-service to:
1. Record all token mints
2. Record all spends with category
3. Provide audit trail endpoint
4. Support block explorer queries

---

## Phase 4: Frontend Integration (Days 11-15)

### Step 4.1: Replace Mock Data in Dashboard

```typescript
// apps/web/src/app/msme/dashboard/page.tsx

const fetchDashboardData = async () => {
  const [walletRes, alertsRes] = await Promise.all([
    api.get('/msme/wallet'),
    api.get('/alerts/active'),
  ]);
  
  return {
    balance: walletRes.data.total,
    resilienceCredits: walletRes.data.resilienceCredits,
    reliefTokens: walletRes.data.reliefTokens,
    allocations: walletRes.data.allocations,
    activeDisasters: alertsRes.data.count,
    alerts: alertsRes.data.alerts,
  };
};
```

### Step 4.2: Real Warehouse Search

```typescript
// apps/web/src/app/msme/warehouses/page.tsx

const searchWarehouses = async (filters) => {
  const { data } = await api.post('/warehouses/search', {
    latitude: filters.lat,
    longitude: filters.lng,
    radiusKm: 50,
    requiredCapacity: filters.capacity,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  return data.warehouses;
};
```

### Step 4.3: Real Booking Creation

```typescript
// apps/web/src/app/msme/book/page.tsx

const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', {
    warehouseId: bookingData.warehouseId,
    vendorId: bookingData.vendorId,
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    quantity: bookingData.sqft,
    paymentMethod: 'RESILIENCE_CREDITS',
    totalCost: bookingData.totalCost,
  });
  
  return data.booking;
};
```

---

## Phase 5: Public Dashboard (Days 16-18)

### Step 5.1: Create Public Routes

```typescript
// apps/web/src/app/public/dashboard/page.tsx

- Live transaction feed (last 100 transactions)
- Total funds disbursed counter
- MSMEs protected counter
- Active disasters map
- Token utilization chart
```

### Step 5.2: Block Explorer

```typescript
// apps/web/src/app/public/explorer/page.tsx

- View all blocks
- Search by transaction hash
- View transaction details
- Verify blockchain integrity
```

---

## Phase 6: Offline Mode (Days 19-21)

### Step 6.1: Service Worker Enhancement

```javascript
// apps/web/public/sw.js

// Cache API responses
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
  }
});

// Queue offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});
```

### Step 6.2: QR Transaction Generation

```typescript
// Generate signed offline transaction
const generateOfflineQR = (vendorId, amount) => {
  const txn = {
    id: crypto.randomUUID(),
    msmeId: currentUser.id,
    vendorId,
    amount,
    timestamp: Date.now(),
    offline: true,
    signature: signWithLocalKey(...)
  };
  return QRCode.toDataURL(JSON.stringify(txn));
};
```

---

## Development Commands

```bash
# Start all services (lite mode)
pnpm run dev:lite

# Start frontend only
pnpm --filter web dev

# Start API gateway
pnpm --filter api-gateway dev

# Run database migrations
pnpm --filter shared-db migrate

# Seed test data
pnpm --filter shared-db seed

# Run all tests
pnpm test
```

---

## Environment Variables

```env
# .env.local (root)
USE_LITE_MODE=true
NO_DOCKER=true
JWT_SECRET=gruha-development-secret-key
BLOCKCHAIN_SECRET=gruha-blockchain-local-key
DATABASE_PATH=./data/gruha.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx (get free from mapbox.com)
```

---

## Testing Checklist

### Authentication Flow
- [ ] Send OTP (dev mode: always succeeds)
- [ ] Verify OTP (dev mode: accept 123456)
- [ ] JWT token issued
- [ ] Protected routes work

### MSME Flow
- [ ] Dashboard shows real balance
- [ ] Warehouse search returns results
- [ ] Booking creates record in DB
- [ ] Vendor receives notification
- [ ] Payment deducts from balance
- [ ] Transaction appears in history

### Vendor Flow
- [ ] Dashboard shows pending bookings
- [ ] Accept booking updates status
- [ ] Settlement tracks earnings
- [ ] Proof upload works

### Authority Flow
- [ ] Declare disaster
- [ ] Allocate tokens to MSMEs
- [ ] View analytics
- [ ] Export reports

### Public Flow
- [ ] View transaction feed
- [ ] See fund utilization
- [ ] Block explorer works
- [ ] No login required

---

## Success Metrics

After implementation:
- ✅ Real data persists across restarts
- ✅ Token balances update on transactions
- ✅ Booking → Payment → Settlement chain works
- ✅ Blockchain records all transactions
- ✅ Public can verify spending
- ✅ Offline transactions queue and sync
