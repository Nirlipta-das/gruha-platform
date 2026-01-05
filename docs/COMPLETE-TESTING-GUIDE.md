# GRUHA Platform - Complete Testing Guide

## 🚀 Quick Start - Launch Everything

### Step 1: Start All Backend Services

Open **PowerShell** in the project root and run:

```powershell
cd "c:\Users\pc\OneDrive\Desktop\GRUHA-IITKGP(1)"

# Terminal 1: API Gateway (REQUIRED FIRST)
cd services\api-gateway
npx tsx src/server.ts
# Should show: "API Gateway running on port 3001"

# Terminal 2: Wallet Service
cd services\wallet-service
npx tsx src/server-sqlite.ts
# Should show: "Wallet Service running on port 3005"

# Terminal 3: Booking Service
cd services\booking-service
npx tsx src/server-sqlite.ts
# Should show: "Booking Service running on port 3004"

# Terminal 4: Token Service
cd services\token-service
npx tsx src/server.ts
# Should show: "Token Service running on port 3013"

# Terminal 5: Settlement Service
cd services\settlement-service
npx tsx src/server-sqlite.ts
# Should show: "Settlement Service running on port 3006"

# Terminal 6: Fraud Service
cd services\fraud-service
npx tsx src/server-sqlite.ts
# Should show: "Fraud Service running on port 3010"

# Terminal 7: eKYC Service
cd services\ekyc-service
npx tsx src/server.ts
# Should show: "eKYC Service running on port 3014"

# Terminal 8: Audit Service
cd services\audit-service
npx tsx src/server.ts
# Should show: "Audit Service running on port 3015"
```

### Step 2: Start Frontend

```powershell
# Terminal 9: Frontend
cd apps\web
npm run dev
# Should show: "Ready on http://localhost:3000"
```

### Step 3: Verify All Services

```powershell
# Quick health check
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3005/health  # Wallet
curl http://localhost:3004/health  # Booking
curl http://localhost:3013/health  # Token
curl http://localhost:3006/health  # Settlement
curl http://localhost:3010/health  # Fraud
curl http://localhost:3014/health  # eKYC
curl http://localhost:3015/health  # Audit
```

---

## 📱 User Flow Testing

### Test Flow 1: Public Portal (No Login Required)

**URL:** http://localhost:3000/public

#### 1.1 Transparency Dashboard
- [ +] Open http://localhost:3000/public
- [ +] Verify stats cards show data (Total Funds, MSMEs Protected, etc.)
- [ -] Check that numbers animate on load
- [ +] Verify dark mode toggle works

#### 1.2 Live Transaction Feed
- [ + ] Navigate to http://localhost:3000/public/transactions
- [ +] Verify transactions appear in real-time (every 3 seconds)
- [ +] Click "Pause" button - feed should stop
- [ +] Click "Play" button - feed should resume
- [ +] Check connection status indicator (green = live)

#### 1.3 Blockchain Explorer
- [+ ] Navigate to http://localhost:3000/public/explorer
- [ +] Verify block list displays with block numbers
- [+ ] Click on a block to expand details
- [+ ] See transactions within the block
- [ +] Try search by block number or transaction ID
- [ ] Verify chain integrity status badge

#### 1.4 Fund Flow Visualization
- [ ] Check "Category" tab - horizontal bar charts
- [ ] Check "Timeline" tab - line chart with 3 metrics
- [ ] Check "Flow" tab - Sankey diagram (Treasury → Districts → MSMEs → Vendors)
- [ ] Check "Region" tab - district breakdown
- [ ] Hover on charts for tooltips
- [ ] Click "Download Report" button

#### 1.5 Report Downloads
- [ ] Click download button for PDF report
- [ ] Click download button for CSV export
- [ ] Verify files download with correct data

---

### Test Flow 2: MSME Registration & Login

**URL:** http://localhost:3000/auth/login

#### 2.1 Phone OTP Login
- [ ] Enter phone number: `9876543210`
- [ ] Click "Send OTP"
- [ ] Enter OTP: `123456` (dev mode accepts any 6 digits)
- [ ] Click "Verify"
- [ ] Should redirect to MSME dashboard

#### 2.2 New MSME Registration
- [ ] Click "Register New MSME"
- [ ] Fill business details:
  - Business Name: "Test Textiles"
  - Owner Name: "Test User"
  - Phone: `9876543211`
  - Udyam Number: `UDYAM-MH-00-0000001`
  - District: "Mumbai"
  - State: "Maharashtra"
- [ ] Submit and verify registration success

---

### Test Flow 3: MSME Dashboard & Wallet

**URL:** http://localhost:3000/msme/dashboard

#### 3.1 Dashboard Overview
- [ +] Verify wallet balance displays
- [ +] Check token breakdown (Resilience Credits vs Relief Tokens)
- [ +] Verify recent transactions list
- [ +] Check active bookings count

#### 3.2 Wallet Details
- [ +] Navigate to http://localhost:3000/msme/wallet
- [ +] Verify detailed balance breakdown
- [ +] Check token allocations with expiry dates
- [ +] View full transaction history
- [ ] Filter transactions by type/date

#### 3.3 eKYC Verification (Integrated in Registration)
- [ ] eKYC is now integrated into the registration flow
- [ ] During registration, OTP verification serves as identity verification
- [ ] Udyam number validation happens automatically
- [ ] No separate /ekyc page required
- [ ] Verify "Verified" badge appears on profile after registration

---

### Test Flow 4: Pre-Disaster Services (Warehouse & Transport)

**NOTE:** Pre-disaster services (warehouse/transport) are separate from the Recovery Marketplace.
These are for protecting inventory BEFORE disaster strikes.

#### 4.1 Warehouse Booking (Marketplace Style)
**URL:** http://localhost:3000/msme/book/warehouse

- [ ] Page auto-displays nearest safe warehouses (no search needed)
- [ ] Verify warehouse grid shows:
  - Storage type badges (DRY, COLD, FROZEN, MIXED)
  - Available capacity and total capacity
  - Features (Temperature Control, CCTV, Fire Safety)
  - Distance from your location
  - Price per sq ft per day
  - Star rating
  - Emergency availability badge
- [ ] Use filters:
  - Distance (5km, 10km, 25km, 50km)
  - Storage Type dropdown
  - Emergency Available toggle
- [ ] Click "Book Now" on a warehouse
- [ ] Booking modal opens with:
  - Duration buttons (3, 7, 14, 30 days)
  - Space required input (sq ft)
  - Goods type selection
  - Total cost calculation
- [ ] Click "Confirm Booking"
- [ ] Verify success message

#### 4.2 Transport Booking (Marketplace Style)
**URL:** http://localhost:3000/msme/book/transport

- [ ] Page auto-displays nearest transport providers
- [ ] Verify transport grid shows:
  - Vehicle types available
  - Total vehicles in fleet
  - Max cargo capacity
  - Service radius
  - GPS tracking badge
  - Emergency pricing badge
  - Price per km
  - Star rating
- [ ] Use filters:
  - Distance (5km, 10km, 25km, 50km)
  - Vehicle Type dropdown
  - Emergency Available toggle
- [ ] Click "Book Now" on a transporter
- [ ] Booking modal opens with:
  - Pickup address input
  - Delivery address input
  - Pickup date and time
  - Vehicle type selection
  - Cargo description
  - Estimated weight
  - Estimated distance calculation
  - Total cost calculation
- [ ] Click "Confirm Booking"
- [ ] Verify success message

#### 4.3 View Bookings
- [ ] Navigate to http://localhost:3000/msme/bookings
- [ ] Find warehouse and transport bookings in list
- [ ] Click to view details
- [ ] Verify status: "PENDING_VENDOR_CONFIRMATION"

---

### Test Flow 5: QR Payment (Offline Capable)

**URL:** http://localhost:3000/msme/qr-payment

#### 5.1 Generate Payment QR
- [ ] Enter Vendor ID: `VND-001`
- [ ] Enter Vendor Name: "Test Vendor"
- [ ] Enter Amount: `500`
- [ ] Select Category: "STORAGE"
- [ ] Click "Generate Payment QR"
- [ ] Verify QR code displays

#### 5.2 QR Actions
- [ ] Click "Copy" - verify data copies to clipboard
- [ ] Click "Download" - verify PNG image downloads
- [ ] Click "Share" - verify share dialog (if supported)
- [ ] Check expiry timer (30 minutes)

#### 5.3 Offline Mode Test
- [ ] Open DevTools → Network → Toggle "Offline"
- [ ] Generate a new QR payment
- [ ] Verify offline indicator shows
- [ ] Verify "Government Guaranteed" notice (≤₹5,000)
- [ ] Toggle back online

---

### Test Flow 6: Push Notifications

**URL:** http://localhost:3000/msme/notifications

#### 6.1 Enable Notifications
- [ ] Click "Enable Notifications" when prompted
- [ ] Grant browser permission
- [ ] Verify permission status shows "Granted"

#### 6.2 Configure Settings
- [ ] Toggle "Sound" on/off
- [ ] Toggle "Disaster Alerts" on/off
- [ ] Toggle "Booking Updates" on/off
- [ ] Toggle "Settlement Alerts" on/off

#### 6.3 Test Demo Alert
- [ ] Click "Trigger Demo Alert" button
- [ ] Verify floating alert banner appears
- [ ] Check browser notification (if permissions granted)
- [ ] Click dismiss (X) to close alert
- [ ] Check notification in bell dropdown

---

### Test Flow 7: Recovery Marketplace (Post-Disaster Only)

**URL:** http://localhost:3000/msme/marketplace

**NOTE:** This marketplace is for POST-DISASTER recovery services only.
Pre-disaster services (Warehouse/Transport) are at /msme/book/warehouse and /msme/book/transport.

#### 7.1 Browse Services
- [ ] Verify info banner explains this is for post-disaster recovery
- [ ] Verify link to pre-disaster booking services
- [ ] Verify professional Lucide icons (no emojis)
- [ ] Click each category:
  - Repairs (Wrench icon)
  - Materials (Package icon)
  - Equipment (Settings icon)
  - Power/Generator (Zap icon)
  - Temp Space (Store icon)
- [ ] Note: Warehouse and Transport are NOT in marketplace
- [ ] Verify service cards show:
  - Provider name and type
  - Price (or FREE/Subsidized)
  - Availability status
  - Token supported badge
  - Professional category icons

#### 7.2 Filter Services
- [ ] Use search box to filter by name
- [ ] Toggle "Token Payments" filter
- [ ] Toggle "Emergency Pricing" filter
- [ ] Toggle "Available Now" filter
- [ ] Verify results update correctly

#### 7.3 Service Details
- [ ] Click on a service card
- [ ] Verify modal shows full details
- [ ] Check features list
- [ ] Check provider info and rating
- [ ] Click "Book Now" or "Join Waitlist"

#### 7.4 Wage Support Form
- [ ] Find "Wage Support" service
- [ ] Click to open details
- [ ] Add workers:
  - Name: "Worker 1"
  - Skill: "Electrician"
  - Daily Wage: 500
  - Days: 10
- [ ] Verify subsidy calculation (30%)
- [ ] Submit application

#### 7.5 Utility Bill Payment
- [ ] Find "Utility Payments" service
- [ ] View pending bills (electricity, water, internet)
- [ ] Select bills to pay
- [ ] Verify total amount
- [ ] Click "Pay Now"
- [ ] Verify status changes to "PAID"

---

### Test Flow 8: Vendor Portal

**URL:** http://localhost:3000/vendor

#### 8.1 Vendor Registration (Type-Specific Fields)
- [ ] Navigate to http://localhost:3000/register
- [ ] Select "Vendor" registration type
- [ ] Fill basic details (name, phone, location)
- [ ] Select vendor category and verify type-specific fields appear:
  - **Warehouse**: Storage type (DRY/COLD/FROZEN/MIXED), total capacity, available capacity, temperature control, CCTV, fire safety, photos
  - **Transport**: Vehicle types, total vehicles, max cargo capacity, service radius, GPS tracking
  - **Repair**: Repair specializations, certifications
  - **Equipment**: Equipment types, rental rates
  - **Power**: Generator capacity, fuel type
  - **Materials**: Material types, delivery available
- [ ] Complete registration with category-specific details

#### 8.2 Vendor Login
- [ ] Login as vendor with phone: `9876543212`
- [ ] OTP: `123456`
- [ ] Verify redirect to vendor dashboard

#### 8.3 View Bookings
- [ ] Navigate to http://localhost:3000/vendor/bookings
- [ ] See list of incoming bookings
- [ ] Check booking details:
  - MSME name
  - Service requested
  - Amount
  - Status

#### 8.4 Accept/Reject Booking
- [ ] Find a "PENDING" booking
- [ ] Click "Accept" button
- [ ] Verify status changes to "CONFIRMED"
- [ ] Try "Reject" on another booking
- [ ] Enter rejection reason
- [ ] Verify status changes to "REJECTED"

#### 8.5 Photo Proof Upload
- [ ] Navigate to http://localhost:3000/vendor/proof?bookingId=BKG-001
- [ ] Select photo type: "BEFORE"
- [ ] Click "Take Photo" (or upload from gallery)
- [ ] Allow camera permission if prompted
- [ ] Capture/select photo
- [ ] Verify GPS location is tagged
- [ ] Select "AFTER" type
- [ ] Take/upload another photo
- [ ] Click "Upload Photos"
- [ ] Verify AI verification scores display

#### 8.6 QR Scanner (Receive Payment)
- [ ] Navigate to http://localhost:3000/vendor/scan
- [ ] Click "Start Camera"
- [ ] Scan MSME's payment QR
- [ ] Verify payment details display
- [ ] Click "Confirm Payment"
- [ ] Verify success message

#### 8.7 Settlement Tracking
- [ ] Navigate to http://localhost:3000/vendor/settlements
- [ ] View settlement history
- [ ] Check:
  - Amount received
  - Platform fee deducted
  - Settlement timestamp
  - Transaction ID

---

### Test Flow 9: Authority Dashboard

**URL:** http://localhost:3000/authority

#### 9.1 Authority Login
- [ ] Login with authority credentials
- [ ] Phone: `9876543213`
- [ ] OTP: `123456`

#### 9.2 Disaster Declaration
- [ ] Navigate to http://localhost:3000/authority/disaster
- [ ] Click "Declare New Disaster"
- [ ] Fill form:
  - Type: "FLOOD"
  - Severity: "HIGH"
  - District: "Mumbai"
  - State: "Maharashtra"
  - Description: "Heavy flooding due to rainfall"
- [ ] Click "Declare Disaster"
- [ ] Verify disaster appears in list

#### 9.3 Token Allocation
- [ ] Navigate to http://localhost:3000/authority/allocate
- [ ] Select disaster from dropdown
- [ ] Enter allocation details:
  - MSME ID: `MSME-001`
  - Amount: `10000`
  - Token Type: "RELIEF_TOKEN"
  - Categories: ["REPAIR", "MATERIALS"]
  - Validity: 30 days
- [ ] Click "Allocate Tokens"
- [ ] Verify multi-sig approval flow (if implemented)

#### 9.4 Analytics Dashboard
- [ ] Navigate to http://localhost:3000/authority/analytics
- [ ] View charts:
  - Fund utilization by category
  - Disbursement timeline
  - District-wise breakdown
- [ ] Export analytics report

#### 9.5 Audit Logs
- [ ] Navigate to http://localhost:3000/authority/audit
- [ ] View immutable blockchain logs
- [ ] Filter by:
  - Date range
  - Action type
  - User type
- [ ] Click on log entry for full details
- [ ] Verify blockchain hash integrity

---

## 🔌 API Testing (Direct Endpoints)

### Wallet Service (Port 3005)

```powershell
# Get wallet balance
curl http://localhost:3005/api/wallet/MSME-001

# Get all allocations
curl http://localhost:3005/api/wallet/MSME-001/allocations

# Get transaction history
curl http://localhost:3005/api/wallet/MSME-001/transactions
```

### Booking Service (Port 3004)

```powershell
# Search warehouses
curl -X POST http://localhost:3004/api/warehouses/search `
  -H "Content-Type: application/json" `
  -d '{"location":"Mumbai","size":100}'

# Create booking
curl -X POST http://localhost:3004/api/bookings `
  -H "Content-Type: application/json" `
  -d '{"msmeId":"MSME-001","warehouseId":"WH-001","days":7}'

# Get booking
curl http://localhost:3004/api/bookings/BKG-001
```

### Token Service (Port 3013)

```powershell
# Mint tokens (Authority only)
curl -X POST http://localhost:3013/api/tokens/mint `
  -H "Content-Type: application/json" `
  -d '{"msmeId":"MSME-001","amount":5000,"type":"RELIEF_TOKEN","categories":["REPAIR"]}'

# Spend tokens
curl -X POST http://localhost:3013/api/tokens/spend `
  -H "Content-Type: application/json" `
  -d '{"msmeId":"MSME-001","vendorId":"VND-001","amount":1000,"category":"REPAIR"}'

# Get allocations
curl http://localhost:3013/api/tokens/allocations/MSME-001
```

### Fraud Service (Port 3010)

```powershell
# Check transaction risk
curl -X POST http://localhost:3010/api/fraud/check `
  -H "Content-Type: application/json" `
  -d '{"msmeId":"MSME-001","vendorId":"VND-001","amount":5000,"category":"STORAGE"}'

# Verify GPS proximity
curl -X POST http://localhost:3010/api/fraud/verify-gps `
  -H "Content-Type: application/json" `
  -d '{"vendorLat":19.076,"vendorLng":72.877,"msmeLat":19.077,"msmeLng":72.878}'
```

### Settlement Service (Port 3006)

```powershell
# Process settlement
curl -X POST http://localhost:3006/api/settlements `
  -H "Content-Type: application/json" `
  -d '{"vendorId":"VND-001","amount":5000,"bookingId":"BKG-001"}'

# Get vendor settlements
curl http://localhost:3006/api/settlements/vendor/VND-001

# Get liquidity pool status
curl http://localhost:3006/api/settlements/pool
```

### eKYC Service (Port 3014)

```powershell
# Verify Aadhaar
curl -X POST http://localhost:3014/api/ekyc/aadhaar/verify `
  -H "Content-Type: application/json" `
  -d '{"aadhaarNumber":"123456789012","otp":"123456"}'

# Verify Udyam
curl -X POST http://localhost:3014/api/ekyc/udyam/verify `
  -H "Content-Type: application/json" `
  -d '{"udyamNumber":"UDYAM-MH-00-0000001"}'

# Verify PAN
curl -X POST http://localhost:3014/api/ekyc/pan/verify `
  -H "Content-Type: application/json" `
  -d '{"panNumber":"ABCDE1234F"}'
```

### Audit Service (Port 3015)

```powershell
# Log action
curl -X POST http://localhost:3015/api/audit/log `
  -H "Content-Type: application/json" `
  -d '{"action":"TOKEN_MINT","userId":"AUTH-001","details":{"amount":10000}}'

# Get audit logs
curl http://localhost:3015/api/audit/logs

# Verify integrity
curl http://localhost:3015/api/audit/verify
```

---

## 🧪 Feature-Specific Tests

### Offline Mode Testing

1. **Enable Offline Mode**
   - Open DevTools (F12) → Network → Check "Offline"
   - Or: DevTools → Application → Service Workers → Check "Offline"

2. **Test Offline Features**
   - [ ] Dashboard should load from cache
   - [ ] Wallet balance shows cached data
   - [ ] Offline banner appears at top
   - [ ] Create a booking → goes to queue
   - [ ] Generate QR payment → works offline
   - [ ] Check pending transactions count

3. **Sync on Reconnect**
   - Uncheck "Offline"
   - [ ] Verify sync indicator appears
   - [ ] Pending transactions are submitted
   - [ ] Success notifications appear

### Emergency Mode Testing

1. **Trigger Emergency Mode**
   - Authority declares HIGH/CRITICAL disaster
   - OR: Add `?emergency=true` to URL

2. **Verify Emergency UI**
   - [ ] Red gradient background
   - [ ] Larger fonts (+20%)
   - [ ] High contrast colors
   - [ ] Bigger buttons (60px min height)
   - [ ] Pulsing alert banner
   - [ ] Simplified navigation

### Multi-language Testing

1. **Change Language**
   - Click language selector (top right)
   - Select: हिंदी (Hindi)

2. **Verify Translations**
   - [ ] Navigation labels change
   - [ ] Button text changes
   - [ ] Form labels change
   - [ ] Error messages change

### Responsive Design Testing

1. **Desktop (1920x1080)**
   - [ ] Full navigation sidebar visible
   - [ ] Multi-column layouts
   - [ ] Large charts render properly

2. **Tablet (768x1024)**
   - [ ] Collapsible sidebar
   - [ ] 2-column grids
   - [ ] Touch-friendly buttons

3. **Mobile (375x667)**
   - [ ] Bottom navigation bar
   - [ ] Single column layouts
   - [ ] Full-width cards
   - [ ] Swipe gestures work

---

## ✅ Test Checklist Summary

### Public Portal
- [ ] Dashboard with live stats
- [ ] Transaction feed (real-time)
- [ ] Blockchain explorer
- [ ] Fund flow charts
- [ ] Report downloads

### MSME Portal
- [ ] Registration & OTP login (with integrated eKYC)
- [ ] Wallet balance view
- [ ] Warehouse booking (marketplace style, auto-display)
- [ ] Transport booking (marketplace style, auto-display)
- [ ] Booking creation
- [ ] QR payment generation
- [ ] Push notifications
- [ ] Recovery Marketplace (post-disaster only)
- [ ] Offline mode

### Vendor Portal
- [ ] Registration with type-specific fields
- [ ] Login
- [ ] View bookings
- [ ] Accept/Reject bookings
- [ ] Photo proof upload
- [ ] QR scanner
- [ ] Settlement tracking

### Authority Portal
- [ ] Login
- [ ] Disaster declaration
- [ ] Token allocation
- [ ] Analytics dashboard
- [ ] Audit logs

### Backend Services
- [ ] API Gateway routing
- [ ] Wallet operations
- [ ] Booking CRUD
- [ ] Token mint/spend
- [ ] Fraud detection
- [ ] Settlement processing
- [ ] eKYC verification
- [ ] Audit logging

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Service not starting | Check if port is already in use: `netstat -ano | findstr :3001` |
| CORS errors | Ensure API Gateway is running on 3001 |
| "Cannot find module" | Run `pnpm install` in service directory |
| Database empty | Run seed script: `npx tsx packages/shared-db/src/seed.ts` |
| OTP not working | Use any 6-digit OTP in dev mode |
| Wallet balance 0 | Check if MSME ID exists in database |
| Camera not working | Allow camera permissions in browser |
| Notifications blocked | Reset permissions in browser settings |

---

## 📞 Test Credentials

| Role | Phone | OTP | Notes |
|------|-------|-----|-------|
| MSME (Rajesh Textiles) | 9876543210 | 123456 | Pre-seeded with balance |
| MSME (New) | 9876543211 | 123456 | For registration test |
| Vendor (SafeStore) | 9876543212 | 123456 | Pre-seeded warehouse |
| Authority (District) | 9876543213 | 123456 | Can declare disasters |
| Authority (State) | 9876543214 | 123456 | Can approve allocations |

---

## 🎯 End-to-End Flow Test

**Complete disaster recovery cycle:**

1. ✅ Authority declares disaster (FLOOD in Mumbai)
2. ✅ Authority allocates Relief Tokens to affected MSMEs
3. ✅ MSME receives push notification
4. ✅ MSME logs in, sees token balance
6. ✅ MSME views nearest safe warehouses (auto-displayed marketplace)
7. ✅ MSME books warehouse/transport, pays with tokens
7. ✅ Vendor receives booking notification
8. ✅ Vendor accepts booking
9. ✅ Vendor uploads before/after photos
10. ✅ MSME confirms service completion
11. ✅ Settlement service pays vendor (INR)
12. ✅ Transaction recorded on blockchain
13. ✅ Public can view in transparency dashboard

**Time to complete:** ~15 minutes for full cycle
